# 🧠 Generador de Tests desde JSON y PDF *(Proyecto DAW)*

## 🧾 Autor  
**Iker Martínez Velasco — 2º DAW**

---

## 🇪🇸 Versión en Español  

### 🧩 Descripción general

Este proyecto es una **herramienta educativa desarrollada en JavaScript** que permite **leer y mostrar tests tipo cuestionario almacenados en archivos JSON**.  
Su objetivo principal es **automatizar la evaluación de contenidos teóricos** y facilitar la reutilización de cuestionarios en diferentes materias, como sostenibilidad, economía circular o desarrollo web.

En su versión actual, el sistema **solo permite cargar tests JSON ya existentes**, mostrando las preguntas y opciones de respuesta.  
La funcionalidad de **leer archivos PDF y generar automáticamente las preguntas** está **parcialmente desarrollada**, pendiente de implementación final.

---

## ⚙️ Funcionalidades implementadas (v1.0)

1. **Carga de tests en formato JSON**
   - Permite seleccionar cualquier archivo `.json` con la estructura correcta.  
   - Valida que contenga los apartados `meta` y `questions`.  
   - Muestra el test en pantalla con navegación entre preguntas.  
   - Corrige automáticamente al pulsar “Enviar” y muestra un informe de resultados.

2. **Compatibilidad educativa**
   - Diseñado para temas de formación profesional (DAW, FP Dual, sostenibilidad, TIC…).  
   - Permite a docentes y alumnos gestionar tests sin depender de plataformas externas.

3. **Informe de corrección**
   - Muestra cuántas preguntas fueron respondidas correctamente.  
   - Indica las respuestas erróneas y cuál era la opción correcta.  
   - Permite **descargar los resultados en CSV** o **imprimirlos directamente**.

4. **Persistencia local**
   - Guarda el progreso del alumno en `localStorage` (se puede retomar el test).  
   - Permite reiniciar y barajar preguntas.




   ## 🧩 Mejoras pendientes (v2.0)

### 1. Lectura y análisis de PDFs
- Implementar `leerPDF()` con `pdfjsLib` para extraer texto completo.  
- Procesar el contenido detectando frases explicativas como “es”, “son” o “permite”.  
- Generar preguntas automáticamente a partir del texto analizado.

### 2. Descarga y exportación automática
- Añadir botón para descargar el test generado como `.json`.  
- Validar duplicados y evitar datos vacíos.

### 3. Renderizado interactivo mejorado
- Mostrar puntaje obtenido.  
- Indicar respuestas correctas tras el envío.  
- Posibilidad de volver a intentar el test.

### 4. Integración con GitHub Pages
- Hacer el proyecto **100 % funcional desde el navegador**.  
- Permitir al usuario subir un **PDF o JSON** y generar el test en línea.

---

## 🧩 Ejemplo de estructura JSON válida

```json
{
  "meta": {
    "title": "Test de sostenibilidad",
    "description": "Preguntas sobre los Objetivos de Desarrollo Sostenible"
  },
  "questions": [
    {
      "id": "q1",
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


---


