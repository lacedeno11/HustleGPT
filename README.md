# SL8 - AI 🎨🤖

Una pizarra inteligente con IA que actúa como tutor personal para ayudarte a resolver problemas paso a paso.

## 🚀 Características

- **Pizarra Digital**: Dibuja y escribe con herramientas de lápiz y borrador
- **IA Tutora**: Obtén pistas y ayuda personalizada basada en lo que dibujas
- **6 Modos de Ayuda**: Desde pistas básicas hasta soluciones completas
- **Análisis de Imágenes**: La IA puede ver y analizar tus dibujos
- **Interfaz Intuitiva**: Fácil de usar con controles simples

## 📋 Requisitos Previos

1. **Navegador Web Moderno** (Chrome, Firefox, Safari, Edge)
2. **API Key de Google Gemini** (gratuita)
3. **Servidor Web Local** (opcional, pero recomendado)

## 🔧 Instalación

### Paso 1: Obtener API Key de Google Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia tu API key (guárdala en un lugar seguro)

### Paso 2: Configurar el Proyecto

1. **Clona o descarga** este repositorio
2. **Abre el archivo** `index.html` en tu navegador
   - O mejor aún, usa un servidor local (ver opciones abajo)

### Paso 3: Configurar tu API Key

1. **Abre la aplicación** en tu navegador
2. **Presiona F12** para abrir la consola del navegador
3. **Escribe el siguiente comando** (reemplaza con tu API key):
   ```javascript
   setGeminiApiKey("tu-api-key-aqui")
   ```
4. **Presiona Enter**
5. Deberías ver: `✅ API key actualizada correctamente`

## 🌐 Opciones de Servidor Local (Recomendado)

### Opción 1: Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Opción 2: Node.js
```bash
npx http-server -p 8000
```

### Opción 3: PHP
```bash
php -S localhost:8000
```

Luego abre: `http://localhost:8000`

## 📖 Cómo Usar SL8 - AI

### 🎨 Herramientas de Dibujo

1. **Lápiz (✏️)**: Dibuja en la pizarra
   - Tamaño fijo de 2px para trazos precisos
   - Color negro sobre fondo blanco

2. **Borrador (🧽)**: Borra partes del dibujo
   - Tamaño ajustable con el slider
   - Aparece cuando seleccionas el borrador

3. **Deshacer (↶)**: Deshace la última acción

4. **Eliminar Todo (🗑️)**: Limpia la pizarra y respuestas de IA

### 📝 Área de Ejercicio

1. **Escribe o pega** el enunciado de tu problema
2. **Pega imágenes** (Ctrl+V) si tienes diagramas o figuras
3. **Botón Limpiar**: Borra solo el contenido del ejercicio

### 🤖 Modos de Ayuda de la IA

Haz clic en **"🆘 Ayuda"** para ver las opciones:

1. **🚫 Estoy Atascado**: Te ayuda a analizar el problema desde diferentes ángulos
2. **💡 Necesito una Pista**: Te da el siguiente paso lógico sin revelar la solución
3. **❓ Aclarar Problema**: Explica mejor el enunciado con ejemplos
4. **👣 Siguiente Paso**: Sugiere qué hacer a continuación
5. **✅ Verificar Solución**: Revisa si tu respuesta es correcta
6. **📖 Mostrar Solución**: Te da la solución completa paso a paso

### 💬 Consultas Directas

- **Escribe preguntas** en el campo inferior
- **Presiona Enter** o el botón "Enviar"
- La IA responderá basándose en tu dibujo y pregunta

## 🎯 Flujo de Trabajo Recomendado

1. **Escribe el problema** en el área de ejercicio
2. **Dibuja tu trabajo** en la pizarra (diagramas, cálculos, ideas)
3. **Pide ayuda específica** usando los botones de ayuda
4. **Continúa dibujando** basándote en las pistas
5. **Verifica tu solución** cuando creas que está lista

## 🔒 Seguridad y Privacidad

- **Tu API key se guarda localmente** en tu navegador
- **No se envía a ningún servidor** excepto Google Gemini
- **Tus dibujos y preguntas** solo se procesan para darte ayuda
- **Recomendación**: No compartas tu API key con nadie

## 🚨 Solución de Problemas

### La IA dice "no puedo ver la pizarra"
- Asegúrate de haber dibujado algo antes de pedir ayuda
- Verifica que tu API key esté configurada correctamente

### Error "API key expired"
- Tu API key ha expirado, genera una nueva en Google AI Studio
- Configúrala nuevamente con `setGeminiApiKey("nueva-key")`

### Error "Has superado el límite"
- Has usado todas tus consultas diarias (5 por defecto)
- Espera hasta mañana o genera una nueva API key

### La aplicación no carga
- Usa un servidor local en lugar de abrir el archivo directamente
- Verifica que todos los archivos estén en la misma carpeta

## 🎨 Consejos de Uso

### Para Matemáticas
- Dibuja ecuaciones, gráficos y diagramas
- Usa "Aclarar Problema" si no entiendes el enunciado
- Pide "Verificar Solución" antes de finalizar

### Para Programación
- Dibuja diagramas de flujo y pseudocódigo
- Usa "Estoy Atascado" cuando no sepas cómo empezar
- Pide "Siguiente Paso" para avanzar gradualmente

### Para Ciencias
- Dibuja diagramas, fórmulas y experimentos
- Usa imágenes en el área de ejercicio para contexto
- Pide "Mostrar Solución" solo como último recurso

## 📊 Límites y Consideraciones

- **5 consultas diarias** por defecto (configurable)
- **Imágenes optimizadas** automáticamente para mejor rendimiento
- **Respuestas en español** por defecto
- **Funciona mejor** con problemas visuales y diagramas

## 🛠️ Desarrollo

### Estructura del Proyecto
```
MVP/
├── index.html          # Interfaz principal
├── main.js            # Lógica de la aplicación y IA
├── draw.js            # Funcionalidad de la pizarra
├── styles.css         # Estilos (incluidos en HTML)
└── README.md          # Esta guía
```

### Tecnologías Utilizadas
- **HTML5 Canvas** para la pizarra
- **Tailwind CSS** para estilos
- **Google Gemini API** para IA
- **JavaScript Vanilla** sin frameworks

## 📄 Licencia

Este proyecto es de código abierto. Úsalo, modifícalo y compártelo libremente.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras bugs o tienes ideas de mejora, no dudes en contribuir.

---

**¡Disfruta aprendiendo con SL8 - AI! 🎓✨**