"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090B",
          color: "#F4F4F5",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center", padding: 24 }}>
          {/* Icon */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 16,
              backgroundColor: "rgba(255, 51, 85, 0.1)",
              marginBottom: 32,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF3355"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          {/* Message */}
          <p
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "rgba(255, 51, 85, 0.2)",
              margin: "0 0 8px",
              lineHeight: 1,
              letterSpacing: "-0.025em",
            }}
          >
            500
          </p>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              margin: "0 0 8px",
            }}
          >
            Critical Error
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#A1A1AA",
              lineHeight: 1.6,
              margin: "0 0 32px",
            }}
          >
            A critical error occurred and the application could not recover.
            Please try refreshing the page.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 12,
                color: "rgba(161, 161, 170, 0.6)",
                fontFamily: "monospace",
                marginBottom: 32,
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 36,
                padding: "0 16px",
                borderRadius: 8,
                border: "1px solid rgba(255, 68, 180, 0.15)",
                backgroundColor: "transparent",
                color: "#F4F4F5",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Try Again
            </button>
            <a
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 36,
                padding: "0 16px",
                borderRadius: 8,
                border: "1px solid transparent",
                backgroundColor: "#FF44B4",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                textDecoration: "none",
                fontFamily: "inherit",
              }}
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
