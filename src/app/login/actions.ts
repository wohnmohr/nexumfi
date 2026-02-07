"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signInWithPassword(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const next = (formData.get("next") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Please enter both email and password" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(next);
}

export async function signUpWithPassword(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const name = (formData.get("name") as string)?.trim() ?? "";

  if (!email || !password) {
    return { error: "Please enter both email and password" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  if (name && name.length < 2) {
    return { error: "Name must be at least 2 characters" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name || "",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Check your email to confirm your account before signing in.",
  };
}

export async function signInWithGoogle(next?: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const dynamicOrigin = origin?.startsWith("http")
    ? origin
    : `${protocol}://${origin}`;

  const baseUrl =
    process.env.NODE_ENV === "development"
      ? dynamicOrigin
      : (process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
        "https://hypermonks-frontend.vercel.app");

  const callbackUrl = next
    ? `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`
    : `${baseUrl}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Please enter your email address" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  const headersList = await headers();
  const origin = headersList.get("origin") || headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = origin?.startsWith("http")
    ? origin
    : `${protocol}://${origin}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Check your email for a password reset link.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
