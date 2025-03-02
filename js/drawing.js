/**
 * Drawing Engine for Construction Estimator
 * Handles the canvas drawing, element creation, and visualization
 */

// Will be initialized when DOM is ready
let canvas;
let ctx;
let elements = [];
let roomPoints = [];
let backgroundImage = null;
let selectedElementIndex = -1;

// State variables
let currentTool = null;
let isDrawing = false;
let startX = 0;
let startY = 0;

// Pan and zoom variables
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Colors for different elements
const colors = {
    wall: '#e74c3c',
    door: '#3498db',
    window: '#2ecc71',
    measure: '#f39c12',
    area: '#9b59b6',
    room: 'rgba(46, 204, 113, 0.3)',
    selected: '#ff00ff'
};

/**
 * Initialize the drawing engine
 */
function initDrawingEngine() {
    canvas = document.getElementById('annotationCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('dblclick', handleDoubleClick);
    
    // Initialize the canvas
    drawCanvas();
}

/**
 * Set the active drawing tool
 * @param {string} tool - The tool to activate
 */
function setActiveTool(tool) {
    currentTool = tool;
    updateCurrentTool(tool.charAt(0).toUpperCase() + tool.slice(1));
    
    // Update active button state
    document.querySelectorAll('.tool-btn').forEach(button => {
        if (button.dataset.tool === tool) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Set appropriate cursor
    if (tool === 'pan') {
        canvas.style.cursor = 'grab';
    } else if (tool === 'select') {
        canvas.style.cursor = 'pointer';
    } else {
        canvas.style.cursor = 'crosshair';
    }
    
    // Reset room points if not using room tool
    if (tool !== 'room') {
        completeRoom();
    }
    
    // Reset selection when changing tools
    if (tool !== 'select') {
        selectedElementIndex = -1;
        drawCanvas();
    }
}

/**
 * Handle mouse down event on canvas
 * @param {MouseEvent} e - The mouse event
 */
function handleMouseDown(e) {
    if (!currentTool) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale - offsetX;
    const mouseY = (e.clientY - rect.top) / scale - offsetY;
    
    if (currentTool === 'pan') {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        canvas.style.cursor = 'grabbing';
    } else if (currentTool === 'select') {
        // Check if clicked on an element
        for (let i = elements.length - 1; i >= 0; i--) {
            if (isPointInElement(mouseX, mouseY, elements[i])) {
                selectedElementIndex = i;
                drawCanvas();
                return;
            }
        }
        selectedElementIndex = -1;
        drawCanvas();
    } else if (currentTool === 'room') {
        // Add point to room polygon
        roomPoints.push({x: mouseX, y: mouseY});
        drawCanvas();
    } else {
        // Start drawing
        isDrawing = true;
        startX = mouseX;
        startY = mouseY;
    }
    
    // Update coordinates display
    const coordDisplay = document.getElementById('coordinates');
    if (coordDisplay) {
        coordDisplay.textContent = `Position: ${Math.round(mouseX)}, ${Math.round(mouseY)}`;
    }
}

/**
 * Handle mouse move event on canvas
 * @param {MouseEvent} e - The mouse event
 */
function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale - offsetX;
    const mouseY = (e.clientY - rect.top) / scale - offsetY;
    
    // Update coordinates display if it exists
    const coordDisplay = document.getElementById('coordinates');
    if (coordDisplay) {
        coordDisplay.textContent = `Position: ${Math.round(mouseX)}, ${Math.round(mouseY)}`;
    }
    
    if (isDragging && currentTool === 'pan') {
        // Pan the view
        offsetX += (e.clientX - lastMouseX) / scale;
        offsetY += (e.clientY - lastMouseY) / scale;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        drawCanvas();
    } else if (isDrawing && currentTool !== 'room') {
        // Preview current drawing
        drawCanvas();
        
        // Draw preview on top
        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(offsetX, offsetY);
        
        ctx.beginPath();
        ctx.strokeStyle = colors[currentTool];
        ctx.lineWidth = 2;
        
        if (currentTool === 'wall') {
            drawWallPreview(startX, startY, mouseX, mouseY);
        } else if (currentTool === 'door') {
            drawDoorPreview(startX, startY, mouseX, mouseY);
        } else if (currentTool === 'window') {
            drawWindowPreview(startX, startY, mouseX, mouseY);
        } else if (currentTool === 'measure') {
            drawMeasurePreview(startX, startY, mouseX, mouseY);
        } else if (currentTool === 'area') {
            drawAreaPreview(startX, startY, mouseX, mouseY);
        }
        
        ctx.restore();
    } else if (currentTool === 'room' && roomPoints.length > 0) {
        // Preview the room polygon with line to current mouse position
        drawCanvas();
        
        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(offsetX, offsetY);
        
        drawRoomPreview(mouseX, mouseY);
        
        ctx.restore();
    }
}

/**
 * Handle mouse up event on canvas
 * @param {MouseEvent} e - The mouse event
 */
function handleMouseUp(e) {
    if (isDragging && currentTool === 'pan') {
        isDragging = false;
        canvas.style.cursor = 'grab';
        return;
    }
    
    if (!isDrawing || currentTool === 'room') return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale - offsetX;
    const mouseY = (e.clientY - rect.top) / scale - offsetY;
    
    // Calculate width and height
    const width = mouseX - startX;
    const height = mouseY - startY;
    
    // Only add if there's a significant drag (to avoid accidental clicks)
    if (Math.abs(width) > 3 || Math.abs(height) > 3) {
        if (currentTool === 'wall') {
            addWall(startX, startY, mouseX, mouseY);
        } else if (currentTool === 'door') {
            addDoor(startX, startY, width, height);
        } else if (currentTool === 'window') {
            addWindow(startX, startY, width, height);
        } else if (currentTool === 'measure') {
            addMeasurement(startX, startY, mouseX, mouseY);
        } else if (currentTool === 'area') {
            addArea(startX, startY, width, height);
        }
        
        if (typeof window.measurementsEngine !== 'undefined' && 
            typeof window.measurementsEngine.updateTotals === 'function') {
            window.measurementsEngine.updateTotals();
        }
    }
    
    isDrawing = false;
    drawCanvas();
}

/**
 * Handle double click for room completion
 * @param {MouseEvent} e - The mouse event
 */
function handleDoubleClick(e) {
    if (currentTool === 'room' && roomPoints.length > 2) {
        completeRoom();
    }
}

/**
 * Handle mouse wheel for zoom
 * @param {WheelEvent} e - The wheel event
 */
function handleWheel(e) {
    e.preventDefault();
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom
    const zoomIntensity = 0.1;
    const zoomFactor = e.deltaY > 0 ? (1 - zoomIntensity) : (1 + zoomIntensity);
    
    // Calculate new scale
    const newScale = scale * zoomFactor;
    
    // Limit zoom level
    if (newScale >= 0.1 && newScale <= 5) {
        // Calculate new offset to zoom around mouse position
        offsetX = (offsetX * scale + mouseX) / newScale - mouseX / scale;
        offsetY = (offsetY * scale + mouseY) / newScale - mouseY / scale;
        
        scale = newScale;
        
        // Update zoom display if it exists
        const zoomDisplay = document.getElementById('zoomLevel');
        if (zoomDisplay) {
            zoomDisplay.textContent = `Zoom: ${Math.round(scale * 100)}%`;
        }
        
        drawCanvas();
    }
}

/**
 * Set zoom level
 * @param {number} newScale - The new scale factor
 */
function setZoom(newScale) {
    if (newScale >= 0.1 && newScale <= 5) {
        scale = newScale;
        
        // Update zoom display if it exists
        const zoomDisplay = document.getElementById('zoomLevel');
        if (zoomDisplay) {
            zoomDisplay.textContent = `Zoom: ${Math.round(scale * 100)}%`;
        }
        
        drawCanvas();
    }
}

/**
 * Reset view to original position and scale
 */
function resetView() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    
    // Update zoom display if it exists
    const zoomDisplay = document.getElementById('zoomLevel');
    if (zoomDisplay) {
        zoomDisplay.textContent = `Zoom: 100%`;
    }
    
    drawCanvas();
}

/**
 * Draw preview functions for different tools
 */
function drawWallPreview(x1, y1, x2, y2) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Show length while drawing
    const length = calculateDistance(x1, y1, x2, y2) * (window.measurementsEngine ? window.measurementsEngine.pixelToUnitRatio : 1);
    const unit = window.measurementsEngine ? window.measurementsEngine.scaleUnit : 'px';
    
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // Background for text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(midX - 40, midY - 10, 80, 20);
    
    // Text
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(length.toFixed(2) + ' ' + unit, midX, midY + 5);
}

