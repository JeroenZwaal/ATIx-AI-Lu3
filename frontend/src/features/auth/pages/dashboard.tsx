import { useNavigate } from 'react-router-dom';
import type { Module } from '../../../shared/types/index';

interface DashboardProps {
    favoriteModules?: Module[];
    onToggleFavorite?: (moduleId: string) => void;
    onModuleClick?: (moduleId: string) => void;
}

export default function Dashboard({
    favoriteModules = [],
    onToggleFavorite,
    onModuleClick,
}: DashboardProps) {
    const navigate = useNavigate();

    // Default favorite modules - replace with real data later
    const defaultFavoriteModules: Module[] = [
        {
            id: '1',
            externalId: 1,
            name: 'Module 1',
            shortdescription:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            description: '',
            content: '',
            studycredit: 5,
            location: 'Breda',
            contactId: 1,
            level: 'NLQF5',
            learningoutcomes: '',
            tags: [],
            combinedText: '',
        },
        {
            id: '2',
            externalId: 2,
            name: 'Module 2',
            shortdescription:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            description: '',
            content: '',
            studycredit: 5,
            location: 'Breda',
            contactId: 1,
            level: 'NLQF6',
            learningoutcomes: '',
            tags: [],
            combinedText: '',
        },
        {
            id: '3',
            externalId: 3,
            name: 'Module 3',
            shortdescription:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            description: '',
            content: '',
            studycredit: 5,
            location: 'Breda',
            contactId: 1,
            level: 'NLQF5',
            learningoutcomes: '',
            tags: [],
            combinedText: '',
        },
    ];

    const modulesToShow = favoriteModules.length > 0 ? favoriteModules : defaultFavoriteModules;

    const handleModuleClick = (moduleId: string) => {
        if (onModuleClick) {
            onModuleClick(moduleId);
        } else {
            navigate(`/keuzemodules/${moduleId}`);
        }
    };

    const handleToggleFavorite = (moduleId: string) => {
        if (onToggleFavorite) {
            onToggleFavorite(moduleId);
        }
    };

    const getLevelTag = (level: string): string => {
        return level || 'P3';
    };

    return (
        <div className="min-h-screen bg-neutral-950 w-full overflow-x-hidden">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">Dashboard</h1>

                {/* Favoriete Modules Section */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        Favoriete Modules
                    </h2>

                    <div className="space-y-6">
                        {modulesToShow.map((module) => (
                            <div key={module.id} className="bg-gray-700 rounded-lg p-4">
                                <div className="flex gap-2 mb-3">
                                    <span className="bg-green-700 text-white px-3 py-1 rounded text-sm font-medium">
                                        {getLevelTag(module.level)}
                                    </span>
                                    <span className="bg-red-800 text-white px-3 py-1 rounded text-sm font-medium">
                                        {module.studycredit} ETC
                                    </span>
                                    <span className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium">
                                        {module.location || 'Onbekend'}
                                    </span>
                                </div>

                                <p className="text-gray-300 mb-4">
                                    {module.shortdescription ||
                                        module.description ||
                                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'}
                                </p>

                                <div className="flex items-center justify-end gap-4">
                                    <button
                                        onClick={() => handleModuleClick(module.id)}
                                        className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                                    >
                                        Meer weten
                                    </button>
                                    <button
                                        onClick={() => handleToggleFavorite(module.id)}
                                        className="p-2 hover:opacity-70 transition-opacity"
                                        aria-label="Toggle favorite"
                                    >
                                        <svg
                                            className="w-6 h-6 text-black fill-current"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
