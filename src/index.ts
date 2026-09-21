/**
 * StarBrowser AI Service
 * 
 * 纯后端 API 服务，为 StarBrowser 提供 AI 功能
 * 支持对话、翻译、总结、问答等功能
 */

import { Env, ChatMessage } from "./types";

// AI 模型配置
const MODEL_ID = "@cf/meta/llama-3.1-8b-instruct-fp8";

// 默认系统提示词
const SYSTEM_PROMPTS = {
  chat: "你是一个 helpful、friendly 的助手。提供简洁准确的回答。",
  translate: (targetLang: string) => `你是一个专业的翻译助手。请将用户提供的文本翻译成${targetLang}。只返回翻译结果，不要添加任何解释。`,
  summarize: "你是一个文本总结助手。请用简洁的语言总结用户提供的文本，提取关键信息。",
  question: "你是一个智能助手，请尽可能准确和详细地回答用户的问题。"
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 处理 CORS 预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: getCORSHeaders(),
      });
    }

    // 对话接口
    if (path === "/api/ai/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    // 翻译接口
    if (path === "/api/ai/translate" && request.method === "POST") {
      return handleTranslate(request, env);
    }

    // 总结接口
    if (path === "/api/ai/summarize" && request.method === "POST") {
      return handleSummarize(request, env);
    }

    // 问答接口
    if (path === "/api/ai/question" && request.method === "POST") {
      return handleQuestion(request, env);
    }

    // 清除历史
    if (path === "/api/ai/clear" && request.method === "POST") {
      return handleClear(request, env);
    }

    // 健康检查
    if (path === "/api/ai/health" && request.method === "GET") {
      return handleHealth();
    }

    // 版本信息接口
    if (path === "/api/vars/win" && request.method === "GET") {
      return handleVarsRequest(env, "win");
    }

    if (path === "/api/vars/app" && request.method === "GET") {
      return handleVarsRequest(env, "app");
    }

    // 404
    return new Response("Not Found", { 
      status: 404,
      headers: getCORSHeaders()
    });
  },
} satisfies ExportedHandler<Env>;

/**
 * 对话接口
 */
async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const { messages = [], message } = await request.json() as {
      messages?: ChatMessage[];
      message?: string;
    };

    // 支持单条消息或消息历史
    let chatMessages: ChatMessage[] = [...messages];
    
    if (message && messages.length === 0) {
      chatMessages.push({ role: "user", content: message });
    }

    if (chatMessages.length === 0) {
      return jsonResponse({ error: "消息不能为空" }, 400);
    }

    // 添加系统提示词
    if (!chatMessages.some(msg => msg.role === "system")) {
      chatMessages.unshift({ role: "system", content: SYSTEM_PROMPTS.chat });
    }

    const inputs = {
      messages: chatMessages,
      max_tokens: 1024,
      stream: true,
    };

    const stream = await env.AI.run(MODEL_ID, inputs);

    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache",
        "connection": "keep-alive",
        ...getCORSHeaders(),
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return jsonResponse({ error: "AI 服务错误" }, 500);
  }
}

/**
 * 翻译接口
 */
async function handleTranslate(request: Request, env: Env): Promise<Response> {
  try {
    const { text, target_language = "中文" } = await request.json() as {
      text: string;
      target_language?: string;
    };

    if (!text) {
      return jsonResponse({ error: "文本不能为空" }, 400);
    }

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPTS.translate(target_language) },
      { role: "user", content: text }
    ];

    const response = await env.AI.run(MODEL_ID, {
      messages,
      max_tokens: 512,
    });

    return jsonResponse({
      translation: response.response || ""
    });
  } catch (error) {
    console.error("Translate error:", error);
    return jsonResponse({ error: "翻译服务错误" }, 500);
  }
}

/**
 * 总结接口
 */
async function handleSummarize(request: Request, env: Env): Promise<Response> {
  try {
    const { text } = await request.json() as { text: string };

    if (!text) {
      return jsonResponse({ error: "文本不能为空" }, 400);
    }

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPTS.summarize },
      { role: "user", content: text }
    ];

    const response = await env.AI.run(MODEL_ID, {
      messages,
      max_tokens: 512,
    });

    return jsonResponse({
      summary: response.response || ""
    });
  } catch (error) {
    console.error("Summarize error:", error);
    return jsonResponse({ error: "总结服务错误" }, 500);
  }
}

/**
 * 问答接口
 */
async function handleQuestion(request: Request, env: Env): Promise<Response> {
  try {
    const { question } = await request.json() as { question: string };

    if (!question) {
      return jsonResponse({ error: "问题不能为空" }, 400);
    }

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPTS.question },
      { role: "user", content: question }
    ];

    const response = await env.AI.run(MODEL_ID, {
      messages,
      max_tokens: 1024,
    });

    return jsonResponse({
      answer: response.response || ""
    });
  } catch (error) {
    console.error("Question error:", error);
    return jsonResponse({ error: "问答服务错误" }, 500);
  }
}

/**
 * 清除历史
 */
async function handleClear(request: Request, env: Env): Promise<Response> {
  return jsonResponse({
    status: "success",
    message: "对话历史已清除"
  });
}

/**
 * 健康检查
 */
function handleHealth(): Response {
  return jsonResponse({
    status: "running",
    service: "StarBrowser AI Server",
    enabled: true
  });
}

/**
 * 版本信息接口
 */
function handleVarsRequest(env: Env, platform: "app" | "win"): Response {
  if (platform === "win") {
    return jsonResponse({
      WIN_VERSION_CODE: env.WIN_VERSION_CODE ?? "1",
      WIN_VERSION_NAME: env.WIN_VERSION_NAME ?? "1.0",
      WIN_DOWNLOAD_URL: env.WIN_DOWNLOAD_URL ?? "",
      WIN_CHANGELOG: env.WIN_CHANGELOG ?? "",
      WIN_FORCE_UPDATE: env.WIN_FORCE_UPDATE ?? "false",
    });
  }

  return jsonResponse({
    APP_VERSION_CODE: env.APP_VERSION_CODE ?? "1",
    APP_VERSION_NAME: env.APP_VERSION_NAME ?? "1.0",
    APP_DOWNLOAD_URL: env.APP_DOWNLOAD_URL ?? "",
    APP_CHANGELOG: env.APP_CHANGELOG ?? "",
    APP_FORCE_UPDATE: env.APP_FORCE_UPDATE ?? "false",
    APP_MIN_SDK: env.APP_MIN_SDK ?? "24",
  });
}

/**
 * 辅助函数：返回 JSON 响应
 */
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-cache",
      ...getCORSHeaders(),
    },
  });
}

/**
 * CORS 头
 */
function getCORSHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}