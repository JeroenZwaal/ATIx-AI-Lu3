import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { ITokenBlacklistRepository } from '../../domain/repositories/token-blacklist.repository.interface';
import { BlacklistedTokenDocument } from '../schemas/blacklisted-token.schema';

@Injectable()
export class TokenBlacklistRepository implements ITokenBlacklistRepository {
    constructor(
        @InjectModel('BlacklistedToken')
        private readonly blacklistModel: Model<BlacklistedTokenDocument>,
    ) {}

    async addToken(token: string, expiresAt: Date): Promise<void> {
        await this.blacklistModel.create({
            token,
            expiresAt,
        });
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const blacklistedToken = await this.blacklistModel.findOne({ token });
        if (!blacklistedToken) {
            return false;
        }

        // Verwijder token als het verlopen is
        if (blacklistedToken.expiresAt < new Date()) {
            await this.blacklistModel.deleteOne({ token });
            return false;
        }

        return true;
    }

    async removeExpiredTokens(): Promise<void> {
        await this.blacklistModel.deleteMany({
            expiresAt: { $lt: new Date() },
        });
    }
}
