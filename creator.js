// AI Article Creator Logic - Treats materials as reference sources

const creator = {
    // Main creation function
    async createArticle(material1, material2, material3) {
        try {
            console.log('🎨 開始 AI 創作...');
            console.log('📝 USE_AI_CREATION:', CONFIG.USE_AI_CREATION);
            console.log('🔑 API Key 已設定:', CONFIG.GEMINI_API_KEY ? '是' : '否');

            // Use AI creation if enabled and API key is available
            if (CONFIG.USE_AI_CREATION && CONFIG.GEMINI_API_KEY) {
                console.log('✅ 使用 AI 創作模式');
                return await this.aiCreate(material1, material2, material3);
            } else {
                console.log('⚠️ 使用簡單合併模式（未啟用 AI 或缺少 API Key）');
                return this.simpleCreate(material1, material2, material3);
            }
        } catch (error) {
            console.error('Creation error:', error);
            throw new Error('創作文章時發生錯誤：' + error.message);
        }
    },

    // AI-powered creation using Gemini API
    async aiCreate(material1, material2, material3) {
        console.log('🚀 調用 Gemini API...');

        // Build materials list
        let materialsText = `參考素材一：\n${material1}\n\n參考素材二：\n${material2}`;
        if (material3 && material3.trim()) {
            materialsText += `\n\n參考素材三：\n${material3}`;
        }

        const prompt = `你是一位專業的繁體中文文章創作者和編輯。我會提供 2-3 段參考素材，請你以這些素材為基礎，創作一篇全新的文章。

**🎯 核心要求：文章必須達到 10000 字**

**核心任務**：

1. **自由重組內容**：
   - 你可以自由決定使用哪些素材的哪些部分
   - 順序不必按照素材一、二、三的順序
   - 可以先用素材二的內容，再用素材一的，完全自由


2. **改寫與刪減**：
   - 大幅改寫素材內容，使其更流暢、更有邏輯
   - 刪除重複或不必要的內容

   - 可以合併相似的觀點
   - 可以調整語氣和風格，使其統一

3. **大量補充與擴展（重點！）**：
   - **文章總字數必須達到 10000 字**
   - **字數必須達到 10000 字（這是硬性要求）**
   - 讀起來應該像是原創作品，而非單純的素材拼接
   - 內容豐富、情節完整、描寫細膩

**文字處理要求**：

5. **簡體轉繁體**：將所有簡體字轉換為繁體字（100% 轉換）

6. **標點符號統一**：
   - 必須使用全形標點：，。！？；：「」『』（）
   - 絕對不要使用半形標點

7. **分段與排版**：
   - 段落之間空一行
   - 確保閱讀體驗良好

**重要提醒**：
- 不要只是把三段素材依序排列
- 要真正「創作」一篇新文章
- 可以大膽調整順序和內容

- 保持邏輯連貫和主題一致
- **最重要：文章必須達到 10000 字，請充分發揮創作能力，補充大量細節和內容**

---

${materialsText}

---

現在請開始創作，輸出完整的 10000 字新文章：`;

        try {
            const response = await fetch(
                `${CONFIG.GEMINI_API_URL}${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.8,  // 提高創造性
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: CONFIG.MAX_OUTPUT_TOKENS,
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ API 錯誤:', errorData);
                throw new Error(`API 錯誤: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const createdText = data.candidates[0].content.parts[0].text;

            console.log('✅ AI 創作成功！');
            console.log('📊 創作字數:', createdText.length);

            return createdText.trim();
        } catch (error) {
            console.error('❌ AI creation error:', error);
            console.warn('⚠️ AI 創作失敗，使用簡單合併模式');
            return this.simpleCreate(material1, material2, material3);
        }
    },

    // Simple concatenation without AI
    simpleCreate(material1, material2, material3) {
        console.log('📝 使用簡單合併模式');
        const m1 = material1.trim();
        const m2 = material2.trim();
        const m3 = material3 ? material3.trim() : '';

        if (m3) {
            return `${m1}\n\n${m2}\n\n${m3}`;
        } else {
            return `${m1}\n\n${m2}`;
        }
    },

    // Validate materials before creation
    validateMaterials(material1, material2, material3) {
        if (!material1 || !material1.trim()) {
            throw new Error('請至少填寫參考素材一');
        }

        if (!material2 || !material2.trim()) {
            throw new Error('請至少填寫參考素材二');
        }

        return true;
    }
};
