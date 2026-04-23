export default function Slide07BubbleTiers() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0d1117" }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)",
          backgroundSize: "8vw 8vw",
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
            BUBBLE BOT · УРОВНИ
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
            Три тира <span style={{ color: "#10b981" }}>сигналов</span>
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
              display: "flex",
              alignItems: "center",
              gap: "3vw",
            }}
          >
            <div style={{ width: "10vw", flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "2.2vw",
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: "0.05em",
                }}
              >
                SMALL
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.2vw",
                  color: "#64748b",
                  marginTop: "0.3vh",
                }}
              >
                1 окно
              </div>
            </div>
            <div
              style={{
                width: "1px",
                height: "5vh",
                background: "rgba(48,54,61,0.8)",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.4vw",
                  color: "#94a3b8",
                  marginBottom: "0.5vh",
                }}
              >
                Одно окно превысило P75 своего диапазона
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1vw",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    height: "0.7vh",
                    width: "33%",
                    background: "#94a3b8",
                    borderRadius: "1vw",
                  }}
                />
                <div
                  style={{
                    height: "0.7vh",
                    width: "33%",
                    background: "rgba(48,54,61,0.5)",
                    borderRadius: "1vw",
                  }}
                />
                <div
                  style={{
                    height: "0.7vh",
                    width: "33%",
                    background: "rgba(48,54,61,0.5)",
                    borderRadius: "1vw",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "1.5vw",
                color: "#94a3b8",
                fontWeight: 600,
              }}
            >
              &gt; P75
            </div>
          </div>

          <div
            style={{
              background: "rgba(22,27,34,0.9)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "0.6vw",
              padding: "2vh 2.5vw",
              display: "flex",
              alignItems: "center",
              gap: "3vw",
            }}
          >
            <div style={{ width: "10vw", flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "2.2vw",
                  fontWeight: 700,
                  color: "#f59e0b",
                  letterSpacing: "0.05em",
                }}
              >
                MEDIUM
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.2vw",
                  color: "#64748b",
                  marginTop: "0.3vh",
                }}
              >
                2 окна
              </div>
            </div>
            <div
              style={{
                width: "1px",
                height: "5vh",
                background: "rgba(48,54,61,0.8)",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.4vw",
                  color: "#94a3b8",
                  marginBottom: "0.5vh",
                }}
              >
                Два окна превысили свои пороги
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1vw",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    height: "0.7vh",
                    width: "33%",
                    background: "#f59e0b",
                    borderRadius: "1vw",
                  }}
                />
                <div
                  style={{
                    height: "0.7vh",
                    width: "33%",
                    background: "#f59e0b",
                    borderRadius: "1vw",
                  }}
                />
                <div
                  style={{
                    height: "0.7vh",
                    width: "33%",
                    background: "rgba(48,54,61,0.5)",
                    borderRadius: "1vw",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "1.5vw",
                color: "#f59e0b",
                fontWeight: 600,
              }}
            >
              &gt; P90
            </div>
          </div>

          <div
            style={{
              background: "rgba(16,185,129,0.07)",
              border: "1px solid rgba(16,185,129,0.35)",
              borderRadius: "0.6vw",
              padding: "2vh 2.5vw",
              display: "flex",
              alignItems: "center",
              gap: "3vw",
            }}
          >
            <div style={{ width: "10vw", flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "2.2vw",
                  fontWeight: 700,
                  color: "#10b981",
                  letterSpacing: "0.05em",
                }}
              >
                BIG
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.2vw",
                  color: "#64748b",
                  marginTop: "0.3vh",
                }}
              >
                3 окна
              </div>
            </div>
            <div
              style={{
                width: "1px",
                height: "5vh",
                background: "rgba(48,54,61,0.8)",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.4vw",
                  color: "#94a3b8",
                  marginBottom: "0.5vh",
                }}
              >
                Консенсус: все три окна превысили P97
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1vw",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    height: "0.7vh",
                    width: "33%",
                    background: "#10b981",
                    borderRadius: "1vw",
                  }}
                />
                <div
                  style={{
                    height: "0.7vh",
                    width: "33%",
                    background: "#10b981",
                    borderRadius: "1vw",
                  }}
                />
                <div
                  style={{
                    height: "0.7vh",
                    width: "33%",
                    background: "#10b981",
                    borderRadius: "1vw",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5vh",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.5vw",
                  color: "#10b981",
                  fontWeight: 600,
                }}
              >
                &gt; P97
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.1vw",
                  color: "#64748b",
                }}
              >
                BIG·BUY / BIG·SELL
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(22,27,34,0.9)",
              border: "1px solid rgba(48,54,61,0.7)",
              borderRadius: "0.6vw",
              padding: "1.5vh 2.5vw",
              display: "flex",
              alignItems: "center",
              gap: "2vw",
            }}
          >
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "1.1vw",
                color: "#64748b",
                letterSpacing: "0.1em",
              }}
            >
              ЭСКАЛАЦИЯ ТИРА
            </div>
            <div
              style={{
                width: "1px",
                height: "3vh",
                background: "rgba(48,54,61,0.8)",
              }}
            />
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.55vw",
                color: "#94a3b8",
              }}
            >
              Повышение тира (SMALL → MEDIUM → BIG) всегда проходит мгновенно, минуя кулдаун
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
