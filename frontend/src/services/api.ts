export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Base mock API client simulation.
 * In production, this would use axios or fetch against a real backend.
 */
export async function mockApiCall<T>(data: T, latencyMs = 800): Promise<T> {
    await delay(latencyMs);
    return data;
}
