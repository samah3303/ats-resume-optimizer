export interface InterviewRoomData {
  id: string;
  title: string;
  targetRole: string;
  interviewerName: string;
  candidateName?: string;
  createdAt: number;
  status: "waiting" | "active" | "completed";
  sharedCode: string;
  codeLanguage: string;
  transcript: {
    sender: "interviewer" | "candidate";
    text: string;
    timestamp: number;
  }[];
  scorecard: {
    technicalRating: number;
    communicationRating: number;
    problemSolvingRating: number;
    notes: string;
    recommendation: "strong_hire" | "hire" | "lean_hire" | "no_hire";
  };
}

// In-memory room store for fast real-time signaling & collaboration
const ROOMS_STORE = new Map<string, InterviewRoomData>();

export function getOrCreateRoom(roomId: string, defaults?: Partial<InterviewRoomData>): InterviewRoomData {
  let room = ROOMS_STORE.get(roomId);
  if (!room) {
    room = {
      id: roomId,
      title: defaults?.title || "Technical & Architecture Interview",
      targetRole: defaults?.targetRole || "Staff Software Engineer",
      interviewerName: defaults?.interviewerName || "Lead Technical Interviewer",
      candidateName: defaults?.candidateName || "Candidate",
      createdAt: Date.now(),
      status: "waiting",
      sharedCode: `// Shared Live Coding Pad
function solve(input) {
  // Write synchronized code here
  return input;
}`,
      codeLanguage: "javascript",
      transcript: [],
      scorecard: {
        technicalRating: 4,
        communicationRating: 4,
        problemSolvingRating: 4,
        notes: "",
        recommendation: "hire",
      },
    };
    ROOMS_STORE.set(roomId, room);
  }
  return room;
}

export function updateRoom(roomId: string, updates: Partial<InterviewRoomData>): InterviewRoomData | null {
  const room = ROOMS_STORE.get(roomId);
  if (!room) return null;
  const updated = { ...room, ...updates };
  ROOMS_STORE.set(roomId, updated);
  return updated;
}
