  /**
   * app/errors/recoveryOrchestrator.ts
   */
  import { AtrisError } from './AtrisError';

  export async function attemptRecovery(error: AtrisError): Promise<void> {
    const sortedOptions = [...error.recoveryOptions].sort((a, b) => b.reliability - a.reliability);
    for (const option of sortedOptions) {
      console.log(
        `Attempting recovery strategy "${option.strategy}" (cost=${option.cost}, reliability=${option.reliability})`
      );
      try {
        await performRecoveryStrategy(option.strategy, error);
        console.log(`Successfully recovered using strategy "${option.strategy}"!`);
        return;
      } catch (e) {
        console.warn(`Strategy "${option.strategy}" failed:`, e);
      }
    }
    console.error('All recovery strategies failed. Propagating error upward.');
    throw error;
  }

  async function performRecoveryStrategy(strategyName: string, error: AtrisError): Promise<void> {
    switch (strategyName) {
      case 'RetryWithBackoff':
        // Implement retry logic with exponential backoff
        throw new Error('Not actually implemented here.');
      case 'FallbackToEntityDerived':
        // Implement fallback logic
        throw new Error('Not actually implemented here.');
      default:
        throw new Error(`Unknown strategy: ${strategyName}`);
    }
  }
