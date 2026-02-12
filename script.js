import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm'

// DOM要素
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// QRコード要素
const qrUrlInput = document.getElementById('qr-url');
const qrTitleInput = document.getElementById('qr-title');
const qrCanvasSizeSelect = document.getElementById('qr-canvas-size');
const qrSizePercentInput = document.getElementById('qr-size-percent');

// Default canvas size (600 x 600 px)
const qrSizePercentValue = document.getElementById('qr-size-percent-value');
const qrColorInput = document.getElementById('qr-color');
const qrBgColorInput = document.getElementById('qr-bg-color');
const qrTitleFontSizeSelect = document.getElementById('qr-title-font-size');
const qrTitleColorInput = document.getElementById('qr-title-color');
const qrPreview = document.getElementById('qr-preview');
const qrCanvas = document.getElementById('qr-canvas');
const downloadQrBtn = document.getElementById('download-qr');

// QRサイズパーセンテージの表示更新
qrSizePercentInput.addEventListener('input', () => {
    qrSizePercentValue.textContent = `${qrSizePercentInput.value}%`;
});

// オーバーレイ要素
const overlayTitleInput = document.getElementById('overlay-title');
const overlayBgColorInput = document.getElementById('overlay-bg-color');
const overlayTextColorInput = document.getElementById('overlay-text-color');
const overlayFontSizeSelect = document.getElementById('overlay-font-size');
const overlayPaddingSelect = document.getElementById('overlay-padding');
const overlayWidthSelect = document.getElementById('overlay-width');
const overlayHeightSelect = document.getElementById('overlay-height');
const overlayPreview = document.getElementById('overlay-preview');
const overlayCanvas = document.getElementById('overlay-canvas');
const downloadOverlayBtn = document.getElementById('download-overlay');

// タブ切り替え
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // アクティブなタブボタンを更新
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 対応するコンテンツを表示
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === targetTab) {
                content.classList.add('active');
            }
        });
    });
});

function generateQRCode(url, title, canvasWidth, canvasHeight, sizePercent, color, bgColor, titleFontSize, titleColor) {
    const ctx = qrCanvas.getContext('2d');
    
    // キャンバスサイズを設定
    qrCanvas.width = canvasWidth;
    qrCanvas.height = canvasHeight;
    
    // キャンバスをクリア（透明背景）
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // QRコードサイズをキャンバス高さのパーセンテージで計算
    const qrSize = Math.floor(canvasHeight * (sizePercent / 100));
    
    // タイトルの高さを計算
    const titleHeight = title ? (titleFontSize + 12) : 0;
    
    // QRコードとタイトルを含む背景領域のパディング
    const padding = 8;
    const bgWidth = qrSize + (padding * 2);
    const bgHeight = qrSize + (padding * 2) + titleHeight;
    
    // 右上に配置（右端と上端からpaddingの余白を設ける）
    const bgX = canvasWidth - bgWidth - padding;
    const bgY = padding;
    
    // QRコード背景を描画（角丸付き）
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
    
    // QRコード用の一時キャンバスを作成
    const tempCanvas = document.createElement('canvas');
    
    QRCode.toCanvas(tempCanvas, url, {
        width: qrSize,
        margin: 0,
        color: {
            dark: color,
            light: bgColor
        }
    }, (error) => {
        if (error) {
            console.error(error);
            alert('QRコードの生成に失敗しました。もう一度お試しください。');
            return;
        }
        
        // QRコードを右上背景領域内に描画
        const qrX = bgX + padding;
        const qrY = bgY + padding;
        ctx.drawImage(tempCanvas, qrX, qrY);
        
        // タイトルが指定されている場合は描画
        if (title) {
            ctx.fillStyle = titleColor;
            ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const titleX = bgX + (bgWidth / 2);
            const titleY = bgY + padding + qrSize + (titleHeight / 2);
            ctx.fillText(title, titleX, titleY);
        }
        
        // プレビューを表示
        qrPreview.classList.remove('hidden');
    });
}

// QRコードのダウンロード
downloadQrBtn.addEventListener('click', () => {
    const title = qrTitleInput.value.trim() || 'qrcode';
    const filename = sanitizeFilename(title) + '_qrcode.png';
    downloadCanvas(qrCanvas, filename);
});

