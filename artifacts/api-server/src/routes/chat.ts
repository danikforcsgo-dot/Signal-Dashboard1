import { Router } from "express";

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `Ты торговый ассистент для криптовалютного трейдера, работающего с OKX perpetual swap рынками.
Ты помогаешь анализировать рыночные сигналы, объяснять стратегии ADR (Average Daily Range) и Volume Bubble детекции.
Отвечай лаконично и по делу. Используй русский язык. 
Ключевые понятия системы:
- ADR HIGH / ADR LOW — цена достигла верхней/нижней границы среднедневного диапазона
- Volume Bubble (SMALL/MEDIUM/BIG) — объём дня превысил P75/P90/P97 исторических значений
- BIG BUY / BIG SELL — крупный объём с преобладанием покупок/продаж`;

router.post("/", async (req, res) => {
  if (!GROQ_API_KEY) {
    res.status(503).json({ error: "GROQ_API_KEY not configured" });
    return;
  }

  const body = req.body as { messages?: unknown };
  if (!Array.isArray(body?.messages) || body.messages.length === 0) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const messages = (body.messages as Array<{ role: string; content: string }>)
    .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8192,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!groqRes.ok || !groqRes.body) {
      const err = await groqRes.text();
      res.write(`data: ${JSON.stringify({ error: err })}\n\n`);
      res.end();
      return;
    }

    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch {}
        }
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`);
    res.end();
  }
});

export default router;
