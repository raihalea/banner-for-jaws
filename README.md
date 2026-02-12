# StreamYard Material Creator

A static web application for creating streaming materials for StreamYard. Generate QR codes and title overlays that can be uploaded to StreamYard's brand features.

## Features

### QR Code Generator

Create customizable QR codes for StreamYard Brand Logo:

- URL encoding with validation
- Optional title text below QR code
- Canvas size options (200-800px)
- QR code size percentage adjustment
- Color customization (QR code, background, title)
- Real-time preview
- PNG download with transparent areas for StreamYard overlay

### Event Title Overlay

Create transparent PNG overlays for StreamYard:

- Custom event title text
- Background and text color customization
- Font size options (24-48px)
- Padding adjustment
- Resolution options: HD (1280x720), Full HD (1920x1080), QHD (2560x1440)
- Transparent background with title bar only
- Real-time preview

## Usage

1. Open `index.html` in a modern web browser
2. Select the desired tab (QR Code Generator or Event Title Overlay)
3. Configure your settings - preview updates automatically
4. Download the generated PNG image
5. Upload to StreamYard via **Brand** → **Logo** or **Overlay**

## Project Structure

```
banner-for-jaws/
├── index.html      # Main HTML file
├── script.js       # JavaScript logic
├── style.css       # Stylesheet
└── README.md       # Documentation
```

## Technical Details

- **Frontend**: HTML5, CSS3 (CSS Variables, Flexbox), JavaScript (ES6+)
- **Libraries**: QRCode.js (CDN)
- **No build process required** - just open in browser

## Deployment

### GitHub Pages

1. Push repository to GitHub
2. Go to **Settings** → **Pages**
3. Select `main` branch and `/ (root)` folder
4. Site will be available at `https://<username>.github.io/banner-for-jaws/`

### Local Development

Simply open `index.html` in your browser. No server required.
