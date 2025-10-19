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
    temas: [],             // todo el array "Temas" cargado desde el JSON
    temaActual: null,      // nombre del tema seleccionado
    preguntas: [],          // solo las preguntas filtradas de ese tema
    indice: 0,              // posición actual dentro del test
    respuestas: {},         // objeto para guardar respuestas del usuario
    completado: false
};

/* ===================== CONTADORES DINÁMICOS ===================== */
const progressLabel = document.getElementById("progress-label");
const pointsLabel = document.getElementById("points-label");

/**
 * Actualiza los contadores de progreso y puntos
 */
function actualizarProgreso() {
    const respondidas = Object.keys(state.respuestas).length;
    const total = state.preguntas.length || 0;
    progressLabel.textContent = `${respondidas} / ${total} respondidas`;

    // Calcular puntos actuales
    let aciertos = 0;
    for (const p of state.preguntas) {
        const correcta = p.options.findIndex(o => o.correct);
        const elegida = state.respuestas[p.id];
        if (elegida === correcta) aciertos++;
    }

    pointsLabel.textContent = `${aciertos} puntos`;
}

/* ===================== CARGA DEL TEST DESDE JSON ===================== */
async function cargarDatos() {
    try {
        const respuesta = await fetch('Temas/datos.json');
        if (!respuesta.ok) throw new Error("Error al cargar el archivo JSON");

        const datos = await respuesta.json();
        inicializarTest(datos);
        configurarSelectorTemas();
    } catch (err) {
        console.error("❌ Error al cargar el test:", err);
        alert("No se pudo cargar el test. Revisa la ruta o el formato del JSON.");
    }
}

/* ===================== INICIALIZAR TEST ===================== */
function inicializarTest(datos) {
    // 1️ Verificar que el JSON tenga formato válido
    if (!datos || !Array.isArray(datos.temas)) {
        console.error("❌ No hay temas válidos para inicializar el test:", datos);
        return;
    }

    // 2️ Inicializar el estado base del test
    state.meta = datos.meta || {};
    state.temas = datos.temas || [];
    state.temaActual = null;
    state.preguntas = [];
    state.indice = 0;
    state.respuestas = {};
    state.completado = false;

    console.log(` ${state.temas.length} temas cargados correctamente.`);

    // 3️ Actualizar título y descripción dinámicamente
    const titulo = qs("#quiz-title");
    const descripcion = qs("#quiz-desc");

    if (titulo) {
        // Si hay título en los metadatos del JSON, úsalo
        titulo.textContent = 'Daw' || "Test interactivo 2º DAW";
    }

    if (descripcion) {
        // Si hay descripción en los metadatos, úsala
        descripcion.textContent = 'Herramienta de repaso' || "Selecciona un tema para comenzar el cuestionario.";
    }

    // 4️ Cargar el selector de temas (asignaturas) si existe en el JSON
    const select = document.getElementById("cursoSelect");
    if (select && Array.isArray(state.meta.asignaturas)) {
        select.innerHTML = '<option value="">-- Elegir tema --</option>';
        state.meta.asignaturas.forEach(asig => {
            const opt = document.createElement("option");
            opt.value = asig;
            opt.textContent = asig;
            select.appendChild(opt);
        });
        console.log(" Asignaturas cargadas:", state.meta.asignaturas);
    }

    // 5️ Recuperar estado anterior si existe en localStorage
    const guardado = loadState();
    if (guardado && guardado.temas?.length) {
        state = guardado;
        console.log("♻️ Estado anterior restaurado.");
    } else {
        clearState();
        console.log(" Estado nuevo inicializado.");
    }

    // 6️ Render inicial vacío (esperando tema)
    renderizarPregunta();
    actualizarProgreso();
}

/* ===================== SELECCIONAR TEMA USUARIO ===================== */
function configurarSelectorTemas() {
    const select = document.getElementById("cursoSelect");
    if (!select) {
        console.error("⚠️ No se encontró el select de curso.");
        return;
    }

    select.addEventListener("change", e => {
        const seleccion = e.target.value.trim();
        if (!seleccion) return;

        state.temaActual = seleccion;
        state.preguntas = state.temas.filter(t => t.Asignatura === seleccion);
        state.indice = 0;
        state.respuestas = {};
        state.completado = false;

        console.log(`📚 Tema seleccionado: ${seleccion}`);
        console.log(`🧩 Preguntas encontradas: ${state.preguntas.length}`);

        renderizarPregunta();
        actualizarProgreso();
    });
}

