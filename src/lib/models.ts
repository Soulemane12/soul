import { GroqModel } from '@/types';

export const GROQ_MODELS: GroqModel[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    description: 'High-performance model for general-purpose tasks',
    supportsReasoning: false,
    supportsWebSearch: false,
    supportsBrowserSearch: false,
    maxTokens: 8192,
  },
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B Versatile',
    description: 'Versatile model for various applications',
    supportsReasoning: false,
    supportsWebSearch: false,
    supportsBrowserSearch: false,
    maxTokens: 8192,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    description: 'Fast, lightweight model for quick responses',
    supportsReasoning: false,
    supportsWebSearch: false,
    supportsBrowserSearch: false,
    maxTokens: 8192,
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    description: 'Mixture of experts model with large context',
    supportsReasoning: false,
    supportsWebSearch: false,
    supportsBrowserSearch: false,
    maxTokens: 32768,
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B IT',
    description: 'Instruction-tuned model for conversations',
    supportsReasoning: false,
    supportsWebSearch: false,
    supportsBrowserSearch: false,
    maxTokens: 8192,
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    description: 'Reasoning model with step-by-step analysis',
    supportsReasoning: true,
    supportsWebSearch: false,
    supportsBrowserSearch: true,
    maxTokens: 8192,
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B',
    description: 'Advanced reasoning model for complex problems',
    supportsReasoning: true,
    supportsWebSearch: false,
    supportsBrowserSearch: true,
    maxTokens: 8192,
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen 3 32B',
    description: 'Multilingual reasoning model',
    supportsReasoning: true,
    supportsWebSearch: false,
    supportsBrowserSearch: false,
    maxTokens: 8192,
  },
  {
    id: 'groq/compound',
    name: 'Compound',
    description: 'Advanced system with web search capabilities',
    supportsReasoning: false,
    supportsWebSearch: true,
    supportsBrowserSearch: false,
    maxTokens: 8192,
  },
  {
    id: 'groq/compound-mini',
    name: 'Compound Mini',
    description: 'Lightweight system with web search',
    supportsReasoning: false,
    supportsWebSearch: true,
    supportsBrowserSearch: false,
    maxTokens: 8192,
  },
];

export function getModelById(id: string): GroqModel | undefined {
  return GROQ_MODELS.find(model => model.id === id);
}

export function getModelsByCapability(capability: 'reasoning' | 'webSearch' | 'browserSearch'): GroqModel[] {
  return GROQ_MODELS.filter(model => {
    switch (capability) {
      case 'reasoning':
        return model.supportsReasoning;
      case 'webSearch':
        return model.supportsWebSearch;
      case 'browserSearch':
        return model.supportsBrowserSearch;
      default:
        return false;
    }
  });
}
