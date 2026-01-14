import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

// Eenvoudige in-memory rate limiter per client IP
const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientKey(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }

    if (Array.isArray(req.ips) && req.ips.length > 0) {
        return req.ips[0];
    }

    return req.ip || req.socket?.remoteAddress || 'unknown';
}

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const key = getClientKey(req);
        const now = Date.now();

        let entry = rateLimitStore.get(key);
        if (!entry || entry.resetAt <= now) {
            entry = { count: 0, resetAt: now + WINDOW_MS };
            rateLimitStore.set(key, entry);
        }

        entry.count += 1;

        const remaining = Math.max(0, MAX_REQUESTS - entry.count);
        res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString());

        if (entry.count > MAX_REQUESTS) {
            const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
            res.setHeader('Retry-After', retryAfterSeconds.toString());
            res.status(429).json({
                message: 'Te veel verzoeken, probeer later opnieuw.',
            });
            return;
        }

        next();
    }
}
