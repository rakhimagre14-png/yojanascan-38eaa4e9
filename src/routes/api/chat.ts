import { createFileRoute } from "@tanstack/react-router";
import { SCHEMES, DOCUMENT_LABELS, type Profile } from "@/lib/schemes";

type ChatMessage = { role: "user" | "assistant"; content: string };

// A blank profile fails every rule, so each scheme's own rule engine
// tells us its exact eligibility criteria — no invented rules.
const BLANK: Profile = {
  name: "",
  age: null,
  gender: "",
  state: "",
  residence: "",
  category: "",
  religion: "",
  occupation: "",
  annualIncome: null,
  landHolding: null,
  disability: false,
  bpl: false,
  hasBankAccount: false,
  documents: {
    aadhaar: false, pan: false, voterId: false, incomeCertificate: false,
    casteCertificate: false, domicile: false, disabilityCertificate: false,
    bankPassbook: false, rationCard: false, landRecord: false, marksheet: false,
  },
};

function criteriaFor(s: (typeof SCHEMES)[number]): string {
  try {
    const r = s.eligible(BLANK).reasons;
    return r.length ? r.join("; ") : "No specific restrictions in our records";
  } catch {
    return "Not available in our records";
  }
}

function buildSystemPrompt(lang: string) {
  const langName = lang === "hi" ? "Hindi" : lang === "mr" ? "Marathi" : "English";

  const schemeSummary = SCHEMES.map((s) => {
    const docs = s.requiredDocs.map((d) => DOCUMENT_LABELS[d]).join(", ");
    return `- ${s.name} (${s.ministry}, ${s.category})
  Purpose: ${s.summary}
  Benefits: ${s.benefits}
  Eligibility criteria: ${criteriaFor(s)}
  Required documents: ${docs}
  Official link (apply here): ${s.link}
  Last date: ${s.lastDate ?? "No official deadline announced (applications generally open)"}`;
  }).join("\n");

  return `You are the YojanaScan Assistant, a friendly helper for Indian government schemes.

Reply in ${langName}. Keep answers short, clear and simple, using bullet points for eligibility, documents and steps.

What you can do:
- Explain what a scheme is, its benefits, eligibility criteria, required documents, how to apply (generally: visit the official link, register, fill the form, upload documents, or visit the nearest CSC / government office), and the official link.
- Tell users why they may or may not be eligible, based on the criteria below. If you need details (age, income, occupation, category, state, land, etc.) to decide, ask for them.
- Suggest 1–2 alternative schemes from the list when someone seems ineligible.
- For general questions (e.g. "government scholarship"), answer using the matching schemes from the list.

Accuracy rules:
- Base scheme facts (amounts, eligibility, documents, links, deadlines) ONLY on the verified list below. Never invent rules, amounts, deadlines or links.
- Never guess a deadline; if none is listed, say no official deadline has been announced.
- If a question is about a scheme or detail NOT in the list, say clearly that you could not verify it from YojanaScan's records and suggest checking the official portal (e.g. https://www.myscheme.gov.in/). Still help with whatever related information IS in the list.
- Only use the "couldn't verify" message for the specific part you cannot verify — never as a reply to questions the list answers.

VERIFIED SCHEMES:
${schemeSummary}`;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { messages?: ChatMessage[]; lang?: string };
          const lang = typeof body.lang === "string" ? body.lang : "en";
          // Only user/assistant turns, trimmed, last 20 — the client can't inject system prompts.
          const messages = (Array.isArray(body.messages) ? body.messages : [])
            .filter(
              (m) =>
                m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
            )
            .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
            .slice(-20);
          // Drop leading assistant greeting(s) so the conversation starts with the user.
          while (messages.length && messages[0].role === "assistant") messages.shift();
          if (!messages.length) return json({ error: "Please type a question." }, 400);

          const key = process.env.LOVABLE_API_KEY;
          if (!key) return json({ error: "AI service is not configured." }, 500);

          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "content-type": "application/json", "Lovable-API-Key": key },
            body: JSON.stringify({
              model: "google/gemini-3.6-flash",
              messages: [{ role: "system", content: buildSystemPrompt(lang) }, ...messages],
            }),
          });

          if (!resp.ok) {
            const text = await resp.text();
            console.error("AI gateway error", resp.status, text.slice(0, 300));
            const msg =
              resp.status === 429
                ? "Too many requests right now. Please wait a moment and try again."
                : resp.status === 402
                  ? "AI credits have run out. Please contact the site owner."
                  : "The AI service is unavailable right now. Please try again.";
            return json({ error: msg }, resp.status);
          }

          const data = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
          const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
          if (!reply) return json({ error: "The AI returned an empty answer. Please rephrase." }, 502);
          return json({ reply });
        } catch (err) {
          console.error("chat route error", err);
          return json({ error: "Something went wrong. Please try again." }, 500);
        }
      },
    },
  },
});
