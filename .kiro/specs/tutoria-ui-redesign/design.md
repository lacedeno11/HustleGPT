# Design Document - TutorIA UI Redesign

## Overview

El rediseño de TutorIA se enfoca en crear una interfaz de usuario más intuitiva y organizada que siga el mockup proporcionado. La nueva interfaz estará dividida en 4 secciones principales que optimizan el flujo de trabajo del estudiante: entrada del ejercicio, canvas de dibujo, controles de acción, y área de output.

## Architecture

### Layout Structure
La aplicación tendrá el canvas como área principal, con secciones compactas para ejercicio y output con input:

```
┌─────────────────────────────────────────────────────────┐
│                    White Board                          │
├─────────────────────────────────────────────────────────┤
│  Ejercicio                              💡        ❓    │
│ ┌─────────────┐                                         │
│ │[Texto edit] │                                         │
│ └─────────────┘           CANVAS AREA                   │
│                    ┌─────────────────────────────┐      │
│                    │                             │      │
│                    │                             │      │
│                    │      [Drawing Canvas]       │      │
│                    │                             │      │
│                    │                             │      │
│                    │                             │      │
│                    │                             │      │
│                    └─────────────────────────────┘      │
│                                                         │
│                                          Output         │
│                                      ┌─────────────┐    │
│                                      │[AI Response]│    │
│                                      │             │    │
│                                      │[Input Query]│    │
│                                      └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. Header Section
- **Título**: "White Board" centrado
- **Estilo**: Tipografía clara, fondo neutro

#### 2. Exercise Section (Top Left - Compacto)
- **Ubicación**: Esquina superior izquierda
- **Funcionalidad**: Textarea pequeña y editable para copiar/pegar ejercicios
- **Estilo**: Borde definido, fondo blanco, texto legible
- **Tamaño**: Compacto, aproximadamente 25% del ancho, 15% de la altura

#### 3. Canvas Section (Área Principal)
- **Ubicación**: Centro de la pantalla, área principal
- **Funcionalidad**: Canvas HTML5 para dibujo, área de trabajo principal
- **Estilo**: Borde definido, fondo blanco
- **Tamaño**: Área principal, aproximadamente 70% del ancho, 75% de la altura
- **Controles**: Botón de limpiar integrado

#### 4. Action Buttons (Top Right)
- **Ubicación**: Parte superior derecha
- **Botón Bombilla (💡)**:
  - Estado normal: Gris/neutro
  - Estado activo: Amarillo brillante
  - Funcionalidad: Toggle para activar modo de ayuda
- **Botón Interrogación (❓)**:
  - Estilo: Circular, azul
  - Funcionalidad: Trigger para solicitar pista a la IA

#### 5. Output Section (Bottom Right - Con Input)
- **Ubicación**: Esquina inferior derecha
- **Funcionalidad**: 
  - Mostrar respuestas de la IA (área scrolleable)
  - Input para realizar consultas adicionales a la IA
- **Estilo**: Área scrolleable, fondo ligeramente diferenciado
- **Estados**: Loading, content, empty
- **Tamaño**: Compacto, aproximadamente 25% del ancho, 40% de la altura
- **Componentes**:
  - Área de respuestas (70% del espacio)
  - Input de consulta (30% del espacio)

## Components and Interfaces

### HTML Structure
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TutorIA - White Board</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto p-4">
        <!-- Header -->
        <header class="text-center mb-4">
            <h1 class="text-3xl font-bold text-gray-800">White Board</h1>
        </header>
        
        <!-- Main Layout -->
        <div class="relative h-[calc(100vh-120px)]">
            <!-- Exercise Section (Top Left - Compact) -->
            <div class="absolute top-0 left-0 w-80 h-32 bg-white rounded-lg border-2 border-gray-300 p-3 z-10">
                <h2 class="text-sm font-semibold mb-1">Ejercicio</h2>
                <textarea id="exercise-input" class="w-full h-20 resize-none border-none outline-none text-sm" 
                          placeholder="Pega aquí tu ejercicio..."></textarea>
            </div>
            
            <!-- Action Buttons (Top Right) -->
            <div class="absolute top-0 right-0 flex space-x-3 z-10">
                <button id="hint-toggle" class="w-12 h-12 rounded-full bg-gray-300 hover:bg-yellow-400 
                                               transition-colors duration-200 flex items-center justify-center text-xl">
                    💡
                </button>
                <button id="ask-question" class="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 
                                                text-white transition-colors duration-200 flex items-center justify-center text-xl">
                    ❓
                </button>
            </div>
            
            <!-- Canvas Section (Main Area) -->
            <div class="absolute inset-0 bg-white rounded-lg border-2 border-gray-300 p-4">
                <div class="canvas-container h-full relative">
                    <canvas id="drawing-canvas" class="w-full h-full border border-gray-200 rounded"></canvas>
                    <!-- Clear button -->
                    <button id="clear-canvas" class="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 
                                                    text-white px-3 py-1 rounded text-sm">
                        Limpiar
                    </button>
                </div>
            </div>
            
            <!-- Output Section (Bottom Right - Compact with Input) -->
            <div class="absolute bottom-0 right-0 w-80 h-64 bg-white rounded-lg border-2 border-gray-300 p-3 z-10">
                <h2 class="text-sm font-semibold mb-2">Output</h2>
                
                <!-- AI Response Area -->
                <div id="ai-response" class="h-40 overflow-y-auto text-xs bg-gray-50 rounded p-2 mb-2">
                    <p class="text-gray-500 italic">Las respuestas de la IA aparecerán aquí...</p>
                </div>
                
                <!-- Query Input -->
                <div class="flex space-x-2">
                    <input id="query-input" type="text" 
                           class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" 
                           placeholder="Pregunta a la IA...">
                    <button id="send-query" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

### CSS Enhancements
```css
/* Custom styles for better UX */
.canvas-container {
    position: relative;
}

