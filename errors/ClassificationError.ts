  /**
   * app/errors/ClassificationError.ts
   */
  import { AtrisError, QueryCategory, DataSource, RecoveryOption } from './AtrisError';

  export class ClassificationError extends Error implements AtrisError {
    public queryCategory: QueryCategory;
    public source: DataSource;
    public recoveryOptions: RecoveryOption[];
    public context: {
      originalQuery: string;
      processingStage: string;
      suggestedNewCategory?: QueryCategory;
      [key: string]: any;
    };

    constructor(
      message: string,
      currentCategory: QueryCategory,
      suggestedNewCategory: QueryCategory,
      source: DataSource = 'INTERNAL',
      recoveryOptions: RecoveryOption[] = [],
      context?: Partial<AtrisError['context']>
    ) {
      super(message);
      this.name = 'ClassificationError';
      this.queryCategory = currentCategory;
      this.source = source;
      this.recoveryOptions = recoveryOptions;
      this.context = {
        originalQuery: context?.originalQuery || '',
        processingStage: context?.processingStage || 'Classification',
        suggestedNewCategory,
        ...context,
      };
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ClassificationError);
      }
    }
  }
