/**
 * Main Application for Construction Estimator
 * Coordinates all components and initializes the application
 */

// Wait for the document to fully load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Construction Estimator application initialized');
    
    // Check if we're on the main app page or landing page
    const canvas = document.getElementById('annotationCanvas');
    if (!canvas) {
        // We're on the landing page, set up navigation
        setupLandingPage();
        return;
    }
    
    // Add status bar
    addStatusBar();
    
    // Initialize all engines
    initializeApplication();
    
    // Set up button event listeners
    setupEventListeners();
});

/**
 * Set up landing page navigation
 */
function setupLandingPage() {
    // Add a button to navigate to the app
    const container = document.querySelector('.content');
    if (container) {
        const appButton = document.createElement('a');
        appButton.href = 'app.html';
        appButton.className = 'app-button';
        appButton.textContent = 'Launch Estimator Tool';
        appButton.style.display = 'inline-block';
        appButton.style.marginTop = '20px';
        appButton.style.padding = '12px 24px';
        appButton.style.backgroundColor = '#3498db';
        appButton.style.color = 'white';
        appButton.style.textDecoration = 'none';
        appButton.style.borderRadius = '5px';
        appButton.style.fontWeight = 'bold';
        appButton.style.transition = 'background-color 0.3s';
        
        appButton.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#2980b9';
        });
        
        appButton.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#3498db';
        });
        
        container.appendChild(appButton);
    }
}

/**
 * Add status bar to the application
 */
function addStatusBar() {
    // Create the status bar if it doesn't exist already
    let statusBar = document.querySelector('.status-bar');
    if (!statusBar) {
        statusBar = document.createElement('div');
        statusBar.className = 'status-bar';
        document.querySelector('.canvas-container').after(statusBar);
    }
    
    // Add status elements
    statusBar.innerHTML = `
        <div id="coordinates">Position: 0, 0</div>
        <div id="scaleInfo">Scale: 1px = 1cm</div>
        <div id="zoomLevel">Zoom: 100%</div>
        <div id="currentTool">Current Tool: None</div>
    `;
}

/**
 * Initialize all application engines
 */
function initializeApplication() {
    // Initialize drawing engine
    if (window.drawingEngine && typeof window.drawingEngine.initDrawingEngine === 'function') {
        window.drawingEngine.initDrawingEngine();
    } else {
        console.error('Drawing engine not available');
    }
    
    // Initialize measurements engine
    if (window.measurementsEngine && typeof window.measurementsEngine.initMeasurementsEngine === 'function') {
        window.measurementsEngine.initMeasurementsEngine();
    } else {
        console.error('Measurements engine not available');
    }
    
    // Initialize storage engine
    if (window.storageEngine && typeof window.storageEngine.initStorageEngine === 'function') {
        window.storageEngine.initStorageEngine();
    } else {
        console.error('Storage engine not available');
    }
}

/**
 * Set up event listeners for all buttons
 */
function setupEventListeners() {
    // Wall Button
    const wallButton = document.getElementById('wallButton');
    if (wallButton) {
        wallButton.addEventListener('click', function() {
            window.drawingEngine.setActiveTool('wall');
        });
    }
    
    // Door Button
    const doorButton = document.getElementById('doorButton');
    if (doorButton) {
        doorButton.addEventListener('click', function() {
            window.drawingEngine.setActiveTool('door');
        });
    }
    
    // Window Button
    const windowButton = document.getElementById('windowButton');
    if (windowButton) {
        windowButton.addEventListener('click', function() {
            window.drawingEngine.setActiveTool('window');
        });
    }
    
    // Room Button
    const roomButton = document.getElementById('roomButton');
    if (roomButton) {
        roomButton.addEventListener('click', function() {
            window.drawingEngine.setActiveTool('room');
        });
    }
    
    // Measure Button
    const measureButton = document.getElementById('measureButton');
    if (measureButton) {
        measureButton.addEventListener('click', function() {
            window.drawingEngine.setActiveTool('measure');
        });
    }
    
    // Area Button
    const areaButton = document.getElementById('areaButton');
    if (areaButton) {
        areaButton.addEventListener('click', function() {
            window.drawingEngine.setActiveTool('area');
        });
    }
    
    // Pan Button
    const panButton = document.getElementById('panButton');
    if (panButton) {
        panButton.addEventListener('click', function() {
            window.drawingEngine.setActiveTool('pan');
        });
    }
    
    // Select Button
    const selectButton = document.getElementById('selectButton');
    if (selectButton) {
        selectButton.addEventListener('click', function() {
            window.drawingEngine.setActiveTool('select');
        });
    }
    
    // Zoom In Button
    const zoomInButton = document.getElementById('zoomInButton');
    if (zoomInButton) {
        zoomInButton.addEventListener('click', function() {
            window.drawingEngine.setZoom(window.drawingEngine.scale * 1.2);
        });
    }
    
    // Zoom Out Button
    const zoomOutButton = document.getElementById('zoomOutButton');
    if (zoomOutButton) {
        zoomOutButton.addEventListener('click', function() {
            window.drawingEngine.setZoom(window.drawingEngine.scale / 1.2);
        });
    }
    
    // Reset View Button
    const resetViewButton = document.getElementById('resetViewButton');
    if (resetViewButton) {
        resetViewButton.addEventListener('click', function() {
            window.drawingEngine.resetView();
        });
    }
    
    // Delete Button
    const deleteButton = document.getElementById('deleteButton');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            window.drawingEngine.deleteSelected();
        });
    }
    
    // Clear Button
    const clearButton = document.getElementById('clearButton');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            window.drawingEngine.clearAll();
        });
    }
    
    // Calculate Costs Button
    const calculateCostsButton = document.getElementById('calculateCostsButton');
    if (calculateCostsButton) {
        calculateCostsButton.addEventListener('click', function() {
            window.measurementsEngine.calculateCosts();
        });
    }
}