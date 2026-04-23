export default function Slide08Silence() {
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
          width: "50vw",
          height: "100vh",
          background:
            "linear-gradient(270deg, rgba(245,158,11,0.04) 0%, transparent 100%)",
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
            marginRight: "4vw",
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
              BUBBLE BOT · ВОТЧЛИСТ
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
              ДОЛГАЯ{" "}
              <span style={{ color: "#f59e0b" }}>ТИШИНА</span>
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
              flex: 1,
            }}
          >
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
                  fontSize: "1.65vw",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  marginBottom: "0.6vh",
                }}
              >
                Монета "молчит" 3+ дня
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#94a3b8",
                }}
              >
                Не было ни одного BIG-сигнала более 3 суток
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
                  fontSize: "1.65vw",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  marginBottom: "0.6vh",
                }}
              >
                Монета "выходит из тишины"
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#94a3b8",
                }}
              >
                Первый BIG-сигнал после долгой паузы — особый маркер
              </div>
            </div>

            <div
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "0.5vw",
                padding: "1.8vh 2vw",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "1.65vw",
                  fontWeight: 600,
                  color: "#f59e0b",
                  marginBottom: "0.6vh",
                }}
              >
                Сохраняется в базе данных
              </div>
              <div
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "1.3vw",
                  color: "#94a3b8",
                }}
              >
                silenceDays: количество дней хранится в signals table
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            width: "34vw",
            display: "flex",
            flexDirection: "column",
            gap: "2vh",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "1.1vw",
              color: "#64748b",
              letterSpacing: "0.15em",
              marginBottom: "0.5vh",
            }}
          >
            DASHBOARD · ПРИМЕР КАРТОЧКИ
          </div>

          <div
            style={{
              background: "rgba(22,27,34,0.9)",
              border: "2px solid rgba(245,158,11,0.6)",
              borderRadius: "0.8vw",
              padding: "2.2vh 2.2vw",
              boxShadow: "0 0 2vw rgba(245,158,11,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.2vh",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: "2vw",
                    fontWeight: 700,
                    color: "#e2e8f0",
                  }}
                >
                  SOL-USDT
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.2vw",
                    color: "#94a3b8",
                    marginTop: "0.3vh",
                  }}
                >
                  BIG · BUY
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "0.5vh",
                }}
              >
                <div
                  style={{
                    background: "rgba(245,158,11,0.15)",
                    border: "1px solid rgba(245,158,11,0.4)",
                    borderRadius: "0.4vw",
                    padding: "0.4vh 0.8vw",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.3vw",
                    color: "#f59e0b",
                    fontWeight: 600,
                  }}
                >
                  Луна 5д
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.1vw",
                    color: "#64748b",
                  }}
                >
                  из долгой тишины
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "1.2vh",
                borderTop: "1px solid rgba(48,54,61,0.7)",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.1vw",
                    color: "#64748b",
                  }}
                >
                  Объём
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.4vw",
                    color: "#10b981",
                    fontWeight: 600,
                  }}
                >
                  +430%
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.1vw",
                    color: "#64748b",
                  }}
                >
                  14:47 UTC
                </div>
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "1.4vw",
                    color: "#f59e0b",
                    fontWeight: 600,
                  }}
                >
                  P97
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(22,27,34,0.9)",
              border: "1px solid rgba(48,54,61,0.7)",
              borderRadius: "0.6vw",
              padding: "1.8vh 2.2vw",
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
              РАСЧЁТ silenceDays
            </div>
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.55vw",
                color: "#94a3b8",
                lineHeight: 1.5,
              }}
            >
              P75ref = longH (100-баровое окно) для стабильности. Если сегодня vol &gt;= P75ref, счётчик обнуляется.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
