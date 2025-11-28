// AI Article Merger Logic - Expands paragraphs with AI-generated content

const creator = {
    // Main merge function
    async mergeArticles(article1, article2, article3) {
        try {
            console.log('🎨 開始 AI 合併文章...');
            console.log('📝 USE_AI_CREATION:', CONFIG.USE_AI_CREATION);
            console.log('🔑 API Key 已設定:', CONFIG.GEMINI_API_KEY ? '是' : '否');

            // Use AI merge if enabled and API key is available
            if (CONFIG.USE_AI_CREATION && CONFIG.GEMINI_API_KEY) {
                console.log('✅ 使用 AI 合併模式');
                return await this.aiMerge(article1, article2, article3);
            } else {
                console.log('⚠️ 使用簡單合併模式（未啟用 AI 或缺少 API Key）');
                return this.simpleMerge(article1, article2, article3);
            }
        } catch (error) {
            console.error('Merge error:', error);
            throw new Error('合併文章時發生錯誤：' + error.message);
        }
    },

    // AI-powered merge using Gemini API with paragraph expansion
    async aiMerge(article1, article2, article3) {
        console.log('🚀 調用 Gemini API...');

        //Build articles list
        const articles = [article1, article2, article3].filter(a => a && a.trim());

        let articlesText = articles.map((article, index) =>
            `【文章 ${index + 1}】（共 ${article.length} 字）\n${article}`
        ).join('\n\n---\n\n');

        const prompt = `你是一位專業的繁體中文文章編輯。我會提供 ${articles.length} 篇文章，請你將它們合併成一篇邏輯連貫、內容豐富的長文。

**🎯 核心要求**：

1. **段落擴寫（重點！）**：
   - 對每篇文章的每個段落進行擴寫
   - 在每個段落之間增加 50-2000 字的補充內容
   - 補充的內容要與原段落主題相關，提供更多細節、例子、或深入分析
   - 使文章更加豐富和完整

2. **文章銜接**：
   - 在文章與文章之間添加過渡段落
   - 確保整體邏輯流暢、主題連貫

3. **字數要求**：
   - 最終合併後的文章要達到約 10000 字
   - 透過段落擴寫和添加過渡內容來達到字數

4. **輸出格式**（重要！）：
   請用以下 JSON 格式輸出，讓我能標記哪些是原文（藍色）、哪些是新增（紅色）：

\`\`\`json
{
  "title": "為這篇合併文章生成一個10-20字的濃縮標題",
  "segments": [
    {
      "text": "原文段落（可能稍作潤飾）...",
      "type": "modified",
      "source": 1
    },
    {
      "text": "擴寫的補充內容（50-2000字）...",
      "type": "generated"
    },
    {
      "text": "原文下一段落...",
      "type": "modified",
      "source": 1
    },
    {
      "text": "又一段擴寫內容...",
      "type": "generated"
    },
    ...
  ]
}
\`\`\`

segment 的 type 說明：
- "modified": 從原文修改/潤飾而來的部分（會標記為藍色）
- "generated": AI 新增的擴寫/連接文字（會標記為紅色）

**文字處理要求**：

5. **簡體轉繁體**：將所有簡體字轉換為繁體字（100% 轉換）

6. **標點符號統一**：
   - 必須使用全形標點：，。！？；：「」『』（）
   - 絕對不要使用半形標點

7. **分段與排版**：
   - 段落之間用 \\n\\n 分隔
   - 確保閱讀體驗良好

**重要提醒**：
- 每個段落之間都要增加補充內容
- 補充內容要充實、有意義，不是單純湊字數
- 保持整體邏輯連貫和主題一致
- **最重要：文章必須達到 10000 字，請充分發揮創作能力**

---

${articlesText}

---

現在請開始創作，輸出完整的 JSON 格式合併文章：`;

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
                            temperature: 0.8,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 65536,
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
            const responseText = data.candidates[0].content.parts[0].text;

            console.log('✅ AI 合併成功！');

            // Parse JSON response
            let mergedData;
            try {
                // Try to extract JSON from markdown code block
                const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                    responseText.match(/```\s*([\s\S]*?)\s*```/);
                const jsonText = jsonMatch ? jsonMatch[1] : responseText;
                mergedData = JSON.parse(jsonText);
            } catch (parseError) {
                console.warn('⚠️ JSON 解析失敗，使用簡單合併');
                return this.simpleMerge(article1, article2, article3);
            }

            // Build plain text from segments
            const plainText = mergedData.segments.map(seg => seg.text).join('');

            console.log('📊 合併字數:', plainText.length);
            console.log('📑 標題:', mergedData.title);

            return {
                plainText: plainText,
                segments: mergedData.segments,
                title: mergedData.title
            };

        } catch (error) {
            console.error('❌ AI merge error:', error);
            console.warn('⚠️ AI 合併失敗，使用簡單合併模式');
            return this.simpleMerge(article1, article2, article3);
        }
    },

    // Simple concatenation without AI
    simpleMerge(article1, article2, article3) {
        console.log('📝 使用簡單合併模式');
        const articles = [article1, article2, article3].filter(a => a && a.trim());

        const segments = [];
        articles.forEach((article, index) => {
            if (index > 0) {
                segments.push({
                    text: '\n\n',
                    type: 'generated'
                });
            }
            segments.push({
                text: article,
                type: 'original',
                source: index + 1
            });
        });

        const plainText = segments.map(seg => seg.text).join('');

        return {
            plainText: plainText,
            segments: segments,
            title: utils.generateTitle(plainText)
        };
    },

    // Generate AI title for the merged article
    async generateTitle(mergedResult) {
        // If merge result is an object and already has a title, use it
        if (mergedResult && typeof mergedResult === 'object' && mergedResult.title) {
            return mergedResult.title;
        }

        // Get the text content
        let textContent;
        if (typeof mergedResult === 'string') {
            textContent = mergedResult;
        } else if (mergedResult && mergedResult.plainText) {
            textContent = mergedResult.plainText;
        } else {
            return '未命名文章';
        }

        // Try to generate AI title
        if (!CONFIG.USE_AI_CREATION || !CONFIG.GEMINI_API_KEY) {
            return utils.generateTitle(textContent);
        }

        try {
            const preview = textContent.substring(0, 1000);

            const prompt = `請為以下文章生成一個10-20字的濃縮標題，要能概括文章主旨：

${preview}...

只輸出標題，不要其他內容：`;

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
                            temperature: 0.7,
                            topK: 20,
                            topP: 0.9,
                            maxOutputTokens: 100,
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Title generation failed');
            }

            const data = await response.json();
            const title = data.candidates[0].content.parts[0].text.trim();

            // Limit title length
            return title.substring(0, CONFIG.TITLE_MAX_LENGTH);

        } catch (error) {
            console.error('Title generation error:', error);
            return utils.generateTitle(textContent);
        }
    }
};
