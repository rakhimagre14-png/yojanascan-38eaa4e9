import { createFileRoute } from "@tanstack/react-router";
import { SCHEMES, DOCUMENT_LABELS } from "@/lib/schemes";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function buildSystemPrompt(lang: string) {
  const langName =
    lang === "hi" ? "Hindi" : lang === "mr" ? "Marathi" : "English";

  const schemeSummary = SCHEMES.map((s) => {
    const docs = s.requiredDocs.map((d) => DOCUMENT_LABELS[d]).join(", ");
    return `- ${s.name} (${s.ministry}, ${s.category})
  Purpose: ${s.summary}
  Benefits: ${s.benefits}
  Required documents: ${docs}
  Official link: ${s.link}
  Last date: ${s.lastDate ?? "No official deadline announced (applications are generally open)"}`;
  }).join("\n");

  return `You are the YojanaScan Assistant, a helpful support agent for Indian government schemes.

STRICT RULES:
- Reply ONLY in ${langName}.
- Use ONLY the verified scheme information provided below. Do NOT invent details, deadlines, amounts, or links.
- If the user asks about something not in the list, or you are unsure, reply exactly: "I couldn't verify this information. Please check the official government portal for the latest updates."
- Never guess an application deadline. If none is listed, say "No official deadline has been announced — applications are generally open."
- Keep answers short, clear, and easy to understand for common users. Use bullet points when listing eligibility or documents.
- When a user seems ineligible for a scheme, suggest 1–2 alternative schemes from the list they may qualify for.

VERIFIED SCHEMES:
${schemeSummary}`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            messages?: ChatMessage[];
            lang?: string;
          };
          const messages = Array.isArray(body.messages) ? body.messages : [];
          const lang = typeof body.lang === "string" ? body.lang : "en";

          const key = process.env.LOVABLE_API_KEY;
          if (!key) {
            return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
              status: 500,
              headers: { "content-type": "application/json" },
            });
          }

          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "Lovable-API-Key": key,
            },
            body: JSON.stringify({
              model: "google/gemini-3.6-flash",
              messages: [
                { role: "system", content: buildSystemPrompt(lang) },
                ...messages,
              ],
            }),
          });

          if (!resp.ok) {
            const text = await resp.text();
            return new Response(
              JSON.stringify({ error: `Gateway ${resp.status}: ${text.slice(0, 200)}` }),
              { status: resp.status, headers: { "content-type": "application/json" } },
            );
          }

          const data = (await resp.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const reply = data.choices?.[0]?.message?.content ?? "";
          return new Response(JSON.stringify({ reply }), {
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});
