export default function Slide10AntiSpam() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0d1117" }}
    >
      <div
        className="absolute"
        style={{
          bottom: 0,
          right: 0,
          width: "60vw",
          height: "60vh",
          background:
            "radial-gradient(ellipse at 100% 100%, rgba(245,158,11,0.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="relative z-10"
        style={{
          padding: "6vh 7vw 5vh",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "3vh" }}>
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "1.3vw",
              color: "#f59e0b",
              letterSpacing: "0.2em",
              marginBottom: "1vh",
            }}
          >
            НАДЁЖНОСТЬ
          </div>
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "3.8vw",
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Антиспам и{" "}
            <span style={{ color: "#f59e0b" }}>защита</span>
          </h2>
        </div>

        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2vw",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderRadius: "0.6vw",
                padding: "2.2vh 2vw",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#64748b",
                  letterSpacing: "0.12em",
                  marginBottom: "1vh",
                }}
              >
                КУЛДАУН (BUBBLE BOT)
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "4vw",
                  fontWeight: 700,
                  color: "#f59e0b",
                  lineHeight: 1,
                  marginBottom: "0.5vh",
                }}
              >
                60<span style={{ fontSize: "2vw" }}>мин</span>
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.55vw",
                  color: "#94a3b8",
                  lineHeight: 1.5,
                }}
              >
                Один и тот же тир для одной монеты не повторяется чаще раза в час
              </div>
            </div>

            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderRadius: "0.6vw",
                padding: "2.2vh 2vw",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#64748b",
                  letterSpacing: "0.12em",
                  marginBottom: "1vh",
                }}
              >
                ПОЛНЫЙ СБРОС
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "2.2vw",
                  fontWeight: 700,
                  color: "#e2e8f0",
                  marginBottom: "0.5vh",
                }}
              >
                03:00 МСК
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#64748b",
                  marginBottom: "0.8vh",
                }}
              >
                midnight UTC
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.55vw",
                  color: "#94a3b8",
                }}
              >
                Кулдауны, вотчлист тишины, гейнеры — всё обнуляется
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderRadius: "0.6vw",
                padding: "2.2vh 2vw",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#64748b",
                  letterSpacing: "0.12em",
                  marginBottom: "1vh",
                }}
              >
                ADR ДЕДУПЛИКАЦИЯ
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.55vw",
                  color: "#94a3b8",
                  lineHeight: 1.5,
                }}
              >
                stateMap загружается из БД при старте. signalSentHighAt / signalSentLowAt — временные метки отправки. Сигнал не повторится в тот же день.
              </div>
            </div>

            <div
              style={{
                background: "rgba(245,158,11,0.07)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: "0.6vw",
                padding: "2.2vh 2vw",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#f59e0b",
                  letterSpacing: "0.12em",
                  marginBottom: "1vh",
                }}
              >
                PROD / DEV РАЗДЕЛЕНИЕ
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.55vw",
                  color: "#94a3b8",
                  lineHeight: 1.5,
                  marginBottom: "1vh",
                }}
              >
                Dev-сервер никогда не шлёт сообщения в Telegram. Только production.
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#f59e0b",
                  background: "rgba(245,158,11,0.1)",
                  borderRadius: "0.3vw",
                  padding: "0.6vh 1vw",
                }}
              >
                NODE_ENV === "production"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
