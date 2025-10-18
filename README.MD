# 🧠 **Quiz Iker — Generador y Visualizador de Tests JSON/PDF**

## 👤 Autor  
**Iker Martínez Velasco — 2º DAW**

---

## 🧩 Descripción general

**Quiz Iker** es una aplicación web interactiva desarrollada con **JavaScript, HTML y CSS** que permite **visualizar, responder y evaluar tests tipo cuestionario**.  
Los tests se cargan desde archivos **JSON estructurados**, y en futuras versiones se podrán **generar automáticamente desde archivos PDF** mediante análisis de texto.

Este proyecto está orientado a entornos educativos (como FP o DAW), con el propósito de **digitalizar evaluaciones teóricas** sin depender de plataformas externas.

---

## ⚙️ **Funcionalidades actuales (v1.0)**

### 📥 Carga de tests JSON
- Permite importar cualquier archivo `.json` con estructura válida (`meta` + `temas` o `questions`).
- Los datos se muestran dinámicamente: título, descripción, preguntas y opciones de respuesta.
- El usuario puede navegar entre preguntas con botones “Anterior” y “Siguiente”.

### 🧮 Corrección automática
- Evalúa las respuestas seleccionadas al enviar el test.  
- Muestra los resultados:  
  - Número total de aciertos.  
  - Respuestas incorrectas con la opción correcta indicada.  
- Permite **descargar los resultados en formato CSV** o **imprimirlos**.

### 💾 Persistencia local
- Guarda automáticamente el progreso en `localStorage`.  
- El usuario puede cerrar y reabrir la página sin perder sus respuestas.  
- Incluye opciones de **reiniciar test** y **barajar preguntas**.

### 🎨 Interfaz moderna
- Estilo oscuro con diseño responsive basado en tarjetas (`.q-card`).  
- Animaciones suaves en las preguntas y transiciones CSS.  
- Preguntas y botones con efecto hover, sombreado y colores configurables mediante variables CSS.

---

## 🚧 **Mejoras previstas (v2.0)**

### 📄 1. Generación automática desde PDF
- Implementar una función `leerPDF()` con **pdf.js**.  
- Extraer el texto y generar preguntas automáticamente detectando patrones de tipo “es”, “son”, “permite”, etc.  
- Clasificar y limpiar el texto para crear tests estructurados.

### 💾 2. Exportación avanzada
- Permitir descargar el test generado en formato `.json`.  
- Validar la estructura antes de exportar para evitar errores o duplicados.

### 🧩 3. Interactividad avanzada
- Mostrar puntuación dinámica mientras se responde.  
- Colorear las respuestas correctas/incorrectas después de enviar.  
- Permitir **reintentar** el test o **reanudar** desde donde se dejó.

### 🌐 4. Publicación en GitHub Pages
- Hacer el proyecto **100 % ejecutable desde navegador**.  
- Permitir cargar un **JSON o PDF local** sin servidor backend.  

---


---

## 🧩 **Ejemplo de estructura JSON válida**

```json
{
  "meta": {
    "title": "Test de sostenibilidad",
    "description": "Preguntas sobre los Objetivos de Desarrollo Sostenible"
  },
  "temas": [
    {
      "id": "q1",
      "Asignatura": "Sostenibilidad",
      "question": "¿Cuál es el objetivo principal de la Agenda 2030?",
      "options": [
        { "text": "Erradicar la pobreza y proteger el planeta", "correct": true },
        { "text": "Aumentar el crecimiento industrial", "correct": false },
        { "text": "Privatizar los recursos naturales", "correct": false },
        { "text": "Eliminar las energías renovables", "correct": false }
      ]
    }
  ]
}