/* ===================== MOSTRAR PREGUNTA ===================== */
function renderizarPregunta() {
    const contenedor = qs("#quiz");
    contenedor.innerHTML = "";

    if (!state.preguntas || state.preguntas.length === 0) {
        contenedor.innerHTML = '<p class="aviso">Selecciona un tema para comenzar.</p>';
        actualizarProgreso();
        return;
    }

    const pregunta = state.preguntas[state.indice];
    if (!pregunta) return;

    const card = document.createElement("section");
    card.className = "pregunta";

    const titulo = document.createElement("h3");
    titulo.textContent = `${state.indice + 1}. ${pregunta.question}`;
    card.appendChild(titulo);

    const lista = document.createElement("ul");

    pregunta.options.forEach((opt, i) => {
        const li = document.createElement("li");
        const label = document.createElement("label");
        label.className = "option";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = pregunta.id;
        input.value = i;

        if (state.respuestas[pregunta.id] === i) input.checked = true;

        const span = document.createElement("span");
        span.textContent = opt.text;

        label.appendChild(input);
        label.appendChild(span);
        li.appendChild(label);
        lista.appendChild(li);

        input.addEventListener("change", () => {
            guardarRespuesta(pregunta.id, i);
        });
    });

    card.appendChild(lista);
    contenedor.appendChild(card);

    const prevBtn = qs("#prev");
    const nextBtn = qs("#next");

    if (prevBtn) prevBtn.disabled = state.indice === 0;
    if (nextBtn) nextBtn.disabled = state.indice === state.preguntas.length - 1;
}

/* ===================== GUARDAR RESPUESTA ===================== */
function guardarRespuesta(id, indexOpcion) {
    state.respuestas[id] = indexOpcion;
    saveState(state);
    actualizarProgreso(); // 🔥 actualiza etiquetas
}

/* ===================== EVALUAR RESULTADOS ===================== */
function evaluarTest() {
    let puntos = 0;
    const total = state.preguntas.length;
    const resumen = [];

    for (const p of state.preguntas) {
        const correcta = p.options.findIndex(o => o.correct);
        const elegida = state.respuestas[p.id];
        const esCorrecta = elegida === correcta;
        if (esCorrecta) puntos++;

        resumen.push({
            pregunta: p.question,
            correcta: p.options[correcta]?.text || "(sin definir)",
            elegida: p.options[elegida]?.text || "No respondida",
            acierto: esCorrecta
        });
    }

    qs("#score").textContent = `${puntos} / ${total} correctas`;
    qs("#result").style.display = "flex";
    actualizarProgreso();

    const contenedor = qs("#review");
    contenedor.innerHTML = "";

    resumen.forEach((r, i) => {
        const item = document.createElement("div");
        item.className = `review-item ${r.acierto ? "ok" : "fail"}`;
        item.innerHTML = `
            <p><strong>${i + 1}. ${r.pregunta}</strong></p>
            <p>Tu respuesta: <em>${r.elegida}</em></p>
            ${!r.acierto ? `<p>Correcta: <strong>${r.correcta}</strong></p>` : ""}
            <hr>
        `;
        contenedor.appendChild(item);
    });

    pointsLabel.textContent = `${puntos} puntos`;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===================== EVENTOS DE NAVEGACIÓN ===================== */
qs("#prev").addEventListener("click", () => {
    if (state.indice > 0) {
        state.indice--;
        renderizarPregunta();
    }
});

qs("#next").addEventListener("click", () => {
    if (state.indice < state.preguntas.length - 1) {
        state.indice++;
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
    cargarDatos();
});

/* ===================== FUNCIONALIDAD EXTRA ===================== */
qs("#reset").addEventListener("click", () => {
    if (confirm("¿Seguro que quieres reiniciar el test completo?")) {
        clearState();
        cargarDatos();
    }
});

qs("#shuffle").addEventListener("change", (e) => {
    const activo = e.target.checked;
    if (activo) {
        state.preguntas = shuffle(state.preguntas);
        state.indice = 0;
        renderizarPregunta();
        alert("Preguntas barajadas");
    } else {
        alert("El orden se restablecerá al reiniciar el test");
    }
});

/*  BOTÓN: EXPORTAR PLANTILLA (descargar JSON actual) */
qs("#export-json").addEventListener("click", () => {
    if (!state.preguntas.length) {
        alert("No hay test cargado para exportar.");
        return;
    }

    const exportData = {
        meta: {
            title: state.meta.title || "Nuevo Test",
            description: state.meta.description || "Plantilla exportada desde Quiz Iker"
        },
        questions: state.preguntas.map(q => ({
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

/*  DESCARGAR RESULTADOS EN CSV */
qs("#download-csv").addEventListener("click", () => {
    if (!state.preguntas.length) {
        alert("Primero debes completar un test.");
        return;
    }

    const filas = [["Pregunta", "Tu respuesta", "Correcta", "Resultado"]];
    for (const p of state.preguntas) {
        const correcta = p.options.findIndex(o => o.correct);
        const elegida = state.respuestas[p.id];
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
async function iniciar() {
    await cargarDatos(); // carga general.json (con todos los temas)

    // Reinicia estado sin seleccionar por defecto
    state.temaActual = null;
    state.preguntas = [];
    renderizarPregunta(); // mostrará el mensaje "Selecciona un tema para comenzar"
}

iniciar();