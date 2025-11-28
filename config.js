// Configuration
const CONFIG = {
    // Gemini API Configuration
    // API Key is loaded from config.local.js (not committed to git)
    GEMINI_API_KEY: (typeof LOCAL_CONFIG !== 'undefined' && LOCAL_CONFIG.GEMINI_API_KEY) || '',
    GEMINI_MODEL: 'gemini-3-pro',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/',

    // Application Settings
    STORAGE_KEY: 'articleCreator_articles',
    MAX_TITLE_LENGTH: 5,
    MAX_OUTPUT_TOKENS: 65536,  // 支援約 20000 字的輸出

    // Feature Flags
    USE_AI_CREATION: true,
};

// Utility Functions
const utils = {
    generateId() {
        return Date.now().toString();
    },

    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    generateTitle(content) {
        const cleanContent = content.replace(/\s+/g, '').substring(0, 5);
        const timestamp = this.formatDate(new Date());
        return `${cleanContent} ${timestamp}`;
    },

    toTraditionalChinese(text) {
        if (typeof convertToTraditional === 'function') {
            return convertToTraditional(text);
        }
        return text;
    },

    cleanPunctuation(text) {
        return text
            .replace(/,/g, '，')
            .replace(/\./g, '。')
            .replace(/!/g, '！')
            .replace(/\?/g, '？')
            .replace(/;/g, '；')
            .replace(/:/g, '：')
            .replace(/["""]/g, '「')
            .replace(/["""]/g, '」')
            .replace(/['']/g, '『')
            .replace(/['']/g, '』')
            .replace(/\(/g, '（')
            .replace(/\)/g, '）')
            .replace(/\s+/g, ' ')
            .replace(/\n{4,}/g, '\n\n\n')
            .replace(/([。！？])\s*\n\s*\n\s*([^\n])/g, '$1\n\n$2')
            .replace(/\s+([，。！？；：、」』）])/g, '$1')
            .replace(/([「『（])\s+/g, '$1')
            .replace(/\*\*/g, '')
            .replace(/\.{3,}/g, '…')
            .replace(/。{3,}/g, '…')
            .replace(/\s+$/gm, '')
            .replace(/([。！？])\s*([^\n])/g, '$1\n$2')
            .replace(/\n{2,}/g, '\n\n')
            .trim();
    },

    showToast(message, duration = 3000) {
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
            }, duration);
        }
    }
};

// Storage Manager
const storage = {
    getArticles() {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveArticle(article) {
        const articles = this.getArticles();
        articles.unshift(article);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(articles));
    },

    getArticle(id) {
        const articles = this.getArticles();
        return articles.find(article => article.id === id);
    },

    deleteArticle(id) {
        const articles = this.getArticles();
        const filtered = articles.filter(article => article.id !== id);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(filtered));
    }
};
