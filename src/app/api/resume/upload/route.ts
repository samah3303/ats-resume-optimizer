import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseResumeFile, extractProfileFromResume } from "@/lib/resume-parser";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

const ALLOWED_EXTENSIONS = ["pdf", "docx", "doc", "txt"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "application/octet-stream",
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file provided", 400);
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return apiError("File size must be under 10MB", 400);
    }

    // Whitelist file extension & mime type to prevent arbitrary file upload attacks
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return apiError(
        "Invalid file type. Only PDF, DOCX, DOC, and TXT resumes are supported.",
        400
      );
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return apiError("Unsupported MIME type detected.", 400);
    }

    // Parse the resume file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resumeText = await parseResumeFile(buffer, file.type, file.name);

    if (!resumeText || resumeText.trim().length < 50) {
      return apiError(
        "Could not extract enough text from the resume. Try a different file format.",
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
      const extractedEmail = extracted.email?.toLowerCase().trim();
      if (!extractedEmail) {
        return apiError(
          "Could not extract email from resume. Please register first or ensure your resume contains an email address.",
          422
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: extractedEmail },
      });

      if (existingUser) {
        userId = existingUser.id;
        // If they already have a password, they should log in instead
        if (existingUser.passwordHash) {
          return apiError(
            "An account with this email already exists. Please log in first.",
            409,
            { code: "LOGIN_REQUIRED" }
          );
        }
        isNewUser = false;
      } else {
        // Create user without password — they'll set one up later
        const newUser = await prisma.user.create({
          data: {
            email: extractedEmail,
            name: extracted.name || null,
            passwordHash: null,
          },
        });
        userId = newUser.id;
        isNewUser = true;
      }
    }

    // Create or update profile
    const profileData = {
      resumeText,
      resumeFileName: file.name,
      resumeMimeType: file.type,
      resumeData: resumeText,
      phone: extracted.phone || undefined,
      location: extracted.location || undefined,
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
      name: extracted.name,
    });
  } catch (error) {
    return handleApiError(error, "Failed to process resume");
  }
}