function generateOverlay(title, bgColor, textColor, fontSize, padding, width, height) {
    const ctx = overlayCanvas.getContext('2d');
    
    // キャンバスの寸法を設定
    overlayCanvas.width = width;
    overlayCanvas.height = height;
    
    // キャンバスをクリア（透明背景）
    ctx.clearRect(0, 0, width, height);
    
    // タイトルバーの寸法を計算
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const textMetrics = ctx.measureText(title);
    const textWidth = textMetrics.width;
    const titleBarHeight = fontSize + (padding * 2);
    const titleBarWidth = Math.min(textWidth + (padding * 4), width);
    const titleBarX = (width - titleBarWidth) / 2;
    
    // 角丸でタイトル背景を描画
    const cornerRadius = 0; // 上部の角はキャンバスの上端に配置
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
    
    // タイトルテキストを描画
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, width / 2, titleBarHeight / 2);
    
    // プレビューを表示
    overlayPreview.classList.remove('hidden');
}

// オーバーレイのダウンロード
downloadOverlayBtn.addEventListener('click', () => {
    const title = overlayTitleInput.value.trim() || 'overlay';
    const filename = sanitizeFilename(title) + '_overlay.png';
    downloadCanvas(overlayCanvas, filename);
});

// ユーティリティ関数
function downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function sanitizeFilename(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .substring(0, 50);
}

// リアルタイムプレビュー更新（オプション機能）
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Real-time preview update function for QR Code
function updateQRCodePreview() {
    const url = qrUrlInput.value.trim();
    
    // Only generate if URL is provided and valid
    if (!url) {
        return;
    }
    
    // Validate URL format
    try {
        new URL(url);
    } catch {
        return;
    }
    
    const title = qrTitleInput.value.trim();
    const canvasSize = parseInt(qrCanvasSizeSelect.value);
    const canvasWidth = canvasSize;
    const canvasHeight = canvasSize;
    const sizePercent = parseInt(qrSizePercentInput.value);
    const color = qrColorInput.value;
    const bgColor = qrBgColorInput.value;
    const titleFontSize = parseInt(qrTitleFontSizeSelect.value);
    const titleColor = qrTitleColorInput.value;
    
    generateQRCode(url, title, canvasWidth, canvasHeight, sizePercent, color, bgColor, titleFontSize, titleColor);
}

// Real-time preview update function for Overlay
function updateOverlayPreview() {
    const title = overlayTitleInput.value.trim();
    
    // Only generate if title is provided
    if (!title) {
        return;
    }
    
    const bgColor = overlayBgColorInput.value;
    const textColor = overlayTextColorInput.value;
    const fontSize = parseInt(overlayFontSizeSelect.value);
    const padding = parseInt(overlayPaddingSelect.value);
    const width = parseInt(overlayWidthSelect.value);
    const height = parseInt(overlayHeightSelect.value);
    
    generateOverlay(title, bgColor, textColor, fontSize, padding, width, height);
}

// Debounced versions for performance optimization
const debouncedQRCodeUpdate = debounce(updateQRCodePreview, 300);
const debouncedOverlayUpdate = debounce(updateOverlayPreview, 300);

// QR Code input event listeners for real-time preview
const qrInputElements = [
    { element: qrUrlInput, event: 'input' },
    { element: qrTitleInput, event: 'input' },
    { element: qrCanvasSizeSelect, event: 'change' },
    { element: qrSizePercentInput, event: 'input' },
    { element: qrColorInput, event: 'input' },
    { element: qrBgColorInput, event: 'input' },
    { element: qrTitleFontSizeSelect, event: 'change' },
    { element: qrTitleColorInput, event: 'input' }
];

qrInputElements.forEach(({ element, event }) => {
    element.addEventListener(event, debouncedQRCodeUpdate);
});

// Overlay input event listeners for real-time preview
const overlayInputElements = [
    { element: overlayTitleInput, event: 'input' },
    { element: overlayBgColorInput, event: 'input' },
    { element: overlayTextColorInput, event: 'input' },
    { element: overlayFontSizeSelect, event: 'change' },
    { element: overlayPaddingSelect, event: 'change' },
    { element: overlayWidthSelect, event: 'change' },
    { element: overlayHeightSelect, event: 'change' }
];

overlayInputElements.forEach(({ element, event }) => {
    element.addEventListener(event, debouncedOverlayUpdate);
});

// プレースホルダーの例で初期化
document.addEventListener('DOMContentLoaded', () => {
    // デフォルト値を設定
    qrUrlInput.value = '';
    qrTitleInput.value = '';
    overlayTitleInput.value = '';
});
