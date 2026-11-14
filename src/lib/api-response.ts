import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standardized, typed API response utilities
 */

export function apiSuccess<T>(data: T, status = 200, init?: ResponseInit) {
  return NextResponse.json(data, {
    status,
    ...init,
    headers: {
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      ...init?.headers,
    },
  });
}

export function apiError(
  message: string,
  status = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    {
      status,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    }
  );
}

export function handleApiError(error: unknown, fallbackMessage = "An unexpected error occurred") {
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return apiError(
      error.issues[0]?.message || "Validation failed",
      422,
      formattedErrors
    );
  }

  if (error instanceof Error) {
    console.error("[API Error]:", error.message);
    return apiError(error.message, 500);
  }

  console.error("[API Unknown Error]:", error);
  return apiError(fallbackMessage, 500);
}
