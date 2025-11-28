# AI 文章創作器 ✨

智能文章創作工具，以參考素材為基礎，讓 AI 創作全新文章。

## 快速開始

1. 開啟 `index.html` 檔案
2. 在三個輸入欄位中貼上參考素材
3. 點擊「AI 創作文章」按鈕
4. 等待 AI 處理完成
5. 查看、複製或下載創作的文章

## 主要功能

- ✨ **AI 智能創作**：不只是合併，而是真正的創作
- 🔄 **自由重組**：AI 可以自由調整素材順序和結構
- ✍️ **改寫擴展**：刪減、改寫、補充內容
- 🈯 **繁體中文**：自動轉換為繁體中文
- 📝 **標點整理**：清理和標準化標點符號
- 💾 **文章管理**：儲存、查看、刪除已創作的文章
- 🎨 **優雅介面**：簡潔美觀的設計

## 與「文章合併器」的差異

### 文章合併器（原版）
- 按照順序合併文章 1 → 2 → 3
- 在段落之間補充過渡內容
- 保持原始素材的順序

### AI 文章創作器（新版）
- 將素材視為「參考資料」
- AI 可以自由重組順序
- 大幅改寫和擴展內容
- 創作出全新的文章

## 技術架構

- **前端**：HTML, CSS, JavaScript (Vanilla)
- **AI 模型**：Google Gemini 3 Pro
- **儲存**：localStorage（瀏覽器本地儲存）

## 檔案說明

- `index.html` - 首頁（素材輸入和文章列表）
- `article.html` - 文章詳情頁
- `styles.css` - 樣式表
- `config.js` - 配置和工具函數
- `creator.js` - AI 創作邏輯
- `app.js` - 首頁互動邏輯
- `article.js` - 文章詳情頁邏輯
- `s2t.js` - 簡繁轉換

## API 配置

### 首次使用設定

1. 複製 `config.local.example.js` 並重新命名為 `config.local.js`
2. 在 `config.local.js` 中填入您的 Gemini API 金鑰：

```javascript
const LOCAL_CONFIG = {
    GEMINI_API_KEY: '你的 API 金鑰'
};
```

3. 取得 API 金鑰：https://aistudio.google.com/app/apikey

### 更換模型

如需使用不同的 Gemini 模型，請修改 `config.js` 中的：

```javascript
GEMINI_MODEL: 'gemini-3-pro',  // 改成其他模型名稱
```

### 安全性說明

- `config.local.js` 包含您的私密 API 金鑰，已加入 `.gitignore`
- **請勿將 `config.local.js` 上傳到 Git 或分享給他人**
- 分享專案時，請提供 `config.local.example.js` 作為範例

## 使用說明

### 創作文章

1. 在三個欄位中輸入參考素材
2. 點擊「AI 創作文章」按鈕
3. AI 會自動：
   - 分析所有素材內容
   - 自由重組和調整順序
   - 改寫和擴展內容
   - 轉換為繁體中文
   - 整理標點符號

### 管理文章

- **查看**：點擊文章卡片
- **複製**：在文章詳情頁點擊「複製全文」
- **下載**：點擊「下載文章」儲存為 .txt 檔
- **刪除**：點擊文章卡片上的 🗑️ 圖示

## 注意事項

- 文章儲存在瀏覽器 localStorage，清除瀏覽器資料會遺失
- AI 處理需要較長時間（約 30-60 秒），請耐心等待
- 建議每段素材 100-500 字效果最佳
- 需要網路連線才能使用 AI 功能
- AI 會創作約 10000 字的文章（會在參考素材基礎上大量補充內容）

### 技術架構細節

- **AI 模型**：Google Gemini 3 Pro
- **API 端點**：`https://generativelanguage.googleapis.com/v1beta/models/`
- **最大輸出 Token**：65536 tokens（約支援 10000 字輸出）
- **生成參數**：
  - Temperature: 0.8（提高創造性）
  - Top K: 40
  - Top P: 0.95
- **簡繁轉換**：使用內建的 s2t.js 進行簡體轉繁體
- **標點處理**：自動轉換為全形標點符號（，。！？；：「」『』（））

## 瀏覽器支援

- ✅ Chrome / Edge
- ✅ Firefox
- ✅ Safari

## 授權

此專案僅供個人使用。

---

Made with ✨ by AI Article Creator
