# StreamYard Material Creator

A static web application for creating YouTube streaming materials for use with StreamYard. This tool helps streamers generate QR codes and title overlays that can be uploaded to StreamYard's Brand features.

## 🚀 Live Demo

Visit the GitHub Pages deployment: `https://<your-username>.github.io/banner-for-jaws/`

## ✨ Features

### 📱 QR Code Generator

Create QR codes with customizable options for StreamYard Brand Logo:

- **URL Input**: Enter any valid URL to encode into a QR code
- **Title Text**: Add a descriptive title displayed below the QR code
- **Size Options**: Choose from Small (200x200), Medium (300x300), or Large (400x400)
- **Color Customization**: Set custom QR code color and background color
- **Download**: Save the generated image as PNG for uploading to StreamYard

**Use Case**: Perfect for sharing links to your social media, donation pages, or event registration during live streams.

### 🎯 Event Title Overlay

Create transparent PNG overlays for StreamYard's Overlay feature:

- **Event Title**: Enter your event or stream title
- **Color Customization**: Choose background color and text color
- **Font Size**: Select from Small, Medium, Large, or Extra Large
- **Padding Control**: Adjust the padding around the title
- **Resolution Options**: HD (1280x720), Full HD (1920x1080), or QHD (2560x1440)
- **Transparent Background**: The generated image has transparency everywhere except the title bar

**Use Case**: Display your event title at the top of your stream using StreamYard's overlay feature.

## 📖 How to Use

### QR Code Generator

1. Navigate to the **QR Code Generator** tab
2. Enter the URL you want to encode (e.g., `https://twitter.com/yourusername`)
3. Optionally add a title text (e.g., "Follow me!")
4. Customize the size and colors as desired
5. Click **Generate QR Code**
6. Preview the result and click **Download QR Code Image**
7. In StreamYard, go to **Brand** → **Logo** and upload the downloaded image

### Event Title Overlay

1. Navigate to the **Event Title Overlay** tab
2. Enter your event title (e.g., "AWS User Group Meetup #42")
3. Choose your preferred background and text colors
4. Adjust font size and padding to your liking
5. Select the resolution matching your stream output
6. Click **Generate Overlay**
7. Preview the result (checkered pattern indicates transparency)
8. Click **Download Overlay Image (PNG)**
9. In StreamYard, go to **Brand** → **Overlays** and upload the downloaded image

## 🛠️ Technical Details

### Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled

### Technologies Used

- **HTML5**: Structure and semantics
- **CSS3**: Styling with CSS Variables and Flexbox
- **JavaScript (ES6+)**: Client-side logic
- **Canvas API**: Image generation and manipulation
- **QRCode.js**: QR code generation library (via CDN)

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📦 Deployment

### GitHub Pages

1. Push this repository to GitHub
2. Go to repository **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Choose `main` branch and `/ (root)` folder
5. Click **Save**
6. Your site will be available at `https://<username>.github.io/<repository-name>/`

### Local Development

Simply open `index.html` in a web browser. No build process or server required!

```bash
# Clone the repository
git clone https://github.com/yourusername/banner-for-jaws.git

# Open in browser
open index.html
# or
xdg-open index.html  # Linux
start index.html     # Windows
```

## 📁 Project Structure

```
banner-for-jaws/
├── index.html      # Main HTML file
├── style.css       # Stylesheet
├── script.js       # JavaScript logic
└── README.md       # This file
```

## 🎨 StreamYard Integration Tips

### QR Code as Brand Logo

1. Generate a QR code with appropriate size (300x300 recommended)
2. Choose colors that contrast well with your stream background
3. In StreamYard Studio, click the **Brand** icon (paintbrush)
4. Navigate to **Logo** section
5. Upload your QR code image
6. Position it in a corner that doesn't overlap with other content

### Title Overlay

1. Generate an overlay matching your stream resolution
2. The transparent background ensures only the title bar is visible
3. In StreamYard Studio, click the **Brand** icon
4. Navigate to **Overlays** section
5. Upload your overlay image
6. Toggle it on/off during your stream as needed

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.
