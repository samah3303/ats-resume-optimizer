import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInterviewQuestions } from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { action, analysisId, resumeId, jdId, stage } = body;

    // Handle direct interview questions request (e.g. from analysis details page)
    if (!action || action === "generate") {
      let skillsGapJson: string | undefined;
      let resumeText = "";
      let jobDescriptionText = "";
      let jobTitle: string | undefined;

      if (analysisId) {
        const analysis = await prisma.analysis.findFirst({
          where: { id: analysisId, userId },
          include: { resume: true, jobDescription: true },
        });
        if (!analysis) {
          return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
        }
        skillsGapJson = analysis.skillsGapJson || undefined;
        resumeText = analysis.resume?.parsedText || "";
        jobDescriptionText = analysis.jobDescription.rawText;
        jobTitle = analysis.jobDescription.title;
      } else if (resumeId && jdId) {
        const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
        if (!resume) {
          return NextResponse.json({ error: "Resume not found." }, { status: 404 });
        }
        const jd = await prisma.jobDescription.findFirst({ where: { id: jdId, userId } });
        if (!jd) {
          return NextResponse.json({ error: "Job description not found." }, { status: 404 });
        }
        resumeText = resume.parsedText;
        jobDescriptionText = jd.rawText;
        jobTitle = jd.title;
      } else {
        return NextResponse.json(
          { error: "Either analysisId or both resumeId and jdId are required." },
          { status: 400 }
        );
      }

      const questions = await generateInterviewQuestions({
        skillsGapJson,
        resumeText,
        jobDescriptionText,
        jobTitle,
        stage: stage || "all",
      });

      return NextResponse.json({ questions });
    }

    // Handle session-based interactive mock coach actions
    switch (action) {
      case "start": {
        const { startInterviewSession } = await import("@/lib/agents/interview-coach-agent");

        let skillsGapJson: string | undefined;
        let resumeText = "";
        let jobDescriptionText = "";
        let jobTitle: string | undefined;

        if (analysisId) {
          const analysis = await prisma.analysis.findFirst({
            where: { id: analysisId, userId },
            include: { resume: true, jobDescription: true },
          });
          if (!analysis) {
            return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
          }
          skillsGapJson = analysis.skillsGapJson || undefined;
          resumeText = analysis.resume?.parsedText || "";
          jobDescriptionText = analysis.jobDescription.rawText;
          jobTitle = analysis.jobDescription.title;
        } else if (resumeId && jdId) {
          const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
          if (!resume) {
            return NextResponse.json({ error: "Resume not found." }, { status: 404 });
          }
          const jd = await prisma.jobDescription.findFirst({ where: { id: jdId, userId } });
          if (!jd) {
            return NextResponse.json({ error: "Job description not found." }, { status: 404 });
          }
          resumeText = resume.parsedText;
          jobDescriptionText = jd.rawText;
          jobTitle = jd.title;
        }

        const result = await startInterviewSession({
          userId,
          resumeText,
          jobDescriptionText,
          jobTitle,
          skillsGapJson,
        });

        return NextResponse.json({
          sessionId: result.sessionId,
          questions: result.questions,
          totalQuestions: result.questions.length,
        });
      }

      case "answer": {
        const { evaluateAnswer, getNextQuestion } = await import("@/lib/agents/interview-coach-agent");
        const { sessionId, questionId, answer } = body;
        if (!sessionId || !questionId || answer === undefined) {
          return NextResponse.json(
            { error: "sessionId, questionId, and answer are required." },
            { status: 400 }
          );
        }

        try {
          const result = await evaluateAnswer({ sessionId, questionId, answer });
          const nextQuestion = result.isLastQuestion ? null : getNextQuestion(sessionId);

          return NextResponse.json({
            feedback: result.feedback,
            isLastQuestion: result.isLastQuestion,
            nextQuestion,
          });
        } catch (err) {
          return NextResponse.json(
            { error: (err as Error).message },
            { status: 400 }
          );
        }
      }

      case "next": {
        const { getNextQuestion } = await import("@/lib/agents/interview-coach-agent");
        const { sessionId } = body;
        if (!sessionId) {
          return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
        }
        const nextQuestion = getNextQuestion(sessionId);
        return NextResponse.json({ question: nextQuestion, hasMore: nextQuestion !== null });
      }

      case "report": {
        const { generateInterviewReport } = await import("@/lib/agents/interview-coach-agent");
        const { sessionId } = body;
        if (!sessionId) {
          return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
        }
        try {
          const report = await generateInterviewReport(sessionId);
          return NextResponse.json({ report });
        } catch (err) {
          return NextResponse.json(
            { error: (err as Error).message },
            { status: 400 }
          );
        }
      }

      case "end": {
        const { endInterviewSession } = await import("@/lib/agents/interview-coach-agent");
        const { sessionId } = body;
        if (sessionId) endInterviewSession(sessionId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}.` },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("Interview route error:", err);
    return NextResponse.json(
      { error: "Failed to process interview request." },
      { status: 500 }
    );
  }
}
