class Whiteboard {
    constructor(canvasId, cursorId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
        this.eraserCursor = document.getElementById(cursorId);
        this.isDrawing = false;
        this.mode = 'pen'; // 'pen' or 'eraser'
        this.brushSize = 5;
        this.history = [];

        this.resizeCanvas();
        this.bindEvents();
        this.saveState(); // Guardar el estado inicial en blanco
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => {
            this.isDrawing = false;
            if (this.eraserCursor) this.eraserCursor.style.display = 'none';
        });
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));

        // Eventos para el cursor personalizado del borrador
        this.canvas.addEventListener('mouseenter', () => {
            if (this.mode === 'eraser' && this.eraserCursor) {
                this.eraserCursor.style.display = 'block';
            }
        });
    }

    resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
        this.redrawHistory(); // Redibujar el contenido al cambiar el tamaño
    }

    setMode(newMode) {
        this.mode = newMode;
        if (this.mode === 'pen') {
            this.canvas.style.cursor = 'crosshair';
            if (this.eraserCursor) this.eraserCursor.style.display = 'none';
        } else if (this.mode === 'eraser') {
            this.canvas.style.cursor = 'none'; // Ocultar cursor por defecto
        }
    }

    setBrushSize(size) {
        this.brushSize = size;
        if (this.mode === 'eraser' && this.eraserCursor) {
            this.eraserCursor.style.width = `${size}px`;
            this.eraserCursor.style.height = `${size}px`;
            this.eraserCursor.style.marginLeft = `-${size/2}px`;
            this.eraserCursor.style.marginTop = `-${size/2}px`;
        }
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.context.beginPath();
        this.context.moveTo(e.offsetX, e.offsetY);
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.context.closePath();
            this.saveState(); // Guardar estado después de un trazo
        }
    }

    draw(e) {
        // Mover el cursor personalizado del borrador
        if (this.mode === 'eraser' && this.eraserCursor) {
            this.eraserCursor.style.left = `${e.clientX}px`;
            this.eraserCursor.style.top = `${e.clientY}px`;
        }

        if (!this.isDrawing) return;

        this.context.lineWidth = this.brushSize;
        this.context.lineCap = 'round';
        this.context.strokeStyle = this.mode === 'pen' ? '#000000' : '#FFFFFF'; // Blanco para borrar
        this.context.globalCompositeOperation = this.mode === 'pen' ? 'source-over' : 'destination-out';

        this.context.lineTo(e.offsetX, e.offsetY);
        this.context.stroke();
    }
    
    saveState() {
        if (this.history.length > 20) { // Limitar el historial
            this.history.shift();
        }
        this.history.push(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height));
    }
    
    undo() {
        if (this.history.length > 1) {
            this.history.pop(); // Elimina el estado actual
            const lastState = this.history[this.history.length - 1];
            this.context.putImageData(lastState, 0, 0);
        } else {
             // Si solo queda el estado inicial, limpia el canvas
            this.clearCanvas(false); // false para no guardar un nuevo estado vacío
        }
    }
    
    clearCanvas(save = true) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.history = []; // Limpiar historial
        if (save) {
            this.saveState(); // Guardar el estado en blanco como inicial
        }
    }
    
    redrawHistory() {
        if (this.history.length > 0) {
            this.context.putImageData(this.history[this.history.length - 1], 0, 0);
        }
    }

    getCanvasImageData() {
        return this.canvas.toDataURL('image/png').split(',')[1];
    }
    
    isEmpty() {
        const pixelBuffer = new Uint32Array(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data.buffer);
        return !pixelBuffer.some(color => color !== 0);
    }
}

// Inicialización del pizarrón
let whiteboard;
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure the canvas is properly loaded
    setTimeout(() => {
        whiteboard = new Whiteboard('whiteboard', 'eraser-cursor');
        
        // Create eraser cursor element if it doesn't exist
        if (!document.getElementById('eraser-cursor')) {
            const eraserCursor = document.createElement('div');
            eraserCursor.id = 'eraser-cursor';
            eraserCursor.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                border: 2px solid black;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                display: none;
                transform: translate(-50%, -50%);
            `;
            document.body.appendChild(eraserCursor);
            whiteboard.eraserCursor = eraserCursor;
        }
        
        // Initialize pen tool as active
        const penTool = document.getElementById('pen-tool');
        if (penTool) {
            penTool.classList.add('active');
        }
        
        console.log('Whiteboard initialized successfully');
    }, 100);
});