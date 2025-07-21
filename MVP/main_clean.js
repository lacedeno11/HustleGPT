// Main application logic for TutorIA - Clean version without duplications

class TutorIA {
    constructor() {
        // API Configuration
        this.apiKey = 'AIzaSyAojAxx9lFUfzjeZXXETjGG_dlzpn-ktPk';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

        // Token management
        this.maxTokens = 15;
        this.usedTokens = 0;
        this.tokenStorageKey = 'tutorIA_tokens';
        this.loadTokensFromStorage();

        // Conversation context
        this.currentMode = 'initial';
        this.conversationHistory = [];
        this.responseHistory = [];

        // Tutoring prompts
        this.tutorPrompts = {
            initial: `Eres un tutor experto y amigable. Analiza cuidadosamente la imagen de la pizarra del estudiante. Tu trabajo es:
1. INTERPRETAR: Examina cada trazo, símbolo, número o texto en la pizarra. Si no puedes entender algo con 95% de certeza, pide aclaración específica.
2. CUANDO ESTÉS 95% SEGURO del contenido:
   - Da retroalimentación positiva sobre lo que el estudiante ha hecho correctamente
   - Señala qué podría mejorarse o qué casos no está considerando
   - Proporciona insights valiosos sin dar la solución completa
3. IMPORTANTE: Si no entiendes claramente lo que está escrito, responde: "No puedo leer claramente [parte específica]. ¿Podrías escribirlo de forma más legible o describir lo que intentas resolver?"
Responde en español de manera constructiva y alentadora.`,

            stuck: `El estudiante dice estar atascado. Como tutor experto:
1. Ayúdale a considerar más casos y entender mejor la lógica del problema
2. Haz preguntas que lo guíen a descubrir qué está pasando por alto
3. No des la solución, sino herramientas para pensar diferente
4. Analiza lo que ha dibujado y construye sobre eso
Responde en español de manera que despierte su curiosidad por explorar más.`,

            hint: `El estudiante pide una pista. Como tutor experto:
1. Analiza lo que ya ha descubierto en la pizarra
2. Da una pista que lo ayude a avanzar SOLO en lo que NO ha resuelto aún
3. NO repitas lo que ya sabe o ha hecho
4. La pista debe ser suficiente para el siguiente paso, no más
Responde en español con una pista específica y útil.`,

            clarify: `El estudiante quiere que clarifies el problema. Como tutor experto:
1. Proporciona más ejemplos de entrada y salida
2. Explica mejor las condiciones del problema
3. NO des pistas sobre la solución, solo clarifica el enunciado
4. Ayuda a entender qué se está pidiendo exactamente
Responde en español enfocándote solo en aclarar el problema.`,

            next_step: `El estudiante pide una sugerencia del siguiente paso. Como tutor experto:
1. Analiza dónde está actualmente en su solución
2. Sugiere el próximo paso lógico sin ser obvio
3. NO des la fórmula exacta o la solución directa
4. Guíalo hacia el siguiente razonamiento que necesita hacer
Responde en español con una sugerencia sutil pero útil.`,

            verify: `El estudiante cree tener la solución. Como tutor experto:
1. Analiza su propuesta cuidadosamente
2. Si es correcta: Felicítalo y explica por qué está bien
3. Si es incorrecta: Proporciona un contraejemplo específico que muestre el error
4. Sé constructivo y mantén su motivación alta
Responde en español con evaluación honesta y constructiva.`,

            solution: `El estudiante pide la solución completa. Como tutor experto:
1. Primero, aliéntalo reconociendo su esfuerzo y progreso
2. Presenta la solución completa paso a paso
3. Contrasta: qué hizo bien, qué hizo mal, qué no consideró
4. Termina con: "El patrón clave para resolver este tipo de problemas era..."
Responde en español de manera comprensiva y educativa.`
        };

        this.bindEvents();
    }

    // Token management
    loadTokensFromStorage() {
        const stored = localStorage.getItem(this.tokenStorageKey);
        if (stored) {
            const data = JSON.parse(stored);
            const today = new Date().toDateString();
            if (data.date === today) {
                this.usedTokens = data.usedTokens || 0;
            } else {
                this.usedTokens = 0;
                this.saveTokensToStorage();
            }
        }
        this.updateTokenDisplay();
    }

