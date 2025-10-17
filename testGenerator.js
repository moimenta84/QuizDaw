/* =============================================================
   GENERADOR DE TEST DESDE PDF
   Autor: Iker Martínez Velasco | 2º DAW
   ============================================================= */

// === LECTOR DE PDF ===
async function leerPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let texto = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map(item => item.str).join(' ');
        texto += text + ' ';
    }
    return texto;
}

// === GENERADOR DE PREGUNTAS A PARTIR DEL TEXTO ===
function generarPreguntasDesdeTexto(texto, temaSeleccionado) {
    const frases = texto
        .split(/[.?!]\s+/)
        .map(f => f.trim())
        .filter(f => f.length > 60 && /( es | son | consiste | permite | utiliza | sirve )/i.test(f));

    const preguntas = frases.slice(0, 10).map((frase, i) => {
        const partes = frase.split(/\bes\b|\bson\b|\bconsiste\b|\bpermite\b|\butiliza\b|\bsirve\b/i);
        const sujeto = partes[0]?.trim() || "el concepto";
        const definicion = partes[1]?.trim() || "una descripción asociada";

        return {
            id: `q${i + 1}`,
            type: "multiple",
            required: true,
            points: 2,
            question: `¿Cuál de las siguientes opciones describe mejor ${sujeto}?`,
            shuffleOptions: true,
            options: [
                { text: definicion, correct: true },
                { text: "Una afirmación incorrecta" },
                { text: "Un concepto no relacionado" },
                { text: "Una herramienta tecnológica" }
            ]
        };
    });

    return {
        meta: {
            title: `Test generado automáticamente (${temaSeleccionado})`,
            description: "Preguntas creadas a partir del temario PDF.",
            shuffleQuestions: true,
            showCorrectAfterSubmit: true,
            allowReview: true
        },
        questions: preguntas
    };
}

// === FUNCIÓN PRINCIPAL ===
async function generarTestDesdePDF(file, temaSeleccionado) {
    if (!file) return alert("Selecciona un archivo PDF primero.");
    const texto = await leerPDF(file);

    if (!texto || texto.trim().length < 200) {
        alert("⚠️ No se ha podido extraer texto del PDF. Asegúrate de que no sea una imagen escaneada.");
        return null;
    }

    const test = generarPreguntasDesdeTexto(texto, temaSeleccionado);
    console.log(`✅ Test generado para el tema: ${temaSeleccionado}`);
    return test;
}
