// Main application logic for TutorIA - New UI Design with enhanced functionality

class TutorIA {
    constructor() {
        // Gemini API configuration
        this.apiKey = 'AIzaSyAojAxx9lFUfzjeZXXETjGG_dlzpn-ktPk'; // API key from .env
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

        // Socratic tutoring prompt in Spanish
        this.tutorPrompt = "Eres un tutor experto y amigable. Un estudiante está trabajando en el siguiente problema en su pizarra. Analiza la imagen y su pregunta. Tu objetivo NO es dar la respuesta final. En su lugar, proporciona una pista clara, o el siguiente paso lógico, o haz una pregunta que le ayude a pensar. El idioma de la respuesta debe ser español.";

        // State management
        this.hintModeActive = false;
        this.responseHistory = [];

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            // Help toggle button
            const helpToggle = document.getElementById('help-toggle');
            if (helpToggle) {
                helpToggle.addEventListener('click', this.toggleHelpMenu.bind(this));
            }

            // Help option buttons
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

            // Clear canvas button
            const clearCanvas = document.getElementById('clear-canvas');
            if (clearCanvas) {
                clearCanvas.addEventListener('click', this.clearCanvas.bind(this));
            }

            // Send query button
            const sendQuery = document.getElementById('send-query');
            if (sendQuery) {
                sendQuery.addEventListener('click', this.sendQuery.bind(this));
            }

            // Query input enter key support
            const queryInput = document.getElementById('query-input');
            if (queryInput) {
                queryInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendQuery();
                    }
                });
            }

            // Exercise image paste functionality
            this.setupExerciseImagePaste();

            // Clear exercise button
            const clearExercise = document.getElementById('clear-exercise');
            if (clearExercise) {
                clearExercise.addEventListener('click', this.clearExercise.bind(this));
            }

            // Clear all button
            const clearAll = document.getElementById('clear-all');
            if (clearAll) {
                clearAll.addEventListener('click', this.clearAll.bind(this));
            }

            // Undo action button
            const undoAction = document.getElementById('undo-action');
            if (undoAction) {
                undoAction.addEventListener('click', this.undoAction.bind(this));
            }

            // Eraser mode button
            const eraserMode = document.getElementById('eraser-mode');
            if (eraserMode) {
                eraserMode.addEventListener('click', this.toggleEraserMode.bind(this));
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
                        // Update cursor to reflect new size
                        this.updateCanvasCursor('eraser', size);
                    }
                });
            }

            // Output panel controls
            const closeOutput = document.getElementById('close-output');
            if (closeOutput) {
                closeOutput.addEventListener('click', () => {
                    const outputPanel = document.getElementById('output-panel');
                    if (outputPanel) {
                        outputPanel.classList.add('hidden');
                    }
                });
            }

            const minimizeOutput = document.getElementById('minimize-output');
            const minimizedOutput = document.getElementById('minimized-output');
            if (minimizeOutput && minimizedOutput) {
                minimizeOutput.addEventListener('click', () => {
                    const outputPanel = document.getElementById('output-panel');
                    if (outputPanel) {
                        outputPanel.classList.add('hidden');
                        minimizedOutput.classList.remove('hidden');
                    }
                });

                minimizedOutput.addEventListener('click', () => {
                    const outputPanel = document.getElementById('output-panel');
                    if (outputPanel) {
                        outputPanel.classList.remove('hidden');
                        minimizedOutput.classList.add('hidden');
                    }
                });
            }
        });
    }

    toggleHintMode() {
        this.hintModeActive = !this.hintModeActive;
        const hintToggle = document.getElementById('hint-toggle');

        if (hintToggle) {
            if (this.hintModeActive) {
                hintToggle.classList.add('hint-active');
            } else {
                hintToggle.classList.remove('hint-active');
            }
        }
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

            // Get exercise text if available
            const exerciseText = document.getElementById('exercise-input')?.value || '';

            // Prepare enhanced prompt with exercise context
            let enhancedPrompt = this.tutorPrompt;
            if (exerciseText.trim()) {
                enhancedPrompt += `\n\nContexto del ejercicio: ${exerciseText}`;
            }

            // Prepare API request parts
            const parts = [{ text: enhancedPrompt }];

            // Add canvas image
            parts.push({
                inline_data: {
                    mime_type: "image/png",
                    data: imageData
                }
            });

            // Add exercise image if available
            const exerciseImageData = this.getExerciseImageData();
            if (exerciseImageData) {
                parts.push({
                    inline_data: {
                        mime_type: "image/jpeg", // Most pasted images are JPEG
                        data: exerciseImageData
                    }
                });
                enhancedPrompt += "\n\nNota: También se ha incluido una imagen del ejercicio para tu análisis.";
            }

            const requestBody = {
                contents: [{ parts }],
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
                this.showResponse(aiText, 'hint');
                this.addToHistory('Pista solicitada', aiText);
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

    async sendQuery() {
        const queryInput = document.getElementById('query-input');
        const query = queryInput?.value?.trim();

        if (!query) {
            this.showError('Por favor, escribe una pregunta antes de enviar.');
            return;
        }

        try {
            this.showLoading(true);

            // Get canvas image data if available
            const imageData = whiteboard && !whiteboard.isEmpty() ? whiteboard.getCanvasImageData() : null;

            // Get exercise text if available
            const exerciseText = document.getElementById('exercise-input')?.value || '';

            // Prepare context-aware prompt
            let contextPrompt = `Eres un tutor experto y amigable. Un estudiante te hace la siguiente pregunta: "${query}". `;

            if (exerciseText.trim()) {
                contextPrompt += `El contexto del ejercicio es: ${exerciseText}. `;
            }

            contextPrompt += `Proporciona una respuesta útil que guíe al estudiante sin dar la respuesta completa. El idioma de la respuesta debe ser español.`;

            // Prepare API request parts
            const parts = [{ text: contextPrompt }];

            // Add canvas image if available
            if (imageData) {
                parts.push({
                    inline_data: {
                        mime_type: "image/png",
                        data: imageData
                    }
                });
            }

            // Add exercise image if available
            const exerciseImageData = this.getExerciseImageData();
            if (exerciseImageData) {
                parts.push({
                    inline_data: {
                        mime_type: "image/jpeg", // Most pasted images are JPEG
                        data: exerciseImageData
                    }
                });
                contextPrompt += "\n\nNota: También se ha incluido una imagen del ejercicio para tu análisis.";
            }

            const requestBody = {
                contents: [{ parts }],
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
                this.showResponse(aiText, 'query');
                this.addToHistory(query, aiText);

                // Clear input
                if (queryInput) {
                    queryInput.value = '';
                }
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

    clearCanvas() {
        if (whiteboard) {
            whiteboard.clearCanvas();

            // Clear AI response area
            const aiResponse = document.getElementById('ai-response');
            if (aiResponse) {
                aiResponse.innerHTML = '<p class="text-gray-500 italic">Las respuestas de la IA aparecerán aquí...</p>';
            }

            // Clear response history
            this.responseHistory = [];
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
                return 'No se pudo generar una respuesta. Intenta de nuevo.';
        }
    }

    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const aiResponse = document.getElementById('ai-response');
        const askQuestion = document.getElementById('ask-question');
        const sendQuery = document.getElementById('send-query');
        const outputPanel = document.getElementById('output-panel');

        if (show) {
            // Show output panel when loading starts
            if (outputPanel) {
                outputPanel.classList.remove('hidden');
            }
            
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');
            if (aiResponse) aiResponse.classList.add('hidden');
            if (askQuestion) {
                askQuestion.disabled = true;
                askQuestion.classList.add('opacity-50', 'cursor-not-allowed');
            }
            if (sendQuery) {
                sendQuery.disabled = true;
                sendQuery.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
            if (aiResponse) aiResponse.classList.remove('hidden');
            if (askQuestion) {
                askQuestion.disabled = false;
                askQuestion.classList.remove('opacity-50', 'cursor-not-allowed');
            }
            if (sendQuery) {
                sendQuery.disabled = false;
                sendQuery.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    showResponse(text, type = 'response') {
        const aiResponse = document.getElementById('ai-response');
        if (aiResponse) {
            const timestamp = new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const typeLabel = type === 'hint' ? '💡 Pista' : type === 'query' ? '❓ Consulta' : 'Respuesta';

            const responseHtml = `
                <div class="mb-3 p-2 bg-white rounded border-l-4 border-blue-400">
                    <div class="text-xs text-gray-500 mb-1">${typeLabel} - ${timestamp}</div>
                    <div class="text-gray-800">${text}</div>
                </div>
            `;

            // If this is the first response, clear the placeholder
            if (aiResponse.innerHTML.includes('Las respuestas de la IA aparecerán aquí')) {
                aiResponse.innerHTML = responseHtml;
            } else {
                aiResponse.innerHTML += responseHtml;
            }

            // Scroll to bottom
            aiResponse.scrollTop = aiResponse.scrollHeight;
        }
    }

    showError(message) {
        const aiResponse = document.getElementById('ai-response');
        if (aiResponse) {
            const timestamp = new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const errorHtml = `
                <div class="mb-3 p-2 bg-red-50 rounded border-l-4 border-red-400">
                    <div class="text-xs text-red-500 mb-1">❌ Error - ${timestamp}</div>
                    <div class="text-red-700 font-medium">${message}</div>
                </div>
            `;

            // If this is the first response, clear the placeholder
            if (aiResponse.innerHTML.includes('Las respuestas de la IA aparecerán aquí')) {
                aiResponse.innerHTML = errorHtml;
            } else {
                aiResponse.innerHTML += errorHtml;
            }

            // Scroll to bottom
            aiResponse.scrollTop = aiResponse.scrollHeight;
        }
    }

    addToHistory(query, response) {
        this.responseHistory.push({
            timestamp: new Date(),
            query: query,
            response: response
        });

        // Keep only last 10 interactions
        if (this.responseHistory.length > 10) {
            this.responseHistory = this.responseHistory.slice(-10);
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

    // Method to get response history
    getHistory() {
        return this.responseHistory;
    }

    // Setup exercise image paste functionality
    setupExerciseImagePaste() {
        const exerciseContent = document.getElementById('exercise-content');
        const exerciseInput = document.getElementById('exercise-input');
        const imageContainer = document.getElementById('exercise-image-container');
        const exerciseImage = document.getElementById('exercise-image');
        const removeImageBtn = document.getElementById('remove-exercise-image');

        if (!exerciseContent || !exerciseInput) return;

        // Handle paste events on the exercise content area
        exerciseContent.addEventListener('paste', (e) => {
            e.preventDefault();

            const items = e.clipboardData.items;
            let hasImage = false;

            // Check for images first
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    hasImage = true;
                    const file = item.getAsFile();
                    this.handleExerciseImagePaste(file);
                    break;
                }
            }

            // If no image, handle text
            if (!hasImage) {
                const text = e.clipboardData.getData('text/plain');
                if (text) {
                    // Insert text at cursor position in textarea
                    const start = exerciseInput.selectionStart;
                    const end = exerciseInput.selectionEnd;
                    const currentText = exerciseInput.value;

                    exerciseInput.value = currentText.substring(0, start) + text + currentText.substring(end);
                    exerciseInput.selectionStart = exerciseInput.selectionEnd = start + text.length;
                    exerciseInput.focus();
                }
            }
        });

        // Handle remove image button
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                this.removeExerciseImage();
            });
        }

        // Also allow paste directly on textarea
        exerciseInput.addEventListener('paste', (e) => {
            // Let the default paste behavior handle text
            // Image paste will be handled by the parent container
        });
    }

    // Handle pasted image in exercise section
    handleExerciseImagePaste(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showError('Por favor, pega una imagen válida.');
            return;
        }

        // Check file size (limit to 5MB)
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

                // Store image data for API calls
                this.exerciseImageData = e.target.result;

                // Show success message
                this.showExerciseImageSuccess();
            }
        };

        reader.onerror = () => {
            this.showError('Error al cargar la imagen.');
        };

        reader.readAsDataURL(file);
    }

    // Remove exercise image
    removeExerciseImage() {
        const imageContainer = document.getElementById('exercise-image-container');
        const exerciseImage = document.getElementById('exercise-image');

        if (imageContainer && exerciseImage) {
            imageContainer.classList.add('hidden');
            exerciseImage.src = '';
            this.exerciseImageData = null;
        }
    }

    // Show success message for image paste
    showExerciseImageSuccess() {
        // Create temporary success indicator
        const exerciseContent = document.getElementById('exercise-content');
        if (exerciseContent) {
            const successMsg = document.createElement('div');
            successMsg.className = 'text-xs text-green-600 mt-1';
            successMsg.textContent = '✅ Imagen pegada correctamente';

            exerciseContent.appendChild(successMsg);

            // Remove after 3 seconds
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                }
            }, 3000);
        }
    }

    // Get exercise image data for API calls
    getExerciseImageData() {
        if (this.exerciseImageData) {
            // Remove data URL prefix to get just base64
            return this.exerciseImageData.replace(/^data:image\/[a-z]+;base64,/, '');
        }
        return null;
    }

    // Clear exercise content
    clearExercise() {
        const exerciseInput = document.getElementById('exercise-input');
        const imageContainer = document.getElementById('exercise-image-container');
        const exerciseImage = document.getElementById('exercise-image');

        // Clear text
        if (exerciseInput) {
            exerciseInput.value = '';
            exerciseInput.style.height = 'auto';
        }

        // Clear image
        if (imageContainer && exerciseImage) {
            imageContainer.classList.add('hidden');
            exerciseImage.src = '';
            this.exerciseImageData = null;
        }

        // Show confirmation
        this.showExerciseSuccess('🗑️ Ejercicio limpiado');
    }

    // Clear all content (canvas + exercise + responses)
    clearAll() {
        // Confirm action
        if (confirm('¿Estás seguro de que quieres eliminar todo el contenido?')) {
            // Clear canvas
            if (whiteboard) {
                whiteboard.clearCanvas();
            }

            // Clear exercise
            this.clearExercise();

            // Clear AI responses
            const aiResponse = document.getElementById('ai-response');
            if (aiResponse) {
                aiResponse.innerHTML = '<p class="text-gray-500 italic">Las respuestas de la IA aparecerán aquí...</p>';
            }

            // Clear response history
            this.responseHistory = [];

            // Show confirmation
            this.showSuccess('🗑️ Todo el contenido ha sido eliminado');
        }
    }

    // Undo last action
    undoAction() {
        if (whiteboard && whiteboard.undo) {
            whiteboard.undo();
        } else {
            this.showError('No hay acciones para deshacer');
        }
    }

    // Show success message in exercise area
    showExerciseSuccess(message) {
        const exerciseContent = document.getElementById('exercise-content');
        if (exerciseContent) {
            const successMsg = document.createElement('div');
            successMsg.className = 'text-xs text-green-600 mt-1 p-1 bg-green-50 rounded';
            successMsg.textContent = message;

            exerciseContent.appendChild(successMsg);

            // Remove after 2 seconds
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                }
            }, 2000);
        }
    }

    // Show general success message
    showSuccess(message) {
        const aiResponse = document.getElementById('ai-response');
        if (aiResponse) {
            const timestamp = new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const successHtml = `
                <div class="mb-3 p-2 bg-green-50 rounded border-l-4 border-green-400">
                    <div class="text-xs text-green-500 mb-1">✅ Acción - ${timestamp}</div>
                    <div class="text-green-700 font-medium">${message}</div>
                </div>
            `;

            // If this is the first response, clear the placeholder
            if (aiResponse.innerHTML.includes('Las respuestas de la IA aparecerán aquí')) {
                aiResponse.innerHTML = successHtml;
            } else {
                aiResponse.innerHTML += successHtml;
            }

            // Scroll to bottom
            aiResponse.scrollTop = aiResponse.scrollHeight;
        }
    }

    // Toggle eraser mode
    toggleEraserMode() {
        const eraserBtn = document.getElementById('eraser-mode');
        const eraserSize = document.getElementById('eraser-size');
        const eraserSizeControl = document.getElementById('eraser-size-control');

        if (whiteboard && eraserBtn) {
            if (whiteboard.currentTool === 'eraser') {
                // Switch back to pen
                whiteboard.setTool('pen');
                eraserBtn.textContent = '🧽 Activar Borrador';
                eraserBtn.classList.remove('bg-orange-500', 'text-white');
                eraserBtn.classList.add('bg-gray-300', 'text-gray-700');

                // Hide eraser size control
                if (eraserSizeControl) {
                    eraserSizeControl.classList.add('hidden');
                }

                // Reset cursor to normal
                this.updateCanvasCursor('pen', 2);

            } else {
                // Switch to eraser
                whiteboard.setTool('eraser');

                // Show eraser size control
                if (eraserSizeControl) {
                    eraserSizeControl.classList.remove('hidden');
                }

                // Set eraser size
                const eraserSizeValue = eraserSize ? parseInt(eraserSize.value) : 15;
                if (eraserSize) {
                    whiteboard.brushSize = eraserSizeValue;
                    whiteboard.ctx.lineWidth = whiteboard.brushSize;
                }

                eraserBtn.textContent = '✏️ Activar Lápiz';
                eraserBtn.classList.remove('bg-gray-300', 'text-gray-700');
                eraserBtn.classList.add('bg-orange-500', 'text-white');

                // Set custom eraser cursor
                this.updateCanvasCursor('eraser', eraserSizeValue);
            }
        }
    }

    // Update canvas cursor based on tool and size
    updateCanvasCursor(tool, size) {
        const canvas = document.getElementById('whiteboard');
        if (!canvas) return;

        if (tool === 'pen') {
            canvas.style.cursor = 'crosshair';
        } else if (tool === 'eraser') {
            // Create custom circular cursor for eraser
            const cursorSize = Math.max(10, Math.min(size, 50)); // Limit cursor size for visibility
            const cursorSvg = `
                <svg width="${cursorSize}" height="${cursorSize}" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="${cursorSize / 2}" cy="${cursorSize / 2}" r="${(cursorSize - 2) / 2}" 
                            fill="none" stroke="black" stroke-width="2" opacity="0.7"/>
                </svg>
            `;
            const encodedSvg = encodeURIComponent(cursorSvg);
            const cursorUrl = `data:image/svg+xml,${encodedSvg}`;
            canvas.style.cursor = `url("${cursorUrl}") ${cursorSize / 2} ${cursorSize / 2}, auto`;
        }
    }

    // Toggle help menu
    toggleHelpMenu() {
        const helpMenu = document.getElementById('help-menu');
        const helpArrow = document.getElementById('help-arrow');

        if (helpMenu && helpArrow) {
            if (helpMenu.classList.contains('hidden')) {
                helpMenu.classList.remove('hidden');
                helpArrow.style.transform = 'rotate(180deg)';
            } else {
                helpMenu.classList.add('hidden');
                helpArrow.style.transform = 'rotate(0deg)';
            }
        }
    }

    // Close help menu
    closeHelpMenu() {
        const helpMenu = document.getElementById('help-menu');
        const helpArrow = document.getElementById('help-arrow');

        if (helpMenu && helpArrow) {
            helpMenu.classList.add('hidden');
            helpArrow.style.transform = 'rotate(0deg)';
        }
    }

    // Get help based on type (1-6)
    async getHelp(helpType) {
        try {
            console.log(`Getting help for type: ${helpType}`);
            console.log(`API Key configured: ${this.apiKey !== 'YOUR_API_KEY_HERE'}`);
            
            // Close help menu
            this.closeHelpMenu();

            // Show loading indicator
            this.showLoading(true);

            // Get canvas image data if available
            const imageData = whiteboard && !whiteboard.isEmpty() ? whiteboard.getCanvasImageData() : null;

            // Get exercise text if available
            const exerciseText = document.getElementById('exercise-input')?.value || '';

            // Prepare specific prompt based on help type
            let helpPrompt = this.getHelpPrompt(helpType, exerciseText);

            // Prepare API request parts
            const parts = [{ text: helpPrompt }];

            // Add canvas image if available
            if (imageData) {
                parts.push({
                    inline_data: {
                        mime_type: "image/png",
                        data: imageData
                    }
                });
            }

            // Add exercise image if available
            const exerciseImageData = this.getExerciseImageData();
            if (exerciseImageData) {
                parts.push({
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: exerciseImageData
                    }
                });
            }

            const requestBody = {
                contents: [{ parts }],
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
                const helpLabel = this.getHelpLabel(helpType);
                this.showResponse(aiText, `help-${helpType}`, helpLabel);
                this.addToHistory(`${helpLabel}`, aiText);
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

    // Get specific prompt for each help type
    getHelpPrompt(helpType, exerciseText) {
        const baseContext = exerciseText ? `\n\nContexto del ejercicio: ${exerciseText}` : '';

        // Define tutor prompts object
        const tutorPrompts = {
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
RESPONDER CON SI O NO
2. Si es correcta: Felicítalo y explica por qué está bien
3. Si es incorrecta: Proporciona un contraejemplo específico que muestre el error
4. Sé constructivo y mantén su motivación alta
Responde en español con evaluación honesta y constructiva. No des respuesta o solucion`,

            solution: `DAS LA SOLUCION!. El estudiante pide la solución completa. Como tutor experto:
1. Primero, aliéntalo reconociendo su esfuerzo y progreso
2. Presenta la solución completa paso a paso
3. Contrasta: qué hizo bien, qué hizo mal, qué no consideró
4. Termina con: "El patrón clave para resolver este tipo de problemas era..."
Responde en español de manera comprensiva y educativa. Solo en este caso es cuando provees de la solucion en ningun otro caso puedes hacerlo`
        };

        switch (helpType) {
            case 1: // Estoy Atascado
                return tutorPrompts.stuck + baseContext;

            case 2: // Necesito una Pista
                return tutorPrompts.hint + baseContext;

            case 3: // Aclarar el Problema
                return tutorPrompts.clarify + baseContext;

            case 4: // Siguiente Paso
                return tutorPrompts.next_step + baseContext;

            case 5: // Verificar Solución
                return tutorPrompts.verify + baseContext;

            case 6: // Mostrar Solución
                return tutorPrompts.solution + baseContext;

            default:
                return tutorPrompts.initial + baseContext;
        }
    }

    // Get help label for display
    getHelpLabel(helpType) {
        switch (helpType) {
            case 1: return '🔴 Estoy Atascado';
            case 2: return '🟠 Necesito una Pista';
            case 3: return '🟡 Aclarar el Problema';
            case 4: return '🟢 Siguiente Paso';
            case 5: return '🟣 Verificar Solución';
            case 6: return '⚫ Mostrar Solución';
            default: return '🆘 Ayuda';
        }
    }

    // Enhanced showResponse to handle help types
    showResponse(text, type = 'response', customLabel = null) {
        const aiResponse = document.getElementById('ai-response');
        if (aiResponse) {
            const timestamp = new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            let typeLabel = customLabel || 'Respuesta';
            if (type === 'hint') typeLabel = '💡 Pista';
            else if (type === 'query') typeLabel = '❓ Consulta';

            const responseHtml = `
                <div class="mb-3 p-2 bg-white rounded border-l-4 border-blue-400">
                    <div class="text-xs text-gray-500 mb-1">${typeLabel} - ${timestamp}</div>
                    <div class="text-gray-800">${text}</div>
                </div>
            `;

            // If this is the first response, clear the placeholder
            if (aiResponse.innerHTML.includes('Las respuestas de la IA aparecerán aquí')) {
                aiResponse.innerHTML = responseHtml;
            } else {
                aiResponse.innerHTML += responseHtml;
            }

            // Scroll to bottom
            aiResponse.scrollTop = aiResponse.scrollHeight;
        }
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
            const aiResponse = document.getElementById('ai-response');
            if (aiResponse && aiResponse.innerHTML.includes('Las respuestas de la IA aparecerán aquí')) {
                aiResponse.innerHTML = `
                    <div class="text-amber-600 text-xs mb-2 p-2 bg-amber-50 rounded border-l-4 border-amber-400">
                        <strong>⚠️ Configuración requerida:</strong><br>
                        Para usar la funcionalidad de IA, configura tu API key de Google Gemini.
                        <br><br>
                        <code class="text-xs bg-gray-100 px-1 rounded">setGeminiApiKey("tu-api-key-aqui")</code>
                    </div>
                    <div class="text-gray-600 text-xs italic">
                        Escribe o dibuja tu problema en la pizarra y presiona los botones de acción.
                    </div>
                `;
            }
        }, 1000);
    }

    console.log('TutorIA New UI initialized successfully');
});