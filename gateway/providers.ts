export interface AIProviderConfig {
  id: "openai" | "anthropic" | "gemini" | "groq" | "deepseek";
  name: string;
  logo: string;
  baseUrl: string;
  defaultModel: string;
  supportedModels: string[];
  retailRatePer1kTokens: number;
  testEndpoint: string;
}

export const SUPPORTED_PROVIDERS: Record<string, AIProviderConfig> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    logo: "openai",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    supportedModels: ["gpt-4o", "gpt-4o-mini", "o1-preview", "o1-mini", "gpt-4-turbo"],
    retailRatePer1kTokens: 0.005,
    testEndpoint: "https://api.openai.com/v1/models"
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic Claude",
    logo: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-sonnet-20241022",
    supportedModels: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307", "claude-3-opus-20240229"],
    retailRatePer1kTokens: 0.006,
    testEndpoint: "https://api.anthropic.com/v1/models"
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    logo: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-1.5-pro",
    supportedModels: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
    retailRatePer1kTokens: 0.0035,
    testEndpoint: "https://generativelanguage.googleapis.com/v1beta/models"
  },
  groq: {
    id: "groq",
    name: "Groq Cloud",
    logo: "groq",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    supportedModels: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    retailRatePer1kTokens: 0.0007,
    testEndpoint: "https://api.groq.com/openai/v1/models"
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    logo: "deepseek",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    supportedModels: ["deepseek-chat", "deepseek-reasoner"],
    retailRatePer1kTokens: 0.00028,
    testEndpoint: "https://api.deepseek.com/v1/models"
  }
};