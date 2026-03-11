// lib/errors.ts
import { NextResponse } from "next/server";

export function handleApiError(e: any) {
  if (e?.name === "ZodError") {
    return NextResponse.json(
      { error: "Validation failed", issues: e.issues },
      { status: 400 }
    );
  }

  const message = e?.message ?? "Unexpected error";

  if (message === "Unauthenticated") {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  if (message === "Missing company_id") {
    return NextResponse.json({ error: message }, { status: 403 });
  }

  return NextResponse.json({ error: message }, { status: 500 });
}
