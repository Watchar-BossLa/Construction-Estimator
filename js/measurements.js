/**
 * Measurements Engine for Construction Estimator
 * Handles all measurement calculations and unit conversions
 */

// Scale settings
let pixelToUnitRatio = 1; // Default: 1 pixel = 1 cm
let scaleUnit = 'cm'; // Default unit
let wallHeight = 2.4; // Default wall height in meters
let wallHeightUnit = 'm'; // Default wall height unit

/**
 * Initialize the measurements engine
 */
function initMeasurementsEngine() {
    // Set up event listeners for scale settings
    const setScaleButton = document.getElementById('setScaleButton');
    if (setScaleButton) {
        setScaleButton.addEventListener('click', setScale);
    }
    
    const scaleUnitSelect = document.getElementById('scaleUnit');
    if (scaleUnitSelect) {
        scaleUnitSelect.addEventListener('change', function() {
            scaleUnit = this.value;
            updateScaleInfo();
        });
    }
    
    const wallHeightInput = document.getElementById('wallHeightInput');
    if (wallHeightInput) {
        wallHeightInput.addEventListener('change', function() {
            wallHeight = parseFloat(this.value) || 2.4;
            updateWallHeight();
        });
    }
    
    const wallHeightUnitSelect = document.getElementById('wallHeightUnit');
    if (wallHeightUnitSelect) {
        wallHeightUnitSelect.addEventListener('change', function() {
            wallHeightUnit = this.value;
            updateWallHeight();
        });
    }
    
    // Initialize the scale info display
    updateScaleInfo();
}

/**
 * Set the scale based on user input
 */
function setScale() {
    const scaleInput = document.getElementById('scaleInput');
    const scaleUnitSelect = document.getElementById('scaleUnit');
    
    if (scaleInput && scaleUnitSelect) {
        const value = parseFloat(scaleInput.value);
        if (value && value > 0) {
            pixelToUnitRatio = value;
            scaleUnit = scaleUnitSelect.value;
            updateScaleInfo();
            
            // Update all measurements
            updateMeasurements();
            updateTotals();
            window.drawingEngine.showNotification('Scale updated successfully');
            
            // Redraw canvas to update measurements
            window.drawingEngine.drawCanvas();
        }
    }
}

/**
 * Update scale info display
 */
function updateScaleInfo() {
    const scaleInfoDisplay = document.getElementById('scaleInfo');
    if (scaleInfoDisplay) {
        scaleInfoDisplay.textContent = `Scale: 1px = ${pixelToUnitRatio} ${scaleUnit}`;
    }
}

/**
 * Update wall height
 */
function updateWallHeight() {
    updateTotals();
}

/**
 * Calculate distance between two points
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} Distance between points
 */
function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Calculate area of a polygon
 * @param {Array} points - Array of polygon points
 * @returns {number} Area of polygon
 */
function calculatePolygonArea(points) {
    let area = 0;
    const n = points.length;
    
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }
    
    return Math.abs(area / 2);
}

/**
 * Calculate centroid of a polygon
 * @param {Array} points - Array of polygon points
 * @returns {Object} Centroid coordinates {x, y}
 */
function calculatePolygonCentroid(points) {
    let centroidX = 0;
    let centroidY = 0;
    const n = points.length;
    let signedArea = 0;
    let x0, y0, x1, y1, a;
    
    for (let i = 0; i < n; i++) {
        x0 = points[i].x;
        y0 = points[i].y;
        x1 = points[(i + 1) % n].x;
        y1 = points[(i + 1) % n].y;
        a = x0 * y1 - x1 * y0;
        signedArea += a;
        centroidX += (x0 + x1) * a;
        centroidY += (y0 + y1) * a;
    }
    
    signedArea *= 0.5;
    centroidX /= (6 * signedArea);
    centroidY /= (6 * signedArea);
    
    return { x: Math.abs(centroidX), y: Math.abs(centroidY) };
}

/**
 * Get area unit string based on current unit
 * @returns {string} Unit string for area
 */
