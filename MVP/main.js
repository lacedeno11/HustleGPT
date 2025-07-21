class TutorIA {
    constructor() {
        // Gemini API configuration
        this.apiKey = 'YOUR_API_KEY_HERE'; // Replace with actual API key
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

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
                    helpBtn.addEventListener('click', () => {
                        this.showOutputPanel();
                        this.getHelp(i);
                    });
                }
            }

            // Output panel controls
            const minimizeOutput = document.getElementById('minimize-output');
            const closeOutput = document.getElementById('close-output');
            const minimizedOutput = document.getElementById('minimized-output');

            if (minimizeOutput) {
                minimizeOutput.addEventListener('click', this.minimizeOutputPanel.bind(this));
            }

            if (closeOutput) {
                closeOutput.addEventListener('click', this.closeOutputPanel.bind(this));
            }

            if (minimizedOutput) {
                minimizedOutput.addEventListener('click', this.showOutputPanel.bind(this));
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

            // Tool buttons for pen and eraser
            const penTool = document.getElementById('pen-tool');
            const eraserTool = document.getElementById('eraser-tool');
            const eraserSizePanel = document.getElementById('eraser-size-panel');
            const eraserSizeSlider = document.getElementById('eraser-size');
            const eraserSizeDisplay = document.getElementById('eraser-size-display');

            if (penTool) {
                penTool.addEventListener('click', () => {
                    if (whiteboard) {
                        whiteboard.setMode('pen');
                        penTool.classList.add('active');
                        penTool.classList.remove('bg-gray-300', 'text-gray-700');
                        penTool.classList.add('bg-blue-500', 'text-white');

                        if (eraserTool) {
                            eraserTool.classList.remove('active');
                            eraserTool.classList.remove('bg-orange-500', 'text-white');
                            eraserTool.classList.add('bg-gray-300', 'text-gray-700');
                        }

                        if (eraserSizePanel) {
                            eraserSizePanel.classList.add('hidden');
                        }
                    }
                });
            }

            if (eraserTool) {
                eraserTool.addEventListener('click', () => {
                    if (whiteboard) {
                        whiteboard.setMode('eraser');
                        eraserTool.classList.add('active');
                        eraserTool.classList.remove('bg-gray-300', 'text-gray-700');
                        eraserTool.classList.add('bg-orange-500', 'text-white');

                        if (penTool) {
                            penTool.classList.remove('active');
                            penTool.classList.remove('bg-blue-500', 'text-white');
                            penTool.classList.add('bg-gray-300', 'text-gray-700');
                        }

                        if (eraserSizePanel) {
                            eraserSizePanel.classList.remove('hidden');
                        }

                        // Set initial eraser size
                        if (eraserSizeSlider) {
                            whiteboard.setBrushSize(eraserSizeSlider.value);
                        }
                    }
                });
            }

            if (eraserSizeSlider && eraserSizeDisplay) {
                eraserSizeSlider.addEventListener('input', (e) => {
                    const newSize = e.target.value;
                    if (whiteboard) {
                        whiteboard.setBrushSize(newSize);
                    }
                    eraserSizeDisplay.textContent = `${newSize}px`;
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

        if (show) {
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

    // Clear canvas method
    clearCanvas() {
        if (whiteboard) {
            whiteboard.clearCanvas();
        }
    }

    // Clear all content (canvas + exercise + responses)
    clearAll() {
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
        if (whiteboard && typeof whiteboard.undo === 'function') {
            whiteboard.undo();
        } else {
            this.showError('No hay acciones para deshacer o el pizarrón no está listo.');
        }
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

    // Output panel management methods
    showOutputPanel() {
        const outputPanel = document.getElementById('output-panel');
        const minimizedOutput = document.getElementById('minimized-output');

        if (outputPanel) {
            outputPanel.classList.remove('hidden');
        }
        if (minimizedOutput) {
            minimizedOutput.classList.add('hidden');
        }
    }

    minimizeOutputPanel() {
        const outputPanel = document.getElementById('output-panel');
        const minimizedOutput = document.getElementById('minimized-output');

        if (outputPanel) {
            outputPanel.classList.add('hidden');
        }
        if (minimizedOutput) {
            minimizedOutput.classList.remove('hidden');
        }
    }

    closeOutputPanel() {
        const outputPanel = document.getElementById('output-panel');
        const minimizedOutput = document.getElementById('minimized-output');

        if (outputPanel) {
            outputPanel.classList.add('hidden');
        }
        if (minimizedOutput) {
            minimizedOutput.classList.add('hidden');
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

        switch (helpType) {
            case 1: // Estoy Atascado
                return `Eres un tutor experto y amigable. Un estudiante dice "Estoy atascado" con este problema. Tu objetivo es ayudarle a entender mejor el problema y considerar más casos. NO des la respuesta final. En su lugar, ayúdale a analizar el problema desde diferentes ángulos, identifica qué aspectos podrían estar confundiéndole, y sugiere formas de abordar el problema paso a paso. Haz preguntas que le ayuden a pensar más profundamente sobre la lógica del problema. El idioma de la respuesta debe ser español.${baseContext}`;

            case 2: // Necesito una Pista
                return `Eres un tutor experto y amigable. Un estudiante dice "Necesito una pista" para este problema. Tu objetivo es dar una pista específica que le ayude a avanzar hacia la solución, pero que NO sea algo que ya haya descubierto o que sea demasiado obvio. Analiza lo que ya ha hecho y proporciona el siguiente paso lógico sin dar la respuesta completa. La pista debe ser útil pero no revelar demasiado. El idioma de la respuesta debe ser español.${baseContext}`;

            case 3: // Aclarar el Problema
                return `Eres un tutor experto y amigable. Un estudiante dice "Aclarar el problema" porque necesita más información. Tu objetivo es proporcionar más ejemplos de salida e información sobre el problema (NO sobre la solución). Explica mejor qué se está pidiendo, da ejemplos adicionales de casos de entrada y salida, y clarifica cualquier aspecto confuso del enunciado. Enfócate en el problema en sí, no en cómo resolverlo. El idioma de la respuesta debe ser español.${baseContext}`;

            case 4: // Siguiente Paso
                return `Eres un tutor experto y amigable. Un estudiante pide "Siguiente paso" para este problema. Tu objetivo es sugerir cuál debería ser su próximo paso, pero sin hacer obvio el problema matemático o la solución en sí. Analiza lo que ya ha hecho y sugiere la siguiente acción o consideración que debería tomar, pero de manera que le haga pensar y no le dé la respuesta directamente. El idioma de la respuesta debe ser español.${baseContext}`;

            case 5: // Verificar Solución
                return `Eres un tutor experto y amigable. Un estudiante cree que ya tiene la solución del problema y quiere verificación. Tu objetivo es revisar si su solución es correcta. Si es correcta, felicítale y explica por qué está bien. Si NO es correcta, proporciona un contraejemplo específico que demuestre por qué no funciona, pero hazlo de manera constructiva. Ayúdale a entender dónde está el error sin desanimarlo. El idioma de la respuesta debe ser español.${baseContext}`;

            case 6: // Mostrar Solución
                return `Eres un tutor experto y amigable. Un estudiante dice "Quiero la solución" para este problema. Primero, anímale y recuérdale que está haciendo progreso al intentar resolverlo. Luego proporciona la solución completa, pero de manera educativa: contrasta lo que hizo bien, lo que hizo mal, y lo que no consideró o no pudo descifrar. Termina explicando cuál era el patrón clave para resolver este tipo de problema. Sé alentador pero educativo. El idioma de la respuesta debe ser español.${baseContext}`;

            default:
                return `Eres un tutor experto y amigable. Ayuda al estudiante con este problema de manera Socrática. El idioma de la respuesta debe ser español.${baseContext}`;
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
const aiResponse = document.getElementById('ai-response');
if (aiResponse) {
    const timestamp = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const typeLabel = customLabel || (type === 'hint' ? '💡 Pista' : type === 'query' ? '❓ Consulta' : 'Respuesta');

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
    


// Initialize TutorIA application
let tutorIA;
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure whiteboard from draw.js is initialized
    setTimeout(() => {
        tutorIA = new TutorIA();
        window.tutorIA = tutorIA;

        // Check API Key configuration
        if (!tutorIA.isConfigured()) {
            console.warn('⚠️ API Key no configurada. Usa setGeminiApiKey("tu-api-key") para configurarla.');

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

        console.log('TutorIA inicializado correctamente');
    }, 150); // Slightly longer delay to ensure whiteboard is ready
});

// Function to set Gemini API key
function setGeminiApiKey(key) {
    if (tutorIA) {
        tutorIA.setApiKey(key);
        console.log('API key actualizada correctamente');

        // Clear the warning message
        const aiResponse = document.getElementById('ai-response');
        if (aiResponse && aiResponse.innerHTML.includes('Configuración requerida')) {
            aiResponse.innerHTML = '<p class="text-gray-500 italic">Las respuestas de la IA aparecerán aquí...</p>';
        }
    } else {
        console.error('TutorIA no está inicializado.');
    }
}