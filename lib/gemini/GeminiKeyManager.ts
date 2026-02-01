import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

/**
 * GeminiKeyManager - A fallback system for managing multiple Gemini API keys
 *
 * Features:
 * - Parses comma-separated API keys from environment variable
 * - Randomly selects a key for each request
 * - Automatically falls back to other keys on 429 (rate limit) errors
 * - Maintains key state during a single request cycle
 */
export class GeminiKeyManager {
  private keys: string[];
  private modelName: string;

  constructor(
    apiKeysEnv: string | undefined,
    modelName: string = 'gemini-3-flash-preview',
  ) {
    this.modelName = modelName;

    if (!apiKeysEnv) {
      this.keys = [];
      return;
    }

    // Parse comma-separated keys and filter out empty strings
    this.keys = apiKeysEnv
      .split(',')
      .map(key => key.trim())
      .filter(key => key.length > 0);
  }

  /**
   * Check if any API keys are available
   */
  hasKeys(): boolean {
    return this.keys.length > 0;
  }

  /**
   * Get the total number of available keys
   */
  getKeyCount(): number {
    return this.keys.length;
  }

  /**
   * Get a random key from the provided array
   */
  private getRandomKey(keys: string[]): string {
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }

  /**
   * Check if an error is a 429 rate limit error
   */
  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // Check for 429 status code or rate limit related messages
      return (
        message.includes('429') ||
        message.includes('rate limit') ||
        message.includes('quota exceeded') ||
        message.includes('resource exhausted') ||
        message.includes('too many requests')
      );
    }
    return false;
  }

  /**
   * Execute a function with automatic key fallback on 429 errors
   *
   * @param fn - A function that receives a GenerativeModel and returns a promise
   * @returns The result of the function execution
   * @throws Error if all keys are exhausted or non-429 error occurs
   */
  async executeWithFallback<T>(
    fn: (model: GenerativeModel) => Promise<T>,
  ): Promise<T> {
    if (!this.hasKeys()) {
      throw new Error('No Gemini API keys configured');
    }

    // Create a copy of available keys for this request cycle
    const availableKeys = [...this.keys];
    let lastError: Error | null = null;

    while (availableKeys.length > 0) {
      // Randomly select a key from remaining keys
      const selectedKey = this.getRandomKey(availableKeys);
      const keyIndex = availableKeys.indexOf(selectedKey);

      console.log(
        `Trying Gemini API key ${this.keys.indexOf(selectedKey) + 1}/${this.keys.length} (${availableKeys.length} remaining)`,
      );

      try {
        const genAI = new GoogleGenerativeAI(selectedKey);
        const model = genAI.getGenerativeModel({ model: this.modelName });

        const result = await fn(model);
        return result;
      } catch (error) {
        lastError = error as Error;

        if (this.isRateLimitError(error)) {
          console.warn(
            `Key ${this.keys.indexOf(selectedKey) + 1} hit rate limit (429), trying another key...`,
          );
          // Remove the exhausted key from available keys
          availableKeys.splice(keyIndex, 1);

          if (availableKeys.length > 0) {
            // Small delay before trying next key
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } else {
          // Non-429 error, throw immediately
          console.error(
            'Gemini API error (non-429):',
            (error as Error).message,
          );
          throw error;
        }
      }
    }

    // All keys exhausted
    throw new Error(
      `All ${this.keys.length} Gemini API keys exhausted due to rate limits. Last error: ${lastError?.message}`,
    );
  }

  /**
   * Execute with fallback and retry logic (combines key fallback with exponential backoff)
   *
   * @param fn - A function that receives a GenerativeModel and returns a promise
   * @param maxRetries - Maximum number of retry attempts per key cycle (default: 3)
   * @returns The result of the function execution
   */
  async executeWithFallbackAndRetry<T>(
    fn: (model: GenerativeModel) => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}...`);
        return await this.executeWithFallback(fn);
      } catch (error) {
        lastError = error as Error;
        const errorMessage = (error as Error).message;

        // If all keys are exhausted due to rate limits, apply backoff before retry
        if (
          errorMessage.includes('exhausted due to rate limits') &&
          attempt < maxRetries
        ) {
          const backoffMs = Math.pow(2, attempt - 1) * 1000;
          console.log(
            `All keys exhausted, waiting ${backoffMs}ms before retry cycle ${attempt + 1}...`,
          );
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        } else if (
          !errorMessage.includes('rate limit') &&
          !errorMessage.includes('429')
        ) {
          // Non-rate-limit error, don't retry
          throw error;
        } else if (attempt >= maxRetries) {
          throw error;
        }
      }
    }

    throw lastError || new Error('Unknown error during Gemini API call');
  }
}

/**
 * Create a singleton instance for use across the application
 */
let keyManagerInstance: GeminiKeyManager | null = null;

export function getGeminiKeyManager(modelName?: string): GeminiKeyManager {
  if (!keyManagerInstance || modelName) {
    keyManagerInstance = new GeminiKeyManager(
      process.env.GEMINI_API_KEY,
      modelName || 'gemini-3-flash-preview',
    );
  }
  return keyManagerInstance;
}

/**
 * Reset the singleton instance (useful for testing or when env changes)
 */
export function resetGeminiKeyManager(): void {
  keyManagerInstance = null;
}
