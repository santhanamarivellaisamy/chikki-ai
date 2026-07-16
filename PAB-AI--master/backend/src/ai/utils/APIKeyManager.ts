export class APIKeyManager {
  private static instance: APIKeyManager;

  private constructor() {}

  public static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager();
    }
    return APIKeyManager.instance;
  }

  /**
   * Retrieves an API key from environment variables.
   */
  public getKey(providerId: string): string | undefined {
    const envVarName = `${providerId.toUpperCase()}_API_KEY`;
    const key = process.env[envVarName];
    if (!key || key.trim() === '' || key.toLowerCase().startsWith('your_')) {
      return undefined;
    }
    return key;
  }

  /**
   * Validates that an API key exists for a given provider.
   */
  public hasKey(providerId: string): boolean {
    return !!this.getKey(providerId);
  }

  /**
   * Throws an error if the key is missing.
   */
  public requireKey(providerId: string): string {
    const key = this.getKey(providerId);
    if (!key) {
      throw new Error(`API key for provider '${providerId}' is missing or invalid.`);
    }
    return key;
  }
}
