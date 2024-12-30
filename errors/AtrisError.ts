  /**
   * app/errors/AtrisError.ts
   */
  export type QueryCategory =
    | 'ENTITY_RETRIEVED'
    | 'ENTITY_DERIVED'
    | 'DOCUMENTATION'
    | 'BUSINESS'
    | 'GENERAL'
    | 'INVALID';

  export type DataSource =
    | 'AUDIUS_API'
    | 'RAG'
    | 'TAVILY'
    | 'INTERNAL'
    | 'UNKNOWN'
    | 'NEW_AI_SERVICE';

  export interface RecoveryOption {
    strategy: string;
    cost: number;
    reliability: number;
  }

  export interface AtrisError extends Error {
    name: string;
    message: string;
    queryCategory: QueryCategory;
    source: DataSource;
    recoveryOptions: RecoveryOption[];
    context: {
      originalQuery: string;
      processingStage: string;
      relatedEntities?: unknown[];
      [key: string]: any;
    };
  }
