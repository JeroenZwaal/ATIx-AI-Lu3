import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { moduleService } from '../services/module.service';
import { useAuth } from '../../auth/hooks/useAuth.tsx';
import type { Module } from '../../../shared/types/index';

const MODULES_PER_PAGE = 10;

export default function Keuzemodules() {
    const [modules, setModules] = useState<Module[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [showAiKeuze, setShowAiKeuze] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await moduleService.getAllModules();
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
            setModules(data);
            setCurrentPage(1);
        } catch (error) {
            console.error('Failed to search modules:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const getLanguageTag = (tags: string[] | undefined): string => {
        if (!tags || !Array.isArray(tags)) return 'NL';
        const langTag = tags.find((tag) => tag === 'NL' || tag === 'EN');
        return langTag || 'NL';
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
        <div className="min-h-screen bg-gray-100 w-full overflow-x-hidden">
            {/* Navigation Header */}
            <nav className="bg-gray-800 text-white px-6 py-4 w-full">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold">Avans KeuzeKompas</h1>
                        <div className="flex gap-4">
                            <Link
                                to="/dashboard"
                                className="hover:text-orange-400 transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/keuzemodules"
                                className="hover:text-orange-400 transition-colors font-semibold"
                            >
                                Keuzemodules
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <span className="text-sm">
                                {user.firstName} {user.lastName}
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            Uitloggen
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-black mb-4 text-center">Keuzemodules</h1>

                <p className="text-gray-700 mb-6 text-center max-w-3xl mx-auto">
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
                        onClick={() => setShowAiKeuze(false)}
                        className={`px-6 py-2 rounded-lg font-medium ${
                            !showAiKeuze
                                ? 'bg-gray-300 text-black'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        Filters
                    </button>
                    <button
                        onClick={() => setShowAiKeuze(true)}
                        className={`px-6 py-2 rounded-lg font-medium ${
                            showAiKeuze
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        Ai Keuze
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-bold">Error:</p>
                        <p>{error}</p>
                        <button
                            onClick={loadModules}
                            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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
                            className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
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
                                <div key={module.id} className="bg-gray-200 rounded-lg p-6">
                                    {/* Module Content */}
                                    <div className="flex-1">
                                        {/* Tags */}
                                        <div className="flex gap-2 mb-3">
                                            <span className="bg-green-700 text-white px-3 py-1 rounded text-sm font-medium">
                                                {getLevelTag(module.level)}
                                            </span>
                                            <span className="bg-red-800 text-white px-3 py-1 rounded text-sm font-medium">
                                                {module.studycredit} ETC
                                            </span>
                                            <span className="bg-purple-800 text-white px-3 py-1 rounded text-sm font-medium">
                                                {getLanguageTag(module.tags)}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-xl font-bold text-black mb-2">
                                            {module.name ||
                                                'Lorem ipsum dolor sit amet, consectetur'}
                                        </h2>

                                        {/* Description */}
                                        <p className="text-gray-700 mb-4">
                                            {module.shortdescription ||
                                                module.description ||
                                                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-4 justify-end">
                                            <button className="bg-gray-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors">
                                                Meer weten
                                            </button>
                                            <button
                                                onClick={() => toggleFavorite(module.id)}
                                                className="p-2 hover:opacity-70 transition-opacity"
                                            >
                                                {favorites.has(module.id) ? (
                                                    <svg
                                                        className="w-6 h-6 text-black fill-current"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        className="w-6 h-6 text-black"
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
                                    className={`px-4 py-2 rounded-lg font-medium ${
                                        currentPage === 1
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-700 text-white hover:bg-gray-600'
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
                                                        className={`px-4 py-2 rounded-lg font-medium ${
                                                            currentPage === page
                                                                ? 'bg-gray-700 text-white'
                                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                                                    <span key={page} className="px-2 text-gray-500">
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
                                    className={`px-4 py-2 rounded-lg font-medium ${
                                        currentPage === totalPages
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-700 text-white hover:bg-gray-600'
                                    }`}
                                >
                                    Volgende
                                </button>
                            </div>
                        )}

                        <div className="text-center text-gray-600 text-sm mt-4">
                            Pagina {currentPage} van {totalPages} ({modules.length} modules totaal)
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