.canvas-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
}

.loading-spinner {
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.hint-active {
    background-color: #fbbf24 !important;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
    .grid-cols-3 {
        grid-template-columns: 1fr;
    }
    
    .lg\\:col-span-2 {
        grid-column: span 1;
    }
}
```

### JavaScript Integration Points

#### Canvas Enhancement
- Mantener la funcionalidad existente de `draw.js`
- Añadir botón de limpiar canvas
- Mejorar la responsividad del canvas para el área principal

#### Button Interactions
```javascript
// Hint toggle functionality
document.getElementById('hint-toggle').addEventListener('click', function() {
    this.classList.toggle('hint-active');
});

// Question button functionality (canvas + exercise)
document.getElementById('ask-question').addEventListener('click', function() {
    const exerciseText = document.getElementById('exercise-input').value;
    const canvasImage = document.getElementById('drawing-canvas').toDataURL('image/png');
    getAIHint(exerciseText, canvasImage);
});

// Clear canvas functionality
document.getElementById('clear-canvas').addEventListener('click', function() {
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Send query functionality
document.getElementById('send-query').addEventListener('click', function() {
    const query = document.getElementById('query-input').value;
    if (query.trim()) {
        sendQuery(query);
        document.getElementById('query-input').value = '';
    }
});

// Enter key support for query input
document.getElementById('query-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('send-query').click();
    }
});
```

## Data Models

### Exercise Data
```javascript
const exerciseData = {
    text: String,           // Contenido del ejercicio
    timestamp: Date,        // Cuándo se ingresó
    modified: Boolean       // Si ha sido editado
};
```

### Canvas Data
```javascript
const canvasData = {
    imageData: String,      // Base64 del canvas
    strokes: Array,         // Historial de trazos
    dimensions: Object      // Ancho y alto del canvas
};
```

### AI Response Data
```javascript
const aiResponseData = {
    responses: Array,       // Historial de respuestas
    currentResponse: String, // Respuesta actual
    loading: Boolean,       // Estado de carga
    error: String          // Mensaje de error si existe
};
```

## Error Handling

### Canvas Errors
- Validar que el canvas esté disponible antes de dibujar
- Manejar errores de conversión a Base64
- Fallback para dispositivos sin soporte táctil

### API Errors
- Mostrar mensajes de error amigables en español
- Implementar retry automático para errores temporales
- Validar que hay contenido en el canvas antes de enviar

### UI Errors
- Validar dimensiones de pantalla para responsive design
- Manejar estados de carga apropiadamente
- Prevenir múltiples clicks en botones de acción

## Testing Strategy

### Unit Tests
- Funcionalidad de dibujo en canvas
- Validación de datos de entrada
- Conversión de canvas a Base64

### Integration Tests
- Flujo completo: ejercicio → dibujo → IA → respuesta
- Responsive design en diferentes tamaños de pantalla
- Integración con API de Gemini

### User Acceptance Tests
- Facilidad de uso de la nueva interfaz
- Tiempo de respuesta de la aplicación
- Compatibilidad con diferentes navegadores

### Performance Tests
- Tiempo de carga inicial
- Responsividad del canvas durante el dibujo
- Memoria utilizada durante sesiones largas