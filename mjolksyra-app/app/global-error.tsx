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
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#fff7ec" }}>
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
              border: "2px solid #2a241d",
              background: "#fff7ec",
              padding: "2rem",
            }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "#5e5448",
                margin: 0,
              }}
            >
              Error
            </p>
            <h1
              style={{
                marginTop: "0.5rem",
                fontSize: "2rem",
                fontWeight: 400,
                color: "#101010",
              }}
            >
              Something went wrong
            </h1>
            <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#5e5448" }}>
              An unexpected error occurred. Try refreshing the page.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: "1.5rem",
                display: "inline-flex",
                alignItems: "center",
                border: "2px solid #2a241d",
                background: "#101010",
                color: "#fff7ec",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
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
