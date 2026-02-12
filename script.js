// DOM要素
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// QRコード要素
const qrUrlInput = document.getElementById('qr-url');
const qrTitleInput = document.getElementById('qr-title');
const qrSizeSelect = document.getElementById('qr-size');
const qrColorInput = document.getElementById('qr-color');
const qrBgColorInput = document.getElementById('qr-bg-color');
const generateQrBtn = document.getElementById('generate-qr');
const qrPreview = document.getElementById('qr-preview');
const qrCanvas = document.getElementById('qr-canvas');
const downloadQrBtn = document.getElementById('download-qr');

// オーバーレイ要素
const overlayTitleInput = document.getElementById('overlay-title');
const overlayBgColorInput = document.getElementById('overlay-bg-color');
const overlayTextColorInput = document.getElementById('overlay-text-color');
const overlayFontSizeSelect = document.getElementById('overlay-font-size');
const overlayPaddingSelect = document.getElementById('overlay-padding');
const overlayWidthSelect = document.getElementById('overlay-width');
const overlayHeightSelect = document.getElementById('overlay-height');
const generateOverlayBtn = document.getElementById('generate-overlay');
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

// QRコード生成
generateQrBtn.addEventListener('click', () => {
    const url = qrUrlInput.value.trim();
    const title = qrTitleInput.value.trim();
    const size = parseInt(qrSizeSelect.value);
    const color = qrColorInput.value;
    const bgColor = qrBgColorInput.value;
    
    if (!url) {
        alert('URLを入力してください');
        qrUrlInput.focus();
        return;
    }
    
    // URL形式の検証
    try {
        new URL(url);
    } catch {
        alert('有効なURLを入力してください（例: https://example.com）');
        qrUrlInput.focus();
        return;
    }
    
    generateQRCode(url, title, size, color, bgColor);
});

function generateQRCode(url, title, size, color, bgColor) {
    const ctx = qrCanvas.getContext('2d');
    
    // キャンバスの寸法を計算
    const titleHeight = title ? 50 : 0;
    const padding = 20;
    const canvasWidth = size + (padding * 2);
    const canvasHeight = size + (padding * 2) + titleHeight;
    
    qrCanvas.width = canvasWidth;
    qrCanvas.height = canvasHeight;
    
    // 背景を塗りつぶし
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // QRコード用の一時キャンバスを作成
    const tempCanvas = document.createElement('canvas');
    
    QRCode.toCanvas(tempCanvas, url, {
        width: size,
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
        
        // メインキャンバスにQRコードを描画
        ctx.drawImage(tempCanvas, padding, padding);
        
        // タイトルが指定されている場合は描画
        if (title) {
            ctx.fillStyle = color;
            ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(title, canvasWidth / 2, size + padding + (titleHeight / 2) + 5);
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

// オーバーレイ生成
generateOverlayBtn.addEventListener('click', () => {
    const title = overlayTitleInput.value.trim();
    const bgColor = overlayBgColorInput.value;
    const textColor = overlayTextColorInput.value;
    const fontSize = parseInt(overlayFontSizeSelect.value);
    const padding = parseInt(overlayPaddingSelect.value);
    const width = parseInt(overlayWidthSelect.value);
    const height = parseInt(overlayHeightSelect.value);
    
    if (!title) {
        alert('イベントタイトルを入力してください');
        overlayTitleInput.focus();
        return;
    }
    
    generateOverlay(title, bgColor, textColor, fontSize, padding, width, height);
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

// プレースホルダーの例で初期化
document.addEventListener('DOMContentLoaded', () => {
    // デフォルト値を設定
    qrUrlInput.value = '';
    qrTitleInput.value = '';
    overlayTitleInput.value = '';
});
