# TutorIA: AI-Powered Digital Whiteboard - Copilot Instructions

## Project Overview
TutorIA is a hackathon MVP: a client-side web app where students draw problems on a canvas and receive Socratic-style AI hints. Built for rapid development with minimal dependencies.

## Architecture & Key Components

### File Structure
- `index.html` - Main layout with Tailwind CSS, responsive 2-column design
- `styles.css` - Canvas responsiveness, mobile breakpoints, custom scrollbars
- `draw.js` - Canvas drawing logic with mouse events and image extraction
- `main.js` - Google Gemini API integration and error handling

### Core Data Flow
1. User draws on HTML5 canvas → 2. Canvas converts to Base64 PNG → 3. Gemini API processes image + text prompt → 4. Display Socratic hint in Spanish

## Critical Patterns & Conventions

### Canvas Drawing System
- Use `WhiteboardDrawing` class with mouse event bindings
- Always maintain 600x400px base size, scale responsively via CSS
- Drawing properties: black stroke, 2px width, round caps
- Image extraction: `canvas.toDataURL('image/png')` → strip prefix for API

### AI Integration Pattern
```javascript
// Always use this exact prompt for consistency
const tutorPrompt = "Eres un tutor experto y amigable. Un estudiante está trabajando en el siguiente problema en su pizarra. Analiza la imagen y su pregunta. Tu objetivo NO es dar la respuesta final. En su lugar, proporciona una pista clara, o el siguiente paso lógico, o haz una pregunta que le ayude a pensar. El idioma de la respuesta debe ser español.";
```

### Error Handling Strategy
- Check canvas.isEmpty() before API calls
- Map HTTP status codes to Spanish user messages (400→"Solicitud inválida", 429→"límite de solicitudes")
- Always show loading states and disable buttons during requests

### Mobile Responsiveness Rules
- Canvas height: 400px desktop → 300px tablet → 250px mobile
- Use `lg:` prefixes for desktop layouts, stack vertically on mobile
- Maintain drawing accuracy with `getMousePos()` scaling calculations

## Development Workflow

### Testing Locally
```bash
# Serve files (any static server works)
npx serve .
# Or python -m http.server 8000
```

### API Key Configuration
Replace `YOUR_API_KEY_HERE` in main.js or call `setGeminiApiKey("key")` in browser console.

### Key Dependencies
- Tailwind CSS 2.2.19 (CDN only)
- Google Gemini API (gemini-1.5-flash model)
- No build process - vanilla HTML/CSS/JS

## Hackathon-Specific Considerations
- Prioritize demo-readiness over feature completeness
- Spanish UI/UX for target audience
- Focus on core flow: draw → hint → iterate
- Keep error messages user-friendly for live demos
