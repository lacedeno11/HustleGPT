// Drawing functionality for TutorIA whiteboard

class WhiteboardDrawing {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // Drawing state
        this.currentTool = 'pen'; // 'pen' or 'eraser'
        this.brushSize = 2;
        this.undoStack = [];
        this.maxUndoSteps = 20;
        
        this.setupCanvas();
        this.bindEvents();
        this.setupDrawingTools();
        this.saveState(); // Save initial blank state
    }
    
    setupCanvas() {
        // Set canvas drawing properties
        this.ctx.strokeStyle = '#000000'; // Black stroke
        this.ctx.lineWidth = 2; // 2px width
        this.ctx.lineCap = 'round'; // Round cap
        this.ctx.lineJoin = 'round';
        
        // Fill canvas with white background
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    bindEvents() {
        // Mouse events for drawing
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // Start a new path
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        
        // Draw line from last position to current position
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        // Update last position
        this.lastX = pos.x;
        this.lastY = pos.y;
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            // Save state for undo functionality
            this.saveState();
        }
    }
    
    clearCanvas() {
        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Refill with white background
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset drawing properties (in case they were modified)
        this.setupCanvas();
    }
    
    getCanvasImage() {
        // Convert canvas to Base64 PNG image
        return this.canvas.toDataURL('image/png');
    }
    
    getCanvasImageData() {
        // Get just the Base64 data without the data URL prefix
        const dataURL = this.getCanvasImage();
        return dataURL.replace('data:image/png;base64,', '');
    }
    
    isEmpty() {
        // Check if canvas is empty (only white background)
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Check if all pixels are white (255, 255, 255, 255)
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
                return false; // Found a non-white pixel
            }
        }
        return true;
    }
    
    // Setup drawing tools
    setupDrawingTools() {
        // Pen tool
        const penTool = document.getElementById('pen-tool');
        if (penTool) {
            penTool.addEventListener('click', () => {
                this.setTool('pen');
                this.updateToolButtons();
            });
        }
        
        // Eraser tool
        const eraserTool = document.getElementById('eraser-tool');
        if (eraserTool) {
            eraserTool.addEventListener('click', () => {
                this.setTool('eraser');
                this.updateToolButtons();
            });
        }
        
        // Brush size slider
        const brushSize = document.getElementById('brush-size');
        const brushSizeDisplay = document.getElementById('brush-size-display');
        if (brushSize && brushSizeDisplay) {
            brushSize.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
                this.ctx.lineWidth = this.brushSize;
                brushSizeDisplay.textContent = `${this.brushSize}px`;
            });
        }
    }
    
    // Set drawing tool
    setTool(tool) {
        this.currentTool = tool;
        
        if (tool === 'pen') {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = '#000000';
            this.brushSize = 2; // Always use minimum size for pen
            this.ctx.lineWidth = this.brushSize;
            this.canvas.style.cursor = 'crosshair';
        } else if (tool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            // Brush size will be set by the eraser controls
            this.ctx.lineWidth = this.brushSize;
            this.canvas.style.cursor = 'grab'; // This will be overridden by custom cursor
        }
    }
    
    // Update tool button states
    updateToolButtons() {
        const penTool = document.getElementById('pen-tool');
        const eraserTool = document.getElementById('eraser-tool');
        
        if (penTool && eraserTool) {
            // Remove active class from all tools
            penTool.classList.remove('active', 'bg-blue-500', 'text-white');
            eraserTool.classList.remove('active', 'bg-blue-500', 'text-white');
            
            penTool.classList.add('bg-gray-300', 'text-gray-700');
            eraserTool.classList.add('bg-gray-300', 'text-gray-700');
            
            // Add active class to current tool
            if (this.currentTool === 'pen') {
                penTool.classList.remove('bg-gray-300', 'text-gray-700');
                penTool.classList.add('active', 'bg-blue-500', 'text-white');
            } else if (this.currentTool === 'eraser') {
                eraserTool.classList.remove('bg-gray-300', 'text-gray-700');
                eraserTool.classList.add('active', 'bg-blue-500', 'text-white');
            }
        }
    }
    
    // Save canvas state for undo
    saveState() {
        this.undoStack.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
        
        // Limit undo stack size
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
    }
    
    // Undo last action
    undo() {
        if (this.undoStack.length > 1) {
            // Remove current state
            this.undoStack.pop();
            
            // Restore previous state
            const previousState = this.undoStack[this.undoStack.length - 1];
            this.ctx.putImageData(previousState, 0, 0);
            
            return true;
        }
        return false;
    }
}

// Initialize drawing when DOM is loaded
let whiteboard;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize whiteboard drawing
    whiteboard = new WhiteboardDrawing('whiteboard');
    
    // Bind clear button (support both old and new IDs)
    const clearBtn = document.getElementById('clearBtn') || document.getElementById('clear-canvas');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            whiteboard.clearCanvas();
            
            // Also clear AI response (support both old and new IDs)
            const aiResponse = document.getElementById('aiResponse') || document.getElementById('ai-response');
            if (aiResponse) {
                if (aiResponse.id === 'ai-response') {
                    // New design
                    aiResponse.innerHTML = '<p class="text-gray-500 italic">Las respuestas de la IA aparecerán aquí...</p>';
                } else {
                    // Old design
                    aiResponse.textContent = "Escribe o dibuja tu problema en la pizarra y presiona 'Obtener Pista'.";
                }
            }
        });
    }
    
    console.log('Whiteboard drawing initialized successfully');
});