    saveTokensToStorage() {
        const data = {
            usedTokens: this.usedTokens,
            date: new Date().toDateString()
        };
        localStorage.setItem(this.tokenStorageKey, JSON.stringify(data));
    }    has
TokensAvailable() {
        return this.usedTokens < this.maxTokens;
    }

    consumeToken() {
        if (this.hasTokensAvailable()) {
            this.usedTokens++;
            this.saveTokensToStorage();
            this.updateTokenDisplay();
            return true;
        }
        return false;
    }

    getRemainingTokens() {
        return Math.max(0, this.maxTokens - this.usedTokens);
    }

    updateTokenDisplay() {
        if (!document.getElementById('tokenCounter')) {
            this.addTokenCounter();
        }
        const tokenCounter = document.getElementById('tokenCounter');
        const remaining = this.getRemainingTokens();
        if (tokenCounter) {
            const colorClass = remaining <= 5 ? 'text-red-500' : remaining <= 15 ? 'text-yellow-500' : 'text-green-500';
            tokenCounter.innerHTML = `<span class="font-semibold ${colorClass}">🪙 ${remaining}/${this.maxTokens} consultas restantes</span>`;
        }
    }

    addTokenCounter() {
        const header = document.querySelector('header');
        if (header && !document.getElementById('tokenCounter')) {
            const tokenContainer = document.createElement('div');
            tokenContainer.id = 'tokenCounter';
            tokenContainer.className = 'text-center mt-2 text-sm';
            header.appendChild(tokenContainer);
        }
    }

    // Event binding
    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            // Help buttons
            const helpToggle = document.getElementById('help-toggle');
            if (helpToggle) {
                helpToggle.addEventListener('click', this.toggleHelpMenu.bind(this));
            }

            for (let i = 1; i <= 6; i++) {
                const helpBtn = document.getElementById(`help-${i}`);
                if (helpBtn) {
                    helpBtn.addEventListener('click', () => this.getHelp(i));
                }
            }

            // Close help menu when clicking outside
            document.addEventListener('click', (e) => {
                const helpMenu = document.getElementById('help-menu');
                const helpToggle = document.getElementById('help-toggle');
                if (helpMenu && helpToggle && !helpToggle.contains(e.target) && !helpMenu.contains(e.target)) {
                    this.closeHelpMenu();
                }
            });

            // Canvas controls
            const clearCanvas = document.getElementById('clear-canvas');
            if (clearCanvas) {
                clearCanvas.addEventListener('click', this.clearCanvas.bind(this));
            }      
      // Action buttons
            const clearAll = document.getElementById('clear-all');
            if (clearAll) {
                clearAll.addEventListener('click', this.clearAll.bind(this));
            }

            const undoAction = document.getElementById('undo-action');
            if (undoAction) {
                undoAction.addEventListener('click', this.undoAction.bind(this));
            }

            // Drawing tools
            const penTool = document.getElementById('pen-tool');
            if (penTool) {
                penTool.addEventListener('click', this.selectPenTool.bind(this));
            }

            const eraserTool = document.getElementById('eraser-tool');
            if (eraserTool) {
                eraserTool.addEventListener('click', this.selectEraserTool.bind(this));
            }

            // Eraser size control
            const eraserSize = document.getElementById('eraser-size');
            const eraserSizeDisplay = document.getElementById('eraser-size-display');
            if (eraserSize && eraserSizeDisplay) {
                eraserSize.addEventListener('input', (e) => {
                    const size = parseInt(e.target.value);
                    eraserSizeDisplay.textContent = `${size}px`;
                    if (whiteboard && whiteboard.currentTool === 'eraser') {
                        whiteboard.brushSize = size;
                        whiteboard.ctx.lineWidth = size;
                        this.updateCanvasCursor('eraser', size);
                    }
                });
            }

            // Query functionality
            const sendQuery = document.getElementById('send-query');
            if (sendQuery) {
                sendQuery.addEventListener('click', this.sendQuery.bind(this));
            }

