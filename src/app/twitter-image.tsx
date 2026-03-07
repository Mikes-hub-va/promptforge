import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 600,
};

export const contentType = "image/png";

export const alt = "Promptify Twitter preview";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "42px",
          background:
            "radial-gradient(circle at top right, rgba(255,107,53,0.24), transparent 30%), radial-gradient(circle at bottom left, rgba(14,165,233,0.16), transparent 32%), linear-gradient(135deg, #fffaf5 0%, #fff1e7 100%)",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            borderRadius: "32px",
            border: "1px solid rgba(148,163,184,0.28)",
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 32px 80px -52px rgba(15,23,42,0.45)",
            padding: "36px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "700px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    width: "42px",
                    height: "42px",
                    borderRadius: "14px",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(145deg, #ff6b35, #ff8a48 55%, #ffb84d)",
                  }}
                >
                  <div style={{ display: "flex", width: "28px", height: "28px", alignItems: "center", justifyContent: "center", borderRadius: "10px", background: "rgba(255,255,255,0.92)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <div style={{ width: "6px", height: "15px", borderRadius: "999px", background: "linear-gradient(180deg,#ff6b35,#fb923c)" }} />
                      <div style={{ width: "11px", height: "11px", borderRadius: "999px", background: "radial-gradient(circle at 30% 30%, #0ea5e9, #1d4ed8)", boxShadow: "0 0 0 2px rgba(255,255,255,0.95)" }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", fontSize: "26px", fontWeight: 700 }}>Promptify</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", fontSize: "54px", lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.04em" }}>
                  Rough brief in.
                </div>
                <div style={{ display: "flex", fontSize: "54px", lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.04em", color: "#ff6b35" }}>
                  Operator-grade pack out.
                </div>
              </div>
              <div style={{ display: "flex", fontSize: "24px", lineHeight: 1.45, color: "#475569" }}>
                Synced accounts, managed runs, BYOK routing, and a workspace that makes prompt quality feel operational instead of messy.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Starter free", "Managed cloud", "$12 Pro"].map((chip) => (
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
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(148,163,184,0.18)",
              paddingTop: "20px",
              fontSize: "18px",
              color: "#475569",
            }}
          >
            <div style={{ display: "flex" }}>usepromptify.org</div>
            <div style={{ display: "flex" }}>Prompt systems for people shipping real work</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
