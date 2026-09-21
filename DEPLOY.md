# StarBrowser AI 服务部署指南

## 概述

StarBrowser 集成了基于 Cloudflare Workers AI 的智能助手功能，包括：
- 💬 智能对话
- 🌐 文本翻译
- 📝 内容总结
- ❓ 问答助手

## 架构说明

```
StarBrowser (PyQt6浏览器)
    ↓ HTTP请求
AI 对话框 (ai_dialog.py)
    ↓ HTTP请求
Cloudflare Workers AI (worker.js)
    ↓ AI模型调用
Cloudflare AI (@cf/meta/llama-3-8b-instruct)
```

## 部署步骤

### 1. 安装 Node.js

确保已安装 Node.js (v18+)
下载地址: https://nodejs.org/

### 2. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 3. 配置 Cloudflare 账号

1. 注册 Cloudflare 账号: https://dash.cloudflare.com/
2. 登录 Wrangler:
   ```bash
   wrangler login
   ```

### 4. 本地开发测试

```bash
wrangler dev
```

服务将在 `http://localhost:8787` 启动

### 5. 部署到 Cloudflare

```bash
wrangler deploy
```

部署成功后会获得一个 `*.workers.dev` 域名

### 6. 配置浏览器 AI 服务地址

在 `ai_dialog.py` 中修改 `ai_api_url`:

```python
self.ai_api_url = "https://your-worker.your-subdomain.workers.dev/api/ai/chat"
```

## 配置文件

使用 `wrangler.jsonc` 配置文件（支持注释的 JSON 格式）

示例配置：
```jsonc
{
  "name": "starbrowser-ai-service",
  "main": "worker.js",
  "compatibility_date": "2024-01-01",
  
  // AI 绑定配置
  "ai": {
    "binding": "AI"
  },
  
  // 环境变量
  "vars": {
    "AI_MODEL": "@cf/meta/llama-3-8b-instruct"
  }
}
```

## 本地开发

### 启动 AI 服务

```bash
start_ai_server.bat
```

或直接运行:

```bash
cd AI
wrangler dev
```

### 启动浏览器

```bash
python main.py
```

## API 接口

### 对话接口
- **URL**: `POST /api/ai/chat`
- **请求**:
```json
{
  "message": "你好",
  "history": []
}
```
- **响应**:
```json
{
  "response": "你好！有什么可以帮助你的？",
  "history": [...]
}
```

### 翻译接口
- **URL**: `POST /api/ai/translate`
- **请求**:
```json
{
  "text": "Hello World",
  "target_language": "中文"
}
```
- **响应**:
```json
{
  "translation": "你好世界"
}
```

### 总结接口
- **URL**: `POST /api/ai/summarize`
- **请求**:
```json
{
  "text": "长文本内容..."
}
```
- **响应**:
```json
{
  "summary": "总结内容..."
}
```

### 问答接口
- **URL**: `POST /api/ai/question`
- **请求**:
```json
{
  "question": "什么是人工智能？"
}
```
- **响应**:
```json
{
  "answer": "人工智能是..."
}
```

## 快捷键

- **Ctrl+I**: 打开 AI 助手

## 免费额度

Cloudflare Workers AI 提供免费额度:
- 每天 10,000 次推理
- 适合个人使用

## 常见问题

### Q: 部署失败怎么办？
A: 检查 `wrangler login` 是否成功，配置文件是否正确

### Q: AI 响应慢？
A: Cloudflare AI 使用全球网络，首次响应可能较慢，后续会缓存

### Q: 如何更换 AI 模型？
A: 修改 `wrangler.jsonc` 中的 `AI_MODEL` 变量

## 技术支持

如有问题，请在 StarBrowser 中使用反馈功能联系我们。