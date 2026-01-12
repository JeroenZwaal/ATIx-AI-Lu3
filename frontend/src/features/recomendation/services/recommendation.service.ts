import { environment } from '../../../shared/environments/environment';
import type { RecommendationsResponse } from '../types/recommendation.types';

class RecommendationService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async getRecommendations(params?: {
        k?: number;
        study_location?: string;
        study_credit?: number;
        level?: string;
    }): Promise<RecommendationsResponse> {
        const search = new URLSearchParams();
        if (params?.k != null) search.set('k', String(params.k));
        if (params?.study_location) search.set('study_location', params.study_location);
        if (params?.study_credit != null) search.set('study_credit', String(params.study_credit));
        if (params?.level) search.set('level', params.level);

        const url = `${environment.apiUrl}/recommendations${search.toString() ? `?${search}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
            throw new Error(error.message || 'Failed to fetch recommendations');
        }

        return response.json();
    }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
