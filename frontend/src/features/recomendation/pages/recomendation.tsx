import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../shared/contexts/useLanguage';
import type { RecommendationItem } from '../types/recommendation.types';
import recommendationService from '../services/recommendation.service';
import { moduleService } from '../../modules/services/module.service';
import authService from '../../auth/services/auth.service';
import type { Module } from '../../../shared/types/index';
import ModuleCompareModal from '../../modules/components/ModuleCompareModal';

export default function Recomendation() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    const [items, setItems] = useState<RecommendationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [moduleIdByExternalId, setModuleIdByExternalId] = useState<Record<number, string>>({});
    const [pendingFavorites, setPendingFavorites] = useState<Set<number>>(new Set());
    const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [allModules, setAllModules] = useState<Module[]>([]);

    const loadFavorites = async () => {
        try {
            const favoriteModules = await authService.getFavorites();
            const favoriteIds = new Set(favoriteModules.map((module) => module.id));
            setFavorites(favoriteIds);
        } catch {
            // Ignore
        }
    };

    const loadAllModules = useCallback(async () => {
        try {
            const mongoIds = await Promise.all(
                items.map(async (rec) => {
                    const mongoId = await resolveMongoId(rec);
                    return mongoId;
                }),
            );
            const validIds = mongoIds.filter((id): id is string => id !== null);
            const modules = await Promise.all(
                validIds.map(async (id) => {
                    try {
                        return await moduleService.getModuleById(id);
                    } catch {
                        return null;
                    }
                }),
            );
            setAllModules(modules.filter((m): m is Module => m !== null));
        } catch {
            // Ignore
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    useEffect(() => {
        void loadRecommendations();
        void loadFavorites();
    }, []);

    useEffect(() => {
        void prefetchMongoIds(items);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, moduleIdByExternalId]);

    useEffect(() => {
        void loadAllModules();
    }, [items, loadAllModules]);

    const loadRecommendations = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await recommendationService.getRecommendations({ k: 5 });
            setItems(data.recommendations || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load recommendations');
        } finally {
            setIsLoading(false);
        }
    };

    const sortedItems = useMemo(() => {
        // Keep UI stable even if backend returns more than requested.
        return [...items].sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0)).slice(0, 5);
    }, [items]);

    const getCredits = (rec: RecommendationItem) => {
        return rec.study_credit ?? rec.studycredit ?? null;
    };

    const getReason = (rec: RecommendationItem) => {
        if (language === 'en') return rec.reason_en || rec.reason;
        return rec.reason;
    };

    const openDetails = async (rec: RecommendationItem) => {
        // The recommender returns an external id; resolve to Mongo id for the detail page.
        try {
            const mongoId = await resolveMongoId(rec);
            if (mongoId) {
                navigate(`/keuzemodules/${mongoId}`, { state: { from: '/recomendation' } });
                return;
            }
        } catch {
            // ignore and try fallback
        }

        try {
            const results = await moduleService.searchModules(rec.name);
            if (results.length > 0) {
                navigate(`/keuzemodules/${results[0].id}`, { state: { from: '/recomendation' } });
            }
        } catch {
            // ignore
        }
    };

    const resolveMongoId = async (rec: RecommendationItem): Promise<string | null> => {
        const cached = moduleIdByExternalId[rec.id];
        if (cached) return cached;

        // Try direct externalId lookup
        try {
            const module = await moduleService.getModuleByExternalId(rec.id);
            if (module?.id) {
                setModuleIdByExternalId((prev) => ({ ...prev, [rec.id]: module.id }));
                return module.id;
            }
        } catch {
            // ignore
        }

        // Fallback: search by name
        try {
            const results = await moduleService.searchModules(rec.name);
            if (results.length > 0) {
                setModuleIdByExternalId((prev) => ({ ...prev, [rec.id]: results[0].id }));
                return results[0].id;
            }
        } catch {
            // ignore
        }

        return null;
    };

    const prefetchMongoIds = async (recs: RecommendationItem[]) => {
        const missing = recs.filter((rec) => !moduleIdByExternalId[rec.id]);
        if (missing.length === 0) return;

        const results = await Promise.all(
            missing.map(async (rec) => {
                try {
                    const module = await moduleService.getModuleByExternalId(rec.id);
                    return { externalId: rec.id, mongoId: module?.id ?? null };
                } catch {
                    return { externalId: rec.id, mongoId: null };
                }
            }),
        );

        setModuleIdByExternalId((prev) => {
            const next = { ...prev };
            for (const r of results) {
                if (r.mongoId) {
                    next[r.externalId] = r.mongoId;
                }
            }
            return next;
        });
    };

    const toggleFavorite = async (rec: RecommendationItem) => {
        setPendingFavorites((prev) => new Set(prev).add(rec.id));
        try {
            const mongoId = await resolveMongoId(rec);
            if (!mongoId) {
                setError('Kan module niet vinden om te favoriten.');
                return;
            }

            const isCurrentlyFavorite = favorites.has(mongoId);
            await authService.toggleFavorite(mongoId, isCurrentlyFavorite);

            setFavorites((prev) => {
                const next = new Set(prev);
                if (isCurrentlyFavorite) next.delete(mongoId);
                else next.add(mongoId);
                return next;
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Favoriet aanpassen mislukt');
        } finally {
            setPendingFavorites((prev) => {
                const next = new Set(prev);
                next.delete(rec.id);
                return next;
            });
        }
    };

    const toggleCompareSelection = (mongoId: string) => {
        setSelectedForCompare((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(mongoId)) {
                newSet.delete(mongoId);
            } else {
                if (newSet.size >= 4) {
                    return prev;
                }
                newSet.add(mongoId);
            }
            return newSet;
        });
    };

    const handleCompare = () => {
        if (selectedForCompare.size >= 2) {
            setShowCompareModal(true);
        }
    };

    const selectedModules = allModules.filter((m) => selectedForCompare.has(m.id));

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <h1
                    lang={language}
                    className="text-2xl font-bold theme-text-primary mb-2 break-words leading-tight text-center"
                >
                    {t.nav.aiModules}
                </h1>
                <p className="theme-text-secondary text-center">{t.recommendations.subtitle}</p>
            </div>

            {isLoading ? (
                <div className="text-center py-12 theme-text-secondary">{t.modules.loading}</div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={loadRecommendations} className="btn-primary">
                        {t.modules.tryAgain}
                    </button>
                </div>
            ) : sortedItems.length === 0 ? (
                <div className="text-center py-12">
                    <p className="theme-text-primary text-lg font-semibold mb-2">
                        {t.recommendations.noProfileTitle}
                    </p>
                    <p className="theme-text-secondary mb-6 max-w-2xl mx-auto">
                        {t.recommendations.noProfileBody}
                    </p>
                    <button
                        onClick={() => navigate('/profile/createProfile')}
                        className="btn-primary"
                    >
                        {t.recommendations.fillProfileCta}
                    </button>
                </div>
            ) : (
                <>
                    {selectedForCompare.size > 0 && (
                        <div className="fixed md:static bottom-0 left-0 right-0 theme-card md:theme-card-alt border-t md:border theme-border md:rounded-lg p-4 mb-0 md:mb-8 z-40 shadow-lg md:shadow-none">
                            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="theme-text-primary font-medium">
                                        {t.modules.compare.selected.replace(
                                            '{count}',
                                            String(selectedForCompare.size),
                                        )}
                                    </div>
                                    {selectedForCompare.size < 2 && (
                                        <div className="text-sm theme-text-secondary hidden md:block">
                                            ({t.modules.compare.selectMin})
                                        </div>
                                    )}
                                    {selectedForCompare.size >= 4 && (
                                        <div className="text-sm text-yellow-400 hidden md:block">
                                            ({t.modules.compare.selectMax})
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => setSelectedForCompare(new Set())}
                                        className="btn-secondary flex-1 md:flex-initial px-4 py-2"
                                    >
                                        {t.modules.compare.remove}
                                    </button>
                                    <button
                                        onClick={handleCompare}
                                        disabled={selectedForCompare.size < 2}
                                        className={`flex-1 md:flex-initial px-6 py-2 rounded-lg font-medium transition-colors ${
                                            selectedForCompare.size >= 2
                                                ? 'btn-accent'
                                                : 'btn-secondary cursor-not-allowed'
                                        }`}
                                    >
                                        {t.modules.compare.button}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        className={`space-y-6 ${selectedForCompare.size > 0 ? 'pb-32 md:pb-8' : ''}`}
                    >
                        {sortedItems.map((rec) => {
                            const mongoId = moduleIdByExternalId[rec.id];
                            return (
                                <div
                                    key={rec.id}
                                    className="theme-card rounded-lg p-6 relative flex"
                                >
                                    {/* Compare Checkbox */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        mongoId
                                                            ? selectedForCompare.has(mongoId)
                                                            : false
                                                    }
                                                    onChange={() =>
                                                        mongoId && toggleCompareSelection(mongoId)
                                                    }
                                                    disabled={
                                                        !mongoId ||
                                                        (!selectedForCompare.has(mongoId) &&
                                                            selectedForCompare.size >= 4)
                                                    }
                                                    className="peer sr-only"
                                                />
                                                <div
                                                    className="w-6 h-6 border-2 rounded-md peer-disabled:opacity-50 peer-disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                                    style={{
                                                        backgroundColor:
                                                            mongoId &&
                                                            selectedForCompare.has(mongoId)
                                                                ? 'var(--checkbox-bg)'
                                                                : 'var(--bg-card-alt)',
                                                        borderColor: 'var(--checkbox-border)',
                                                    }}
                                                >
                                                    <svg
                                                        className={`w-4 h-4 transition-all duration-200 ${
                                                            mongoId &&
                                                            selectedForCompare.has(mongoId)
                                                                ? 'opacity-100 scale-100'
                                                                : 'opacity-0 scale-50'
                                                        }`}
                                                        style={{ color: 'var(--btn-accent-text)' }}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={3}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className="text-sm theme-text-secondary hidden xl:inline whitespace-nowrap theme-card-alt px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {t.modules.compare.button}
                                            </span>
                                        </label>
                                    </div>

                                    {/* Module Content */}
                                    <div className="flex-1">
                                        {/* Text/content gets right padding to avoid overlap with compare checkbox */}
                                        <div className="pr-12 md:pr-16">
                                            <div className="flex gap-2 mb-3 flex-wrap">
                                                <span className="bg-green-700/20 text-green-400 px-3 py-1 rounded text-sm font-medium">
                                                    {rec.level || t.modules.unknown}
                                                </span>
                                                <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded text-sm font-medium">
                                                    {getCredits(rec) ?? t.modules.unknown} ECTS
                                                </span>
                                                <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded text-sm font-medium">
                                                    {rec.location || t.modules.unknown}
                                                </span>
                                                <span className="bg-[#d4607a]/20 text-[#d4607a] px-3 py-1 rounded text-sm font-medium">
                                                    {Math.round((rec.similarity ?? 0) * 100)}%
                                                </span>
                                            </div>

                                            <h2 className="text-xl font-bold theme-text-primary mb-2">
                                                {rec.name}
                                            </h2>
                                            <p className="theme-text-secondary mb-4">
                                                {rec.shortdescription}
                                            </p>

                                            {rec.match_terms?.length ? (
                                                <div className="flex gap-2 flex-wrap mb-4">
                                                    {rec.match_terms.slice(0, 8).map((term) => (
                                                        <span
                                                            key={term}
                                                            className="theme-card-alt theme-text-secondary px-2 py-1 rounded text-xs"
                                                        >
                                                            {term}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}

                                            {getReason(rec) ? (
                                                <p className="theme-text-secondary mb-4">
                                                    {getReason(rec)}
                                                </p>
                                            ) : null}
                                        </div>

                                        {/* Action Buttons (centered group) */}
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => void openDetails(rec)}
                                                className="btn-accent whitespace-nowrap shrink-0"
                                            >
                                                {t.modules.learnMore}
                                            </button>
                                            <button
                                                onClick={() => void toggleFavorite(rec)}
                                                disabled={pendingFavorites.has(rec.id)}
                                                className="p-2 hover:opacity-70 transition-opacity disabled:opacity-40 shrink-0"
                                                aria-label="Toggle favorite"
                                                title="Favoriet"
                                            >
                                                {(() => {
                                                    const isFav = mongoId
                                                        ? favorites.has(mongoId)
                                                        : false;
                                                    return isFav ? (
                                                        <svg
                                                            className="w-6 h-6 fill-current"
                                                            style={{ color: '#ff3b3b' }}
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                        </svg>
                                                    ) : (
                                                        <svg
                                                            className="w-6 h-6 theme-text-primary"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                            />
                                                        </svg>
                                                    );
                                                })()}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Compare Modal */}
            {showCompareModal && (
                <ModuleCompareModal
                    modules={selectedModules}
                    onClose={() => setShowCompareModal(false)}
                />
            )}
        </div>
    );
}