function getAreaUnit() {
    if (scaleUnit === 'm') return 'm²';
    if (scaleUnit === 'cm') return 'cm²';
    if (scaleUnit === 'mm') return 'mm²';
    if (scaleUnit === 'ft') return 'ft²';
    if (scaleUnit === 'inch') return 'in²';
    return scaleUnit + '²';
}

/**
 * Get volume unit string based on current unit
 * @returns {string} Unit string for volume
 */
function getVolumeUnit() {
    if (scaleUnit === 'm') return 'm³';
    if (scaleUnit === 'cm') return 'cm³';
    if (scaleUnit === 'mm') return 'mm³';
    if (scaleUnit === 'ft') return 'ft³';
    if (scaleUnit === 'inch') return 'in³';
    return scaleUnit + '³';
}

/**
 * Add measurement to the list
 * @param {string} type - Measurement type (Wall, Door, etc)
 * @param {string} category - Measurement category (Length, Area, etc)
 * @param {number|string} value - Measurement value
 */
function addMeasurement(type, category, value) {
    const measurementList = document.getElementById('measurementList');
    if (!measurementList) return;
    
    const item = document.createElement('div');
    item.className = 'measurement-item';
    
    // Format value based on type
    let formattedValue;
    if (typeof value === 'number') {
        if (type === 'Area' || type === 'Room') {
            formattedValue = value.toFixed(2) + ' ' + getAreaUnit();
        } else {
            formattedValue = value.toFixed(2) + ' ' + scaleUnit;
        }
    } else {
        formattedValue = value + ' ' + scaleUnit;
    }
    
    item.innerHTML = `<span>${type} ${category}:</span><span>${formattedValue}</span>`;
    measurementList.appendChild(item);
}

/**
 * Update all measurements in the list
 */
function updateMeasurements() {
    const measurementList = document.getElementById('measurementList');
    if (!measurementList) return;
    
    // Clear the list
    measurementList.innerHTML = '';
    
    // Get elements from drawing engine
    const elements = window.drawingEngine.elements;
    
    // Re-add all measurements
    elements.forEach(element => {
        if (element.type === 'wall') {
            addMeasurement('Wall', 'Length', element.length);
        } else if (element.type === 'door') {
            addMeasurement('Door', 'Size', `${element.realWidth.toFixed(2)}×${element.realHeight.toFixed(2)}`);
        } else if (element.type === 'window') {
            addMeasurement('Window', 'Size', `${element.realWidth.toFixed(2)}×${element.realHeight.toFixed(2)}`);
        } else if (element.type === 'measure') {
            addMeasurement('Measurement', 'Distance', element.value);
        } else if (element.type === 'area') {
            addMeasurement('Area', 'Size', element.value);
        } else if (element.type === 'room') {
            addMeasurement('Room', 'Area', element.value);
        }
    });
}

/**
 * Update totals section
 */
function updateTotals() {
    const totalSection = document.getElementById('totalSection');
    if (!totalSection) return;
    
    // Get elements from drawing engine
    const elements = window.drawingEngine.elements;
    
    // Count elements by type
    const walls = elements.filter(e => e.type === 'wall');
    const doors = elements.filter(e => e.type === 'door');
    const windows = elements.filter(e => e.type === 'window');
    const areas = elements.filter(e => e.type === 'area');
    const rooms = elements.filter(e => e.type === 'room');
    
    // Calculate totals
    const totalWallLength = walls.reduce((sum, wall) => sum + wall.length, 0);
    const totalWallArea = calculateWallArea(walls);
    const totalFloorArea = [...areas, ...rooms].reduce((sum, area) => sum + area.value, 0);
    
    // Update totals section
    totalSection.innerHTML = `
        <div>Total Wall Length: ${totalWallLength.toFixed(2)} ${scaleUnit}</div>
        <div>Total Wall Area: ${totalWallArea.toFixed(2)} ${getAreaUnit()}</div>
        <div>Total Floor Area: ${totalFloorArea.toFixed(2)} ${getAreaUnit()}</div>
        <div>Door Count: ${doors.length}</div>
        <div>Window Count: ${windows.length}</div>
    `;
}

