import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();
        const path = request.url;

        // X-Content-Type-Options header
        response.setHeader('X-Content-Type-Options', 'nosniff');

        // X-Frame-Options header (anti-clickjacking)
        response.setHeader('X-Frame-Options', 'DENY');

        // Content-Security-Policy header
        // Voor Swagger docs zijn wat meer permissies nodig
        if (path.startsWith('/docs') || path.startsWith('/api-docs')) {
            response.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data: https://cdn.jsdelivr.net; connect-src 'self';",
            );
        } else {
            response.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';",
            );
        }

        // Permissions-Policy header
        response.setHeader(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
        );

        // Referrer-Policy header
        response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Cache-Control headers voor statische content
        if (path.match(/\.(jpg|jpeg|png|gif|ico|svg|css|js|woff|woff2|ttf|eot)$/i)) {
            response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (path.startsWith('/docs') || path.startsWith('/api-docs')) {
            // Swagger docs niet cachen
            response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            response.setHeader('Pragma', 'no-cache');
            response.setHeader('Expires', '0');
        } else {
            // Standaard: geen cache voor API responses
            response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            response.setHeader('Pragma', 'no-cache');
            response.setHeader('Expires', '0');
        }

        return next.handle();
    }
}
