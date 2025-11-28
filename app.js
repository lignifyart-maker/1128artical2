// Main Application Logic for AI Article Creator

// DOM Elements
const material1Input = document.getElementById('material1');
const material2Input = document.getElementById('material2');
const material3Input = document.getElementById('material3');
const createBtn = document.getElementById('createBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const articlesList = document.getElementById('articlesList');

// Initialize app
function init() {
    renderArticlesList();
    setupEventListeners();
    checkAPIKey();
}

// Setup event listeners
function setupEventListeners() {
    createBtn.addEventListener('click', handleCreate);
}

// Check if API key is configured
function checkAPIKey() {
    if (CONFIG.USE_AI_CREATION && !CONFIG.GEMINI_API_KEY) {
        console.warn('⚠️ Gemini API key not configured. Using simple mode.');
        console.info('To enable AI-powered creation, add your API key in config.js');
        console.info('Get your API key from: https://aistudio.google.com/app/apikey');
    }
}

// Handle create button click
async function handleCreate() {
    const material1 = material1Input.value;
    const material2 = material2Input.value;
    const material3 = material3Input.value;

    try {
        // Validate input
        creator.validateMaterials(material1, material2, material3);

        // Show loading
        showLoading(true);
        createBtn.disabled = true;

        // Create article
        const createdContent = await creator.createArticle(material1, material2, material3);

        // Generate title
        const title = utils.generateTitle(createdContent);

        // Create article object
        const article = {
            id: utils.generateId(),
            title: title,
            content: createdContent,
            createdAt: new Date().toISOString()
        };

        // Save article
        storage.saveArticle(article);

        // Clear inputs
        clearInputs();

        // Refresh articles list
        renderArticlesList();

        // Show success message
        showSuccessMessage();

        // Navigate to article detail
        setTimeout(() => {
            navigateToArticle(article.id);
        }, 1000);

    } catch (error) {
        console.error('Create error:', error);
        alert(error.message || '創作文章時發生錯誤，請稍後再試');
    } finally {
        showLoading(false);
        createBtn.disabled = false;
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

// Clear input fields
function clearInputs() {
    material1Input.value = '';
    material2Input.value = '';
    material3Input.value = '';
}

// Show success message
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = '✅ 文章創作成功！';
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
                <p class="empty-state-text">尚無已創作的文章</p>
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
            <p class="article-card-preview">${escapeHtml(getPreview(article.content))}</p>
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

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