function drawDoorPreview(x1, y1, x2, y2) {
    const width = x2 - x1;
    const height = y2 - y1;
    
    // Draw door rectangle
    ctx.rect(x1, y1, width, height);
    
    // Draw door swing arc
    if (Math.abs(width) > Math.abs(height)) {
        // Horizontal door
        const arcStartX = width > 0 ? x1 : x1 + width;
        const arcStartY = height > 0 ? y1 : y1 + height;
        ctx.moveTo(arcStartX, arcStartY);
        ctx.arc(arcStartX, arcStartY, Math.abs(width), 0, Math.PI/2, width * height < 0);
    } else {
        // Vertical door
        const arcStartX = width > 0 ? x1 : x1 + width;
        const arcStartY = height > 0 ? y1 : y1 + height;
        ctx.moveTo(arcStartX, arcStartY);
        ctx.arc(arcStartX, arcStartY, Math.abs(height), 0, Math.PI/2, width * height > 0);
    }
    ctx.stroke();
    
    // Show dimensions
    const pixelToUnitRatio = window.measurementsEngine ? window.measurementsEngine.pixelToUnitRatio : 1;
    const unit = window.measurementsEngine ? window.measurementsEngine.scaleUnit : 'px';
    
    const doorWidth = Math.abs(width) * pixelToUnitRatio;
    const doorHeight = Math.abs(height) * pixelToUnitRatio;
    
    // Background for text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(x1 + width/2 - 50, y1 + height/2 - 10, 100, 20);
    
    // Text
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(`${doorWidth.toFixed(2)}×${doorHeight.toFixed(2)} ${unit}`, x1 + width/2, y1 + height/2 + 5);
}

