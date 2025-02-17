import { apiLogger } from '../../../../logger';

/**
 * Extracts parameters for user queries.
 * @param query - The user's query string.
 * @param entityType - The type of entity, if any.
 * @returns A record of parameters for the API request.
 */
export function extractUserParameters(query: string, entityType: string | null): Record<string, any> {
    let params: Record<string, any> = { limit: 1 };

    if (entityType === 'user') {
        const limitMatch = query.match(/top\s+(\d+)/i);
        if (limitMatch) {
            params.limit = parseInt(limitMatch[1], 10);
        }

        const timeMatch = query.match(/(\w+)\s+time/i);
        if (timeMatch) {
            params.time = timeMatch[1].toLowerCase();
        }
    }

    apiLogger.info(`Extracted user parameters: ${JSON.stringify(params)}`);
    return params;
}
