import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OpenHouse — AI-native open house operations";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "radial-gradient(circle at 15% 20%, rgba(16,185,129,0.35), transparent 45%), radial-gradient(circle at 90% 80%, rgba(34,211,238,0.25), transparent 48%), linear-gradient(135deg, #052e2b 0%, #07111b 100%)",
          color: "#f8fafc",
          padding: "64px",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #10b981, #0f766e)",
              color: "white",
              fontWeight: 700,
              fontSize: "24px",
            }}
          >
            OH
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "30px", fontWeight: 700, letterSpacing: "0.01em" }}>OpenHouse</div>
            <div style={{ fontSize: "18px", opacity: 0.8 }}>AI-native brokerage workflow</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "920px" }}>
          <div style={{ fontSize: "62px", fontWeight: 700, lineHeight: 1.08 }}>
            Turn every open house into a measured lead pipeline.
          </div>
          <div style={{ fontSize: "27px", lineHeight: 1.35, opacity: 0.88 }}>
            Branded sign-in, AI lead scoring, and seller-ready reporting in one platform.
          </div>
        </div>

        <div style={{ display: "flex", gap: "18px" }}>
          {["Free + Pro plans", "North America focused", "AI draft-first workflow"].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid rgba(148,163,184,0.35)",
                background: "rgba(2,6,23,0.36)",
                borderRadius: "999px",
                padding: "8px 16px",
                fontSize: "17px",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
