const fs = require('fs');
const content = fs.readFileSync('src/components/tiles/StepByStepTileNavigator.tsx', 'utf-8');

const replacement = `const campaignStages: PipelineStage[] = [
    {
      id: "all-tools",
      title: "Career OS Toolkit",
      description: "All the auxiliary tools you need to build, track, and land your next role.",
      icon: "🛠️",
      badge: "Unlocked",
      isLocked: false,
      features: [
        {
          id: "builder",
          title: "ATS Resume Studio",
          tagline: "6 Pro Templates & Drag-Drop Editor",
          description: "Pixel-perfect A4 canvas with live print styles and high-res PDF downloads.",
          href: "/dashboard/builder",
          icon: "📄",
          badge: "Core Studio",
        },
        {
          id: "public-share",
          title: "Public Verified Portfolio & Share Link",
          tagline: "1-Click Sharable Candidate Profile",
          description: "Generate a clean, verified candidate portfolio link to send directly to recruiters.",
          href: "/portfolio",
          icon: "🔗",
          badge: "Live Link",
        },
        {
          id: "job-discovery",
          title: "Semantic Job Discovery Hub",
          tagline: "140k+ Multi-Board Live Job Stream",
          description: "Discover live job postings ranked by semantic compatibility with your resume.",
          href: "/dashboard/jobs",
          icon: "🔍",
          badge: "Live Feed",
        },
        {
          id: "outreach-engine",
          title: "Recruiter Outreach & Cold Drips",
          tagline: "3-Step Follow-Up Sequence Synthesizer",
          description: "Generate high-converting recruiter connection notes and hiring manager cold pitches.",
          href: "/dashboard/outreach",
          icon: "✉️",
          badge: "Outreach",
        },
        {
          id: "hunter-swarm",
          title: "Autonomous Hunter Agent Swarm",
          tagline: "24/7 Background Application Packets",
          description: "Autonomous background agents generate tailored STAR bullets and cover letters.",
          href: "/dashboard/agents",
          icon: "🤖",
          badge: "Autonomous",
        },
        {
          id: "company-radar",
          title: "Company Interview Question Radar",
          tagline: "Predict Loop Questions for Google, Stripe & Meta",
          description: "Uncover top predicted interview loop questions and Bar Raiser expectations.",
          href: "/dashboard/interview",
          icon: "🎯",
          badge: "Radar",
        },
        {
          id: "coding-sandbox",
          title: "Technical Coding Sandbox",
          tagline: "In-Browser Algorithms IDE",
          description: "Solve algorithmic problems with real-time test assertions.",
          href: "/dashboard/challenges",
          icon: "💻",
          badge: "IDE",
        },
        {
          id: "system-design",
          title: "System Design Whiteboard Arena",
          tagline: "SVG Vector Canvas & SPOF Capacity Grader",
          description: "Drag-and-drop distributed systems diagrams and export clean Mermaid.js code.",
          href: "/dashboard/whiteboard",
          icon: "📐",
          badge: "Arena",
        },
        {
          id: "video-analytics",
          title: "Video Composure & Gaze HUD",
          tagline: "Webcam Computer Vision Overlay",
          description: "Track real-time direct eye contact % and posture stability.",
          href: "/dashboard/video-analytics",
          icon: "🎥",
          badge: "Vision HUD",
        }
      ],
    }
  ];

  export function StepByStepTileNavigator() {
    const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
    const [stages, setStages] = useState<PipelineStage[]>(campaignStages);
    const [loading, setLoading] = useState(true);
    const [latestAnalysis, setLatestAnalysis] = useState<{ id: string | null; score: number | null }>({
      id: null,
      score: null,
    });
    const [progress, setProgress] = useState<any>(null);
  
    useEffect(() => {
      fetch("/api/progress")
        .then((res) => res.json())
        .then((data) => {
          if (!data) return;
          setProgress(data);
  
          // Deep clone so we can modify nested features
          const updatedStages = JSON.parse(JSON.stringify(campaignStages)) as PipelineStage[];
          
          setStages(updatedStages);
          setLatestAnalysis({
            id: data.latestAnalysisId,
            score: data.latestAnalysisScore,
          });
        })
        .finally(() => setLoading(false));
    }, []);
`;

const startIndex = content.indexOf('const campaignStages: PipelineStage[] = [');
const endIndex = content.indexOf('  if (loading) {');

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + replacement + "\n" + content.substring(endIndex);
    fs.writeFileSync('src/components/tiles/StepByStepTileNavigator.tsx', newContent, 'utf-8');
    console.log("Success");
} else {
    console.log("Could not find boundaries", startIndex, endIndex);
}

