import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
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
    }, [userProfile, fetchUserProfile]);

    // Handlers blijven hetzelfde
    const handleModuleClick = (moduleId: string) => {
        if (onModuleClick) {
            onModuleClick(moduleId);
        } else {
            navigate(`/keuzemodules/${moduleId}`, { state: { from: '/dashboard' } });
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

    const handleExportFavorites = () => {
        if (favoriteModules.length === 0) {
            alert('Geen favorieten om te exporteren');
            return;
        }

        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;
        const maxWidth = pageWidth - 2 * margin;
        let yPosition = margin;

        // Title
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Mijn Favoriete Modules', margin, yPosition);
        yPosition += 10;

        // Date
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Geëxporteerd op: ${new Date().toLocaleDateString('nl-NL')}`, margin, yPosition);
        yPosition += 15;

        favoriteModules.forEach((module, index) => {
            if (index > 0 && index % 2 === 0) {
                pdf.addPage();
                yPosition = margin;
            }

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            const titleLines = pdf.splitTextToSize(module.name, maxWidth);
            pdf.text(titleLines, margin, yPosition);
            yPosition += titleLines.length * 7;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const info = `${getLevelTag(module.level)} | ${module.studycredit} ETC | ${module.location || 'Onbekend'}`;
            pdf.text(info, margin, yPosition);
            yPosition += 7;

            if (module.shortdescription) {
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Korte beschrijving:', margin, yPosition);
                yPosition += 5;
                pdf.setFont('helvetica', 'normal');
                const shortDescLines = pdf.splitTextToSize(module.shortdescription, maxWidth - 5);
                pdf.text(shortDescLines, margin + 5, yPosition);
                yPosition += shortDescLines.length * 5;
                yPosition += 3;
            }

            if (module.description) {
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Beschrijving:', margin, yPosition);
                yPosition += 5;
                pdf.setFont('helvetica', 'normal');
                const descLines = pdf.splitTextToSize(module.description, maxWidth - 5);
                pdf.text(descLines, margin + 5, yPosition);
                yPosition += descLines.length * 5;
                yPosition += 3;
            }

            if (module.content) {
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Inhoud:', margin, yPosition);
                yPosition += 5;
                pdf.setFont('helvetica', 'normal');
                const contentLines = pdf.splitTextToSize(module.content, maxWidth - 5);
                pdf.text(contentLines, margin + 5, yPosition);
                yPosition += contentLines.length * 5;
                yPosition += 3;
            }

            if (module.learningoutcomes) {
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Leerdoelen:', margin, yPosition);
                yPosition += 5;
                pdf.setFont('helvetica', 'normal');
                const outcomesLines = pdf.splitTextToSize(module.learningoutcomes, maxWidth - 5);
                pdf.text(outcomesLines, margin + 5, yPosition);
                yPosition += outcomesLines.length * 5;
                yPosition += 3;
            }

            if (module.tags && module.tags.length > 0) {
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Tags:', margin, yPosition);
                yPosition += 5;
                pdf.setFont('helvetica', 'normal');
                pdf.text(module.tags.join(', '), margin + 5, yPosition);
                yPosition += 5;
            }

            // Separator line
            if (index < favoriteModules.length - 1) {
                yPosition += 5;
                pdf.setDrawColor(200, 200, 200);
                pdf.line(margin, yPosition, pageWidth - margin, yPosition);
                yPosition += 10;
            }
        });

        // Save PDF
        pdf.save(`favoriete-modules-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="min-h-screen theme-page w-full overflow-x-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-10 py-8 ">
                <h1 className="text-4xl font-bold theme-text-primary mb-4 text-center">
                    {t.dashboard.title}
                </h1>

                <div className="flex flex-col items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/recomendation')}
                        className="btn-primary group relative px-8 py-3 shadow-sm hover:shadow-md"
                    >
                        Bekijk AI Aanbevelingen
                    </button>
                </div>

                <div className="theme-card rounded-lg p-4 sm:p-6 mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold theme-text-primary mb-4 text-center">
                        {t.dashboard.profile.title}
                    </h2>

                    {!userProfile ? (
                        <p className="theme-text-muted text-center">
                            {t.dashboard.profile.loading}
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold theme-text-primary mb-1">
                                        {t.dashboard.profile.studyProgram}
                                    </h3>
                                    <p className="theme-text-secondary">
                                        {userProfile.studyProgram}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold theme-text-primary mb-1">
                                        {t.dashboard.profile.yearOfStudy}
                                    </h3>
                                    <p className="theme-text-secondary">
                                        {userProfile.yearOfStudy}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold theme-text-primary mb-1">
                                        {t.dashboard.profile.studyLocation}
                                    </h3>
                                    <p className="theme-text-secondary">
                                        {userProfile.studyLocation || '—'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold theme-text-primary mb-1">
                                        {t.dashboard.profile.studyCredits}
                                    </h3>
                                    <p className="theme-text-secondary">
                                        {userProfile.studyCredits}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold theme-text-primary mb-2">
                                    {t.dashboard.profile.skills}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {userProfile.skills?.map((s) => (
                                        <span
                                            key={s}
                                            className="inline-block bg-[#F89BD1] text-[#4E0734] px-3 py-1 rounded-full text-sm font-medium"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold theme-text-primary mb-2">
                                    {t.dashboard.profile.interests}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {userProfile.interests?.map((i) => (
                                        <span
                                            key={i}
                                            className="inline-block bg-[#A0C5F9] text-[#08284D] px-3 py-1 rounded-full text-sm font-medium"
                                        >
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/profile/createProfile')}
                                className="btn-secondary w-full sm:w-auto"
                            >
                                {t.dashboard.profile.editProfile}
                            </button>
                        </div>
                    )}
                </div>
                <div className="theme-card rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold theme-text-primary">
                            {t.dashboard.favoriteModules}
                        </h2>
                        <button
                            onClick={handleExportFavorites}
                            className="btn-primary flex items-center gap-2 px-4 py-2"
                            disabled={favoriteModules.length === 0}
                            title="Exporteer favorieten naar PDF"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="text-center theme-text-primary py-8">
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
                        <div className="text-center theme-text-muted py-8">
                            <p>{t.dashboard.noFavorites}</p>
                        </div>
                    )}

                    {/* Modules lijst */}
                    {!isLoading && !error && favoriteModules.length > 0 && (
                        <div className="space-y-6">
                            {favoriteModules.map((module) => (
                                <div
                                    key={module.id}
                                    className="theme-card-alt rounded-lg p-6 relative"
                                >
                                    {/* Module Content */}
                                    <div className="flex-1">
                                        {/* Tags */}
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            <span className="bg-green-700/20 text-green-400 px-3 py-1 rounded text-sm font-medium">
                                                {getLevelTag(module.level)}
                                            </span>
                                            <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded text-sm font-medium">
                                                {module.studycredit} ECTS
                                            </span>
                                            <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded text-sm font-medium">
                                                {module.location || t.dashboard.unknown}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold theme-text-primary mb-2 break-words hyphens-auto">
                                            {module.name}
                                        </h3>

                                        {/* Description */}
                                        <p className="theme-text-secondary mb-4 break-words">
                                            {module.shortdescription ||
                                                module.description ||
                                                t.dashboard.noDescription}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => handleModuleClick(module.id)}
                                                className="btn-accent whitespace-nowrap shrink-0"
                                            >
                                                {t.dashboard.learnMore}
                                            </button>
                                            <button
                                                onClick={() => handleToggleFavorite(module.id)}
                                                className="p-2 hover:opacity-70 transition-opacity shrink-0"
                                                aria-label="Toggle favorite"
                                            >
                                                <svg
                                                    className="w-6 h-6 fill-current"
                                                    style={{ color: '#ff3b3b' }}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                </svg>
                                            </button>
                                        </div>
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
