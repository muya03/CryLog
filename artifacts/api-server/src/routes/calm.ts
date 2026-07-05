import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { GeneratePoemBody } from "@workspace/api-zod";

const router = Router();

// POST /api/calm/poem
router.post("/poem", async (req, res): Promise<void> => {
  try {
    const parsed = GeneratePoemBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const { intensity, cryType, trigger } = parsed.data;

    const intensityLabel =
      intensity <= 3 ? "un par de lágrimas suaves"
      : intensity <= 6 ? "un llanto moderado"
      : intensity <= 8 ? "un llanto profundo"
      : "un desahogo total, un valle de lágrimas";

    const typeContext = cryType ? ` El motivo fue: ${cryType}.` : "";
    const triggerContext = trigger ? ` El detonante fue: ${trigger}.` : "";

    const prompt = `Eres un poeta con el alma de Federico García Lorca. Escribe un pequeño poema reconfortante (4-8 líneas) para alguien que acaba de llorar ${intensityLabel}.${typeContext}${triggerContext}

El poema debe:
- Tener referencias a la noche, las estrellas, la luna, o elementos naturales del mundo lorquiano
- Ser reconfortante y gentil, nunca triste
- Sentirse íntimo y personal, como un abrazo en palabras
- Usar imágenes poéticas propias del estilo de Lorca
- Estar en español

Solo devuelve el poema, sin título ni introducción.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const poemText = message.content[0].type === "text"
      ? message.content[0].text
      : "Las estrellas velan tu llanto,\ny la luna, hermana del silencio,\nteje con hilos de plata\nla calma que mereces.";

    const breathingGuide = intensity >= 8
      ? "Inhala despacio contando hasta 4... sostén el aire 4 segundos... exhala contando hasta 6. Repite 5 veces."
      : "Inhala profundo... exhala lentamente. Tu cuerpo sabe cómo calmarse.";

    const supportMessage = intensity === 10
      ? "Has llorado con toda tu alma. Eso requiere valentía. No estás solo/a — tu círculo está aquí."
      : intensity >= 7
      ? "Has soltado algo importante. Date un momento para respirar."
      : "Cada lágrima es un peso que sueltas. Ya estás mejor.";

    res.json({ poem: poemText, breathingGuide, supportMessage });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
