export default function Slide02Overview() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col"
      style={{ background: "#0d1117", padding: "6vh 7vw 5vh" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.04) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div style={{ marginBottom: "4vh" }}>
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "1.3vw",
              color: "#f59e0b",
              letterSpacing: "0.2em",
              marginBottom: "1vh",
            }}
          >
            АРХИТЕКТУРА
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
            Система из двух ботов
          </h2>
        </div>

        <div
          className="flex-1 flex"
          style={{ gap: "2.5vw", alignItems: "stretch" }}
        >
          <div
            style={{
              flex: 1,
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "0.6vw",
              padding: "3vh 2.5vw",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "1.2vw",
                color: "#f59e0b",
                letterSpacing: "0.15em",
                marginBottom: "1.5vh",
              }}
            >
              BOT 1
            </div>
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "2.6vw",
                fontWeight: 700,
                color: "#f59e0b",
                marginBottom: "1.5vh",
                letterSpacing: "-0.01em",
              }}
            >
              ADR Bot
            </div>
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.7vw",
                color: "#94a3b8",
                lineHeight: 1.5,
                marginBottom: "2.5vh",
                flex: 1,
              }}
            >
              Отслеживает приближение цены к уровням средне&shy;дневного диапазона. Сигналы — когда монета достигает 95% своего ADR(14).
            </div>
            <div
              style={{
                background: "rgba(245,158,11,0.1)",
                borderRadius: "0.4vw",
                padding: "1.2vh 1.5vw",
                display: "flex",
                alignItems: "center",
                gap: "1vw",
              }}
            >
              <div
                style={{
                  width: "0.8vw",
                  height: "0.8vw",
                  borderRadius: "50%",
                  background: "#f59e0b",
                }}
              />
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.4vw",
                  color: "#f59e0b",
                  fontWeight: 600,
                }}
              >
                Telegram (только PROD)
              </span>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.22)",
              borderRadius: "0.6vw",
              padding: "3vh 2.5vw",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "1.2vw",
                color: "#10b981",
                letterSpacing: "0.15em",
                marginBottom: "1.5vh",
              }}
            >
              BOT 2
            </div>
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "2.6vw",
                fontWeight: 700,
                color: "#10b981",
                marginBottom: "1.5vh",
                letterSpacing: "-0.01em",
              }}
            >
              Bubble Bot
            </div>
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.7vw",
                color: "#94a3b8",
                lineHeight: 1.5,
                marginBottom: "2.5vh",
                flex: 1,
              }}
            >
              Детектирует аномальные объёмы по трём перцентильным окнам. Ловит крупные покупки и продажи ещё до движения цены.
            </div>
            <div
              style={{
                background: "rgba(16,185,129,0.1)",
                borderRadius: "0.4vw",
                padding: "1.2vh 1.5vw",
                display: "flex",
                alignItems: "center",
                gap: "1vw",
              }}
            >
              <div
                style={{
                  width: "0.8vw",
                  height: "0.8vw",
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
              <span
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.4vw",
                  color: "#10b981",
                  fontWeight: 600,
                }}
              >
                Dashboard (Telegram отключён)
              </span>
            </div>
          </div>

          <div
            style={{
              width: "20vw",
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "rgba(22,27,34,1)",
                border: "1px solid rgba(48,54,61,0.8)",
                borderRadius: "0.6vw",
                padding: "2.5vh 2vw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
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
                ИСТОЧНИК ДАННЫХ
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.8vw",
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}
              >
                OKX API
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#94a3b8",
                  marginTop: "0.5vh",
                }}
              >
                256 PERP пар
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(22,27,34,1)",
                border: "1px solid rgba(48,54,61,0.8)",
                borderRadius: "0.6vw",
                padding: "2.5vh 2vw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
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
                СКАНИРОВАНИЕ
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.8vw",
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}
              >
                каждые 60 сек
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#94a3b8",
                  marginTop: "0.5vh",
                }}
              >
                24 / 7
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