/**
 * Calculate total wall area
 * @param {Array} walls - Array of wall elements
 * @returns {number} Total wall area
 */
function calculateWallArea(walls) {
    // Get wall height in current units
    let heightInCurrentUnits = wallHeight;
    
    // Convert from wall height unit to scale unit if needed
    if (wallHeightUnit !== scaleUnit) {
        if (wallHeightUnit === 'm' && scaleUnit === 'cm') {
            heightInCurrentUnits = wallHeight * 100;
        } else if (wallHeightUnit === 'm' && scaleUnit === 'mm') {
            heightInCurrentUnits = wallHeight * 1000;
        } else if (wallHeightUnit === 'cm' && scaleUnit === 'm') {
            heightInCurrentUnits = wallHeight / 100;
        } else if (wallHeightUnit === 'cm' && scaleUnit === 'mm') {
            heightInCurrentUnits = wallHeight * 10;
        } else if (wallHeightUnit === 'mm' && scaleUnit === 'm') {
            heightInCurrentUnits = wallHeight / 1000;
        } else if (wallHeightUnit === 'mm' && scaleUnit === 'cm') {
            heightInCurrentUnits = wallHeight / 10;
        } else if (wallHeightUnit === 'ft' && scaleUnit === 'inch') {
            heightInCurrentUnits = wallHeight * 12;
        } else if (wallHeightUnit === 'inch' && scaleUnit === 'ft') {
            heightInCurrentUnits = wallHeight / 12;
        }
    }
    
    // Calculate total area (length * height)
    return walls.reduce((sum, wall) => sum + (wall.length * heightInCurrentUnits), 0);
}

/**
 * Calculate and display costs
 */
