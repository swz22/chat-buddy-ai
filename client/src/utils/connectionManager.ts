interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  factor: number;
}

export class ConnectionManager {
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: config.maxRetries || 10,
      baseDelay: config.baseDelay || 1000,
      maxDelay: config.maxDelay || 30000,
      factor: config.factor || 2,
    };
  }

  calculateDelay(): number {
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.factor, this.retryCount);
    const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5);
    return Math.min(jitteredDelay, this.config.maxDelay);
  }

  shouldRetry(): boolean {
    return this.retryCount < this.config.maxRetries;
  }

  scheduleRetry(callback: () => void): void {
    if (!this.shouldRetry()) {
      console.error('Max retries reached');
      return;
    }

    const delay = this.calculateDelay();
    console.log(`Retrying connection in ${Math.round(delay / 1000)}s (attempt ${this.retryCount + 1}/${this.config.maxRetries})`);

    this.retryTimer = setTimeout(() => {
      this.retryCount++;
      callback();
    }, delay);
  }

  reset(): void {
    this.retryCount = 0;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  cleanup(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  getRetryStatus(): string {
    if (this.retryCount === 0) {
      return 'Connected';
    }
    if (this.retryCount < this.config.maxRetries) {
      return `Reconnecting... (${this.retryCount}/${this.config.maxRetries})`;
    }
    return 'Connection failed';
  }
}