export default function Slide09Dashboard() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0d1117" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.04) 0%, transparent 60%)",
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
              color: "#10b981",
              letterSpacing: "0.2em",
              marginBottom: "1vh",
            }}
          >
            DASHBOARD
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
            Живой <span style={{ color: "#10b981" }}>терминал</span>
          </h2>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            gap: "2.5vw",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
            }}
          >
            <div
              style={{
                background: "rgba(245,158,11,0.07)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: "0.6vw",
                padding: "2vh 2vw",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#f59e0b",
                  letterSpacing: "0.12em",
                  marginBottom: "1.2vh",
                }}
              >
                ВКЛАДКА: ADR BOT
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.55vw",
                  color: "#94a3b8",
                  lineHeight: 1.5,
                  marginBottom: "1.5vh",
                }}
              >
                Лента сигналов HIGH/LOW с прогрессом по ADR. Монета, направление, % прохождения, время.
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1vw",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    borderRadius: "0.3vw",
                    padding: "0.4vh 0.8vw",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#10b981",
                  }}
                >
                  HIGH
                </div>
                <div
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "0.3vw",
                    padding: "0.4vh 0.8vw",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#ef4444",
                  }}
                >
                  LOW
                </div>
              </div>
            </div>

            <div
              style={{
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.22)",
                borderRadius: "0.6vw",
                padding: "2vh 2vw",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#10b981",
                  letterSpacing: "0.12em",
                  marginBottom: "1.2vh",
                }}
              >
                ВКЛАДКА: BUBBLE BOT
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.55vw",
                  color: "#94a3b8",
                  lineHeight: 1.5,
                  marginBottom: "1.5vh",
                }}
              >
                BIG·BUY и BIG·SELL сигналы реального времени. Внизу — вотчлист "ДОЛГАЯ ТИШИНА".
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1vw",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    borderRadius: "0.3vw",
                    padding: "0.4vh 0.8vw",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#10b981",
                  }}
                >
                  BIG·BUY
                </div>
                <div
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "0.3vw",
                    padding: "0.4vh 0.8vw",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#ef4444",
                  }}
                >
                  BIG·SELL
                </div>
                <div
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: "0.3vw",
                    padding: "0.4vh 0.8vw",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#f59e0b",
                  }}
                >
                  Луна
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
            }}
          >
            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderRadius: "0.6vw",
                padding: "2vh 2vw",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#64748b",
                  letterSpacing: "0.12em",
                  marginBottom: "1.2vh",
                }}
              >
                ТОП ГЕЙНЕРОВ
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.55vw",
                  color: "#94a3b8",
                  lineHeight: 1.5,
                }}
              >
                Live список монет с наибольшим % роста за день. Полезный контекст к сигналам.
              </div>
            </div>

            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderRadius: "0.6vw",
                padding: "2vh 2vw",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#64748b",
                  letterSpacing: "0.12em",
                  marginBottom: "1.2vh",
                }}
              >
                ОПРОС ДАННЫХ
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
                Фронтенд обновляет данные каждые 10 секунд через REST API.
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#10b981",
                  background: "rgba(16,185,129,0.08)",
                  borderRadius: "0.3vw",
                  padding: "0.6vh 1vw",
                }}
              >
                Polling: 10s interval
              </div>
            </div>

            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderRadius: "0.6vw",
                padding: "2vh 2vw",
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#64748b",
                  letterSpacing: "0.12em",
                  marginBottom: "0.8vh",
                }}
              >
                СТЕК
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#94a3b8",
                }}
              >
                React · Express · PostgreSQL · OKX API
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
