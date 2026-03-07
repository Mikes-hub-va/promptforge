import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const alt = "Promptify social preview";

function SocialCard() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "54px",
        background:
          "radial-gradient(circle at top right, rgba(255,107,53,0.28), transparent 32%), radial-gradient(circle at bottom left, rgba(14,165,233,0.18), transparent 34%), linear-gradient(135deg, #fffaf5 0%, #fff1e7 100%)",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          borderRadius: "36px",
          border: "1px solid rgba(148,163,184,0.28)",
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 32px 80px -52px rgba(15,23,42,0.5)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "64%",
            padding: "42px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.92))",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(145deg, #ff6b35, #ff8a48 55%, #ffb84d)",
                }}
              >
                <div style={{ display: "flex", width: "30px", height: "30px", alignItems: "center", justifyContent: "center", borderRadius: "10px", background: "rgba(255,255,255,0.92)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: "6px", height: "16px", borderRadius: "999px", background: "linear-gradient(180deg,#ff6b35,#fb923c)" }} />
                    <div style={{ width: "12px", height: "12px", borderRadius: "999px", background: "radial-gradient(circle at 30% 30%, #0ea5e9, #1d4ed8)", boxShadow: "0 0 0 2px rgba(255,255,255,0.95)" }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", fontSize: "26px", fontWeight: 700 }}>Promptify</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {["Synced accounts", "Managed cloud", "BYOK-ready"].map((chip) => (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    borderRadius: "999px",
                    border: "1px solid rgba(148,163,184,0.35)",
                    background: "rgba(255,255,255,0.9)",
                    padding: "8px 14px",
                    fontSize: "18px",
                    color: "#334155",
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", fontSize: "54px", lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.04em" }}>
                Rough idea in.
              </div>
              <div style={{ display: "flex", fontSize: "54px", lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.04em", color: "#ff6b35" }}>
                Prompt system out.
              </div>
            </div>
            <div style={{ display: "flex", maxWidth: "560px", fontSize: "24px", lineHeight: 1.45, color: "#475569" }}>
              Promptify gives operators a structured workspace for refining briefs, syncing prompt history, and unlocking managed runs when the workflow calls for them.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: "18px", color: "#475569" }}>
            usepromptify.org
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "36%",
            padding: "32px",
            background: "linear-gradient(160deg, rgba(15,118,110,0.08), rgba(14,165,233,0.18))",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              width: "100%",
              borderRadius: "28px",
              border: "1px solid rgba(148,163,184,0.28)",
              background: "rgba(255,255,255,0.9)",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", fontSize: "18px", fontWeight: 700, color: "#334155" }}>Workspace snapshot</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                borderRadius: "20px",
                background: "rgba(15,23,42,0.04)",
                padding: "18px",
              }}
            >
              <div style={{ display: "flex", fontSize: "16px", color: "#64748b" }}>Goal</div>
              <div style={{ display: "flex", fontSize: "24px", fontWeight: 700 }}>Ship a polished pricing page</div>
              <div style={{ display: "flex", fontSize: "16px", color: "#64748b" }}>Runtime</div>
              <div style={{ display: "flex", fontSize: "20px", fontWeight: 700 }}>Local + Promptify Cloud + BYOK</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Accounts, synced history, and saved prompt packs",
                "Managed OpenRouter lane for hosted runs",
                "Model-targeted prompt packs with export-ready layers",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: "10px", fontSize: "16px", color: "#334155" }}>
                  <div style={{ display: "flex", color: "#ff6b35", fontWeight: 700 }}>•</div>
                  <div style={{ display: "flex", lineHeight: 1.4 }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(<SocialCard />, size);
}
