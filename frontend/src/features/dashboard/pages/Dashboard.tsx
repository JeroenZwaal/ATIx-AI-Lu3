import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Module } from '../../../shared/types/index';
import authService from '../../auth/services/auth.service';
import { useLanguage } from '../../../shared/contexts/useLanguage';
import { useProfile } from '../../profile/hooks/useProfile';

interface DashboardProps {
    favoriteModules?: Module[];
    onToggleFavorite?: (moduleId: string) => void;
    onModuleClick?: (moduleId: string) => void;
}

export default function Dashboard({
    favoriteModules: propFavoriteModules,
    onToggleFavorite,
    onModuleClick,
}: DashboardProps) {
    const navigate = useNavigate();
    const { t } = useLanguage();

    // State voor opgehaalde data
    const [favoriteModules, setFavoriteModules] = useState<Module[]>(propFavoriteModules || []);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userProfile, fetchUserProfile } = useProfile();

    // Data ophalen bij mount
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const modules = await authService.getFavorites();
                setFavoriteModules(modules);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load favorites');
                console.error('Error loading favorites:', err);
            } finally {
                setIsLoading(false);
            }
        };

        // Alleen fetchen als er geen props zijn doorgegeven
        if (!propFavoriteModules || propFavoriteModules.length === 0) {
            loadFavorites();
        } else {
            setFavoriteModules(propFavoriteModules);
            setIsLoading(false);
        }
    }, [propFavoriteModules]);

    useEffect(() => {
        if (!userProfile) {
            fetchUserProfile();
        }
    }, [userProfile]);

    // Handlers blijven hetzelfde
    const handleModuleClick = (moduleId: string) => {
        if (onModuleClick) {
            onModuleClick(moduleId);
        } else {
            navigate(`/keuzemodules/${moduleId}`);
        }
    };

    const handleToggleFavorite = async (moduleId: string) => {
        if (onToggleFavorite) {
            onToggleFavorite(moduleId);
        } else {
            try {
                // On dashboard, all modules are favorites, so always remove
                await authService.toggleFavorite(moduleId, true);
                setFavoriteModules((prev) => prev.filter((module) => module.id !== moduleId));
            } catch (err) {
                console.error('Error removing favorite:', err);
                setError(err instanceof Error ? err.message : 'Failed to remove favorite');
            }
        }
    };

    const getLevelTag = (level: string): string => {
        return level || 'P3';
    };

    return (
        <div className="min-h-screen bg-neutral-950 w-full overflow-x-hidden">
            <div className="max-w-6xl mx-auto px-10 py-8 ">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">{t.dashboard.title}</h1>

                <div className="bg-gray-800 rounded-lg p-6 mb-15">
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">
                        Mijn Profiel
                    </h2>

                    {!userProfile ? (
                        <p className="text-gray-400 text-center">Profiel laden...</p>
                    ) : (
                        <>
                        <h3 className="text-xl text-white">Opleiding</h3>
                        <p className="mb-2">{userProfile.studyProgram}</p>

                        <h3 className="text-xl text-white">Leerjaar</h3>
                        <p className="mb-2">{userProfile.yearOfStudy}</p>

                        <h3 className="text-xl text-white">Studielocatie</h3>
                        <p className="mb-2">{userProfile.studyLocation || '—'}</p>

                        <h3 className="text-xl text-white">Studiepunten</h3>
                        <p className="mb-2">{userProfile.studyCredits}</p>

                        <h3 className="text-xl text-white">Vaardigheden</h3>
                        <div className="mb-2">
                            {userProfile.skills?.map(s => (
                            <span key={s} className="inline-block bg-pink-300 text-black px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2">
                                {s}
                            </span>
                            ))}
                        </div>

                        <h3 className="text-xl text-white">Intresses</h3>
                        <div className="mb-4">
                            {userProfile.interests?.map(i => (
                            <span key={i} className="inline-block bg-blue-300 text-black px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2">
                                {i}
                            </span>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/profile/createProfile')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Aanpassen
                        </button>
                        </>
                    )}
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        {t.dashboard.favoriteModules}
                    </h2>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="text-center text-white py-8">
                            <p>{t.dashboard.loading}</p>
                        </div>
                    )}

                    {/* Error state */}
                    {!isLoading && error && (
                        <div className="text-center text-red-400 py-8">
                            <p>
                                {t.dashboard.error} {error}
                            </p>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && !error && favoriteModules.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                            <p>{t.dashboard.noFavorites}</p>
                        </div>
                    )}

                    {/* Modules lijst */}
                    {!isLoading && !error && favoriteModules.length > 0 && (
                        <div className="space-y-6">
                            {favoriteModules.map((module) => (
                                <div key={module.id} className="bg-gray-700 rounded-lg p-4">
                                    <div className="flex gap-2 mb-3">
                                        <span className="bg-green-700 text-white px-3 py-1 rounded text-sm font-medium">
                                            {getLevelTag(module.level)}
                                        </span>
                                        <span className="bg-red-800 text-white px-3 py-1 rounded text-sm font-medium">
                                            {module.studycredit} ETC
                                        </span>
                                        <span className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium">
                                            {module.location || t.dashboard.unknown}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {module.name}
                                    </h3>

                                    <p className="text-gray-300 mb-4">
                                        {module.shortdescription ||
                                            module.description ||
                                            t.dashboard.noDescription}
                                    </p>

                                    <div className="flex items-center justify-end gap-4">
                                        <button
                                            onClick={() => handleModuleClick(module.id)}
                                            className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                                        >
                                            {t.dashboard.learnMore}
                                        </button>
                                        <button
                                            onClick={() => handleToggleFavorite(module.id)}
                                            className="p-2 hover:opacity-70 transition-opacity"
                                            aria-label="Toggle favorite"
                                        >
                                            <svg
                                                className="w-6 h-6 text-yellow-400 fill-current"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
