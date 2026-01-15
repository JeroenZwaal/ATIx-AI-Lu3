import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { moduleService } from '../services/module.service';
import authService from '../../auth/services/auth.service';
import type { Module } from '../../../shared/types/index';
import { useLanguage } from '../../../shared/contexts/useLanguage';
import ModuleCompareModal from '../components/ModuleCompareModal';

const MODULES_PER_PAGE = 10;
const MAX_DESCRIPTION_LENGTH = 180;

interface FilterState {
    studyCredits: Set<number>;
    themes: Set<string>;
    difficulties: Set<string>;
    locations: Set<string>;
}

// Helper function to truncate long descriptions
const truncateDescription = (text: string | undefined, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

const normalizeLocationKey = (value: string): string => value.trim().toLowerCase();

const parseLocationParts = (location: string | undefined): string[] => {
    if (!location) return [];
    const cleaned = location.replace(/\s+/g, ' ').trim();
    if (!cleaned) return [];

    // Split on common separators and Dutch/English conjunctions.
    return cleaned
        .split(/\s*(?:,|;|\||\/|&|\+|\s+en\s+|\s+and\s+)\s*/gi)
        .map((p) => p.trim())
        .filter(Boolean);
};

export default function Keuzemodules() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [modules, setModules] = useState<Module[]>([]);
    const [allModules, setAllModules] = useState<Module[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [showAiKeuze, setShowAiKeuze] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        studyCredits: new Set<number>(),
        themes: new Set<string>(),
        difficulties: new Set<string>(),
        locations: new Set<string>(),
    });

    useEffect(() => {
        loadModules();
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const favoriteModules = await authService.getFavorites();
            const favoriteIds = new Set(favoriteModules.map((module) => module.id));
            setFavorites(favoriteIds);
        } catch (err) {
            console.error('Error loading favorites:', err);
        }
    };

    const loadModules = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await moduleService.getAllModules();
            setAllModules(data);
            setModules(data);
            setCurrentPage(1);
            console.log('Loaded modules:', data);
        } catch (error) {
            console.error('Failed to load modules:', error);
            setError(error instanceof Error ? error.message : 'Failed to load modules');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadModules();
            return;
        }
        try {
            setIsLoading(true);
            const data = await moduleService.searchModules(searchQuery);
            setAllModules(data);
            setCurrentPage(1);
        } catch (error) {
            console.error('Failed to search modules:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Extract unique values for filter options
    const availableStudyCredits = useMemo(() => {
        const credits = new Set<number>();
        allModules.forEach((module) => {
            if (module.studycredit) {
                credits.add(module.studycredit);
            }
        });
        return Array.from(credits).sort((a, b) => a - b);
    }, [allModules]);

    const availableDifficulties = useMemo(() => {
        const difficulties = new Set<string>();
        allModules.forEach((module) => {
            if (module.level) {
                const level = module.level.toUpperCase();
                if (level.includes('NLQF5') || level.includes('5')) {
                    difficulties.add('NLQF5');
                }
                if (level.includes('NLQF6') || level.includes('6')) {
                    difficulties.add('NLQF6');
                }
            }
        });
        return Array.from(difficulties).sort();
    }, [allModules]);

    const availableLocations = useMemo(() => {
        const locations = new Map<string, string>();
        allModules.forEach((module) => {
            if (module.location) {
                parseLocationParts(module.location).forEach((part) => {
                    const key = normalizeLocationKey(part);
                    if (key && !locations.has(key)) locations.set(key, part);
                });
            }
        });
        return Array.from(locations.values()).sort((a, b) =>
            a.localeCompare(b, 'nl', { sensitivity: 'base' }),
        );
    }, [allModules]);

    // Apply filters live
    const filteredModules = useMemo(() => {
        let filtered = [...allModules];

        if (filters.studyCredits.size > 0) {
            filtered = filtered.filter((module) => filters.studyCredits.has(module.studycredit));
        }

        if (filters.themes.size > 0) {
            filtered = filtered.filter(
                (module) =>
                    module.tags &&
                    Array.isArray(module.tags) &&
                    module.tags.some((tag) => filters.themes.has(tag)),
            );
        }

        if (filters.difficulties.size > 0) {
            filtered = filtered.filter((module) => {
                if (!module.level) return false;
                const level = module.level.toUpperCase();
                return (
                    (filters.difficulties.has('NLQF5') &&
                        (level.includes('NLQF5') || level.includes('5'))) ||
                    (filters.difficulties.has('NLQF6') &&
                        (level.includes('NLQF6') || level.includes('6')))
                );
            });
        }

        if (filters.locations.size > 0) {
            const selectedLocationKeys = new Set(
                Array.from(filters.locations).map((l) => normalizeLocationKey(l)),
            );
            filtered = filtered.filter((module) => {
                const parts = parseLocationParts(module.location);
                return parts.some((p) => selectedLocationKeys.has(normalizeLocationKey(p)));
            });
        }

        return filtered;
    }, [allModules, filters]);

    // Apply search query to filter modules by name
    const searchFilteredModules = useMemo(() => {
        if (!searchQuery.trim()) {
            return filteredModules;
        }
        const query = searchQuery.toLowerCase();
        return filteredModules.filter(
            (module) =>
                module.name.toLowerCase().includes(query) ||
                module.shortdescription?.toLowerCase().includes(query) ||
                module.description?.toLowerCase().includes(query),
        );
    }, [filteredModules, searchQuery]);

    useEffect(() => {
        setModules(searchFilteredModules);
        setCurrentPage(1);
    }, [searchFilteredModules]);

    const toggleFilter = (filterType: keyof FilterState, value: number | string) => {
        setFilters((prev) => {
            const newFilters = { ...prev };
            if (filterType === 'studyCredits') {
                const currentSet = new Set(newFilters.studyCredits);
                if (currentSet.has(value as number)) {
                    currentSet.delete(value as number);
                } else {
                    currentSet.add(value as number);
                }
                newFilters.studyCredits = currentSet;
            } else if (filterType === 'themes') {
                const currentSet = new Set(newFilters.themes);
                if (currentSet.has(value as string)) {
                    currentSet.delete(value as string);
                } else {
                    currentSet.add(value as string);
                }
                newFilters.themes = currentSet;
            } else if (filterType === 'difficulties') {
                const currentSet = new Set(newFilters.difficulties);
                if (currentSet.has(value as string)) {
                    currentSet.delete(value as string);
                } else {
                    currentSet.add(value as string);
                }
                newFilters.difficulties = currentSet;
            } else if (filterType === 'locations') {
                const currentSet = new Set(newFilters.locations);
                if (currentSet.has(value as string)) {
                    currentSet.delete(value as string);
                } else {
                    currentSet.add(value as string);
                }
                newFilters.locations = currentSet;
            }
            return newFilters;
        });
    };

    const clearFilters = () => {
        setFilters({
            studyCredits: new Set<number>(),
            themes: new Set<string>(),
            difficulties: new Set<string>(),
            locations: new Set<string>(),
        });
    };

    const hasActiveFilters =
        filters.studyCredits.size > 0 ||
        filters.themes.size > 0 ||
        filters.difficulties.size > 0 ||
        filters.locations.size > 0;

    const toggleFavorite = async (moduleId: string) => {
        const isFavorite = favorites.has(moduleId);

        // Optimistic update
        setFavorites((prev) => {
            const newFavorites = new Set(prev);
            if (isFavorite) {
                newFavorites.delete(moduleId);
            } else {
                newFavorites.add(moduleId);
            }
            return newFavorites;
        });

        try {
            await authService.toggleFavorite(moduleId, isFavorite);
        } catch (err) {
            // Revert on error
            setFavorites((prev) => {
                const newFavorites = new Set(prev);
                if (isFavorite) {
                    newFavorites.add(moduleId);
                } else {
                    newFavorites.delete(moduleId);
                }
                return newFavorites;
            });
            console.error('Error toggling favorite:', err);
        }
    };

    const getLevelTag = (level: string): string => {
        return level || 'P3';
    };

    const toggleCompareSelection = (moduleId: string) => {
        setSelectedForCompare((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                if (newSet.size >= 4) {
                    return prev;
                }
                newSet.add(moduleId);
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

    const totalPages = Math.ceil(modules.length / MODULES_PER_PAGE);
    const startIndex = (currentPage - 1) * MODULES_PER_PAGE;
    const endIndex = startIndex + MODULES_PER_PAGE;
    const currentModules = modules.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen theme-page w-full overflow-x-hidden">
            {/* Main Content */}
            <div
                className={`max-w-6xl mx-auto px-4 py-8 ${selectedForCompare.size > 0 ? 'pb-32 md:pb-8' : ''}`}
            >
                <h1 className="text-4xl font-bold theme-text-primary mb-4 text-center">
                    {t.modules.title}
                </h1>

                <p className="theme-text-secondary mb-6 text-center max-w-3xl mx-auto">
                    {t.modules.description}
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.modules.searchPlaceholder}
                            className="w-full theme-card theme-text-primary rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                        <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 theme-text-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </form>

                {/* Filter Buttons */}
                <div className="flex gap-4 justify-center mb-8">
                    <button
                        onClick={() => {
                            setShowAiKeuze(false);
                            setShowFilters(!showFilters);
                        }}
                        style={{
                            backgroundColor: !showAiKeuze && showFilters ? '#c4b5fd' : '#a78bfa',
                        }}
                        className={`px-6 py-3 rounded-lg font-medium text-base transition-colors ${
                            !showAiKeuze && showFilters
                                ? 'hover:bg-violet-400 text-black'
                                : 'hover:bg-violet-500 text-black'
                        }`}
                    >
                        {t.modules.filters}
                    </button>
                    <button
                        onClick={() => {
                            setShowAiKeuze(true);
                            setShowFilters(false);
                        }}
                        style={{ backgroundColor: showAiKeuze ? '#c4b5fd' : '#a78bfa' }}
                        className={`px-6 py-3 rounded-lg font-medium text-base transition-colors ${
                            showAiKeuze
                                ? 'hover:bg-violet-400 text-black'
                                : 'hover:bg-violet-500 text-black'
                        }`}
                    >
                        {t.modules.aiChoice}
                    </button>
                </div>

                {/* Compare Bar - Fixed bottom on mobile */}
                {selectedForCompare.size > 0 && (
                    <div className="fixed md:static bottom-0 left-0 right-0 theme-card-alt md:bg-violet-900 md:bg-opacity-30 border-t md:border border-violet-700 md:rounded-lg p-4 mb-0 md:mb-8 z-40 shadow-lg md:shadow-none">
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
                                    className="flex-1 md:flex-initial theme-button-secondary px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    {t.modules.compare.remove}
                                </button>
                                <button
                                    onClick={handleCompare}
                                    disabled={selectedForCompare.size < 2}
                                    style={{
                                        backgroundColor:
                                            selectedForCompare.size >= 2
                                                ? 'var(--accent)'
                                                : 'var(--bg-button)',
                                    }}
                                    className={`flex-1 md:flex-initial px-6 py-2 rounded-lg font-medium transition-colors ${
                                        selectedForCompare.size >= 2
                                            ? 'text-black hover:opacity-80 cursor-pointer'
                                            : 'theme-text-muted cursor-not-allowed'
                                    }`}
                                >
                                    {t.modules.compare.button}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Panel */}
                {!showAiKeuze && showFilters && (
                    <div className="mb-8">
                        <div className="flex items-center justify-end mb-4">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm theme-text-secondary hover:theme-text-accent underline transition-colors"
                                >
                                    {t.modules.clearFilters}
                                </button>
                            )}
                        </div>
                        <div className="theme-page rounded-lg p-6 border theme-border">
                            <div className="space-y-8">
                                {/* Moeilijkheidsgraad Filter */}
                                <div>
                                    <h3 className="text-xl font-bold theme-text-primary mb-4">
                                        {t.modules.difficulty}
                                    </h3>
                                    <div className="flex flex-wrap gap-4">
                                        {availableDifficulties.map((difficulty) => (
                                            <label
                                                key={difficulty}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.difficulties.has(difficulty)}
                                                    onChange={() =>
                                                        toggleFilter('difficulties', difficulty)
                                                    }
                                                    className="w-5 h-5 text-violet-500 theme-card-alt border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                                                />
                                                <span className="theme-text-primary">
                                                    {difficulty}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {/* Locatie Filter */}
                                <div>
                                    <h3 className="text-xl font-bold theme-text-primary mb-4">
                                        {t.modules.location}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {availableLocations.map((location) => (
                                            <label
                                                key={location}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.locations.has(location)}
                                                    onChange={() =>
                                                        toggleFilter('locations', location)
                                                    }
                                                    className="w-5 h-5 text-violet-500 theme-card-alt border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                                                />
                                                <span className="theme-text-primary">
                                                    {location}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {/* Studiepunten Filter */}
                                <div>
                                    <h3 className="text-xl font-bold theme-text-primary mb-4">
                                        {t.modules.studyCredits}
                                    </h3>
                                    <div className="flex flex-wrap gap-4">
                                        {availableStudyCredits.map((credits) => (
                                            <label
                                                key={credits}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filters.studyCredits.has(credits)}
                                                    onChange={() =>
                                                        toggleFilter('studyCredits', credits)
                                                    }
                                                    className="w-5 h-5 text-violet-500 theme-card-alt border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                                                />
                                                <span className="theme-text-primary">
                                                    {credits} ECTS
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <div className="mt-6 text-sm theme-text-secondary">
                                    {filteredModules.length} {t.modules.modulesFound}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
                        <p className="font-bold">{t.modules.error}</p>
                        <p>{error}</p>
                        <button
                            onClick={loadModules}
                            style={{ backgroundColor: 'var(--accent)' }}
                            className="mt-2 text-black px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-colors"
                        >
                            {t.modules.tryAgain}
                        </button>
                    </div>
                )}

                {/* Module Cards */}
                {isLoading ? (
                    <div className="text-center py-12 theme-text-muted">{t.modules.loading}</div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={loadModules}
                            style={{ backgroundColor: 'var(--accent)' }}
                            className="text-black px-6 py-2.5 rounded-lg font-medium hover:opacity-80 transition-colors"
                        >
                            {t.modules.tryAgain}
                        </button>
                    </div>
                ) : modules.length === 0 ? (
                    <div className="text-center py-12 theme-text-muted">
                        <p>{t.modules.noModulesFound}</p>
                        <p className="text-sm mt-2">{t.modules.checkConsole}</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6 mb-8">
                            {currentModules.map((module) => (
                                <div
                                    key={module.id}
                                    className="theme-card rounded-lg p-6 relative p"
                                >
                                    {/* Compare Checkbox - Fixed position */}
                                    <div className="absolute top-6 right-6 z-10">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedForCompare.has(module.id)}
                                                    onChange={() =>
                                                        toggleCompareSelection(module.id)
                                                    }
                                                    disabled={
                                                        !selectedForCompare.has(module.id) &&
                                                        selectedForCompare.size >= 4
                                                    }
                                                    className="peer sr-only"
                                                />
                                                <div className="w-6 h-6 border-2 border-violet-400 rounded-md theme-card-alt peer-checked:bg-violet-600 peer-checked:border-violet-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center">
                                                    <svg
                                                        className={`w-4 h-4 text-white transition-all duration-200 ${
                                                            selectedForCompare.has(module.id)
                                                                ? 'opacity-100 scale-100'
                                                                : 'opacity-0 scale-50'
                                                        }`}
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
                                    <div className="flex-1 pr-12 md:pr-16">
                                        {/* Tags */}
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            <span className="bg-green-700 text-white px-3 py-1 rounded text-sm font-medium">
                                                {getLevelTag(module.level)}
                                            </span>
                                            <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
                                                {module.studycredit} ECTS
                                            </span>
                                            <span className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium">
                                                {module.location || t.modules.unknown}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-xl font-bold theme-text-primary mb-2">
                                            {module.name ||
                                                'Lorem ipsum dolor sit amet, consectetur'}
                                        </h2>

                                        {/* Description */}
                                        <p className="theme-text-secondary mb-4">
                                            {truncateDescription(
                                                module.shortdescription || module.description,
                                                MAX_DESCRIPTION_LENGTH,
                                            ) ||
                                                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...'}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-4 justify-end">
                                            <button
                                                onClick={() =>
                                                    navigate(`/keuzemodules/${module.id}`)
                                                }
                                                style={{ backgroundColor: 'var(--accent)' }}
                                                className="text-black px-6 py-2.5 rounded-lg font-medium hover:opacity-80 transition-colors"
                                            >
                                                {t.modules.learnMore}
                                            </button>
                                            <button
                                                onClick={() => toggleFavorite(module.id)}
                                                className="p-2 hover:opacity-70 transition-opacity"
                                            >
                                                {favorites.has(module.id) ? (
                                                    <svg
                                                        className="w-6 h-6 theme-text-primary fill-current"
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
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        backgroundColor:
                                            currentPage === 1
                                                ? 'var(--bg-button)'
                                                : 'var(--accent)',
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        currentPage === 1
                                            ? 'theme-text-muted cursor-not-allowed'
                                            : 'text-black hover:opacity-80'
                                    }`}
                                >
                                    {t.modules.previous}
                                </button>

                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                        (page) => {
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        style={{
                                                            backgroundColor:
                                                                currentPage === page
                                                                    ? 'var(--accent)'
                                                                    : 'var(--accent-hover)',
                                                        }}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                            currentPage === page
                                                                ? 'text-black hover:opacity-80'
                                                                : 'text-black hover:opacity-80'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (
                                                page === currentPage - 2 ||
                                                page === currentPage + 2
                                            ) {
                                                return (
                                                    <span
                                                        key={page}
                                                        className="px-2 theme-text-muted"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        },
                                    )}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        backgroundColor:
                                            currentPage === totalPages
                                                ? 'var(--bg-button)'
                                                : 'var(--accent)',
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        currentPage === totalPages
                                            ? 'theme-text-muted cursor-not-allowed'
                                            : 'text-black hover:opacity-80'
                                    }`}
                                >
                                    {t.modules.next}
                                </button>
                            </div>
                        )}

                        <div className="text-center theme-text-secondary text-sm mt-4">
                            {t.modules.pageOf
                                .replace('{current}', String(currentPage))
                                .replace('{total}', String(totalPages))
                                .replace('{count}', String(modules.length))}
                        </div>
                    </>
                )}
            </div>

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
