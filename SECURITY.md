# 🔐 API 金鑰安全檢查清單

## ✅ 已完成的保護措施

1. **`.gitignore` 設定**
   - ✅ `config.local.js` 已加入 `.gitignore`
   - ✅ 所有 `.env` 檔案已加入 `.gitignore`
   - ✅ 已驗證 Git 會忽略這些檔案

2. **範例檔案**
   - ✅ 提供 `config.local.example.js` 作為範例
   - ✅ 範例檔案不包含真實金鑰

## 🛡️ 額外安全建議

### 發布前檢查

在每次 `git push` 之前，執行以下命令確認：

```bash
# 檢查哪些檔案會被提交
git status

# 檢查 config.local.js 是否被忽略
git check-ignore -v config.local.js

# 查看即將提交的內容
git diff --cached
```

### 如果不小心提交了金鑰

如果 `config.local.js` 已經被提交到 Git 歷史記錄中：

1. **立即撤銷 API 金鑰**
   - 前往 https://aistudio.google.com/app/apikey
   - 刪除舊的 API 金鑰
   - 生成新的 API 金鑰

2. **從 Git 歷史中移除**
   ```bash
   # 從 Git 歷史中完全移除檔案
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch config.local.js" \
     --prune-empty --tag-name-filter cat -- --all
   
   # 強制推送（危險操作！）
   git push origin --force --all
   ```

3. **使用 BFG Repo-Cleaner（更簡單）**
   ```bash
   # 下載 BFG: https://rtyley.github.io/bfg-repo-cleaner/
   bfg --delete-files config.local.js
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

### 驗證方法

```bash
# 搜尋 Git 歷史中是否有 API 金鑰
git log -p -S "AIzaSy" --all

# 檢查遠端倉庫
git ls-remote --heads origin
```

## 🔍 持續監控

- 定期檢查 GitHub/GitLab 的 Security Alerts
- 使用 `git-secrets` 工具防止意外提交
- 考慮使用 pre-commit hooks

## 📞 緊急聯絡

如果發現金鑰外洩：
1. 立即撤銷 API 金鑰
2. 檢查 API 使用記錄
3. 生成新的金鑰
4. 清理 Git 歷史記錄
