// Main application logic for TutorIA - AI integration and response handling

class TutorIA {
    constructor() {
        // Gemini API configuration
        this.apiKey = 'YOUR_API_KEY_HERE'; // Replace with actual API key
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        
        // Socratic tutoring prompt in Spanish
        this.tutorPrompt = "Eres un tutor experto y amigable. Un estudiante está trabajando en el siguiente problema en su pizarra. Analiza la imagen y su pregunta. Tu objetivo NO es dar la respuesta final. En su lugar, proporciona una pista clara, o el siguiente paso lógico, o haz una pregunta que le ayude a pensar. El idioma de la respuesta debe ser español.";
        
        this.bindEvents();
    }
    
    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            const getHintBtn = document.getElementById('getHintBtn');
            if (getHintBtn) {
                getHintBtn.addEventListener('click', this.getHint.bind(this));
            }
        });
    }
    
    async getHint() {
        try {
            // Check if canvas has any drawing
            if (whiteboard && whiteboard.isEmpty()) {
                this.showError('Por favor, dibuja o escribe algo en la pizarra antes de solicitar una pista.');
                return;
            }
            
            // Show loading indicator
            this.showLoading(true);
            
            // Get canvas image data
            const imageData = whiteboard ? whiteboard.getCanvasImageData() : null;
            
            if (!imageData) {
                throw new Error('No se pudo obtener la imagen de la pizarra');
            }
            
            // Prepare API request
            const requestBody = {
                contents: [{
                    parts: [
                        {
                            text: this.tutorPrompt
                        },
                        {
                            inline_data: {
                                mime_type: "image/png",
                                data: imageData
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            };
            
            // Make API request
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(this.getErrorMessage(response.status, errorData));
            }
            
            const data = await response.json();
            
            // Extract AI response
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiText = data.candidates[0].content.parts[0].text;
                this.showResponse(aiText);
            } else {
                throw new Error('Respuesta inesperada de la API');
            }
            
        } catch (error) {
            console.error('Error getting hint:', error);
            this.showError(`Error: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }
    
    getErrorMessage(status, errorData) {
        switch (status) {
            case 400:
                return 'Solicitud inválida. Verifica que hayas dibujado algo en la pizarra.';
            case 401:
                return 'API key inválida. Verifica tu configuración.';
            case 403:
                return 'Acceso denegado. Verifica tu API key y permisos.';
            case 429:
                return 'Has superado el límite de solicitudes. Intenta de nuevo en unos minutos.';
            case 500:
                return 'Error interno del servidor. Intenta de nuevo más tarde.';
            default:
                if (errorData.error && errorData.error.message) {
                    return errorData.error.message;
                }
                return 'No se pudo generar una pista. Intenta de nuevo.';
        }
    }
    
    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const aiResponse = document.getElementById('aiResponse');
        const getHintBtn = document.getElementById('getHintBtn');
        
        if (loadingIndicator && aiResponse && getHintBtn) {
            if (show) {
                loadingIndicator.classList.remove('hidden');
                aiResponse.classList.add('hidden');
                getHintBtn.disabled = true;
                getHintBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                loadingIndicator.classList.add('hidden');
                aiResponse.classList.remove('hidden');
                getHintBtn.disabled = false;
                getHintBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }
    
    showResponse(text) {
        const aiResponse = document.getElementById('aiResponse');
        if (aiResponse) {
            aiResponse.textContent = text;
            // Scroll to top of response area
            aiResponse.scrollTop = 0;
        }
    }
    
    showError(message) {
        const aiResponse = document.getElementById('aiResponse');
        if (aiResponse) {
            aiResponse.innerHTML = `<div class="text-red-600 font-medium">${message}</div>`;
            aiResponse.scrollTop = 0;
        }
    }
    
    // Method to update API key (for easy configuration)
    setApiKey(key) {
        this.apiKey = key;
    }
    
    // Method to check if API key is configured
    isConfigured() {
        return this.apiKey && this.apiKey !== 'YOUR_API_KEY_HERE';
    }
}

// Initialize TutorIA application
const tutorIA = new TutorIA();

// Utility function to set API key from external script or console
function setGeminiApiKey(key) {
    tutorIA.setApiKey(key);
    console.log('API key updated successfully');
}

// Warning about API key configuration
document.addEventListener('DOMContentLoaded', () => {
    if (!tutorIA.isConfigured()) {
        console.warn('⚠️  API Key not configured. Please set your Gemini API key by calling: setGeminiApiKey("your-api-key-here")');
        
        // Show warning in UI after a short delay
        setTimeout(() => {
            const aiResponse = document.getElementById('aiResponse');
            if (aiResponse && aiResponse.textContent.includes('Escribe o dibuja')) {
                aiResponse.innerHTML = `
                    <div class="text-amber-600 text-sm mb-2">
                        <strong>⚠️ Configuración requerida:</strong><br>
                        Para usar la funcionalidad de IA, configura tu API key de Google Gemini.
                    </div>
                    <div class="text-gray-600 text-sm">
                        Escribe o dibuja tu problema en la pizarra y presiona 'Obtener Pista'.
                    </div>
                `;
            }
        }, 1000);
    }
    
    console.log('TutorIA initialized successfully');
});
