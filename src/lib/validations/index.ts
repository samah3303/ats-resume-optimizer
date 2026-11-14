import { z } from "zod";
import { sanitizeText, sanitizeUrl, sanitizeEmail } from "@/lib/sanitize";

// ==========================================
// Authentication Schemas
// ==========================================
export const registerSchema = z.object({
  email: z
    .string()
    .min(3, "Email is required")
    .max(255, "Email is too long")
    .email("Invalid email format")
    .transform(sanitizeEmail),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
  name: z
    .string()
    .max(100, "Name is too long")
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeText(val) : null)),
});

export const setupPasswordSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must not exceed 128 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(3, "Email is required")
    .max(255, "Email is too long")
    .email("Invalid email format")
    .transform(sanitizeEmail),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Invalid reset token"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
});

// ==========================================
// Candidate Profile Schemas
// ==========================================
export const experienceItemSchema = z.object({
  title: z.string().max(120).transform(sanitizeText),
  company: z.string().max(120).transform(sanitizeText),
  startDate: z.string().max(50).transform(sanitizeText),
  endDate: z.string().max(50).transform(sanitizeText),
  description: z.string().max(4000).optional().transform((v) => (v ? sanitizeText(v) : "")),
});

export const educationItemSchema = z.object({
  degree: z.string().max(120).transform(sanitizeText),
  institution: z.string().max(150).transform(sanitizeText),
  year: z.string().max(30).transform(sanitizeText),
});

export const profilePreferencesSchema = z
  .object({
    platforms: z.array(z.string().max(50)).optional(),
    locations: z.array(z.string().max(100)).optional(),
    workModes: z.array(z.string().max(50)).optional(),
    minSalary: z.string().max(50).optional().nullable(),
    experienceLevel: z.string().max(50).optional().nullable(),
  })
  .optional()
  .nullable();

export const updateProfileSchema = z.object({
  name: z
    .string()
    .max(100)
    .optional()
    .transform((v) => (v !== undefined ? sanitizeText(v) : undefined)),
  phone: z
    .string()
    .max(30)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : null)),
  location: z
    .string()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : null)),
  targetRoles: z
    .array(z.string().max(100).transform(sanitizeText))
    .optional()
    .default([]),
  jobType: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : null)),
  linkedinUrl: z
    .string()
    .max(300)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeUrl(v) : null)),
  portfolioUrl: z
    .string()
    .max(300)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeUrl(v) : null)),
  githubUrl: z
    .string()
    .max(300)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeUrl(v) : null)),
  skills: z
    .array(z.string().max(60).transform(sanitizeText))
    .optional()
    .default([]),
  experience: z.array(experienceItemSchema).optional().default([]),
  education: z.array(educationItemSchema).optional().default([]),
  summary: z
    .string()
    .max(5000)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : null)),
  preferences: profilePreferencesSchema,
  onboardingDone: z.boolean().optional(),
});

// ==========================================
// Job Schemas
// ==========================================
export const createJobSchema = z.object({
  title: z
    .string()
    .min(1, "Job title is required")
    .max(200, "Title is too long")
    .transform(sanitizeText),
  company: z
    .string()
    .max(150)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : null)),
  location: z
    .string()
    .max(150)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : null)),
  salary: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : null)),
  jobType: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : null)),
  description: z
    .string()
    .max(30000, "Description exceeds max length")
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : null)),
  requirements: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .nullable()
    .transform((v) => {
      if (!v) return null;
      if (Array.isArray(v)) {
        return v.map(sanitizeText).filter(Boolean).join("\n");
      }
      return sanitizeText(v);
    }),
  sourceUrl: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeUrl(v) : null)),
  source: z
    .string()
    .max(50)
    .optional()
    .default("manual")
    .transform(sanitizeText),
  matchScore: z.number().min(0).max(100).optional().nullable(),
});

export const updateJobSchema = createJobSchema.partial().extend({
  isBookmarked: z.boolean().optional(),
});

export const patchBookmarkSchema = z.object({
  isBookmarked: z.boolean(),
});

export const parseUrlSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .max(1500, "URL is too long")
    .refine((u) => u.startsWith("http://") || u.startsWith("https://"), {
      message: "URL must begin with http:// or https://",
    }),
});

// ==========================================
// Application Schemas
// ==========================================
export const validApplicationStatuses = [
  "wishlist",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
] as const;

export const createApplicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required").max(100),
  status: z.enum(validApplicationStatuses).optional().default("wishlist"),
});

export const updateApplicationSchema = z.object({
  status: z.enum(validApplicationStatuses).optional(),
  notes: z
    .string()
    .max(10000)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : null)),
  contactPerson: z
    .string()
    .max(150)
    .optional()
    .nullable()
    .transform((v) => (v ? sanitizeText(v) : null)),
  interviewDate: z
    .string()
    .max(60)
    .optional()
    .nullable()
    .transform((v) => {
      if (!v || !v.trim()) return null;
      const d = new Date(v.trim());
      return isNaN(d.getTime()) ? null : d.toISOString();
    }),
  coverLetter: z.string().max(20000).optional().nullable(),
  resumeUpdates: z.string().max(30000).optional().nullable(),
  atsScore: z.number().min(0).max(100).optional().nullable(),
});

// ==========================================
// AI Generation Schemas
// ==========================================
export const generateCoverLetterSchema = z.object({
  jobId: z.string().min(1, "Job ID is required").max(100),
});

export const generateResumeUpdatesSchema = z.object({
  jobId: z.string().min(1, "Job ID is required").max(100),
});

export const generateFollowupSchema = z.object({
  jobId: z.string().min(1, "Job ID is required").max(100),
  context: z.string().max(200).optional().default("following up on application"),
});

export const generateLinkedInSchema = z.object({
  jobId: z.string().min(1, "Job ID is required").max(100),
  type: z.string().max(100).optional(),
  messageType: z.string().max(100).optional(),
});

// ==========================================
// Admin Schemas
// ==========================================
export const adminUserUpdateSchema = z.object({
  role: z.enum(["admin", "user"]),
});
