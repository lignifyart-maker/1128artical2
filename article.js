// Article Detail Page Logic

// Get article ID from URL
function getArticleIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// DOM Elements
const articleTitle = document.getElementById('articleTitle');
const articleContent = document.getElementById('articleContent');
const backBtn = document.getElementById('backBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Initialize article detail page
function init() {
    const articleId = getArticleIdFromUrl();

    if (!articleId) {
        alert('找不到文章');
        navigateToHome();
        return;
    }

    const article = storage.getArticle(articleId);

    if (!article) {
        alert('文章不存在');
        navigateToHome();
        return;
    }

    renderArticle(article);
    setupEventListeners(article);
}

// Render article with color coding
function renderArticle(article) {
    articleTitle.textContent = article.title;

    // Check if article has segments (color-coded)
    if (article.mergedContent && article.mergedContent.segments) {
        // Render with color coding
        const html = article.mergedContent.segments.map(segment => {
            let className = '';
            if (segment.type === 'modified') {
                className = 'modified-text';  // Blue
            } else if (segment.type === 'generated') {
                className = 'generated-text';  // Red
            }

            const text = escapeHtml(segment.text).replace(/\n/g, '<br>');
            return className ? `<span class="${className}">${text}</span>` : text;
        }).join('');

        articleContent.innerHTML = html;
    } else {
        // Fallback: render plain text
        const content = article.mergedContent?.plainText || article.content || '';
        articleContent.innerHTML = content.replace(/\n/g, '<br>');
    }
}

// Setup event listeners
function setupEventListeners(article) {
    backBtn.addEventListener('click', navigateToHome);
    copyBtn.addEventListener('click', () => handleCopy(article));
    downloadBtn.addEventListener('click', () => handleDownload(article));
}

// Navigate to home page
function navigateToHome() {
    window.location.href = 'index.html';
}

// Handle copy to clipboard
async function handleCopy(article) {
    try {
        const content = article.mergedContent?.plainText || article.content || '';
        await navigator.clipboard.writeText(content);
        showToast('✅ 已複製到剪貼簿');

        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="button-icon">✓</span><span class="button-text">已複製</span>';
        copyBtn.style.background = 'var(--color-secondary)';
        copyBtn.style.color = 'white';

        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
        }, 2000);

    } catch (error) {
        console.error('Copy error:', error);

        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = article.mergedContent?.plainText || article.content || '';
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            showToast('✅ 已複製到剪貼簿');
        } catch (e) {
            showToast('❌ 複製失敗，請手動複製');
        }

        document.body.removeChild(textarea);
    }
}

// Handle download as HTML file
function handleDownload(article) {
    try {
        // Build HTML content with color coding
        let htmlContent = generateDownloadHTML(article);

        const BOM = '\uFEFF';
        const content = BOM + htmlContent;
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const filename = `${article.title.replace(/[\\/:*?"<>|]/g, '_')}.html`;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('✅ 文章已下載');

        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<span class="button-icon">✓</span><span class="button-text">已下載</span>';
        downloadBtn.style.background = 'var(--color-accent)';
        downloadBtn.style.color = 'white';

        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.style.background = '';
            downloadBtn.style.color = '';
        }, 2000);

    } catch (error) {
        console.error('Download error:', error);
        showToast('❌ 下載失敗，請稍後再試');
    }
}

// Generate HTML for download
function generateDownloadHTML(article) {
    const dateStr = utils.formatDate(article.createdAt);

    let contentHTML = '';

    if (article.mergedContent && article.mergedContent.segments) {
        // Render with color coding
        contentHTML = article.mergedContent.segments.map(segment => {
            let className = '';
            if (segment.type === 'modified') {
                className = 'modified';
            } else if (segment.type === 'generated') {
                className = 'generated';
            }

            const text = escapeHtml(segment.text).replace(/\n/g, '<br>');
            return className ? `<span class="${className}">${text}</span>` : text;
        }).join('');
    } else {
        const content = article.mergedContent?.plainText || article.content || '';
        contentHTML = escapeHtml(content).replace(/\n/g, '<br>');
    }

    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(article.title)}</title>
    <style>
        body {
            font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
            line-height: 1.8;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f7f7f7;
        }
        .article-container {
            background: white;
            padding: 3rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #2D5016;
            font-size: 2rem;
            margin-bottom: 0.5rem;
            border-bottom: 3px solid #A8C686;
            padding-bottom: 1rem;
        }
        .meta {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 2rem;
        }
        .content {
            font-size: 1.1rem;
            color: #333;
        }
        .modified {
            color: #0066CC;
        }
        .generated {
            color: #CC0000;
        }
        .legend {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e0e0e0;
            font-size: 0.9rem;
            color: #666;
        }
        .legend-item {
            display: inline-block;
            margin-right: 1.5rem;
        }
    </style>
</head>
<body>
    <div class="article-container">
        <h1>${escapeHtml(article.title)}</h1>
        <div class="meta">創建時間：${dateStr}</div>
        <div class="content">
            ${contentHTML}
        </div>
        <div class="legend">
            <div class="legend-item"><span class="modified">■</span> 藍色：AI 修改的原文</div>
            <div class="legend-item"><span class="generated">■</span> 紅色：AI 新增的連接文字</div>
        </div>
    </div>
</body>
</html>`;
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
