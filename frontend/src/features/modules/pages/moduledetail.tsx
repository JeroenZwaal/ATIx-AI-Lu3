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
                    <p className="text-lg md:text-2xl lg:text-3xl font-bold text-white mb-6 leading-tight">
                        {module.name}
                    </p>

                    {/* Practical Info */}
                    {(module.start_date || module.available_spots !== undefined) && (
                        <div className="bg-gray-700 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {module.start_date && (
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">
                                        {t.moduleDetail.startDate}
                                    </p>
                                    <p className="text-white font-medium">
                                        {new Date(module.start_date).toLocaleDateString('nl-NL', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            )}
                            {module.available_spots !== undefined && (
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">
                                        {t.moduleDetail.availableSpots}
                                    </p>
                                    <p className="text-white font-medium">
                                        {module.available_spots > 0 ? (
                                            <span className="text-green-400">
                                                {module.available_spots} plekken
                                            </span>
                                        ) : (
                                            <span className="text-red-400">Vol</span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="text-gray-300 mb-8 space-y-4">
                        {module.shortdescription && (
                            <p className="text-lg font-medium">{module.shortdescription}</p>
                        )}
                        {module.description && (
                            <p className="whitespace-pre-wrap">{module.description}</p>
                        )}
                    </div>

                    {/* Content */}
                    {module.content && (
                        <div className="mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                                {t.moduleDetail.content}
                            </h2>
                            <div className="text-gray-300 whitespace-pre-wrap bg-gray-700 rounded-lg p-4">
                                {module.content}
                            </div>
                        </div>
                    )}

                    {/* Learning Outcomes */}
                    {module.learningoutcomes && (
                        <div className="mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                                {t.moduleDetail.learningOutcomes}
                            </h2>
                            <div className="text-gray-300 whitespace-pre-wrap bg-gray-700 rounded-lg p-4">
                                {module.learningoutcomes}
                            </div>
                        </div>
                    )}

                    {/* Module Tags */}
                    {module.tags && module.tags.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {module.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

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
