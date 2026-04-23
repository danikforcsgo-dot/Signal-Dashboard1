const base = import.meta.env.BASE_URL;

export default function Slide01Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0d1117" }}>
      <img
        src={`${base}hero.png`}
        crossOrigin="anonymous"
        alt="Signal Terminal hero"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.35 }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(13,17,23,0.95) 0%, rgba(13,17,23,0.7) 50%, rgba(13,17,23,0.92) 100%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,158,11,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.06) 1px, transparent 1px)",
          backgroundSize: "6vw 6vw",
        }}
      />

      <div className="relative z-10 flex flex-col justify-center h-full" style={{ paddingLeft: "7vw", paddingRight: "7vw" }}>
        <div className="flex items-center" style={{ marginBottom: "1.5vh", gap: "1.2vw" }}>
          <div style={{ width: "3.5vw", height: "0.25vh", background: "#f59e0b" }} />
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "1.4vw",
              color: "#f59e0b",
              letterSpacing: "0.25em",
              fontWeight: 500,
            }}
          >
            OKX PERPS · APRIL 2026
          </span>
        </div>

        <h1
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "8.5vw",
            fontWeight: 700,
            color: "#e2e8f0",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            textWrap: "balance",
            marginBottom: "2vh",
          }}
        >
          SIGNAL
          <br />
          <span style={{ color: "#f59e0b" }}>TERMINAL</span>
        </h1>

        <p
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "2.2vw",
            fontWeight: 400,
            color: "#94a3b8",
            letterSpacing: "0.02em",
            marginBottom: "5vh",
            textWrap: "balance",
          }}
        >
          Два бота. 256 бессрочных контрактов. Один терминал.
        </p>

        <div className="flex" style={{ gap: "3vw" }}>
          <div
            style={{
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.35)",
              borderRadius: "0.4vw",
              padding: "1.2vh 1.8vw",
            }}
          >
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.5vw",
                fontWeight: 600,
                color: "#f59e0b",
                letterSpacing: "0.05em",
              }}
            >
              ADR BOT
            </div>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "1.2vw",
                color: "#64748b",
                marginTop: "0.3vh",
              }}
            >
              Telegram · Уровни диапазона
            </div>
          </div>

          <div
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "0.4vw",
              padding: "1.2vh 1.8vw",
            }}
          >
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.5vw",
                fontWeight: 600,
                color: "#10b981",
                letterSpacing: "0.05em",
              }}
            >
              BUBBLE BOT
            </div>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "1.2vw",
                color: "#64748b",
                marginTop: "0.3vh",
              }}
            >
              Dashboard · Объёмные аномалии
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute"
        style={{
          bottom: "4vh",
          right: "5vw",
          width: "18vw",
          height: "18vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
