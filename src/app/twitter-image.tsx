import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OpenHouse product preview";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background:
            "radial-gradient(circle at 10% 15%, rgba(16,185,129,0.34), transparent 38%), radial-gradient(circle at 85% 80%, rgba(45,212,191,0.28), transparent 40%), linear-gradient(140deg, #022c22 0%, #031223 100%)",
          color: "#f8fafc",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          padding: "50px 60px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #10b981, #0f766e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "21px",
            }}
          >
            OH
          </div>
          <div style={{ fontSize: "30px", fontWeight: 700 }}>OpenHouse</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "930px" }}>
          <div style={{ fontSize: "58px", fontWeight: 700, lineHeight: 1.08 }}>
            AI-native open house operations
          </div>
          <div style={{ fontSize: "26px", opacity: 0.88, lineHeight: 1.35 }}>
            Capture leads. Score intent. Ship seller-ready updates.
          </div>
        </div>

        <div style={{ fontSize: "19px", opacity: 0.88 }}>Free to start · Pro for advanced AI workflows</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
