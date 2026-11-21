import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseResumeFile, extractProfileFromResume } from "@/lib/resume-parser";
import { autoPopulateJobsForUser } from "@/lib/job-matcher";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

const ALLOWED_EXTENSIONS = ["pdf", "docx", "doc", "txt"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/x-pdf",
  "application/acrobat",
  "applications/vnd.pdf",
  "text/pdf",
  "text/x-pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "application/octet-stream",
  "",
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No resume file provided.", 400);
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return apiError("File size must be under 10MB.", 400);
    }

    // Whitelist file extension & mime type to prevent arbitrary file upload attacks
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return apiError(
        "Invalid file type. Only PDF, DOCX, DOC, and TXT resumes are supported.",
        400
      );
    }

    const normalizedMime = (file.type || "").toLowerCase().trim();
    const isMimePermitted =
      !normalizedMime ||
      ALLOWED_MIME_TYPES.includes(normalizedMime) ||
      (extension === "pdf" && normalizedMime.includes("pdf")) ||
      normalizedMime === "application/octet-stream";

    if (!isMimePermitted) {
      return apiError("Unsupported MIME type detected.", 400);
    }

    // Parse the resume file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let resumeText = "";
    try {
      resumeText = await parseResumeFile(buffer, file.type, file.name);
    } catch (parseErr) {
      const msg =
        parseErr instanceof Error
          ? parseErr.message
          : "Could not extract readable text from this file.";
      return apiError(msg, 422);
    }

    if (!resumeText || resumeText.trim().length < 30) {
      return apiError(
        "Could not extract readable text from the resume. If this is a scanned document or image-only PDF, please upload a text-based PDF or DOCX file.",
        422
      );
    }

    // Extract structured data from resume
    const extracted = await extractProfileFromResume(resumeText);

    // Determine user — authenticated or new
    const session = await getServerSession(authOptions);
    let userId: string;
    let isNewUser = false;

    if (session?.user && (session.user as { id: string }).id) {
      userId = (session.user as { id: string }).id;
    } else {
      // Unauthenticated upload — look up or create user by email
      const userProvidedEmail = (formData.get("email") as string | null)?.toLowerCase().trim();
      const extractedEmail = extracted.email?.toLowerCase().trim();
      const candidateEmail = userProvidedEmail || extractedEmail;

      if (!candidateEmail) {
        return apiError(
          "We analyzed your resume, but could not detect an email address. Please enter your email to view your ATS score.",
          422,
          { code: "EMAIL_REQUIRED", detectedName: extracted.name || null }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: candidateEmail },
      });

      if (existingUser) {
        userId = existingUser.id;
        // If they already have a password set, they are an existing user
        if (existingUser.passwordHash) {
          isNewUser = false;
        } else {
          // If passwordHash is null, they started onboarding before but didn't finish setting a password
          isNewUser = true;
        }
      } else {
        // Create user without password — they'll set one up on /setup-password
        const newUser = await prisma.user.create({
          data: {
            email: candidateEmail,
            name: extracted.name || null,
            passwordHash: null,
          },
        });
        userId = newUser.id;
        isNewUser = true;
      }
    }

    // Load existing profile to preserve any user custom settings
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    let currentPrefs: any = {};
    if (existingProfile?.preferences) {
      try {
        currentPrefs = JSON.parse(existingProfile.preferences);
      } catch {}
    }

    // Determine candidate location & target role from extracted resume
    const candidateLocation =
      extracted.location ||
      extracted.country ||
      currentPrefs.locations?.[0] ||
      existingProfile?.location ||
      "Remote";

    const candidateRole =
      extracted.targetRole ||
      extracted.experience?.[0]?.title ||
      (existingProfile?.targetRoles ? JSON.parse(existingProfile.targetRoles)[0] : null) ||
      "Professional";

    // Initialize or merge job preferences with extracted location & keywords
    const prefLocations =
      currentPrefs.locations && currentPrefs.locations.length > 0
        ? currentPrefs.locations
        : [candidateLocation];

    const isGulfRegion = /dubai|uae|emirates|qatar|saudi|riyadh|kuwait|bahrain|oman/i.test(candidateLocation);

    const mergedPreferences = {
      ...currentPrefs,
      locations: prefLocations,
      platforms:
        currentPrefs.platforms ||
        (isGulfRegion
          ? ["naukrigulf", "indeed", "linkedin"]
          : ["linkedin", "indeed", "greenhouse_lever"]),
      keywords:
        currentPrefs.keywords && currentPrefs.keywords.length > 0
          ? currentPrefs.keywords
          : extracted.skills.slice(0, 5),
    };

    // Create or update profile
    const profileData = {
      resumeText,
      resumeFileName: file.name,
      resumeMimeType: file.type,
      resumeData: resumeText,
      phone: extracted.phone || undefined,
      location: candidateLocation,
      targetRoles: JSON.stringify([candidateRole]),
      preferences: JSON.stringify(mergedPreferences),
      summary: extracted.summary || undefined,
      skills:
        extracted.skills.length > 0
          ? JSON.stringify(extracted.skills)
          : undefined,
      experience:
        extracted.experience.length > 0
          ? JSON.stringify(extracted.experience)
          : undefined,
      education:
        extracted.education.length > 0
          ? JSON.stringify(extracted.education)
          : undefined,
    };

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileData,
      },
      update: profileData,
    });

    // Update user name if not set
    if (extracted.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: extracted.name },
      });
    }

    // Automatically fetch and populate matching jobs for this candidate's country/location & role
    try {
      await autoPopulateJobsForUser(userId, { maxJobs: 5 });
    } catch (jobErr) {
      console.warn("Auto job search during resume upload warning:", jobErr);
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "resume_uploaded",
        details: `Uploaded resume: ${file.name}`,
      },
    });

    // Fetch the user for the response
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    return apiSuccess({
      userId,
      email: user?.email,
      profile: {
        id: profile.id,
        phone: profile.phone,
        location: profile.location,
        summary: profile.summary,
        skills: profile.skills ? JSON.parse(profile.skills) : [],
        experience: profile.experience ? JSON.parse(profile.experience) : [],
        education: profile.education ? JSON.parse(profile.education) : [],
        resumeFileName: profile.resumeFileName,
      },
      isNewUser,
      requiresLogin: !isNewUser && !session?.user,
      name: extracted.name,
    });
  } catch (error) {
    return handleApiError(error, "Failed to process resume");
  }
}
