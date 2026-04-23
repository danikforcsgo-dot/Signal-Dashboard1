export default function Slide03AdrBasis() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0d1117" }}
    >
      <div
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: "50vw",
          height: "100vh",
          background:
            "linear-gradient(90deg, rgba(245,158,11,0.05) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 12.5vh",
          pointerEvents: "none",
        }}
      />

      <div
        className="relative z-10 flex h-full"
        style={{ padding: "6vh 7vw 5vh" }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
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
              ADR BOT · ОСНОВА
            </div>
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "3.8vw",
                fontWeight: 700,
                color: "#e2e8f0",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                textWrap: "balance",
              }}
            >
              Average Daily
              <br />
              <span style={{ color: "#f59e0b" }}>Range (14)</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2vh", flex: 1 }}>
            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderLeft: "3px solid #f59e0b",
                borderRadius: "0.5vw",
                padding: "1.8vh 2vw",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.6vw",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  marginBottom: "0.6vh",
                }}
              >
                Дневная свеча
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.4vw",
                  color: "#94a3b8",
                }}
              >
                High - Low = диапазон одного дня
              </div>
            </div>

            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderLeft: "3px solid #f59e0b",
                borderRadius: "0.5vw",
                padding: "1.8vh 2vw",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.6vw",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  marginBottom: "0.6vh",
                }}
              >
                ADR(14)
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.4vw",
                  color: "#94a3b8",
                }}
              >
                Среднее 14 последних дневных диапазонов
              </div>
            </div>

            <div
              style={{
                background: "rgba(22,27,34,0.9)",
                border: "1px solid rgba(48,54,61,0.7)",
                borderLeft: "3px solid #f59e0b",
                borderRadius: "0.5vw",
                padding: "1.8vh 2vw",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.6vw",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  marginBottom: "0.6vh",
                }}
              >
                Уровни HIGH / LOW
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.4vw",
                  color: "#94a3b8",
                }}
              >
                Вчерашний close ± ADR(14)
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            width: "38vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: "3vw",
          }}
        >
          <div
            style={{
              width: "100%",
              background: "rgba(22,27,34,0.9)",
              border: "1px solid rgba(48,54,61,0.7)",
              borderRadius: "0.8vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "1.1vw",
                color: "#64748b",
                letterSpacing: "0.15em",
                marginBottom: "2.5vh",
              }}
            >
              ПРИМЕР: BTC-USDT-SWAP
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5vh",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.4vw",
                    color: "#64748b",
                  }}
                >
                  High уровень
                </span>
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.6vw",
                    fontWeight: 600,
                    color: "#10b981",
                  }}
                >
                  close + ADR
                </span>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "rgba(16,185,129,0.3)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "-0.5vh",
                    width: "3vw",
                    height: "1.5vh",
                    background: "rgba(16,185,129,0.2)",
                    border: "1px solid rgba(16,185,129,0.5)",
                    borderRadius: "0.2vw",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  borderRadius: "0.4vw",
                  padding: "1vh 1.2vw",
                }}
              >
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.4vw",
                    color: "#f59e0b",
                  }}
                >
                  Вчерашний close
                </span>
                <span
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "1.6vw",
                    fontWeight: 700,
                    color: "#f59e0b",
                  }}
                >
                  BASE
                </span>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "rgba(239,68,68,0.3)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "-0.5vh",
                    width: "3vw",
                    height: "1.5vh",
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.5)",
                    borderRadius: "0.2vw",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.4vw",
                    color: "#64748b",
                  }}
                >
                  Low уровень
                </span>
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.6vw",
                    fontWeight: 600,
                    color: "#ef4444",
                  }}
                >
                  close - ADR
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: "2.5vh",
                paddingTop: "2vh",
                borderTop: "1px solid rgba(48,54,61,0.7)",
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "1.3vw",
                color: "#64748b",
                textAlign: "center",
              }}
            >
              Обновляется каждый день в 03:00 МСК
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
