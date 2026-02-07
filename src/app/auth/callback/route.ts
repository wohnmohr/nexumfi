import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Validate next param to prevent open redirect attacks */
function safeRedirectPath(next: string | null): string {
  if (!next || typeof next !== "string") return "/dashboard";
  const trimmed = next.trim();
  // Must be a relative path starting with /, not protocol-relative (//) or absolute (containing :)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes(":")) {
    return "/dashboard";
  }
  return trimmed;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth=open&error=auth_callback_error`);
}
