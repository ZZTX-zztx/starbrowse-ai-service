export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (path === '/api/ai/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    if (path === '/api/ai/translate' && request.method === 'POST') {
      return handleTranslate(request, env);
    }

    if (path === '/api/ai/summarize' && request.method === 'POST') {
      return handleSummarize(request, env);
    }

    if (path === '/api/ai/question' && request.method === 'POST') {
      return handleQuestion(request, env);
    }

    if (path === '/api/ai/clear' && request.method === 'POST') {
      return handleClear(request, env);
    }

    if (path === '/api/ai/health' && request.method === 'GET') {
      return handleHealth();
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function handleChat(request, env) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message) {
      return jsonResponse({ error: '消息不能为空' }, 400);
    }

    const messages = [
      ...history,
      { role: 'user', content: message }
    ];

    const response = await env.AI.run(env.AI_MODEL, {
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const assistantMessage = response.response || response.result?.response || '';

    return jsonResponse({
      response: assistantMessage,
      history: [
        ...messages,
        { role: 'assistant', content: assistantMessage }
      ]
    });
  } catch (error) {
    return jsonResponse({ error: `AI服务错误: ${error.message}` }, 500);
  }
}

async function handleTranslate(request, env) {
  try {
    const body = await request.json();
    const { text, target_language = '中文' } = body;

    if (!text) {
      return jsonResponse({ error: '文本不能为空' }, 400);
    }

    const messages = [
      { role: 'system', content: `你是一个专业的翻译助手。请将用户提供的文本翻译成${target_language}。只返回翻译结果，不要添加任何解释。` },
      { role: 'user', content: text }
    ];

    const response = await env.AI.run(env.AI_MODEL, {
      messages,
      temperature: 0.3,
      max_tokens: 512,
    });

    return jsonResponse({
      translation: response.response || response.result?.response || ''
    });
  } catch (error) {
    return jsonResponse({ error: `翻译服务错误: ${error.message}` }, 500);
  }
}

async function handleSummarize(request, env) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return jsonResponse({ error: '文本不能为空' }, 400);
    }

    const messages = [
      { role: 'system', content: '你是一个文本总结助手。请用简洁的语言总结用户提供的文本，提取关键信息。' },
      { role: 'user', content: text }
    ];

    const response = await env.AI.run(env.AI_MODEL, {
      messages,
      temperature: 0.5,
      max_tokens: 512,
    });

    return jsonResponse({
      summary: response.response || response.result?.response || ''
    });
  } catch (error) {
    return jsonResponse({ error: `总结服务错误: ${error.message}` }, 500);
  }
}

async function handleQuestion(request, env) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question) {
      return jsonResponse({ error: '问题不能为空' }, 400);
    }

    const messages = [
      { role: 'system', content: '你是一个智能助手，请尽可能准确和详细地回答用户的问题。' },
      { role: 'user', content: question }
    ];

    const response = await env.AI.run(env.AI_MODEL, {
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return jsonResponse({
      answer: response.response || response.result?.response || ''
    });
  } catch (error) {
    return jsonResponse({ error: `问答服务错误: ${error.message}` }, 500);
  }
}

async function handleClear(request, env) {
  return jsonResponse({
    status: 'success',
    message: '对话历史已清除'
  });
}

async function handleHealth() {
  return jsonResponse({
    status: 'running',
    service: 'Cloudflare AI Server',
    enabled: true
  });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}