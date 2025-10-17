/* =============================================================
    SCRIPT PRINCIPAL DEL TEST INTERACTIVO
    Autor: Iker Martínez Velasco | 2º DAW
    Descripción: Sistema autocorregible con soporte JSON,
                 guardado de progreso y descarga de resultados.
   ============================================================= */

/* ===================== CONFIGURACIÓN DEMO ===================== */
const quizData = {
    meta: {
        title: "Despliegue y Arquitectura Web – Demo",
        description: "Ejemplo con 5 preguntas. Sustituye por tus propias preguntas o importa un JSON.",
        shuffleQuestions: false,
        showCorrectAfterSubmit: true,
        allowReview: true
    },
    questions: [
        {
            id: "q1",
            type: "single",
            question: "¿Qué es un VPS en el contexto de despliegue de aplicaciones web?",
            required: true,
            points: 1,
            shuffleOptions: true,
            options: [
                { text: "Un servidor físico exclusivo con hardware dedicado" },
                { text: "Un servidor compartido que actúa como dedicado mediante virtualización", correct: true },
                { text: "Un protocolo de cifrado para administrar servidores" },
                { text: "Un servicio DNS para balancear carga" }
            ]
        },
        {
            id: "q2",
            type: "single",
            question: "El puerto TCP estándar para SSH es…",
            required: true, points: 1,
            options: [
                { text: "21" }, { text: "22", correct: true }, { text: "80" }, { text: "443" }
            ]
        },
        {
            id: "q3",
            type: "multiple",
            question: "Selecciona ventajas típicas de Nginx:",
            required: true, points: 2, shuffleOptions: true,
            options: [
                { text: "Bajo consumo de RAM", correct: true },
                { text: "Multiplexación y proxy inverso eficiente", correct: true },
                { text: "Sólo funciona en Windows" },
                { text: "Requiere entorno gráfico" }
            ]
        },
        {
            id: "q4",
            type: "short",
            question: "Indica la versión de HTTP que usa QUIC sobre UDP (una palabra/número)",
            required: false, points: 1,
            answerText: ["http/3", "http3", "3", "h3"]
        },
        {
            id: "q5",
            type: "long",
            question: "Explica brevemente por qué las claves SSH son más seguras que las contraseñas.",
            required: false, points: 0
        }
    ]
};

/* ===================== UTILIDADES ===================== */
const qs = s => document.querySelector(s);
const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]);
const uid = () => Math.random().toString(36).slice(2, 9);

// Persistencia (localStorage)
const KEY = "quiz_state_v1";
const saveState = state => localStorage.setItem(KEY, JSON.stringify(state));
const loadState = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null") } catch (_) { return null } };
const clearState = () => localStorage.removeItem(KEY);

/* ===================== ESTADO GLOBAL ===================== */
let state = { meta: {}, questions: [], index: 0, answers: {}, submitted: false };

/* ===================== INICIALIZACIÓN DEL TEST ===================== */
function init(data) {
    state.meta = { ...data.meta };
    state.questions = data.questions.map(q => ({ ...q, _options: q.options ? [...q.options] : undefined }));

    // Mezclar preguntas si corresponde
    if (state.meta.shuffleQuestions || qs('#shuffle').checked) {
        state.questions = shuffle(state.questions);
    }

    // Mezclar opciones por pregunta si procede
    state.questions.forEach(q => { if (q.shuffleOptions && q._options) q._options = shuffle(q._options); });

    // Restaurar progreso guardado (si existe)
    const persisted = loadState();
    if (persisted && persisted.questions?.length === state.questions.length) {
        state.answers = persisted.answers || {};
        state.index = Math.min(persisted.index || 0, state.questions.length - 1);
        state.submitted = !!persisted.submitted;
    } else {
        clearState();
        state.answers = {}; state.index = 0; state.submitted = false;
    }

    // Actualizar cabecera
    qs('#quiz-title').textContent = state.meta.title || 'Test interactivo';
    qs('#quiz-desc').textContent = state.meta.description || '';
    render();
}

/* ===================== RENDER Y NAVEGACIÓN ===================== */
function setProgress() {
    const total = state.questions.length;
    const answered = Object.keys(state.answers).length;
    const percent = total ? Math.round((answered / total) * 100) : 0;

    qs('#progress-bar').style.width = percent + '%';
    qs('#progress-label').textContent = `${answered} / ${total} respondidas`;
    const totalPoints = state.questions.reduce((s, q) => s + (q.points || 0), 0);
    qs('#points-label').textContent = `${totalPoints} puntos`;
}

