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

// Render article
function renderArticle(article) {
    articleTitle.textContent = article.title;
    articleContent.innerHTML = article.content.replace(/\n/g, '<br>');
}

// Setup event listeners
function setupEventListeners(article) {
    backBtn.addEventListener('click', navigateToHome);
    copyBtn.addEventListener('click', () => handleCopy(article.content));
    downloadBtn.addEventListener('click', () => handleDownload(article));
}

// Navigate to home page
function navigateToHome() {
    window.location.href = 'index.html';
}

// Handle copy to clipboard
async function handleCopy(content) {
    try {
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

        const textarea = document.createElement('textarea');
        textarea.value = content;
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

// Handle download as text file
function handleDownload(article) {
    try {
        const BOM = '\uFEFF';
        const content = BOM + article.content;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const filename = `${article.title.replace(/[\\/:*?"<>|]/g, '_')}.txt`;
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