function calculateCosts() {
    // Get cost inputs
    const wallCost = parseFloat(document.getElementById('wallCost').value) || 0;
    const floorCost = parseFloat(document.getElementById('floorCost').value) || 0;
    const doorCost = parseFloat(document.getElementById('doorCost').value) || 0;
    const windowCost = parseFloat(document.getElementById('windowCost').value) || 0;
    
    // Get elements from drawing engine
    const elements = window.drawingEngine.elements;
    
    // Get quantities
    const walls = elements.filter(e => e.type === 'wall');
    const doors = elements.filter(e => e.type === 'door').length;
    const windows = elements.filter(e => e.type === 'window').length;
    const floorAreas = elements.filter(e => e.type === 'area' || e.type === 'room');
    
    const wallArea = calculateWallArea(walls);
    const floorArea = floorAreas.reduce((sum, area) => sum + area.value, 0);
    
    // Calculate costs
    const wallTotalCost = wallArea * wallCost;
    const floorTotalCost = floorArea * floorCost;
    const doorTotalCost = doors * doorCost;
    const windowTotalCost = windows * windowCost;
    const grandTotal = wallTotalCost + floorTotalCost + doorTotalCost + windowTotalCost;
    
    // Create a cost report
    const report = `
        <h3>Cost Estimate Report</h3>
        
        <div style="margin-bottom: 10px;">
            <strong>Walls:</strong><br>
            ${wallArea.toFixed(2)} ${getAreaUnit()} @ ${wallCost} = ${wallTotalCost.toFixed(2)}
        </div>
        
        <div style="margin-bottom: 10px;">
            <strong>Floor:</strong><br>
            ${floorArea.toFixed(2)} ${getAreaUnit()} @ ${floorCost} = ${floorTotalCost.toFixed(2)}
        </div>
        
        <div style="margin-bottom: 10px;">
            <strong>Doors:</strong><br>
            ${doors} units @ ${doorCost} = ${doorTotalCost.toFixed(2)}
        </div>
        
        <div style="margin-bottom: 10px;">
            <strong>Windows:</strong><br>
            ${windows} units @ ${windowCost} = ${windowTotalCost.toFixed(2)}
        </div>
        
        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd; font-weight: bold;">
            <strong>Grand Total:</strong> ${grandTotal.toFixed(2)}
        </div>
    `;
    
    // Show report in a new window
    const reportWindow = window.open('', 'Cost Report', 'width=500,height=600');
    reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Construction Cost Estimate</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 20px;
                    color: #333;
                }
                h1 {
                    color: #2c3e50;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                h3 {
                    color: #2c3e50;
                    margin-top: 20px;
                }
                .section {
                    margin-bottom: 20px;
                    padding: 15px;
                    background-color: #f9f9f9;
                    border-radius: 5px;
                }
                .total {
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 20px;
                    padding: 10px;
                    background-color: #2c3e50;
                    color: white;
                    border-radius: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                th, td {
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                .print-btn {
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    cursor: pointer;
                    border-radius: 5px;
                }
                .print-btn:hover {
                    background-color: #2980b9;
                }
            </style>
        </head>
        <body>
            <h1>Construction Cost Estimate</h1>
            
            <div class="section">
                <h3>Project Summary</h3>
                <p>Date: ${new Date().toLocaleDateString()}</p>
                <p>Scale: 1${scaleUnit} per pixel</p>
                <p>Wall Height: ${wallHeight} ${wallHeightUnit}</p>
            </div>
            
            <div class="section">
                <h3>Bill of Quantities</h3>
                <table>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                    <tr>
                        <td>Walls</td>
                        <td>${wallArea.toFixed(2)}</td>
                        <td>${getAreaUnit()}</td>
                        <td>${wallCost}</td>
                        <td>${wallTotalCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Floor</td>
                        <td>${floorArea.toFixed(2)}</td>
                        <td>${getAreaUnit()}</td>
                        <td>${floorCost}</td>
                        <td>${floorTotalCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Doors</td>
                        <td>${doors}</td>
                        <td>units</td>
                        <td>${doorCost}</td>
                        <td>${doorTotalCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Windows</td>
                        <td>${windows}</td>
                        <td>units</td>
                        <td>${windowCost}</td>
                        <td>${windowTotalCost.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            
            <div class="total">
                Grand Total: ${grandTotal.toFixed(2)}
            </div>
            
            <p>This is an automated estimate generated by Construction Estimator.</p>
            
            <button class="print-btn" onclick="window.print()">Print Report</button>
        </body>
        </html>
    `);
    reportWindow.document.close();
    
    window.drawingEngine.showNotification('Cost estimate generated');
}

/**
 * Export to CSV format
 */
function exportToCSV() {
    // Get elements from drawing engine
    const elements = window.drawingEngine.elements;
    
    if (elements.length === 0) {
        alert('No elements to export. Add some elements first.');
        return;
    }
    
    // Create CSV header
    let csv = 'Type,Category,Measurement,Value,Unit\n';
    
    // Add walls
    const walls = elements.filter(e => e.type === 'wall');
    walls.forEach((wall, index) => {
        csv += `Wall,${index + 1},Length,${wall.length.toFixed(2)},${scaleUnit}\n`;
    });
    
    // Add doors
    const doors = elements.filter(e => e.type === 'door');
    doors.forEach((door, index) => {
        csv += `Door,${index + 1},Width,${door.realWidth.toFixed(2)},${scaleUnit}\n`;
        csv += `Door,${index + 1},Height,${door.realHeight.toFixed(2)},${scaleUnit}\n`;
    });
    
    // Add windows
    const windows = elements.filter(e => e.type === 'window');
    windows.forEach((window, index) => {
        csv += `Window,${index + 1},Width,${window.realWidth.toFixed(2)},${scaleUnit}\n`;
        csv += `Window,${index + 1},Height,${window.realHeight.toFixed(2)},${scaleUnit}\n`;
    });
    
    // Add areas
    const areas = elements.filter(e => e.type === 'area');
    areas.forEach((area, index) => {
        csv += `Area,${index + 1},Area,${area.value.toFixed(2)},${getAreaUnit()}\n`;
    });
    
    // Add rooms
    const rooms = elements.filter(e => e.type === 'room');
    rooms.forEach((room, index) => {
        csv += `Room,${index + 1},Area,${room.value.toFixed(2)},${getAreaUnit()}\n`;
    });
    
    // Add measurements
    const measurements = elements.filter(e => e.type === 'measure');
    measurements.forEach((measure, index) => {
        csv += `Measurement,${index + 1},Distance,${measure.value.toFixed(2)},${scaleUnit}\n`;
    });
    
    // Add totals
    const totalWallLength = walls.reduce((sum, wall) => sum + wall.length, 0);
    const totalWallArea = calculateWallArea(walls);
    const totalFloorArea = [...areas, ...rooms].reduce((sum, area) => sum + area.value, 0);
    
    csv += `\nSummary,Total,Wall Length,${totalWallLength.toFixed(2)},${scaleUnit}\n`;
    csv += `Summary,Total,Wall Area,${totalWallArea.toFixed(2)},${getAreaUnit()}\n`;
    csv += `Summary,Total,Floor Area,${totalFloorArea.toFixed(2)},${getAreaUnit()}\n`;
    csv += `Summary,Total,Door Count,${doors.length},count\n`;
    csv += `Summary,Total,Window Count,${windows.length},count\n`;
    
    // Get cost inputs for cost calculations
    const wallCost = parseFloat(document.getElementById('wallCost').value) || 0;
    const floorCost = parseFloat(document.getElementById('floorCost').value) || 0;
    const doorCost = parseFloat(document.getElementById('doorCost').value) || 0;
    const windowCost = parseFloat(document.getElementById('windowCost').value) || 0;
    
    // Add cost estimates
    csv += `\nCosts,Walls,Area,${totalWallArea.toFixed(2)},${getAreaUnit()}\n`;
    csv += `Costs,Walls,Unit Cost,${wallCost},per ${getAreaUnit()}\n`;
    csv += `Costs,Walls,Total Cost,${(totalWallArea * wallCost).toFixed(2)},currency\n`;
    
    csv += `Costs,Floor,Area,${totalFloorArea.toFixed(2)},${getAreaUnit()}\n`;
    csv += `Costs,Floor,Unit Cost,${floorCost},per ${getAreaUnit()}\n`;
    csv += `Costs,Floor,Total Cost,${(totalFloorArea * floorCost).toFixed(2)},currency\n`;
    
    csv += `Costs,Doors,Count,${doors.length},count\n`;
    csv += `Costs,Doors,Unit Cost,${doorCost},each\n`;
    csv += `Costs,Doors,Total Cost,${(doors.length * doorCost).toFixed(2)},currency\n`;
    
    csv += `Costs,Windows,Count,${windows.length},count\n`;
    csv += `Costs,Windows,Unit Cost,${windowCost},each\n`;
    csv += `Costs,Windows,Total Cost,${(windows.length * windowCost).toFixed(2)},currency\n`;
    
    const totalCost = (totalWallArea * wallCost) + (totalFloorArea * floorCost) + 
                       (doors.length * doorCost) + (windows.length * windowCost);
    
    csv += `Costs,Total,Grand Total,${totalCost.toFixed(2)},currency\n`;
    
    // Create download link
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "construction-estimates.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    window.drawingEngine.showNotification('Data exported successfully to CSV');
}

/**
 * Export functions for use in other modules
 */
// These will be available to other scripts
window.measurementsEngine = {
    initMeasurementsEngine,
    setScale,
    updateMeasurements,
    updateTotals,
    calculateCosts,
    exportToCSV,
    // Measurement utilities
    calculateDistance,
    calculatePolygonArea,
    calculatePolygonCentroid,
    getAreaUnit,
    getVolumeUnit,
    // Variables
    pixelToUnitRatio,
    scaleUnit,
    wallHeight,
    wallHeightUnit
};