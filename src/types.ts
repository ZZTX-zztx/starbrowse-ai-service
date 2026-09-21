/**
 * StarBrowser AI Service 类型定义
 */

export interface Env {
  /**
   * Workers AI API 绑定
   */
  AI: Ai;

  /**
   * KV 命名空间（用于存储对话历史）
   */
  CHAT_KV: KVNamespace;

  /**
   * 可选 API 密钥
   */
  API_KEY: string;

  /**
   * Android 版本号
   */
  APP_VERSION_CODE: string;

  /**
   * Android 版本名称
   */
  APP_VERSION_NAME: string;

  /**
   * Android 下载链接
   */
  APP_DOWNLOAD_URL: string;

  /**
   * Android 更新日志
   */
  APP_CHANGELOG: string;

  /**
   * Android 是否强制更新
   */
  APP_FORCE_UPDATE: string;

  /**
   * Android 最低 SDK 版本
   */
  APP_MIN_SDK: string;

  /**
   * Windows 版本号
   */
  WIN_VERSION_CODE: string;

  /**
   * Windows 版本名称
   */
  WIN_VERSION_NAME: string;

  /**
   * Windows 下载链接
   */
  WIN_DOWNLOAD_URL: string;

  /**
   * Windows 更新日志
   */
  WIN_CHANGELOG: string;

  /**
   * Windows 是否强制更新
   */
  WIN_FORCE_UPDATE: string;
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}