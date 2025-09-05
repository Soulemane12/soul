export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  reasoning?: string;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  mode: 'regular' | 'reasoning';
  webSearch: boolean;
  browserSearch: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroqModel {
  id: string;
  name: string;
  description: string;
  supportsReasoning: boolean;
  supportsWebSearch: boolean;
  supportsBrowserSearch: boolean;
  maxTokens: number;
}

export interface ChatCompletionRequest {
  messages: Message[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  reasoningFormat?: 'parsed' | 'raw' | 'hidden';
  includeReasoning?: boolean;
  reasoningEffort?: 'none' | 'default' | 'low' | 'medium' | 'high';
  webSearch?: boolean;
  browserSearch?: boolean;
  searchSettings?: {
    excludeDomains?: string[];
    includeDomains?: string[];
    country?: string;
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      reasoning?: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
