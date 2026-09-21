# StarBrowser AI 服务

基于 Cloudflare Workers AI 的后端 API 服务

## 部署步骤

### 1. 安装 Wrangler CLI
```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare
```bash
wrangler login
```

### 3. 创建 KV 命名空间
```bash
wrangler kv:namespace create CHAT_KV
```
将返回的 ID 填入 `wrangler.jsonc` 中的 `kv_namespaces[0].id`

### 4. 本地开发测试
```bash
wrangler dev
```

服务将在 `http://localhost:8787` 启动

### 5. 部署到 Cloudflare
```bash
wrangler deploy
```

## API 接口

### 对话（SSE 流式响应）
- **POST** `/api/ai/chat`
- 请求体: `{ "message": "你好", "history": [] }`
- 响应: SSE 流式响应

### 翻译
- **POST** `/api/ai/translate`
- 请求体: `{ "text": "Hello", "target_language": "中文" }`
- 响应: `{ "translation": "你好" }`

### 总结
- **POST** `/api/ai/summarize`
- 请求体: `{ "text": "长文本..." }`
- 响应: `{ "summary": "总结..." }`

### 问答
- **POST** `/api/ai/question`
- 请求体: `{ "question": "什么是AI?" }`
- 响应: `{ "answer": "..." }`

### 清除历史
- **POST** `/api/ai/clear`

### 健康检查
- **GET** `/api/ai/health`

### 版本信息
- **GET** `/api/vars/win` - Windows 版本信息
- **GET** `/api/vars/app` - Android 版本信息