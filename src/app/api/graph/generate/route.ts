import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const nodes: any[] = [];
  const links: any[] = [];
  const addedNodes = new Set<string>();
  const addedLinks = new Set<string>();

  const addNode = (id: string, group: string, label: string, val: number = 1) => {
    if (!addedNodes.has(id)) {
      nodes.push({ id, group, label, val });
      addedNodes.add(id);
    }
  };

  const addLink = (source: string, target: string, label: string) => {
    const linkId = `${source}-${target}-${label}`;
    if (!addedLinks.has(linkId)) {
      links.push({ source, target, label });
      addedLinks.add(linkId);
    }
  };

  try {
    // 1. User Node (Center)
    const userNodeId = `user-${userId}`;
    addNode(userNodeId, "user", session.user.name || "You", 6);

    // 2. Onboarding Profile Target Roles
    const profile = await prisma.onboardingProfile.findUnique({ where: { userId } });
    if (profile?.targetPositions) {
      const roles = profile.targetPositions.split(",").map((r: string) => r.trim()).filter(Boolean);
      roles.forEach((role: string) => {
        const roleId = `role-${role.toLowerCase().replace(/\s+/g, "-")}`;
        addNode(roleId, "target_role", role, 4);
        addLink(userNodeId, roleId, "TARGETS");
      });
    }

    // 3. Resumes
    const resumes = await prisma.resume.findMany({ where: { userId }, select: { id: true, title: true, isPrimary: true } });
    resumes.forEach((resume: any) => {
      const resId = `resume-${resume.id}`;
      addNode(resId, "resume", resume.title || "Resume", resume.isPrimary ? 4 : 2);
      addLink(userNodeId, resId, "OWNS");
    });

    // 4. Tracked Applications (Kanban)
    const apps = await prisma.candidateApplication.findMany({
      where: { candidateId: userId },
      include: { jobPosting: { include: { organization: true } } }
    });

    apps.forEach((app: any) => {
      const jobId = `job-${app.jobPosting.id}`;
      const company = app.jobPosting.organization?.name || "Unknown Company";
      addNode(jobId, "job", `${app.jobPosting.title} @ ${company}`, 4);
      addLink(userNodeId, jobId, app.stage.toUpperCase()); 

      // Extract skills from this application if available
      if (app.matchedSkills) {
        try {
          const skills = JSON.parse(app.matchedSkills);
          if (Array.isArray(skills)) {
            skills.forEach((skill: any) => {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              if (skillName) {
                const skillId = `skill-${skillName.toLowerCase()}`;
                addNode(skillId, "skill", skillName, 2);
                addLink(userNodeId, skillId, "HAS_SKILL");
                addLink(jobId, skillId, "REQUIRES");
              }
            });
          }
        } catch(e) {}
      }
      
      if (app.missingSkills) {
        try {
          const skills = JSON.parse(app.missingSkills);
          if (Array.isArray(skills)) {
            skills.forEach((skill: any) => {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              if (skillName) {
                const skillId = `skill-${skillName.toLowerCase()}`;
                addNode(skillId, "skill", skillName, 2);
                addLink(jobId, skillId, "REQUIRES");
              }
            });
          }
        } catch(e) {}
      }
    });

    // 5. Analyses (JDs from the Analyzer tool)
    const analyses = await prisma.analysis.findMany({
      where: { userId },
      include: { jobDescription: true, resume: true }
    });

    analyses.forEach((analysis: any) => {
      const jdId = `jd-${analysis.jobDescriptionId}`;
      
      addNode(jdId, "analysis_jd", analysis.jobDescription.title || "Target JD", 3);
      addLink(userNodeId, jdId, "ANALYZED");

      if (analysis.resumeId) {
        addLink(`resume-${analysis.resumeId}`, jdId, "COMPARED_AGAINST");
      }

      if (analysis.skillsGapJson) {
        try {
          const gap = JSON.parse(analysis.skillsGapJson);
          if (gap.matched && Array.isArray(gap.matched)) {
            gap.matched.forEach((s: any) => {
              const skillName = typeof s === 'string' ? s : s.skill || s.name;
              if (skillName) {
                const skillId = `skill-${skillName.toLowerCase()}`;
                addNode(skillId, "skill", skillName, 2);
                addLink(userNodeId, skillId, "HAS_SKILL");
                addLink(jdId, skillId, "REQUIRES");
              }
            });
          }
          if (gap.missing && Array.isArray(gap.missing)) {
            gap.missing.forEach((s: any) => {
              const skillName = typeof s === 'string' ? s : s.skill || s.name;
              if (skillName) {
                const skillId = `skill-${skillName.toLowerCase()}`;
                addNode(skillId, "skill", skillName, 2);
                addLink(jdId, skillId, "REQUIRES");
              }
            });
          }
        } catch(e) {}
      }
    });

    // Dummy data generation if the user has no real graph data (for demo purposes)
    if (nodes.length <= 1) {
      addNode("jd-demo-1", "analysis_jd", "Senior React Developer", 3);
      addLink(userNodeId, "jd-demo-1", "TARGETS");
      ["React", "TypeScript", "Next.js"].forEach(s => {
        addNode(`skill-${s.toLowerCase()}`, "skill", s, 2);
        addLink("jd-demo-1", `skill-${s.toLowerCase()}`, "REQUIRES");
        addLink(userNodeId, `skill-${s.toLowerCase()}`, "HAS_SKILL");
      });
      ["GraphQL", "Node.js"].forEach(s => {
        addNode(`skill-${s.toLowerCase()}`, "skill", s, 2);
        addLink("jd-demo-1", `skill-${s.toLowerCase()}`, "REQUIRES");
      });
    }

    return NextResponse.json({ nodes, links });
  } catch (error) {
    console.error("Graph fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch graph data" }, { status: 500 });
  }
}
