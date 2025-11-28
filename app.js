// Main Application Logic for AI Article Merger

// DOM Elements
const article1Input = document.getElementById('article1');
const article2Input = document.getElementById('article2');
const article3Input = document.getElementById('article3');
const mergeBtn = document.getElementById('mergeBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const articlesList = document.getElementById('articlesList');

// Counter Elements
const counter1 = document.getElementById('counter1');
const counter2 = document.getElementById('counter2');
const counter3 = document.getElementById('counter3');

// Initialize app
function init() {
    renderArticlesList();
    setupEventListeners();

    // Initialize draggable cards
    if (window.initDraggableCards) {
        window.initDraggableCards();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Input listeners for character counting
    article1Input.addEventListener('input', () => updateCharCounter(1));
    article2Input.addEventListener('input', () => updateCharCounter(2));
    article3Input.addEventListener('input', () => updateCharCounter(3));

    // Clear buttons
    document.querySelectorAll('.clear-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const field = e.target.dataset.field || e.target.closest('.clear-btn').dataset.field;
            clearField(parseInt(field));
        });
    });

    // Merge button
    mergeBtn.addEventListener('click', handleMerge);
}

// Update character counter
function updateCharCounter(fieldNum) {
    const input = document.getElementById(`article${fieldNum}`);
    const counter = document.getElementById(`counter${fieldNum}`);
    const length = input.value.length;

    counter.textContent = `${length} 字`;
}

// Clear field
function clearField(fieldNum) {
    const input = document.getElementById(`article${fieldNum}`);
    if (input) {
        input.value = '';
        updateCharCounter(fieldNum);
    }
}

// Validate inputs before merging
function validateInputs() {
    const article1 = article1Input.value.trim();
    const article2 = article2Input.value.trim();
    const article3 = article3Input.value.trim();

    // Count non-empty articles
    const nonEmptyCount = [article1, article2, article3].filter(a => a).length;

    if (nonEmptyCount < 2) {
        throw new Error('請至少填寫兩篇文章');
    }

    return { article1, article2, article3 };
}

// Handle merge button click
async function handleMerge() {
    try {
        // Validate inputs
        const { article1, article2, article3 } = validateInputs();

        // Show loading
        showLoading(true);
        mergeBtn.disabled = true;

        // Merge articles using AI
        const mergedResult = await creator.mergeArticles(article1, article2, article3);

        // Generate AI title (pass entire result, function will handle it)
        const title = await creator.generateTitle(mergedResult);

        // Create article object
        const article = {
            id: utils.generateId(),
            title: title,
            originalInputs: [article1, article2, article3].filter(a => a),
            mergedContent: mergedResult,
            createdAt: new Date().toISOString()
        };

        // Save article
        storage.saveArticle(article);

        // Clear inputs
        clearAllInputs();

        // Refresh articles list
        renderArticlesList();

        // Show success message
        showSuccessMessage();

        // Navigate to article detail
        setTimeout(() => {
            navigateToArticle(article.id);
        }, 1000);

    } catch (error) {
        console.error('Merge error:', error);
        alert(error.message || '合併文章時發生錯誤，請稍後再試');
    } finally {
        showLoading(false);
        mergeBtn.disabled = false;
    }
}

// Show/hide loading indicator
function showLoading(show) {
    if (show) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

// Clear all input fields
function clearAllInputs() {
    clearField(1);
    clearField(2);
    clearField(3);
}

// Show success message
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = '✅ 文章合併成功！';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #A8C686, #C1DDA0);
        color: white;
        padding: 2rem 3rem;
        border-radius: 16px;
        font-size: 1.3rem;
        font-weight: 600;
        box-shadow: 0 8px 32px rgba(45, 80, 22, 0.2);
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 1500);
}

// Render articles list
function renderArticlesList() {
    const articles = storage.getArticles();

    if (articles.length === 0) {
        articlesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p class="empty-state-text">尚無已合併的文章</p>
                <p class="empty-state-hint">開始輸入文章片段並點擊「合併文章」</p>
            </div>
        `;
        return;
    }

    articlesList.innerHTML = articles.map(article => `
        <div class="article-card" data-id="${article.id}">
            <div class="article-card-header">
                <h3 class="article-card-title">${escapeHtml(article.title)}</h3>
                <button class="delete-button" data-id="${article.id}" title="刪除文章">
                    🗑️
                </button>
            </div>
            <p class="article-card-date">${utils.formatDate(article.createdAt)}</p>
            <p class="article-card-preview">${escapeHtml(getPreview(article.mergedContent.plainText))}</p>
            <div class="article-card-meta">
                <span class="meta-item">📊 ${article.mergedContent.plainText.length} 字</span>
                <span class="meta-item">📑 ${article.originalInputs.length} 篇合併</span>
            </div>
        </div>
    `).join('');

    // Add click event listeners
    document.querySelectorAll('.article-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-button') ||
                e.target.closest('.delete-button')) {
                return;
            }
            const id = card.dataset.id;
            navigateToArticle(id);
        });
    });

    // Add delete button listeners
    document.querySelectorAll('.delete-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            handleDelete(id);
        });
    });
}

// Get preview text
function getPreview(content) {
    const preview = content.substring(0, 100);
    return preview.length < content.length ? preview + '...' : preview;
}

// Handle article deletion
function handleDelete(id) {
    if (confirm('確定要刪除這篇文章嗎？')) {
        storage.deleteArticle(id);
        renderArticlesList();

        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.textContent = '文章已刪除';
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: #2D5016;
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(45, 80, 22, 0.2);
            z-index: 1000;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }
}

// Navigate to article detail page
function navigateToArticle(id) {
    window.location.href = `article.html?id=${id}`;
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
