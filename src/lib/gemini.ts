/**
 * Minimal Google Gemini (Flash) client for vision + chat.
 * Uses the `GEMINI_API_KEY` server env var.
 */

const MODEL = 'gemini-1.5-flash';

export interface GeminiInput {
  prompt: string;
  imageBase64?: string;
  mimeType?: string; // e.g. image/png, image/jpeg, application/pdf
}

export async function callGemini(input: GeminiInput): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY no configurada en el servidor.');
  }

  const parts: any[] = [];
  if (input.imageBase64 && input.mimeType) {
    const hasPdf = input.mimeType === 'application/pdf';
    const data = input.imageBase64.replace(/^data:[^,]+,/, '');
    parts.push({
      inline_data: {
        mime_type: input.mimeType,
        data,
      },
    });
  }
  parts.push({ text: input.prompt });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    }
  );

  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message ?? `Gemini error (${res.status})`;
    throw new Error(msg);
  }

  const text =
    json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? '';
  return text.trim();
}

/** Extracts the first JSON object from an LLM response (handles code fences). */
export function extractJson<T>(text: string): T | null {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
