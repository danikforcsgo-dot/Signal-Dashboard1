export default function Slide05AdrTelegram() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0d1117" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 80%, rgba(245,158,11,0.05) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="relative z-10 flex h-full"
        style={{ padding: "6vh 7vw 5vh" }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            marginRight: "5vw",
          }}
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
              ADR BOT · TELEGRAM
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
              Как выглядит
              <br />
              <span style={{ color: "#f59e0b" }}>уведомление</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2vh", flex: 1 }}>
            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderLeft: "3px solid #f59e0b",
                borderRadius: "0.5vw",
                padding: "1.5vh 1.8vw",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.6vw",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  marginBottom: "0.4vh",
                }}
              >
                Монета и направление
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#64748b",
                }}
              >
                BTC-USDT-SWAP · HIGH
              </div>
            </div>

            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderLeft: "3px solid #f59e0b",
                borderRadius: "0.5vw",
                padding: "1.5vh 1.8vw",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.6vw",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  marginBottom: "0.4vh",
                }}
              >
                Текущая цена и уровень ADR
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#64748b",
                }}
              >
                Price: 95,480 · ADR High: 95,200
              </div>
            </div>

            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderLeft: "3px solid #f59e0b",
                borderRadius: "0.5vw",
                padding: "1.5vh 1.8vw",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.6vw",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  marginBottom: "0.4vh",
                }}
              >
                % прохождения и ADR(14) значение
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#64748b",
                }}
              >
                Progress: 97.3% · ADR: 1,850 USDT
              </div>
            </div>

            <div
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: "0.5vw",
                padding: "1.5vh 1.8vw",
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#f59e0b",
                }}
              >
                Только в production · NODE_ENV === "production"
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            width: "34vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              background: "#1e2029",
              border: "1px solid rgba(48,54,61,0.9)",
              borderRadius: "1vw",
              overflow: "hidden",
              boxShadow: "0 2vw 4vw rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                background: "#2b5278",
                padding: "1.2vh 1.8vw",
                display: "flex",
                alignItems: "center",
                gap: "1vw",
              }}
            >
              <div
                style={{
                  width: "2.2vw",
                  height: "2.2vw",
                  borderRadius: "50%",
                  background: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.2vw",
                  fontWeight: 700,
                  color: "#0d1117",
                }}
              >
                S
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "1.4vw",
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  Signal Terminal Bot
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.1vw",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  bot
                </div>
              </div>
            </div>

            <div style={{ padding: "2vh 1.8vw" }}>
              <div
                style={{
                  background: "#17212b",
                  borderRadius: "0.5vw",
                  padding: "1.5vh 1.5vw",
                  marginBottom: "1.2vh",
                }}
              >
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.35vw",
                    color: "#10b981",
                    fontWeight: 600,
                    marginBottom: "0.5vh",
                  }}
                >
                  ADR HIGH
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.5vw",
                    color: "#e2e8f0",
                    fontWeight: 600,
                    marginBottom: "0.5vh",
                  }}
                >
                  BTC-USDT-SWAP
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#94a3b8",
                    marginBottom: "0.3vh",
                  }}
                >
                  Price: 95,480 USDT
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#94a3b8",
                    marginBottom: "0.3vh",
                  }}
                >
                  ADR High: 95,200 USDT
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#94a3b8",
                    marginBottom: "0.3vh",
                  }}
                >
                  Progress: 97.3%
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#94a3b8",
                  }}
                >
                  ADR(14): 1,850 USDT
                </div>
                <div
                  style={{
                    marginTop: "0.8vh",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.1vw",
                    color: "#64748b",
                  }}
                >
                  14:23 UTC
                </div>
              </div>

              <div
                style={{
                  background: "#17212b",
                  borderRadius: "0.5vw",
                  padding: "1.5vh 1.5vw",
                }}
              >
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.35vw",
                    color: "#ef4444",
                    fontWeight: 600,
                    marginBottom: "0.5vh",
                  }}
                >
                  ADR LOW
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.5vw",
                    color: "#e2e8f0",
                    fontWeight: 600,
                    marginBottom: "0.5vh",
                  }}
                >
                  ETH-USDT-SWAP
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#94a3b8",
                    marginBottom: "0.3vh",
                  }}
                >
                  Price: 1,612 USDT
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#94a3b8",
                  }}
                >
                  Progress: 96.1%
                </div>
                <div
                  style={{
                    marginTop: "0.8vh",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.1vw",
                    color: "#64748b",
                  }}
                >
                  14:31 UTC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