function render() {
    setProgress();
    const container = qs('#quiz');
    container.innerHTML = '';

    const q = state.questions[state.index];
    if (!q) { container.innerHTML = '<p class="helper">No hay preguntas.</p>'; return; }

    const card = document.createElement('div');
    card.className = 'q-card';

    const title = document.createElement('h3');
    title.className = 'q-title';
    title.innerHTML = `${state.index + 1}. ${q.question}${q.required ? '<span class="q-required">*</span>' : ''}`;
    card.appendChild(title);

    const block = document.createElement('div');
    const currentValue = state.answers[q.id];

    if (q.type === 'single' && q._options) {
        q._options.forEach((opt, i) => {
            const id = uid();
            const row = document.createElement('label');
            row.className = 'option';
            row.innerHTML = `<input type="radio" name="${q.id}" id="${id}" value="${i}"> <span>${opt.text}</span>`;
            block.appendChild(row);
        });
    }

    if (q.type === 'multiple' && q._options) {
        q._options.forEach((opt, i) => {
            const id = uid();
            const row = document.createElement('label');
            row.className = 'option';
            row.innerHTML = `<input type="checkbox" name="${q.id}" id="${id}" value="${i}"> <span>${opt.text}</span>`;
            block.appendChild(row);
        });
    }

    if (q.type === 'short') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'option';
        input.placeholder = 'Escribe tu respuesta…';
        block.appendChild(input);
    }

    if (q.type === 'long') {
        const ta = document.createElement('textarea');
        ta.rows = 4;
        ta.className = 'option';
        ta.placeholder = 'Escribe tu respuesta…';
        block.appendChild(ta);
    }

    const helper = document.createElement('div');
    helper.className = 'helper';
    helper.textContent = q.required ? 'Pregunta obligatoria' : 'Pregunta opcional';
    card.appendChild(block);
    card.appendChild(helper);
    container.appendChild(card);

    qs('#prev').disabled = state.index === 0;
    qs('#next').disabled = state.index === state.questions.length - 1;

    block.addEventListener('change', () => collectAnswer(q, block));
    block.addEventListener('input', () => collectAnswer(q, block));
}

/* ===================== GUARDAR RESPUESTAS ===================== */
function collectAnswer(q, block) {
    if (q.type === 'single') {
        const sel = block.querySelector(`input[name="${q.id}"]:checked`);
        state.answers[q.id] = sel ? Number(sel.value) : undefined;
    }
    if (q.type === 'multiple') {
        const sels = [...block.querySelectorAll(`input[name="${q.id}"]:checked`)].map(i => Number(i.value));
        state.answers[q.id] = sels;
    }
    if (q.type === 'short' || q.type === 'long') {
        const el = block.querySelector(q.type === 'short' ? 'input' : 'textarea');
        state.answers[q.id] = (el.value || '').trim();
    }
    setProgress();
    saveState(state);
}

/* ===================== EVALUACIÓN ===================== */
function scoreQuiz() {
    let points = 0, max = 0;
    for (const q of state.questions) {
        const p = q.points || 0; max += p;
        let ok = null;

        if (q.type === 'single' && q._options) {
            const correctIndex = q._options.findIndex(o => o.correct);
            ok = (state.answers[q.id] === correctIndex);
        }
        if (q.type === 'multiple' && q._options) {
            const correctSet = new Set(q._options.map((o, i) => o.correct ? i : null).filter(v => v !== null));
            const ans = new Set(Array.isArray(state.answers[q.id]) ? state.answers[q.id] : []);
            ok = (correctSet.size === ans.size && [...correctSet].every(v => ans.has(v)));
        }
        if (q.type === 'short' && q.answerText) {
            const ans = (state.answers[q.id] || '').toLowerCase().trim();
            const accepted = Array.isArray(q.answerText) ? q.answerText : [q.answerText];
            ok = accepted.map(s => s.toLowerCase().trim()).includes(ans);
        }
        if (ok) points += p;
    }
    return { points, max };
}

/* ===================== EVENTOS ===================== */
document.getElementById('prev').addEventListener('click', () => { state.index = Math.max(0, state.index - 1); render(); });
document.getElementById('next').addEventListener('click', () => { state.index = Math.min(state.questions.length - 1, state.index + 1); render(); });
document.getElementById('submit').addEventListener('click', () => {
    const { points, max } = scoreQuiz();
    qs('#score').textContent = `${points} / ${max} puntos`;
    qs('#result').style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('retry').addEventListener('click', () => { clearState(); init(state); });

/* ===================== CARGA DE TEMAS ===================== */



/* ===================== INICIALIZACIÓN ===================== */
init(quizData);

/* ===================== EVENTO: REINICIAR ===================== */
