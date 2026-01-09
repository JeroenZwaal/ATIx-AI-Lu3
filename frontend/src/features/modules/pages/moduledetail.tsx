import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moduleService } from '../services/module.service';
import type { Module } from '../../../shared/types/index';
import { useLanguage } from '../../../shared/contexts/useLanguage';

export default function ModuleDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [module, setModule] = useState<Module | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadModule();
    }, [id]);

    const loadModule = async () => {
        if (!id) {
            setError(t.moduleDetail.noModuleId);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const data = await moduleService.getModuleById(id);
            setModule(data);
        } catch (error) {
            console.error('Failed to load module:', error);
            setError(error instanceof Error ? error.message : 'Failed to load module');
        } finally {
            setIsLoading(false);
        }
    };

    const getLevelTag = (level: string): string => {
        return level || 'P3';
    };

    const handleBack = () => {
        navigate('/keuzemodules');
    };

    if (isLoading) {
        return (
            <div className="bg-neutral-950 w-full overflow-x-hidden">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-12 text-gray-300">{t.modules.loading}</div>
                </div>
            </div>
        );
    }

    if (error || !module) {
        return (
            <div className="bg-neutral-950 w-full overflow-x-hidden">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
                        <p className="font-bold">{t.modules.error}</p>
                        <p>{error || t.moduleDetail.moduleNotFound}</p>
                        <button
                            onClick={handleBack}
                            style={{ backgroundColor: '#c4b5fd' }}
                            className="mt-2 text-black px-4 py-2 rounded-lg font-medium hover:bg-violet-400 transition-colors"
                        >
                            {t.moduleDetail.backToOverview}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutral-950 w-full overflow-x-hidden">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="mb-6 flex items-center gap-2 text-gray-300 hover:text-violet-400 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    <span>{t.moduleDetail.backToOverview}</span>
                </button>

                {/* Module Content */}
                <div className="bg-gray-800 rounded-lg p-6 md:p-8">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-green-700 text-white px-3 py-1 rounded text-sm font-medium">
                            {getLevelTag(module.level)}
                        </span>
                        <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
                            {module.studycredit} ETC
                        </span>
                        <span className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium">
                            {module.location || t.moduleDetail.unknown}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        {module.name}
                    </h1>

                    {/* Description */}
                    <div className="text-gray-300 mb-8 space-y-4">
                        {module.shortdescription && (
                            <p className="text-lg font-medium">{module.shortdescription}</p>
                        )}
                        {module.description && (
                            <p className="whitespace-pre-wrap">{module.description}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center">
                        <button
                            style={{ backgroundColor: '#c4b5fd' }}
                            className="w-full sm:w-auto text-black px-8 py-3 rounded-lg font-medium hover:bg-violet-400 transition-colors"
                        >
                            {t.moduleDetail.enroll}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
