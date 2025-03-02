# Construction Estimator

An AI-powered construction estimation platform for generating quantity takeoffs and cost estimates from blueprints and floor plans.

## Project Overview

Construction Estimator is a web-based application that allows construction professionals to upload drawings, mark elements (walls, doors, windows, rooms), and automatically generate quantity measurements and cost estimates. The application works entirely in the browser with no server-side dependencies.

### Key Features

- **Drawing Upload**: Import any blueprint or floor plan image
- **Annotation Tools**: Mark walls, doors, windows, rooms, and take measurements
- **Automatic Calculations**: Get accurate measurements with unit conversion
- **Cost Estimation**: Generate detailed cost breakdowns based on material unit prices
- **Project Management**: Save and load projects to continue work later
- **Data Export**: Export measurements and estimates to CSV format

## Project Structure

```
construction-estimator/
├── index.html                # Landing page with features and introduction
├── app.html                  # Main application page with drawing tools
├── css/
│   ├── main.css              # Shared styles for landing page and app
│   └── app.css               # Application-specific styles
├── js/
│   ├── app.js                # Main application initialization
│   ├── drawing.js            # Drawing and annotation engine
│   ├── measurements.js       # Measurement calculations and unit conversion
│   └── storage.js            # File loading, saving, and project management
└── assets/                   # Future folder for images and icons
```

## How to Use

### For End Users

1. Visit the website or open the application locally
2. Click "Launch App" or navigate to app.html
3. Click "Load Drawing" to upload a blueprint or floor plan
4. Set the scale using a known measurement in the drawing
5. Use the drawing tools to mark walls, doors, windows, and rooms
6. Review measurements in the sidebar
7. Enter material costs and click "Calculate Costs" to generate estimates
8. Save your project or export data as needed

### For Developers

#### Local Development

1. Clone the repository
2. Open the project in your preferred code editor
3. Use a local development server to serve the files (e.g., Live Server extension in VS Code)
4. Make changes to the code as needed
5. Test changes in your browser

#### Deployment

1. Push your changes to your GitHub repository
2. Set up Netlify to deploy from your repository
3. Configure the domain settings if using a custom domain

## Technical Details

### Libraries Used

- Pure JavaScript, HTML, and CSS - no external dependencies required
- Uses the HTML5 Canvas API for drawing and annotation
- Leverages modern browser features like FileReader API, Blob, and localStorage

### Browser Compatibility

- Chrome: Latest version
- Firefox: Latest version
- Safari: Latest version
- Edge: Latest version

### Future Development

We're planning to enhance the platform with:

1. **AI-Powered Element Detection**: Automatically identify walls, doors, windows from drawings
2. **Cloud Storage**: Save projects to the cloud and access from anywhere
3. **Multi-User Collaboration**: Work together with colleagues on the same project
4. **Material Database Integration**: Connect to real-time material pricing data

## License

This project is privately owned and not currently open for external contributions.

## Contact

For questions or support, please contact the project owner.

---

© 2023 Construction Estimator - All Rights Reserved