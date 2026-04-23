export default function Slide06BubbleBasis() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0d1117" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 90% 50%, rgba(16,185,129,0.05) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="relative z-10"
        style={{ padding: "6vh 7vw 5vh", height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div style={{ marginBottom: "3.5vh" }}>
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "1.3vw",
              color: "#10b981",
              letterSpacing: "0.2em",
              marginBottom: "1vh",
            }}
          >
            BUBBLE BOT · МЕТОД
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
            Перцентильная{" "}
            <span style={{ color: "#10b981" }}>детекция</span>
            <br />
            объёмных аномалий
          </h2>
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
              padding: "2vh 2.5vw",
            }}
          >
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.6vw",
                fontWeight: 600,
                color: "#94a3b8",
                marginBottom: "1.5vh",
              }}
            >
              Три скользящих окна объёма
            </div>
            <div
              style={{
                display: "flex",
                gap: "2.5vw",
              }}
            >
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: "0.5vw",
                  padding: "2vh 1.5vw",
                }}
              >
                <div
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "3.5vw",
                    fontWeight: 700,
                    color: "#10b981",
                    lineHeight: 1,
                    marginBottom: "0.8vh",
                  }}
                >
                  20
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.3vw",
                    color: "#64748b",
                  }}
                >
                  баров
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#94a3b8",
                    marginTop: "0.5vh",
                  }}
                >
                  shortH
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: "0.5vw",
                  padding: "2vh 1.5vw",
                }}
              >
                <div
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "3.5vw",
                    fontWeight: 700,
                    color: "#10b981",
                    lineHeight: 1,
                    marginBottom: "0.8vh",
                  }}
                >
                  50
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.3vw",
                    color: "#64748b",
                  }}
                >
                  баров
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#94a3b8",
                    marginTop: "0.5vh",
                  }}
                >
                  midH
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: "0.5vw",
                  padding: "2vh 1.5vw",
                }}
              >
                <div
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "3.5vw",
                    fontWeight: 700,
                    color: "#10b981",
                    lineHeight: 1,
                    marginBottom: "0.8vh",
                  }}
                >
                  100
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.3vw",
                    color: "#64748b",
                  }}
                >
                  баров
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#94a3b8",
                    marginTop: "0.5vh",
                  }}
                >
                  longH
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "2.5vw",
            }}
          >
            <div
              style={{
                flex: 1,
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
                  marginBottom: "1vh",
                }}
              >
                КАК РАБОТАЕТ
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.55vw",
                  color: "#94a3b8",
                  lineHeight: 1.5,
                }}
              >
                Каждый бар сравнивается с историческим перцентилем этого окна. Если объём выбивается — окно "голосует".
              </div>
            </div>

            <div
              style={{
                flex: 1,
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
                  marginBottom: "1vh",
                }}
              >
                НАПРАВЛЕНИЕ
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.55vw",
                  color: "#94a3b8",
                  lineHeight: 1.5,
                }}
              >
                Бычий бар (close &gt; open) = BUY сигнал. Медвежий (close &lt; open) = SELL. Тикер объёма определяет намерение.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
