export default function Slide04AdrSignal() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0d1117" }}
    >
      <div
        className="absolute"
        style={{
          top: 0,
          right: 0,
          width: "45vw",
          height: "100vh",
          background:
            "linear-gradient(270deg, rgba(245,158,11,0.04) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="relative z-10"
        style={{ padding: "6vh 7vw 5vh", height: "100%" }}
      >
        <div style={{ marginBottom: "3.5vh" }}>
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "1.3vw",
              color: "#f59e0b",
              letterSpacing: "0.2em",
              marginBottom: "1vh",
            }}
          >
            ADR BOT · ЛОГИКА
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
            Когда срабатывает{" "}
            <span style={{ color: "#f59e0b" }}>сигнал</span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2vw",
            height: "calc(100% - 22vh)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div
              style={{
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: "0.6vw",
                padding: "2.2vh 2vw",
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#10b981",
                  letterSpacing: "0.12em",
                  marginBottom: "1vh",
                }}
              >
                HIGH СИГНАЛ
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.65vw",
                  color: "#e2e8f0",
                  lineHeight: 1.4,
                  marginBottom: "1.5vh",
                }}
              >
                Цена поднялась выше 95% от High уровня ADR
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#10b981",
                  background: "rgba(16,185,129,0.1)",
                  borderRadius: "0.3vw",
                  padding: "0.8vh 1.2vw",
                }}
              >
                progressToHigh &gt;= 0.95
              </div>
            </div>

            <div
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "0.6vw",
                padding: "2.2vh 2vw",
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#ef4444",
                  letterSpacing: "0.12em",
                  marginBottom: "1vh",
                }}
              >
                LOW СИГНАЛ
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.65vw",
                  color: "#e2e8f0",
                  lineHeight: 1.4,
                  marginBottom: "1.5vh",
                }}
              >
                Цена опустилась ниже 95% от Low уровня ADR
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#ef4444",
                  background: "rgba(239,68,68,0.1)",
                  borderRadius: "0.3vw",
                  padding: "0.8vh 1.2vw",
                }}
              >
                progressToLow &gt;= 0.95
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
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "5vw",
                  fontWeight: 700,
                  color: "#f59e0b",
                  lineHeight: 1,
                  marginBottom: "0.5vh",
                }}
              >
                95<span style={{ fontSize: "2.5vw" }}>%</span>
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.6vw",
                  color: "#94a3b8",
                }}
              >
                Порог срабатывания
              </div>
            </div>

            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderRadius: "0.6vw",
                padding: "2.2vh 2vw",
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
                ЗАЩИТА ОТ ДУБЛЕЙ
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.65vw",
                  color: "#e2e8f0",
                  lineHeight: 1.5,
                }}
              >
                Не более 1 HIGH и 1 LOW сигнала на монету в день
              </div>
              <div
                style={{
                  marginTop: "1.2vh",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#64748b",
                }}
              >
                Сброс в 03:00 МСК (midnight UTC)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
