import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { moduleService } from '../services/module.service';
import type { Module } from '../../../shared/types/index';

const MODULES_PER_PAGE = 10;

interface FilterState {
    studyCredits: Set<number>;
    themes: Set<string>;
    difficulties: Set<string>;
    locations: Set<string>;
}

export default function Keuzemodules() {
    const navigate = useNavigate();
    const [modules, setModules] = useState<Module[]>([]);
    const [allModules, setAllModules] = useState<Module[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [showAiKeuze, setShowAiKeuze] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<FilterState>({
        studyCredits: new Set<number>(),
        themes: new Set<string>(),
        difficulties: new Set<string>(),
        locations: new Set<string>(),
    });

    useEffect(() => {
        loadModules();
    }, []);

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

    const availableThemes = useMemo(() => {
        const themes = new Set<string>();
        allModules.forEach((module) => {
            if (module.tags && Array.isArray(module.tags)) {
                module.tags.forEach((tag) => {
                    if (tag && tag !== 'NL' && tag !== 'EN') {
                        themes.add(tag);
                    }
                });
            }
        });
        return Array.from(themes).sort();
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
        const locations = new Set<string>();
        allModules.forEach((module) => {
            if (module.location) {
                const location = module.location.trim();
                if (location) {
                    locations.add(location);
                }
            }
        });
        return Array.from(locations).sort();
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
            filtered = filtered.filter((module) => filters.locations.has(module.location.trim()));
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

    const toggleFavorite = (moduleId: string) => {
        setFavorites((prev) => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(moduleId)) {
                newFavorites.delete(moduleId);
            } else {
                newFavorites.add(moduleId);
            }
            return newFavorites;
        });
    };

    const getLevelTag = (level: string): string => {
        return level || 'P3';
    };

    const totalPages = Math.ceil(modules.length / MODULES_PER_PAGE);
    const startIndex = (currentPage - 1) * MODULES_PER_PAGE;
    const endIndex = startIndex + MODULES_PER_PAGE;
    const currentModules = modules.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-neutral-950 w-full overflow-x-hidden">
            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-white mb-4 text-center">Keuzemodules</h1>

                <p className="text-gray-300 mb-6 text-center max-w-3xl mx-auto">
                    Hier vind je alle keuzemodules die je kunt volgen binnen je opleiding. Bekijk
                    het aanbod, ontdek wat bij jou past en kies de module die aansluit op jouw
                    interesses en ambities.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Zoeken..."
                            className="w-full bg-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                        <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600"
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
                        Filters
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
                        Ai Keuze
                    </button>
                </div>

                {/* Filter Panel */}
                {!showAiKeuze && showFilters && (
                    <div className="mb-8">
                        <div className="flex items-center justify-end mb-4">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-gray-300 hover:text-violet-400 underline transition-colors"
                                >
                                    Filters wissen
                                </button>
                            )}
                        </div>
                        <div className="bg-neutral-950 rounded-lg p-6 border border-gray-800">
                            <div className="space-y-8">
                                {/* Moeilijkheidsgraad Filter */}
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">
                                        Moeilijkheidsgraad
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
                                                    className="w-5 h-5 text-violet-500 bg-neutral-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                                                />
                                                <span className="text-white">{difficulty}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Locatie Filter */}
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">Locatie</h3>
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
                                                    className="w-5 h-5 text-violet-500 bg-neutral-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                                                />
                                                <span className="text-white">{location}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Studiepunten Filter */}
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">
                                        Studiepunten
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
                                                    className="w-5 h-5 text-violet-500 bg-neutral-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                                                />
                                                <span className="text-white">{credits} ETC</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Thema Filter */}
                                {availableThemes.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-4">Thema</h3>
                                        <div className="flex flex-wrap gap-4">
                                            {availableThemes.map((theme) => (
                                                <label
                                                    key={theme}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.themes.has(theme)}
                                                        onChange={() =>
                                                            toggleFilter('themes', theme)
                                                        }
                                                        className="w-5 h-5 text-violet-500 bg-neutral-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                                                    />
                                                    <span className="text-white">{theme}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {hasActiveFilters && (
                                <div className="mt-6 text-sm text-gray-300">
                                    {filteredModules.length} module(s) gevonden
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
                        <p className="font-bold">Error:</p>
                        <p>{error}</p>
                        <button
                            onClick={loadModules}
                            style={{ backgroundColor: '#c4b5fd' }}
                            className="mt-2 text-black px-4 py-2 rounded-lg font-medium hover:bg-violet-400 transition-colors"
                        >
                            Opnieuw proberen
                        </button>
                    </div>
                )}

                {/* Module Cards */}
                {isLoading ? (
                    <div className="text-center py-12 text-gray-600">Laden...</div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={loadModules}
                            style={{ backgroundColor: '#c4b5fd' }}
                            className="text-black px-6 py-2.5 rounded-lg font-medium hover:bg-violet-400 transition-colors"
                        >
                            Opnieuw proberen
                        </button>
                    </div>
                ) : modules.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                        <p>Geen modules gevonden</p>
                        <p className="text-sm mt-2">Check de console voor meer details</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6 mb-8">
                            {currentModules.map((module) => (
                                <div key={module.id} className="bg-gray-800 rounded-lg p-6">
                                    {/* Module Content */}
                                    <div className="flex-1">
                                        {/* Tags */}
                                        <div className="flex gap-2 mb-3">
                                            <span className="bg-green-700 text-white px-3 py-1 rounded text-sm font-medium">
                                                {getLevelTag(module.level)}
                                            </span>
                                            <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
                                                {module.studycredit} ETC
                                            </span>
                                            <span className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium">
                                                {module.location || 'Onbekend'}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-xl font-bold text-white mb-2">
                                            {module.name ||
                                                'Lorem ipsum dolor sit amet, consectetur'}
                                        </h2>

                                        {/* Description */}
                                        <p className="text-gray-300 mb-4">
                                            {module.shortdescription ||
                                                module.description ||
                                                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-4 justify-end">
                                            <button
                                                onClick={() =>
                                                    navigate(`/keuzemodules/${module.id}`)
                                                }
                                                style={{ backgroundColor: '#c4b5fd' }}
                                                className="text-black px-6 py-2.5 rounded-lg font-medium hover:bg-violet-400 transition-colors"
                                            >
                                                Meer weten
                                            </button>
                                            <button
                                                onClick={() => toggleFavorite(module.id)}
                                                className="p-2 hover:opacity-70 transition-opacity"
                                            >
                                                {favorites.has(module.id) ? (
                                                    <svg
                                                        className="w-6 h-6 text-white fill-current"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        className="w-6 h-6 text-white"
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
                                        backgroundColor: currentPage === 1 ? '#374151' : '#c4b5fd',
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        currentPage === 1
                                            ? 'text-gray-500 cursor-not-allowed'
                                            : 'text-black hover:bg-violet-400'
                                    }`}
                                >
                                    Vorige
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
                                                                    ? '#c4b5fd'
                                                                    : '#a78bfa',
                                                        }}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                            currentPage === page
                                                                ? 'text-black hover:bg-violet-400'
                                                                : 'text-black hover:bg-violet-500'
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
                                                    <span key={page} className="px-2 text-gray-400">
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
                                            currentPage === totalPages ? '#374151' : '#c4b5fd',
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        currentPage === totalPages
                                            ? 'text-gray-500 cursor-not-allowed'
                                            : 'text-black hover:bg-violet-400'
                                    }`}
                                >
                                    Volgende
                                </button>
                            </div>
                        )}

                        <div className="text-center text-gray-300 text-sm mt-4">
                            Pagina {currentPage} van {totalPages} ({modules.length} modules totaal)
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
