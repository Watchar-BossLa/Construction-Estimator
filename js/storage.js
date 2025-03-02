/**
 * Storage Engine for Construction Estimator
 * Handles file loading, saving, and project management
 */

/**
 * Initialize the storage engine
 */
function initStorageEngine() {
    // Set up event listeners for file operations
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    const loadButton = document.getElementById('loadButton');
    if (loadButton) {
        loadButton.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }
    
    const projectFileInput = document.getElementById('projectFileInput');
    if (projectFileInput) {
        projectFileInput.addEventListener('change', loadProject);
    }
    
    const saveProjectButton = document.getElementById('saveProjectButton');
    if (saveProjectButton) {
        saveProjectButton.addEventListener('click', saveProject);
    }
    
    const loadProjectButton = document.getElementById('loadProjectButton');
    if (loadProjectButton) {
        loadProjectButton.addEventListener('click', () => {
            if (projectFileInput) projectFileInput.click();
        });
    }
    
    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            window.measurementsEngine.exportToCSV();
        });
    }
}

/**
 * Handle file selection for drawing upload
 * @param {Event} e - The change event from file input
 */
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file || !file.type.match('image.*')) {
        alert('Please select a valid image file.');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Store the image in drawing engine
            window.drawingEngine.backgroundImage = img;
            
            // Get canvas and resize it
            const canvas = document.getElementById('annotationCanvas');
            if (canvas) {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Reset view and draw
                window.drawingEngine.resetView();
                window.drawingEngine.drawCanvas();
                window.drawingEngine.showNotification('Drawing loaded successfully');
            }
        };
        img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
    
    // Reset the file input
    e.target.value = '';
}

/**
 * Save the current project to a JSON file
 */
function saveProject() {
    // Get elements from drawing engine
    const elements = window.drawingEngine.elements;
    const backgroundImage = window.drawingEngine.backgroundImage;
    
    if (elements.length === 0 && !backgroundImage) {
        alert('Nothing to save. Add some elements or load a drawing first.');
        return;
    }
    
    // Get measurements settings
    const pixelToUnitRatio = window.measurementsEngine.pixelToUnitRatio;
    const scaleUnit = window.measurementsEngine.scaleUnit;
    const wallHeight = window.measurementsEngine.wallHeight;
    const wallHeightUnit = window.measurementsEngine.wallHeightUnit;
    
    // Create project data
    const projectData = {
        scale: {
            pixelToUnitRatio,
            scaleUnit
        },
        wallHeight: {
            value: wallHeight,
            unit: wallHeightUnit
        },
        elements: elements,
        // Convert image to data URL if it exists
        backgroundImage: backgroundImage ? backgroundImage.src : null
    };
    
    // Convert to JSON and create download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "construction-project.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    window.drawingEngine.showNotification('Project saved successfully');
}

/**
 * Load a project from a JSON file
 * @param {Event} e - The change event from file input
 */
function loadProject(e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const projectData = JSON.parse(event.target.result);
            
            // Load scale settings
            if (projectData.scale) {
                window.measurementsEngine.pixelToUnitRatio = projectData.scale.pixelToUnitRatio || 1;
                window.measurementsEngine.scaleUnit = projectData.scale.scaleUnit || 'cm';
                
                // Update UI
                const scaleInput = document.getElementById('scaleInput');
                const scaleUnitSelect = document.getElementById('scaleUnit');
                
                if (scaleInput) {
                    scaleInput.value = window.measurementsEngine.pixelToUnitRatio;
                }
                
                if (scaleUnitSelect) {
                    scaleUnitSelect.value = window.measurementsEngine.scaleUnit;
                }
                
                // Update scale info display
                const scaleInfoDisplay = document.getElementById('scaleInfo');
                if (scaleInfoDisplay) {
                    scaleInfoDisplay.textContent = `Scale: 1px = ${window.measurementsEngine.pixelToUnitRatio} ${window.measurementsEngine.scaleUnit}`;
                }
            }
            
            // Load wall height
            if (projectData.wallHeight) {
                window.measurementsEngine.wallHeight = projectData.wallHeight.value || 2.4;
                window.measurementsEngine.wallHeightUnit = projectData.wallHeight.unit || 'm';
                
                // Update UI
                const wallHeightInput = document.getElementById('wallHeightInput');
                const wallHeightUnitSelect = document.getElementById('wallHeightUnit');
                
                if (wallHeightInput) {
                    wallHeightInput.value = window.measurementsEngine.wallHeight;
                }
                
                if (wallHeightUnitSelect) {
                    wallHeightUnitSelect.value = window.measurementsEngine.wallHeightUnit;
                }
            }
            
            // Load elements
            window.drawingEngine.elements = projectData.elements || [];
            
            // Load background image if exists
            if (projectData.backgroundImage) {
                const img = new Image();
                img.onload = function() {
                    window.drawingEngine.backgroundImage = img;
                    
                    // Resize canvas to fit image
                    const canvas = document.getElementById('annotationCanvas');
                    if (canvas) {
                        canvas.width = img.width;
                        canvas.height = img.height;
                    }
                    
                    window.drawingEngine.resetView();
                    window.drawingEngine.drawCanvas();
                    window.measurementsEngine.updateMeasurements();
                    window.measurementsEngine.updateTotals();
                };
                img.src = projectData.backgroundImage;
            } else {
                window.drawingEngine.drawCanvas();
                window.measurementsEngine.updateMeasurements();
                window.measurementsEngine.updateTotals();
            }
            
            window.drawingEngine.showNotification('Project loaded successfully');
        } catch (err) {
            console.error('Error loading project:', err);
            alert('Error loading project. The file may be corrupted.');
        }
    };
    
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = '';
}

/**
 * Export functions for use in other modules
 */
// These will be available to other scripts
window.storageEngine = {
    initStorageEngine,
    handleFileSelect,
    saveProject,
    loadProject
};