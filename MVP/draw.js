// Drawing functionality for TutorIA whiteboard

class WhiteboardDrawing {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        this.setupCanvas();
        this.bindEvents();
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
        this.isDrawing = false;
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
}

// Initialize drawing when DOM is loaded
let whiteboard;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize whiteboard drawing
    whiteboard = new WhiteboardDrawing('whiteboard');
    
    // Bind clear button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            whiteboard.clearCanvas();
            
            // Also clear AI response
            const aiResponse = document.getElementById('aiResponse');
            if (aiResponse) {
                aiResponse.textContent = "Escribe o dibuja tu problema en la pizarra y presiona 'Obtener Pista'.";
            }
        });
    }
    
    console.log('Whiteboard drawing initialized successfully');
});