            const queryInput = document.getElementById('query-input');
            if (queryInput) {
                queryInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendQuery();
                    }
                });
            }

            // Output panel controls
            const minimizeOutput = document.getElementById('minimize-output');
            if (minimizeOutput) {
                minimizeOutput.addEventListener('click', this.minimizeOutputPanel.bind(this));
            }

            const closeOutput = document.getElementById('close-output');
            if (closeOutput) {
                closeOutput.addEventListener('click', this.closeOutputPanel.bind(this));
            }

            const minimizedOutput = document.getElementById('minimized-output');
            if (minimizedOutput) {
                minimizedOutput.addEventListener('click', this.showOutputPanel.bind(this));
            }    
        // Exercise functionality
            const clearExercise = document.getElementById('clear-exercise');
            if (clearExercise) {
                clearExercise.addEventListener('click', this.clearExercise.bind(this));
            }

            this.setupExerciseImagePaste();
        });
    }

    // Help menu functions
    toggleHelpMenu() {
        const helpMenu = document.getElementById('help-menu');
        const helpArrow = document.getElementById('help-arrow');
        
        if (helpMenu && helpArrow) {
            const isHidden = helpMenu.classList.contains('hidden');
            if (isHidden) {
                helpMenu.classList.remove('hidden');
                helpArrow.style.transform = 'rotate(180deg)';
            } else {
                helpMenu.classList.add('hidden');
                helpArrow.style.transform = 'rotate(0deg)';
            }
        }
    }

    closeHelpMenu() {
        const helpMenu = document.getElementById('help-menu');
        const helpArrow = document.getElementById('help-arrow');
        
        if (helpMenu && helpArrow) {
            helpMenu.classList.add('hidden');
            helpArrow.style.transform = 'rotate(0deg)';
        }
    }

    // Main help function
    async getHelp(helpType) {
        try {
            if (!this.hasTokensAvailable()) {
                this.showError('Has agotado tus consultas diarias. Regresa mañana para más ayuda del tutor IA. 🪙');
                return;
            }

            this.showOutputPanel();

            const helpModes = {
                1: 'stuck', 2: 'hint', 3: 'clarify', 
                4: 'next_step', 5: 'verify', 6: 'solution'
            };

            const mode = helpModes[helpType];
            if (!mode) {
                this.showError('Tipo de ayuda no válido.');
                return;
            }

            this.currentMode = mode;
            this.closeHelpMenu();

            if (['stuck', 'hint', 'next_step', 'verify'].includes(mode)) {
                if (whiteboard && whiteboard.isEmpty()) {
                    this.showError('Por favor, dibuja o escribe algo en la pizarra antes de solicitar este tipo de ayuda.');
                    return;
                }
            }

            if (!this.consumeToken()) {
                this.showError('Error al procesar la solicitud. Intenta de nuevo.');
                return;
            }

            this.showLoading(true);          
  const imageData = whiteboard && !whiteboard.isEmpty() ? whiteboard.getCanvasImageData() : null;
            const exerciseText = document.getElementById('exercise-input')?.value || '';

            let contextualPrompt = this.tutorPrompts[mode];
            if (this.conversationHistory.length > 0) {
                contextualPrompt += `\n\nHistorial: ${this.conversationHistory.slice(-3).join('\n')}`;
            }
            if (exerciseText.trim()) {
                contextualPrompt += `\n\nContexto del ejercicio: ${exerciseText}`;
            }

            const requestParts = [{ text: contextualPrompt }];
            if (imageData && ['stuck', 'hint', 'next_step', 'verify'].includes(mode)) {
                requestParts.push({
                    inline_data: { mime_type: "image/png", data: imageData }
                });
            }

            const exerciseImageData = this.getExerciseImageData();
            if (exerciseImageData) {
                requestParts.push({
                    inline_data: { mime_type: "image/jpeg", data: exerciseImageData }
                });
            }

            if (mode === 'clarify' && (!imageData || whiteboard.isEmpty())) {
                requestParts[0].text += "\n\nProporciona ejemplos y explicaciones sobre tipos de problemas comunes.";
            }

            const requestBody = {
                contents: [{ parts: requestParts }],
                generationConfig: {
                    temperature: mode === 'solution' ? 0.3 : 0.7,
                    topK: 40, topP: 0.95, maxOutputTokens: 1024
                }
            };

            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(this.getErrorMessage(response.status, errorData));
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiText = data.candidates[0].content.parts[0].text;
                
                this.conversationHistory.push(`Modo: ${mode} - Respuesta: ${aiText.substring(0, 100)}...`);
                if (this.conversationHistory.length > 5) {
                    this.conversationHistory.shift();
                }

                const typeLabels = {
                    stuck: '🚫 Apoyo', hint: '💡 Pista', clarify: '❓ Aclaración',
                    next_step: '👣 Siguiente Paso', verify: '✅ Verificación', solution: '📖 Solución'
                };

                this.showResponse(aiText, typeLabels[mode] || 'Ayuda');
                this.addToHistory(`Ayuda: ${typeLabels[mode]}`, aiText);

                const remaining = this.getRemainingTokens();
                if (remaining <= 5 && remaining > 0) {
                    setTimeout(() => this.showTokenWarning(remaining), 2000);
                }
            } else {
                throw new Error('Respuesta inesperada de la API');
            }
        } catch (error) {
            console.error('Error getting help:', error);
            this.showError(`Error: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }   
    async sendQuery() {
        const queryInput = document.getElementById('query-input');
        const query = queryInput?.value?.trim();

        if (!query) {
            this.showError('Por favor, escribe una pregunta antes de enviar.');
            return;
        }

        try {
            this.showOutputPanel();
            this.showLoading(true);

            const imageData = whiteboard && !whiteboard.isEmpty() ? whiteboard.getCanvasImageData() : null;
            const exerciseText = document.getElementById('exercise-input')?.value || '';

            let contextPrompt = `Eres un tutor experto. Un estudiante pregunta: "${query}". `;
            if (exerciseText.trim()) {
                contextPrompt += `Contexto del ejercicio: ${exerciseText}. `;
            }
            contextPrompt += `Responde en español de manera útil sin dar la respuesta completa.`;

            const parts = [{ text: contextPrompt }];
            if (imageData) {
                parts.push({ inline_data: { mime_type: "image/png", data: imageData } });
            }

            const exerciseImageData = this.getExerciseImageData();
            if (exerciseImageData) {
                parts.push({ inline_data: { mime_type: "image/jpeg", data: exerciseImageData } });
            }

            const requestBody = {
                contents: [{ parts }],
                generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 }
            };

            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(this.getErrorMessage(response.status, errorData));
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiText = data.candidates[0].content.parts[0].text;
                this.showResponse(aiText, '❓ Consulta');
                this.addToHistory(query, aiText);
                if (queryInput) queryInput.value = '';
            } else {
                throw new Error('Respuesta inesperada de la API');
            }
        } catch (error) {
            console.error('Error sending query:', error);
            this.showError(`Error: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }   
 // Action functions
    clearAll() {
        if (confirm('¿Estás seguro de que quieres eliminar todo el contenido?')) {
            if (whiteboard) whiteboard.clearCanvas();
            this.clearExercise();
            
            const aiResponse = document.getElementById('ai-response');
            if (aiResponse) {
                aiResponse.innerHTML = '<p class="text-gray-500 italic">Las respuestas de la IA aparecerán aquí...</p>';
            }
            
            this.responseHistory = [];
            this.conversationHistory = [];
            this.showExerciseSuccess('🗑️ Todo el contenido ha sido eliminado');
        }
    }

    undoAction() {
        if (whiteboard && whiteboard.undo) {
            const success = whiteboard.undo();
            if (success) {
                this.showExerciseSuccess('↶ Acción deshecha');
            } else {
                this.showError('No hay acciones para deshacer.');
            }
        } else {
            this.showError('Función de deshacer no disponible en este momento.');
        }
    }

    clearCanvas() {
        if (whiteboard) {
            whiteboard.clearCanvas();
            const aiResponse = document.getElementById('ai-response');
            if (aiResponse) {
                aiResponse.innerHTML = '<p class="text-gray-500 italic">Las respuestas de la IA aparecerán aquí...</p>';
            }
            this.responseHistory = [];
        }
    }

    clearExercise() {
        const exerciseInput = document.getElementById('exercise-input');
        const imageContainer = document.getElementById('exercise-image-container');
        const exerciseImage = document.getElementById('exercise-image');
        
        if (exerciseInput) {
            exerciseInput.value = '';
            exerciseInput.style.height = 'auto';
        }
        
        if (imageContainer && exerciseImage) {
            imageContainer.classList.add('hidden');
            exerciseImage.src = '';
            this.exerciseImageData = null;
        }
        
        this.showExerciseSuccess('🗑️ Ejercicio limpiado');
    }

    // Drawing tool functions
    selectPenTool() {
        if (whiteboard) {
            whiteboard.setTool('pen');
            this.updateToolButtons();
            this.hideEraserSizePanel();
            this.updateCanvasCursor('pen');
        }
    }

    selectEraserTool() {
        if (whiteboard) {
            whiteboard.setTool('eraser');
            this.updateToolButtons();
            this.showEraserSizePanel();
            
            const eraserSize = document.getElementById('eraser-size');
            const size = eraserSize ? parseInt(eraserSize.value) : 15;
            
            if (eraserSize) {
                whiteboard.brushSize = size;
                whiteboard.ctx.lineWidth = size;
            }
            
            this.updateCanvasCursor('eraser', size);
        }
    } 
   updateToolButtons() {
        const penTool = document.getElementById('pen-tool');
        const eraserTool = document.getElementById('eraser-tool');
        
        if (penTool && eraserTool && whiteboard) {
            // Reset both buttons
            penTool.classList.remove('bg-blue-500', 'text-white');
            penTool.classList.add('bg-gray-300', 'text-gray-700');
            eraserTool.classList.remove('bg-orange-500', 'text-white');
            eraserTool.classList.add('bg-gray-300', 'text-gray-700');
            
            // Activate current tool
            if (whiteboard.currentTool === 'pen') {
                penTool.classList.remove('bg-gray-300', 'text-gray-700');
                penTool.classList.add('bg-blue-500', 'text-white');
            } else if (whiteboard.currentTool === 'eraser') {
                eraserTool.classList.remove('bg-gray-300', 'text-gray-700');
                eraserTool.classList.add('bg-orange-500', 'text-white');
            }
        }
    }

    showEraserSizePanel() {
        const eraserSizePanel = document.getElementById('eraser-size-panel');
        if (eraserSizePanel) eraserSizePanel.classList.remove('hidden');
    }

    hideEraserSizePanel() {
        const eraserSizePanel = document.getElementById('eraser-size-panel');
        if (eraserSizePanel) eraserSizePanel.classList.add('hidden');
    }

    updateCanvasCursor(tool, size = 15) {
        const canvas = document.getElementById('whiteboard');
        if (!canvas) return;
        
        if (tool === 'eraser') {
            const cursorSize = Math.max(12, Math.min(size, 50));
            const cursorSvg = `
                <svg width="${cursorSize}" height="${cursorSize}" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="${cursorSize/2}" cy="${cursorSize/2}" r="${(cursorSize-3)/2}" 
                            fill="rgba(255,255,255,0.3)" stroke="black" stroke-width="2" opacity="0.9"/>
                </svg>
            `;
            const encodedSvg = encodeURIComponent(cursorSvg);
            const cursorUrl = `data:image/svg+xml,${encodedSvg}`;
            canvas.style.cursor = `url("${cursorUrl}") ${cursorSize/2} ${cursorSize/2}, auto`;
        } else {
            canvas.style.cursor = 'crosshair';
        }
    }

    // Output panel functions
    showOutputPanel() {
        const outputPanel = document.getElementById('output-panel');
        const minimizedOutput = document.getElementById('minimized-output');
        
        if (outputPanel && minimizedOutput) {
            outputPanel.classList.remove('hidden');
            minimizedOutput.classList.add('hidden');
        }
    }

    minimizeOutputPanel() {
        const outputPanel = document.getElementById('output-panel');
        const minimizedOutput = document.getElementById('minimized-output');
        
        if (outputPanel && minimizedOutput) {
            outputPanel.classList.add('hidden');
            minimizedOutput.classList.remove('hidden');
            
            const responseCount = document.querySelectorAll('#ai-response .mb-3').length;
            const countBadge = minimizedOutput.querySelector('.bg-blue-600');
            if (countBadge) {
                countBadge.textContent = responseCount > 0 ? responseCount : '1';
            }
        }
    }

    closeOutputPanel() {
        const outputPanel = document.getElementById('output-panel');
        const minimizedOutput = document.getElementById('minimized-output');
        
        if (outputPanel && minimizedOutput) {
            outputPanel.classList.add('hidden');
            minimizedOutput.classList.add('hidden');
        }
    }    

    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const aiResponse = document.getElementById('ai-response');
        const sendQuery = document.getElementById('send-query');
        
        if (show) {
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');
            if (aiResponse) aiResponse.classList.add('hidden');
            if (sendQuery) {
                sendQuery.disabled = true;
                sendQuery.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            if (aiResponse) aiResponse.classList.remove('hidden');
            if (sendQuery) {
                sendQuery.disabled = false;
                sendQuery.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    showResponse(text, type = 'Respuesta') {
        const aiResponse = document.getElementById('ai-response');
        if (aiResponse) {
            const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const responseHtml = `
                <div class="mb-3 p-2 bg-white rounded border-l-4 border-blue-400">
                    <div class="text-xs text-gray-500 mb-1">${type} - ${timestamp}</div>
                    <div class="text-gray-800">${text}</div>
                </div>
            `;
            
            if (aiResponse.innerHTML.includes('Las respuestas de la IA aparecerán aquí')) {
                aiResponse.innerHTML = responseHtml;
            } else {
                aiResponse.innerHTML += responseHtml;
            }
            
            aiResponse.scrollTop = aiResponse.scrollHeight;
        }
    }

    showError(message) {
        const aiResponse = document.getElementById('ai-response');
        if (aiResponse) {
            const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const errorHtml = `
                <div class="mb-3 p-2 bg-red-50 rounded border-l-4 border-red-400">
                    <div class="text-xs text-red-500 mb-1">❌ Error - ${timestamp}</div>
                    <div class="text-red-700 font-medium">${message}</div>
                </div>
            `;
            
            if (aiResponse.innerHTML.includes('Las respuestas de la IA aparecerán aquí')) {
                aiResponse.innerHTML = errorHtml;
            } else {
                aiResponse.innerHTML += errorHtml;
            }
            
            aiResponse.scrollTop = aiResponse.scrollHeight;
        }
    }

    showTokenWarning(remaining) {
        const aiResponse = document.getElementById('ai-response');
        if (aiResponse) {
            const warningHtml = `
                <div class="mb-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <div class="text-xs text-yellow-600 mb-1">⚠️ Advertencia</div>
                    <div class="text-yellow-700 text-sm">Te quedan solo ${remaining} consultas. Úsalas sabiamente.</div>
                </div>
            `;
            aiResponse.innerHTML += warningHtml;
            aiResponse.scrollTop = aiResponse.scrollHeight;
        }
    }

    showExerciseSuccess(message) {
        const exerciseContent = document.getElementById('exercise-content');
        if (exerciseContent) {
            const successMsg = document.createElement('div');
            successMsg.className = 'text-xs text-green-600 mt-1';
            successMsg.textContent = message;
            
            exerciseContent.appendChild(successMsg);
            
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                }
            }, 3000);
        }
    }   
 // Utility functions
    addToHistory(query, response) {
        this.responseHistory.push({
            timestamp: new Date(),
            query: query,
            response: response
        });
        
        if (this.responseHistory.length > 10) {
            this.responseHistory = this.responseHistory.slice(-10);
        }
    }

    getErrorMessage(status, errorData) {
        switch (status) {
            case 400: return 'Solicitud inválida. Verifica que hayas dibujado algo en la pizarra.';
            case 401: return 'API key inválida. Verifica tu configuración.';
            case 403: return 'Acceso denegado. Verifica tu API key y permisos.';
            case 429: return 'Has superado el límite de solicitudes. Intenta de nuevo en unos minutos.';
            case 500: return 'Error interno del servidor. Intenta de nuevo más tarde.';
            default:
                if (errorData.error && errorData.error.message) {
                    return errorData.error.message;
                }
                return 'No se pudo generar una respuesta. Intenta de nuevo.';
        }
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    isConfigured() {
        return this.apiKey && this.apiKey !== 'YOUR_API_KEY_HERE';
    }

    getHistory() {
        return this.responseHistory;
    }

    // Exercise image functionality
    setupExerciseImagePaste() {
        const exerciseContent = document.getElementById('exercise-content');
        const exerciseInput = document.getElementById('exercise-input');
        
        if (!exerciseContent || !exerciseInput) return;
        
        exerciseContent.addEventListener('paste', (e) => {
            e.preventDefault();
            
            const items = e.clipboardData.items;
            let hasImage = false;
            
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    hasImage = true;
                    const file = item.getAsFile();
                    this.handleExerciseImagePaste(file);
                    break;
                }
            }
            
            if (!hasImage) {
                const text = e.clipboardData.getData('text/plain');
                if (text) {
                    const start = exerciseInput.selectionStart;
                    const end = exerciseInput.selectionEnd;
                    const currentText = exerciseInput.value;
                    
                    exerciseInput.value = currentText.substring(0, start) + text + currentText.substring(end);
                    exerciseInput.selectionStart = exerciseInput.selectionEnd = start + text.length;
                    exerciseInput.focus();
                }
            }
        });
        
        const removeImageBtn = document.getElementById('remove-exercise-image');
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                this.removeExerciseImage();
            });
        }
    }  
  handleExerciseImagePaste(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showError('Por favor, pega una imagen válida.');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            this.showError('La imagen es demasiado grande. Máximo 5MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageContainer = document.getElementById('exercise-image-container');
            const exerciseImage = document.getElementById('exercise-image');
            
            if (exerciseImage && imageContainer) {
                exerciseImage.src = e.target.result;
                imageContainer.classList.remove('hidden');
                this.exerciseImageData = e.target.result;
                this.showExerciseImageSuccess();
            }
        };
        
        reader.onerror = () => {
            this.showError('Error al cargar la imagen.');
        };
        
        reader.readAsDataURL(file);
    }

    removeExerciseImage() {
        const imageContainer = document.getElementById('exercise-image-container');
        const exerciseImage = document.getElementById('exercise-image');
        
        if (imageContainer && exerciseImage) {
            imageContainer.classList.add('hidden');
            exerciseImage.src = '';
            this.exerciseImageData = null;
        }
    }

    showExerciseImageSuccess() {
        const exerciseContent = document.getElementById('exercise-content');
        if (exerciseContent) {
            const successMsg = document.createElement('div');
            successMsg.className = 'text-xs text-green-600 mt-1';
            successMsg.textContent = '✅ Imagen pegada correctamente';
            
            exerciseContent.appendChild(successMsg);
            
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                }
            }, 3000);
        }
    }

    getExerciseImageData() {
        if (this.exerciseImageData) {
            return this.exerciseImageData.replace(/^data:image\/[a-z]+;base64,/, '');
        }
        return null;
    }
}

// Initialize TutorIA application
const tutorIA = new TutorIA();

// Utility function to set API key
function setGeminiApiKey(key) {
    tutorIA.setApiKey(key);
    console.log('API key updated successfully');
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (tutorIA.isConfigured()) {
        console.log('✅ TutorIA initialized successfully with API key configured');
        
        setTimeout(() => {
            const aiResponse = document.getElementById('ai-response');
            if (aiResponse && aiResponse.innerHTML.includes('Las respuestas de la IA aparecerán aquí')) {
                aiResponse.innerHTML = `
                    <div class="text-green-600 text-xs mb-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                        <strong>✅ TutorIA Configurado Correctamente</strong><br>
                        Sistema de tutorías inteligente activado con 6 modos de ayuda.
                    </div>
                    <div class="text-gray-600 text-xs">
                        <strong>Instrucciones:</strong><br>
                        1. Escribe tu ejercicio en la sección superior izquierda<br>
                        2. Dibuja tu trabajo en el canvas<br>
                        3. Presiona "🆘 Ayuda" para obtener asistencia de la IA<br>
                        4. O haz preguntas directas en el input inferior
                    </div>
                `;
            }
        }, 1000);
    } else {
        console.warn('⚠️ API Key not configured properly');
    }
});