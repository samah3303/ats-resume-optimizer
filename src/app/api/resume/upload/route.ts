import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseResumeFile, extractProfileFromResume } from "@/lib/resume-parser";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 },
      );
    }

    // Parse the resume file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resumeText = await parseResumeFile(buffer, file.type, file.name);

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from the resume. Try a different file format.",
        },
        { status: 422 },
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
        return NextResponse.json(
          {
            error:
              "Could not extract email from resume. Please register first or ensure your resume contains an email address.",
          },
          { status: 422 },
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: extractedEmail },
      });

      if (existingUser) {
        userId = existingUser.id;
        // If they already have a password, they should log in instead
        if (existingUser.passwordHash) {
          return NextResponse.json(
            {
              error:
                "An account with this email already exists. Please log in first.",
              code: "LOGIN_REQUIRED",
            },
            { status: 409 },
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
      resumeData: resumeText, // store raw text; binary handled separately if needed
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

    return NextResponse.json({
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
    console.error("Resume upload error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