function drawWindowPreview(x1, y1, x2, y2) {
    const width = x2 - x1;
    const height = y2 - y1;
    
    // Draw window rectangle
    ctx.rect(x1, y1, width, height);
    
    // Draw window panes (cross)
    ctx.moveTo(x1, y1 + height/2);
    ctx.lineTo(x1 + width, y1 + height/2);
    ctx.moveTo(x1 + width/2, y1);
    ctx.lineTo(x1 + width/2, y1 + height);
    ctx.stroke();
    
    // Show dimensions
    const pixelToUnitRatio = window.measurementsEngine ? window.measurementsEngine.pixelToUnitRatio : 1;
    const unit = window.measurementsEngine ? window.measurementsEngine.scaleUnit : 'px';
    
    const windowWidth = Math.abs(width) * pixelToUnitRatio;
    const windowHeight = Math.abs(height) * pixelToUnitRatio;
    
    // Background for text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(x1 + width/2 - 50, y1 + height/2 - 10, 100, 20);
    
    // Text
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(`${windowWidth.toFixed(2)}×${windowHeight.toFixed(2)} ${unit}`, x1 + width/2, y1 + height/2 + 5);
}

function drawMeasurePreview(x1, y1, x2, y2) {
    // Draw measurement line
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    
    // Draw arrow heads
    drawArrowhead(ctx, x1, y1, x2, y2);
    drawArrowhead(ctx, x2, y2, x1, y1);
    ctx.stroke();
    
    // Show distance while measuring
    const pixelToUnitRatio = window.measurementsEngine ? window.measurementsEngine.pixelToUnitRatio : 1;
    const unit = window.measurementsEngine ? window.measurementsEngine.scaleUnit : 'px';
    
    const distance = calculateDistance(x1, y1, x2, y2) * pixelToUnitRatio;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // Background for text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.