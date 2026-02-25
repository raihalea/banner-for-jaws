import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm'
import QRCodeStyling from 'https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/+esm'

// Application Module Pattern
const App = (() => {
    // Private: Blocked URL schemes for security
    const BLOCKED_SCHEMES = ['javascript:', 'data:', 'vbscript:'];

    // Private: LocalStorage key
    const STORAGE_KEY = 'streamyard-material-creator-settings';

    // Private: Debounce timeout for color inputs (ms)
    const COLOR_DEBOUNCE_MS = 500;

    // Private: Current QR mode ('simple' or 'advanced')
    let currentQRMode = 'simple';

    // Private: Logo image data URL
    let logoImageData = null;

    // Private: QRCodeStyling instance
    let qrCodeStylingInstance = null;

    // Private: DOM Elements
    const elements = {
        tabBtns: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        // QR Code elements
        qrUrlInput: document.getElementById('qr-url'),
        qrUrlError: document.getElementById('qr-url-error'),
        qrGenerationError: document.getElementById('qr-generation-error'),
        qrTitleInput: document.getElementById('qr-title'),
        qrCanvasSizeSelect: document.getElementById('qr-canvas-size'),
        qrSizePercentInput: document.getElementById('qr-size-percent'),
        qrSizePercentValue: document.getElementById('qr-size-percent-value'),
        qrColorInput: document.getElementById('qr-color'),
        qrBgColorInput: document.getElementById('qr-bg-color'),
        qrTitleFontSizeSelect: document.getElementById('qr-title-font-size'),
        qrTitleColorInput: document.getElementById('qr-title-color'),
        qrPreview: document.getElementById('qr-preview'),
        qrCanvas: document.getElementById('qr-canvas'),
        downloadQrBtn: document.getElementById('download-qr'),
        // Mode toggle elements
        modeBtns: document.querySelectorAll('.mode-btn'),
        advancedControls: document.getElementById('advanced-controls'),
        // Advanced mode elements
        qrLogoUpload: document.getElementById('qr-logo-upload'),
        qrLogoClear: document.getElementById('qr-logo-clear'),
        qrLogoPreviewName: document.getElementById('qr-logo-preview-name'),
        logoSizeGroup: document.getElementById('logo-size-group'),
        qrLogoSize: document.getElementById('qr-logo-size'),
        qrLogoSizeValue: document.getElementById('qr-logo-size-value'),
        qrDotStyle: document.getElementById('qr-dot-style'),
        qrCornerSquareStyle: document.getElementById('qr-corner-square-style'),
        qrCornerDotStyle: document.getElementById('qr-corner-dot-style'),
        qrGradientType: document.getElementById('qr-gradient-type'),
        gradientColors: document.getElementById('gradient-colors'),
        qrGradientColor1: document.getElementById('qr-gradient-color1'),
        qrGradientColor2: document.getElementById('qr-gradient-color2'),
        qrAdvancedPreview: document.getElementById('qr-advanced-preview'),
        // Overlay elements
        overlayTitleInput: document.getElementById('overlay-title'),
        overlayBgColorInput: document.getElementById('overlay-bg-color'),
        overlayTextColorInput: document.getElementById('overlay-text-color'),
        overlayFontSizeSelect: document.getElementById('overlay-font-size'),
        overlayPaddingSelect: document.getElementById('overlay-padding'),
        overlaySizeSelect: document.getElementById('overlay-size'),
        overlayPreview: document.getElementById('overlay-preview'),
        overlayCanvas: document.getElementById('overlay-canvas'),
        downloadOverlayBtn: document.getElementById('download-overlay')
    };

    // Private: Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    function sanitizeFilename(name) {
        return name
            .replace(/[^\p{L}\p{N}]/gu, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .substring(0, 50);
    }

    function downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // Private: URL validation with security checks
    function validateUrl(url) {
        if (!url) {
            return { valid: false, error: '' };
        }

        // Check for blocked schemes
        const lowerUrl = url.toLowerCase().trim();
        for (const scheme of BLOCKED_SCHEMES) {
            if (lowerUrl.startsWith(scheme)) {
                return { valid: false, error: `URL scheme "${scheme}" is not allowed for security reasons.` };
            }
        }

        // Validate URL format
        try {
            const parsed = new URL(url);
            // Only allow http and https
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return { valid: false, error: `Only HTTP and HTTPS URLs are allowed.` };
            }
            return { valid: true, error: '' };
        } catch {
            return { valid: false, error: 'Please enter a valid URL (e.g., https://example.com)' };
        }
    }

    // Private: Show/hide error messages
    function showError(element, message) {
        if (element) {
            element.textContent = message;
        }
    }

    function clearError(element) {
        if (element) {
            element.textContent = '';
        }
    }

    // Private: LocalStorage functions
    function saveSettings() {
        const settings = {
            qr: {
                url: elements.qrUrlInput.value,
                title: elements.qrTitleInput.value,
                canvasSize: elements.qrCanvasSizeSelect.value,
                sizePercent: elements.qrSizePercentInput.value,
                color: elements.qrColorInput.value,
                bgColor: elements.qrBgColorInput.value,
                titleFontSize: elements.qrTitleFontSizeSelect.value,
                titleColor: elements.qrTitleColorInput.value,
                mode: currentQRMode,
                // Advanced mode settings
                logoSize: elements.qrLogoSize.value,
                dotStyle: elements.qrDotStyle.value,
                cornerSquareStyle: elements.qrCornerSquareStyle.value,
                cornerDotStyle: elements.qrCornerDotStyle.value,
                gradientType: elements.qrGradientType.value,
                gradientColor1: elements.qrGradientColor1.value,
                gradientColor2: elements.qrGradientColor2.value
            },
            overlay: {
                title: elements.overlayTitleInput.value,
                bgColor: elements.overlayBgColorInput.value,
                textColor: elements.overlayTextColorInput.value,
                fontSize: elements.overlayFontSizeSelect.value,
                padding: elements.overlayPaddingSelect.value,
                size: elements.overlaySizeSelect.value
            }
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save settings to localStorage:', e);
        }
    }

    function loadSettings() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return;

            const settings = JSON.parse(stored);

            // QR settings
            if (settings.qr) {
                if (settings.qr.url) elements.qrUrlInput.value = settings.qr.url;
                if (settings.qr.title) elements.qrTitleInput.value = settings.qr.title;
                if (settings.qr.canvasSize) elements.qrCanvasSizeSelect.value = settings.qr.canvasSize;
                if (settings.qr.sizePercent) {
                    elements.qrSizePercentInput.value = settings.qr.sizePercent;
                    elements.qrSizePercentValue.textContent = `${settings.qr.sizePercent}%`;
                }
                if (settings.qr.color) elements.qrColorInput.value = settings.qr.color;
                if (settings.qr.bgColor) elements.qrBgColorInput.value = settings.qr.bgColor;
                if (settings.qr.titleFontSize) elements.qrTitleFontSizeSelect.value = settings.qr.titleFontSize;
                if (settings.qr.titleColor) elements.qrTitleColorInput.value = settings.qr.titleColor;
                // Load mode
                if (settings.qr.mode) {
                    currentQRMode = settings.qr.mode;
                }
                // Load advanced settings
                if (settings.qr.logoSize) {
                    elements.qrLogoSize.value = settings.qr.logoSize;
                    elements.qrLogoSizeValue.textContent = `${settings.qr.logoSize}%`;
                }
                if (settings.qr.dotStyle) elements.qrDotStyle.value = settings.qr.dotStyle;
                if (settings.qr.cornerSquareStyle) elements.qrCornerSquareStyle.value = settings.qr.cornerSquareStyle;
                if (settings.qr.cornerDotStyle) elements.qrCornerDotStyle.value = settings.qr.cornerDotStyle;
                if (settings.qr.gradientType) elements.qrGradientType.value = settings.qr.gradientType;
                if (settings.qr.gradientColor1) elements.qrGradientColor1.value = settings.qr.gradientColor1;
                if (settings.qr.gradientColor2) elements.qrGradientColor2.value = settings.qr.gradientColor2;
            }

            // Overlay settings
            if (settings.overlay) {
                if (settings.overlay.title) elements.overlayTitleInput.value = settings.overlay.title;
                if (settings.overlay.bgColor) elements.overlayBgColorInput.value = settings.overlay.bgColor;
                if (settings.overlay.textColor) elements.overlayTextColorInput.value = settings.overlay.textColor;
                if (settings.overlay.fontSize) elements.overlayFontSizeSelect.value = settings.overlay.fontSize;
                if (settings.overlay.padding) elements.overlayPaddingSelect.value = settings.overlay.padding;
                if (settings.overlay.size) elements.overlaySizeSelect.value = settings.overlay.size;
            }
        } catch (e) {
            console.warn('Failed to load settings from localStorage:', e);
        }
    }

    // Private: QR Code generation (Simple mode)
    function generateQRCode(url, title, canvasWidth, canvasHeight, sizePercent, color, bgColor, titleFontSize, titleColor) {
        const ctx = elements.qrCanvas.getContext('2d');

        elements.qrCanvas.width = canvasWidth;
        elements.qrCanvas.height = canvasHeight;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const qrSize = Math.floor(canvasHeight * (sizePercent / 100));
        const titleHeight = title ? (titleFontSize + 12) : 0;
        const padding = 8;
        const bgWidth = qrSize + (padding * 2);
        const bgHeight = qrSize + (padding * 2) + titleHeight;
        const bgX = canvasWidth - bgWidth - padding;
        const bgY = padding;

        const cornerRadius = 8;
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.moveTo(bgX + cornerRadius, bgY);
        ctx.lineTo(bgX + bgWidth - cornerRadius, bgY);
        ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + cornerRadius);
        ctx.lineTo(bgX + bgWidth, bgY + bgHeight - cornerRadius);
        ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - cornerRadius, bgY + bgHeight);
        ctx.lineTo(bgX + cornerRadius, bgY + bgHeight);
        ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - cornerRadius);
        ctx.lineTo(bgX, bgY + cornerRadius);
        ctx.quadraticCurveTo(bgX, bgY, bgX + cornerRadius, bgY);
        ctx.closePath();
        ctx.fill();

        const tempCanvas = document.createElement('canvas');

        QRCode.toCanvas(tempCanvas, url, {
            width: qrSize,
            margin: 0,
            color: { dark: color, light: bgColor }
        }, (error) => {
            if (error) {
                console.error(error);
                showError(elements.qrGenerationError, 'Failed to generate QR code. Please try again.');
                return;
            }

            clearError(elements.qrGenerationError);
            const qrX = bgX + padding;
            const qrY = bgY + padding;
            ctx.drawImage(tempCanvas, qrX, qrY);

            if (title) {
                ctx.fillStyle = titleColor;
                ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const titleX = bgX + (bgWidth / 2);
                const titleY = bgY + padding + qrSize + (titleHeight / 2);
                ctx.fillText(title, titleX, titleY);
            }

            elements.qrPreview.classList.remove('hidden');
        });
    }

    // Private: Advanced QR Code generation using qr-code-styling
    async function generateAdvancedQRCode(url, title, canvasWidth, canvasHeight, sizePercent, color, bgColor, titleFontSize, titleColor) {
        const qrSize = Math.floor(canvasHeight * (sizePercent / 100));
        const titleHeight = title ? (titleFontSize + 12) : 0;
        const padding = 8;

        // Get advanced styling options
        const dotStyle = elements.qrDotStyle.value;
        const cornerSquareStyle = elements.qrCornerSquareStyle.value;
        const cornerDotStyle = elements.qrCornerDotStyle.value;
        const gradientType = elements.qrGradientType.value;
        const gradientColor1 = elements.qrGradientColor1.value;
        const gradientColor2 = elements.qrGradientColor2.value;
        const logoSize = parseInt(elements.qrLogoSize.value);

        // Build dots options
        let dotsOptions = {
            type: dotStyle
        };

        if (gradientType !== 'none') {
            dotsOptions.gradient = {
                type: gradientType,
                rotation: 45,
                colorStops: [
                    { offset: 0, color: gradientColor1 },
                    { offset: 1, color: gradientColor2 }
                ]
            };
        } else {
            dotsOptions.color = color;
        }

        // Build corner squares options
        let cornersSquareOptions = {
            type: cornerSquareStyle
        };
        if (gradientType !== 'none') {
            cornersSquareOptions.gradient = {
                type: gradientType,
                rotation: 45,
                colorStops: [
                    { offset: 0, color: gradientColor1 },
                    { offset: 1, color: gradientColor2 }
                ]
            };
        } else {
            cornersSquareOptions.color = color;
        }

        // Build corner dot options
        let cornersDotOptions = {
            type: cornerDotStyle
        };
        if (gradientType !== 'none') {
            cornersDotOptions.gradient = {
                type: gradientType,
                rotation: 45,
                colorStops: [
                    { offset: 0, color: gradientColor1 },
                    { offset: 1, color: gradientColor2 }
                ]
            };
        } else {
            cornersDotOptions.color = color;
        }

        // QRCodeStyling options
        const qrOptions = {
            width: qrSize,
            height: qrSize,
            data: url,
            margin: 0,
            qrOptions: {
                errorCorrectionLevel: logoImageData ? 'H' : 'M' // Higher error correction when logo is present
            },
            dotsOptions: dotsOptions,
            cornersSquareOptions: cornersSquareOptions,
            cornersDotOptions: cornersDotOptions,
            backgroundOptions: {
                color: bgColor
            }
        };

        // Add logo if present
        if (logoImageData) {
            qrOptions.image = logoImageData;
            qrOptions.imageOptions = {
                crossOrigin: 'anonymous',
                margin: 2,
                imageSize: logoSize / 100
            };
        }

        // Clear previous instance
        elements.qrAdvancedPreview.innerHTML = '';

        // Create new QRCodeStyling instance
        qrCodeStylingInstance = new QRCodeStyling(qrOptions);

        // Append to preview container
        await qrCodeStylingInstance.append(elements.qrAdvancedPreview);

        // Now draw the complete composition on the main canvas
        try {
            const qrCanvas = elements.qrAdvancedPreview.querySelector('canvas');
            if (!qrCanvas) {
                showError(elements.qrGenerationError, 'Failed to generate QR code. Please try again.');
                return;
            }

            const ctx = elements.qrCanvas.getContext('2d');
            elements.qrCanvas.width = canvasWidth;
            elements.qrCanvas.height = canvasHeight;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Calculate background dimensions
            const bgWidth = qrSize + (padding * 2);
            const bgHeight = qrSize + (padding * 2) + titleHeight;
            const bgX = canvasWidth - bgWidth - padding;
            const bgY = padding;

            // Draw rounded rectangle background
            const cornerRadius = 8;
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.moveTo(bgX + cornerRadius, bgY);
            ctx.lineTo(bgX + bgWidth - cornerRadius, bgY);
            ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + cornerRadius);
            ctx.lineTo(bgX + bgWidth, bgY + bgHeight - cornerRadius);
            ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - cornerRadius, bgY + bgHeight);
            ctx.lineTo(bgX + cornerRadius, bgY + bgHeight);
            ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - cornerRadius);
            ctx.lineTo(bgX, bgY + cornerRadius);
            ctx.quadraticCurveTo(bgX, bgY, bgX + cornerRadius, bgY);
            ctx.closePath();
            ctx.fill();

            // Draw QR code
            const qrX = bgX + padding;
            const qrY = bgY + padding;
            ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

            // Draw title
            if (title) {
                ctx.fillStyle = titleColor;
                ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const titleX = bgX + (bgWidth / 2);
                const titleY = bgY + padding + qrSize + (titleHeight / 2);
                ctx.fillText(title, titleX, titleY);
            }

            clearError(elements.qrGenerationError);
            elements.qrPreview.classList.remove('hidden');
        } catch (error) {
            console.error('Error generating advanced QR code:', error);
            showError(elements.qrGenerationError, 'Failed to generate QR code. Please try again.');
        }
    }

    // Private: Overlay generation
    function generateOverlay(title, bgColor, textColor, fontSize, padding, width, height) {
        const ctx = elements.overlayCanvas.getContext('2d');

        elements.overlayCanvas.width = width;
        elements.overlayCanvas.height = height;
        ctx.clearRect(0, 0, width, height);

        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const textMetrics = ctx.measureText(title);
        const textWidth = textMetrics.width;
        const titleBarHeight = fontSize + (padding * 2);
        const titleBarWidth = Math.min(textWidth + (padding * 4), width);
        const titleBarX = (width - titleBarWidth) / 2;

        const bottomCornerRadius = 10;
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.moveTo(titleBarX, 0);
        ctx.lineTo(titleBarX + titleBarWidth, 0);
        ctx.lineTo(titleBarX + titleBarWidth, titleBarHeight - bottomCornerRadius);
        ctx.quadraticCurveTo(titleBarX + titleBarWidth, titleBarHeight, titleBarX + titleBarWidth - bottomCornerRadius, titleBarHeight);
        ctx.lineTo(titleBarX + bottomCornerRadius, titleBarHeight);
        ctx.quadraticCurveTo(titleBarX, titleBarHeight, titleBarX, titleBarHeight - bottomCornerRadius);
        ctx.lineTo(titleBarX, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, width / 2, titleBarHeight / 2);

        elements.overlayPreview.classList.remove('hidden');
    }

    // Private: Update QR Code Preview
    function updateQRCodePreview() {
        const url = elements.qrUrlInput.value.trim();

        if (!url) {
            clearError(elements.qrUrlError);
            elements.qrUrlInput.classList.remove('input-error');
            return;
        }

        const validation = validateUrl(url);
        if (!validation.valid) {
            showError(elements.qrUrlError, validation.error);
            elements.qrUrlInput.classList.add('input-error');
            return;
        }

        clearError(elements.qrUrlError);
        elements.qrUrlInput.classList.remove('input-error');

        const title = elements.qrTitleInput.value.trim();
        const canvasSize = parseInt(elements.qrCanvasSizeSelect.value);
        const sizePercent = parseInt(elements.qrSizePercentInput.value);
        const color = elements.qrColorInput.value;
        const bgColor = elements.qrBgColorInput.value;
        const titleFontSize = parseInt(elements.qrTitleFontSizeSelect.value);
        const titleColor = elements.qrTitleColorInput.value;

        if (currentQRMode === 'advanced') {
            generateAdvancedQRCode(url, title, canvasSize, canvasSize, sizePercent, color, bgColor, titleFontSize, titleColor);
        } else {
            generateQRCode(url, title, canvasSize, canvasSize, sizePercent, color, bgColor, titleFontSize, titleColor);
        }
        saveSettings();
    }

    // Private: Update Overlay Preview
    function updateOverlayPreview() {
        const title = elements.overlayTitleInput.value.trim();
        if (!title) return;

        const bgColor = elements.overlayBgColorInput.value;
        const textColor = elements.overlayTextColorInput.value;
        const fontSize = parseInt(elements.overlayFontSizeSelect.value);
        const padding = parseInt(elements.overlayPaddingSelect.value);
        const [width, height] = elements.overlaySizeSelect.value.split('x').map(v => parseInt(v));

        generateOverlay(title, bgColor, textColor, fontSize, padding, width, height);
        saveSettings();
    }

    // Private: Tab switching with ARIA support
    function setupTabs() {
        elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;

                elements.tabBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                elements.tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    // Private: Setup mode toggle
    function setupModeToggle() {
        elements.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                if (mode === currentQRMode) return;

                currentQRMode = mode;

                // Update button states
                elements.modeBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');

                // Show/hide advanced controls
                if (mode === 'advanced') {
                    elements.advancedControls.classList.remove('hidden');
                    // Show gradient colors if gradient is selected
                    if (elements.qrGradientType.value !== 'none') {
                        elements.gradientColors.classList.remove('hidden');
                    }
                } else {
                    elements.advancedControls.classList.add('hidden');
                }

                // Re-generate preview if URL exists
                if (elements.qrUrlInput.value.trim()) {
                    updateQRCodePreview();
                }

                saveSettings();
            });
        });
    }

    // Private: Setup logo upload handlers
    function setupLogoUpload() {
        elements.qrLogoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showError(elements.qrGenerationError, 'Please select a valid image file.');
                return;
            }

            // Read file as data URL
            const reader = new FileReader();
            reader.onload = (event) => {
                logoImageData = event.target.result;
                elements.qrLogoPreviewName.textContent = file.name;
                elements.qrLogoClear.style.display = 'inline-block';
                elements.logoSizeGroup.style.display = 'block';

                // Re-generate QR code
                if (elements.qrUrlInput.value.trim()) {
                    updateQRCodePreview();
                }
            };
            reader.onerror = () => {
                showError(elements.qrGenerationError, 'Failed to read the image file.');
            };
            reader.readAsDataURL(file);
        });

        elements.qrLogoClear.addEventListener('click', () => {
            logoImageData = null;
            elements.qrLogoUpload.value = '';
            elements.qrLogoPreviewName.textContent = '';
            elements.qrLogoClear.style.display = 'none';
            elements.logoSizeGroup.style.display = 'none';

            // Re-generate QR code
            if (elements.qrUrlInput.value.trim()) {
                updateQRCodePreview();
            }
        });
    }

    // Private: Setup event listeners
    function setupEventListeners() {
        const debouncedQRUpdate = debounce(updateQRCodePreview, 300);
        const debouncedOverlayUpdate = debounce(updateOverlayPreview, 300);
        const debouncedColorQRUpdate = debounce(updateQRCodePreview, COLOR_DEBOUNCE_MS);
        const debouncedColorOverlayUpdate = debounce(updateOverlayPreview, COLOR_DEBOUNCE_MS);

        // QR Code size percent display
        elements.qrSizePercentInput.addEventListener('input', () => {
            elements.qrSizePercentValue.textContent = `${elements.qrSizePercentInput.value}%`;
            elements.qrSizePercentInput.setAttribute('aria-valuenow', elements.qrSizePercentInput.value);
        });

        // QR Code inputs (text uses 'input', colors use 'change')
        elements.qrUrlInput.addEventListener('input', debouncedQRUpdate);
        elements.qrTitleInput.addEventListener('input', debouncedQRUpdate);
        elements.qrCanvasSizeSelect.addEventListener('change', debouncedQRUpdate);
        elements.qrSizePercentInput.addEventListener('input', debouncedQRUpdate);
        elements.qrTitleFontSizeSelect.addEventListener('change', debouncedQRUpdate);

        // Color inputs: use 'change' event for performance
        elements.qrColorInput.addEventListener('change', debouncedColorQRUpdate);
        elements.qrBgColorInput.addEventListener('change', debouncedColorQRUpdate);
        elements.qrTitleColorInput.addEventListener('change', debouncedColorQRUpdate);

        // Advanced mode controls
        elements.qrLogoSize.addEventListener('input', () => {
            elements.qrLogoSizeValue.textContent = `${elements.qrLogoSize.value}%`;
            elements.qrLogoSize.setAttribute('aria-valuenow', elements.qrLogoSize.value);
        });
        elements.qrLogoSize.addEventListener('input', debouncedQRUpdate);
        elements.qrDotStyle.addEventListener('change', debouncedQRUpdate);
        elements.qrCornerSquareStyle.addEventListener('change', debouncedQRUpdate);
        elements.qrCornerDotStyle.addEventListener('change', debouncedQRUpdate);
        elements.qrGradientType.addEventListener('change', () => {
            // Show/hide gradient color inputs
            if (elements.qrGradientType.value !== 'none') {
                elements.gradientColors.classList.remove('hidden');
            } else {
                elements.gradientColors.classList.add('hidden');
            }
            debouncedQRUpdate();
        });
        elements.qrGradientColor1.addEventListener('change', debouncedColorQRUpdate);
        elements.qrGradientColor2.addEventListener('change', debouncedColorQRUpdate);

        // Overlay inputs
        elements.overlayTitleInput.addEventListener('input', debouncedOverlayUpdate);
        elements.overlayFontSizeSelect.addEventListener('change', debouncedOverlayUpdate);
        elements.overlayPaddingSelect.addEventListener('change', debouncedOverlayUpdate);
        elements.overlaySizeSelect.addEventListener('change', debouncedOverlayUpdate);

        // Overlay color inputs: use 'change' event
        elements.overlayBgColorInput.addEventListener('change', debouncedColorOverlayUpdate);
        elements.overlayTextColorInput.addEventListener('change', debouncedColorOverlayUpdate);

        // Download buttons
        elements.downloadQrBtn.addEventListener('click', () => {
            const title = elements.qrTitleInput.value.trim() || 'qrcode';
            const filename = sanitizeFilename(title) + '_qrcode.png';
            downloadCanvas(elements.qrCanvas, filename);
        });

        elements.downloadOverlayBtn.addEventListener('click', () => {
            const title = elements.overlayTitleInput.value.trim() || 'overlay';
            const filename = sanitizeFilename(title) + '_overlay.png';
            downloadCanvas(elements.overlayCanvas, filename);
        });

    }

    // Private: Apply loaded mode to UI
    function applyLoadedMode() {
        // Update mode button states
        elements.modeBtns.forEach(btn => {
            if (btn.dataset.mode === currentQRMode) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        // Show/hide advanced controls
        if (currentQRMode === 'advanced') {
            elements.advancedControls.classList.remove('hidden');
            if (elements.qrGradientType.value !== 'none') {
                elements.gradientColors.classList.remove('hidden');
            }
        }
    }

    // Public: Initialize the application
    function init() {
        loadSettings();
        setupTabs();
        setupModeToggle();
        setupLogoUpload();
        setupEventListeners();
        applyLoadedMode();

        // Generate initial previews if data exists
        if (elements.qrUrlInput.value.trim()) {
            updateQRCodePreview();
        }
        if (elements.overlayTitleInput.value.trim()) {
            updateOverlayPreview();
        }
    }

    // Return public API
    return { init };
})();

// Initialize on DOM ready
// Note: ES modules with CDN imports may execute after DOMContentLoaded has already fired,
// so we need to check the document readyState to ensure initialization happens.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    // DOMContentLoaded has already fired, initialize immediately
    App.init();
}
