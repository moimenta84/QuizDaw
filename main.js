/* =============================================================
   TEST INTERACTIVO TIPO QUIZ (solo opción única)
   Autor: Iker Martínez Velasco | 2º DAW
   Descripción:
   Carga un test desde un archivo JSON (por defecto sostenibilidad.json),
   muestra las preguntas con 4 opciones y una correcta.
   Corrige automáticamente y guarda progreso en localStorage.
   ============================================================= */

/* ===================== FUNCIONES BÁSICAS ===================== */
const qs = s => document.querySelector(s); // Selector rápido
const shuffle = arr => arr.sort(() => Math.random() - 0.5); // Mezclar arrays

// Guardar y recuperar estado
const KEY = "quiz_state_v1";
const saveState = s => localStorage.setItem(KEY, JSON.stringify(s));
const loadState = () => JSON.parse(localStorage.getItem(KEY) || "null");
const clearState = () => localStorage.removeItem(KEY);

/* ===================== ESTADO DEL TEST ===================== */
let state = {
    meta: {},
    questions: [],
    index: 0,
    answers: {},
    submitted: false
};

/* ===================== CARGA DEL TEST DESDE JSON ===================== */
async function cargarTest(ruta = "./Temas/Sostenibilidad.json") {
    try {
        const respuesta = await fetch(ruta);
        if (!respuesta.ok) throw new Error("Error al cargar el archivo JSON");

        const datos = await respuesta.json();
        console.log(` Test cargado: ${datos.meta.title} (${datos.questions.length} preguntas)`);
        inicializarTest(datos);
    } catch (err) {
        console.error("❌ Error al cargar el test:", err);
        alert("No se pudo cargar el test. Revisa la ruta o el formato del JSON.");
    }
}

/* ===================== INICIALIZAR TEST ===================== */
function inicializarTest(datos) {
    state.meta = { ...datos.meta };
    state.questions = shuffle(datos.questions); // Mezcla las preguntas si quieres

    const guardado = loadState();
    if (guardado && guardado.questions?.length === state.questions.length) {
        state.answers = guardado.answers || {};
        state.index = Math.min(guardado.index || 0, state.questions.length - 1);
    } else {
        clearState();
        state.answers = {};
        state.index = 0;
    }

    qs("#quiz-title").textContent = state.meta.title || "Test";
    qs("#quiz-desc").textContent = state.meta.description || "";
    renderizarPregunta();
}

/* ===================== MOSTRAR PREGUNTA ===================== */
function renderizarPregunta() {
    const contenedor = qs("#quiz");
    contenedor.innerHTML = "";

    const pregunta = state.questions[state.index];
    if (!pregunta) {
        contenedor.innerHTML = "<p>No hay preguntas disponibles.</p>";
        return;
    }

    const card = document.createElement("div");
    card.className = "q-card";

    // Título
    const titulo = document.createElement("h3");
    titulo.textContent = `${state.index + 1}. ${pregunta.question}`;
    card.appendChild(titulo);

    // Opciones
    const bloque = document.createElement("div");
    bloque.className = "options";

    pregunta.options.forEach((opt, i) => {
        const label = document.createElement("label");
        label.className = "option";
        label.innerHTML = `
            <input type="radio" name="${pregunta.id}" value="${i}">
            <span>${opt.text}</span>`;
        bloque.appendChild(label);
    });

    card.appendChild(bloque);
    contenedor.appendChild(card);

    qs("#prev").disabled = state.index === 0;
    qs("#next").disabled = state.index === state.questions.length - 1;

    bloque.addEventListener("change", () => guardarRespuesta(pregunta.id, bloque));
}

/* ===================== GUARDAR RESPUESTA ===================== */
function guardarRespuesta(id, bloque) {
    const seleccion = bloque.querySelector(`input[name="${id}"]:checked`);
    state.answers[id] = seleccion ? Number(seleccion.value) : undefined;
    saveState(state);
}

