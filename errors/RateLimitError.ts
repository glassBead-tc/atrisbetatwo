  /**
   * app/errors/RateLimitError.ts
   */
  import { AtrisError, QueryCategory, DataSource, RecoveryOption } from './AtrisError';

  export class RateLimitError extends Error implements AtrisError {
    public queryCategory: QueryCategory;
    public source: DataSource;
    public recoveryOptions: RecoveryOption[];
    public context: {
      originalQuery: string;
      processingStage: string;
      relatedEntities?: unknown[];
      [key: string]: any;
    };

    constructor(
      message: string,
      queryCategory: QueryCategory,
      source: DataSource = 'AUDIUS_API',
      recoveryOptions: RecoveryOption[],
      context: {
        originalQuery: string;
        processingStage: string;
        relatedEntities?: unknown[];
        [key: string]: any;
      }
    ) {
      super(message);
      this.name = 'RateLimitError';
      this.queryCategory = queryCategory;
      this.source = source;
      this.recoveryOptions = recoveryOptions;
      this.context = context;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, RateLimitError);
      }
    }
  }
