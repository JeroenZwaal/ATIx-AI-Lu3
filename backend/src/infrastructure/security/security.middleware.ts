import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const path = req.url;

        // X-Content-Type-Options header
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // X-Frame-Options header (anti-clickjacking)
        res.setHeader('X-Frame-Options', 'DENY');

        // Strict-Transport-Security (HSTS) - forceer HTTPS
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

        // Cross-Origin headers - bescherming tegen Spectre attacks
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

        // Content-Security-Policy header
        // Voor Swagger docs zijn wat meer permissies nodig
        if (path.startsWith('/docs') || path.startsWith('/api-docs')) {
            res.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data: https://cdn.jsdelivr.net; connect-src 'self';",
            );
        } else {
            res.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';",
            );
        }

        // Permissions-Policy header
        res.setHeader(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
        );

        // Referrer-Policy header
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Cache-Control headers voor statische content
        if (path.match(/\.(jpg|jpeg|png|gif|ico|svg|css|js|woff|woff2|ttf|eot)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (path.startsWith('/docs') || path.startsWith('/api-docs')) {
            // Swagger docs niet cachen
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        } else {
            // Standaard: geen cache voor API responses
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }

        next();
    }
}