/* ===================== EVALUAR RESULTADOS ===================== */
function evaluarTest() {
    let puntos = 0;
    const total = state.questions.length;
    const resumen = [];

    for (const p of state.questions) {
        const correcta = p.options.findIndex(o => o.correct);
        const elegida = state.answers[p.id];

        const esCorrecta = elegida === correcta;
        if (esCorrecta) puntos++;

        resumen.push({
            pregunta: p.question,
            correcta: p.options[correcta]?.text || "(sin definir)",
            elegida: p.options[elegida]?.text || "No respondida",
            acierto: esCorrecta
        });
    }

    // Mostrar puntuación
    qs("#score").textContent = `${puntos} / ${total} correctas`;
    qs("#result").style.display = "flex";

    // Generar informe detallado
    const contenedor = qs("#review");
    contenedor.innerHTML = ""; // Limpia anteriores

    resumen.forEach((r, i) => {
        const item = document.createElement("div");
        item.className = `review-item ${r.acierto ? "ok" : "fail"}`;
        item.innerHTML = `
            <p><strong>${i + 1}. ${r.pregunta}</strong></p>
            <p>Tu respuesta: <em>${r.elegida}</em></p>
            ${!r.acierto ? `<p> Correcta: <strong>${r.correcta}</strong></p>` : ""}
            <hr>
        `;
        contenedor.appendChild(item);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===================== EVENTOS DE NAVEGACIÓN ===================== */
qs("#prev").addEventListener("click", () => {
    if (state.index > 0) {
        state.index--;
        renderizarPregunta();
    }
});

qs("#next").addEventListener("click", () => {
    if (state.index < state.questions.length - 1) {
        state.index++;
        renderizarPregunta();
    }
});

/* ===================== ENVÍO Y REINICIO ===================== */
qs("#submit").addEventListener("click", () => {
    evaluarTest();
    window.scrollTo({ top: 0, behavior: "smooth" });
});

qs("#retry").addEventListener("click", () => {
    clearState();
    cargarTest();
});
/* ===================== FUNCIONALIDAD EXTRA ===================== */

/*  BOTÓN: REINICIAR TEST */
qs("#reset").addEventListener("click", () => {
    if (confirm("¿Seguro que quieres reiniciar el test completo?")) {
        clearState();
        cargarTest();
    }
});

/* BOTÓN: BARAJAR PREGUNTAS */
qs("#shuffle").addEventListener("change", (e) => {
    const activo = e.target.checked;
    if (activo) {
        state.questions = shuffle(state.questions);
        state.index = 0;
        renderizarPregunta();
        alert(" Preguntas barajadas");
    } else {
        alert("❗ El orden se restablecerá al reiniciar el test");
    }
});

/*  BOTÓN: EXPORTAR PLANTILLA (descargar JSON actual) */
qs("#export-json").addEventListener("click", () => {
    if (!state.questions.length) {
        alert("No hay test cargado para exportar.");
        return;
    }

    const exportData = {
        meta: {
            title: state.meta.title || "Nuevo Test",
            description: state.meta.description || "Plantilla exportada desde Quiz Iker"
        },
        questions: state.questions.map(q => ({
            question: q.question,
            options: q.options.map(o => ({
                text: o.text,
                correct: !!o.correct
            }))
        }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = (state.meta.title || "test_exportado") + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

/* ===================== BOTONES DE RESULTADOS ===================== */
/* ===================== BOTONES DE RESULTADOS ===================== */

/*  REINTENTAR */
qs("#retry").addEventListener("click", () => {
    if (confirm("¿Quieres volver a intentar el test desde el principio?")) {
        clearState();
        cargarTest();
        qs("#result").style.display = "none";
    }
});

/*  DESCARGAR RESULTADOS EN CSV */
qs("#download-csv").addEventListener("click", () => {
    if (!state.questions.length) {
        alert("Primero debes completar un test.");
        return;
    }

    const filas = [["Pregunta", "Tu respuesta", "Correcta", "Resultado"]];
    for (const p of state.questions) {
        const correcta = p.options.findIndex(o => o.correct);
        const elegida = state.answers[p.id];

        filas.push([
            p.question,
            p.options[elegida]?.text || "No respondida",
            p.options[correcta]?.text || "(sin definir)",
            elegida === correcta ? "Correcta" : "Incorrecta"
        ]);
    }


    const csv = filas.map(f => f.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = (state.meta.title || "resultados") + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});


/* IMPRIMIR RESULTADOS */
qs("#print").addEventListener("click", () => {
    window.print();
});

/* ===================== INICIO ===================== */
cargarTest(); // ← carga automática de Temas/sostenibilidad.json
