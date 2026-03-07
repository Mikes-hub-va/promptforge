import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "18px",
          background: "linear-gradient(145deg, #ff6b35, #ff8a48 55%, #ffb84d)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "44px",
            height: "44px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 14px 30px -18px rgba(17,24,39,0.45)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: "7px",
                height: "20px",
                borderRadius: "999px",
                background: "linear-gradient(180deg, #ff6b35, #fb923c)",
              }}
            />
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "999px",
                background: "radial-gradient(circle at 30% 30%, #0ea5e9, #1d4ed8)",
                boxShadow: "0 0 0 3px rgba(255,255,255,0.95)",
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
