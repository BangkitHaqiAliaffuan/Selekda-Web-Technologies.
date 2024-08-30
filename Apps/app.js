// script.js

window.onload = function() {
    // Handle Welcome Screen
    setTimeout(() => {
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }, 1000);

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let brushSize = 10;
    let brushOpacity = 100;
    let brushShape = 'round';
    let textFont = 'Arial';
    let textSize = '16px';
    let textStyle = '';
    let drawing = false;
    let zoomLevel = 1;
    let currentTool = 'brush';

    // Stack for undo/redo
    let undoStack = [];
    let redoStack = [];

    function saveState() {
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (undoStack.length > 20) {
            undoStack.shift(); // Limit stack size
        }
    }

    // Brush Tool Event
    document.getElementById('brush-tool').addEventListener('click', () => selectTool('brush'));
    document.getElementById('eraser-tool').addEventListener('click', () => selectTool('eraser'));
    document.getElementById('move-tool').addEventListener('click', () => selectTool('move'));
    document.getElementById('shape-tool').addEventListener('click', () => selectTool('shape'));
    document.getElementById('color-picker-tool').addEventListener('click', () => selectTool('color-picker'));
    document.getElementById('paint-bucket-tool').addEventListener('click', () => selectTool('paint-bucket'));
    document.getElementById('text-tool').addEventListener('click', () => selectTool('text'));
    document.getElementById('clone-stamp-tool').addEventListener('click', () => selectTool('clone-stamp'));

    // Brush Properties
    document.getElementById('brush-size').addEventListener('input', (e) => {
        brushSize = e.target.value;
    });
    document.getElementById('brush-opacity').addEventListener('input', (e) => {
        brushOpacity = e.target.value / 100;
    });
    document.getElementById('brush-shape').addEventListener('change', (e) => {
        brushShape = e.target.value;
    });

    // Eraser Properties
    document.getElementById('eraser-size').addEventListener('input', (e) => {
        brushSize = e.target.value; // Eraser size is the same as brush size
    });
    document.getElementById('eraser-opacity').addEventListener('input', (e) => {
        brushOpacity = e.target.value / 100;
    });

    // Text Properties
    document.getElementById('text-font').addEventListener('change', (e) => {
        textFont = e.target.value;
    });
    document.getElementById('text-size').addEventListener('input', (e) => {
        textSize = e.target.value + 'px';
    });
    document.getElementById('text-style').addEventListener('change', (e) => {
        textStyle = e.target.value;
    });

    function selectTool(tool) {
        currentTool = tool;
        // Show or hide tool properties based on the selected tool
        document.querySelectorAll('.tool-properties').forEach(el => el.classList.add('hidden'));
        document.getElementById(`${tool}-properties`).classList.remove('hidden');
    }

    // Drawing on Canvas
    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        ctx.beginPath();
    });

    canvas.addEventListener('mouseup', (e) => {
        drawing = false;
        ctx.beginPath();
        saveState(); // Save state after drawing
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!drawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = brushSize;
        ctx.lineCap = brushShape;

        if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out'; // Erase with transparency
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // White color for eraser
        } else {
            ctx.globalCompositeOperation = 'source-over'; // Normal painting
            ctx.strokeStyle = `rgba(0, 0, 0, ${brushOpacity})`;
        }
        
        ctx.globalAlpha = brushOpacity;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    });

    // Undo / Redo
    document.getElementById('undo').addEventListener('click', () => {
        if (undoStack.length > 0) {
            redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            const previousState = undoStack.pop();
            ctx.putImageData(previousState, 0, 0);
        }
    });

    document.getElementById('redo').addEventListener('click', () => {
        if (redoStack.length > 0) {
            undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            const nextState = redoStack.pop();
            ctx.putImageData(nextState, 0, 0);
        }
    });

    // Zoom In/Out
    document.getElementById('zoom-in').addEventListener('click', () => {
        zoomLevel += 0.1;
        canvas.style.transform = `scale(${zoomLevel})`;
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        zoomLevel = Math.max(0.1, zoomLevel - 0.1);
        canvas.style.transform = `scale(${zoomLevel})`;
    });

    // Export File
    document.getElementById('export').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg');
        link.download = 'image.jpg';
        link.click();
    });

    // Import File
    document.getElementById('import').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    ctx.drawImage(img, 0, 0);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
        input.click();
    });
};