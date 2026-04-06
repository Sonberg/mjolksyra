"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, sans-serif", background: "#f2f3f4" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "28rem",
              border: "1px solid #d0d0d0",
              background: "#ffffff",
              padding: "2rem",
            }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "#767676",
                margin: 0,
              }}
            >
              Error
            </p>
            <h1
              style={{
                marginTop: "0.5rem",
                fontSize: "2rem",
                fontWeight: 600,
                color: "#1b1b1b",
              }}
            >
              Something went wrong
            </h1>
            <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#767676" }}>
              An unexpected error occurred. Try refreshing the page.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: "1.5rem",
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid #d0d0d0",
                background: "#333333",
                color: "#ffffff",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
