export interface ITokenBlacklistRepository {
    addToken(token: string, expiresAt: Date): Promise<void>;
    isTokenBlacklisted(token: string): Promise<boolean>;
    removeExpiredTokens(): Promise<void>;
}

export const TOKEN_BLACKLIST_REPOSITORY = Symbol('ITokenBlacklistRepository');
