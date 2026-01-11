import type { Module } from '../../../shared/types/index';
import { useLanguage } from '../../../shared/contexts/useLanguage';
import type { JSX } from 'react';

interface ModuleCompareModalProps {
    modules: Module[];
    onClose: () => void;
}

export default function ModuleCompareModal({ modules, onClose }: ModuleCompareModalProps) {
    const { t } = useLanguage();

    const compareFields: Array<{ key: keyof Module; label: string }> = [
        { key: 'name', label: t.modules.compare.fields.name },
        { key: 'studycredit', label: t.modules.compare.fields.studycredit },
        { key: 'level', label: t.modules.compare.fields.level },
        { key: 'location', label: t.modules.compare.fields.location },
        { key: 'shortdescription', label: t.modules.compare.fields.shortdescription },
        { key: 'tags', label: t.modules.compare.fields.tags },
    ];

    const findSimilarities = (): string[] => {
        const similarities: string[] = [];

        if (modules.length < 2) return similarities;

        // Check studiepunten - met null checks
        const credits = modules.map((m) => m.studycredit).filter((c) => c != null);
        if (credits.length === modules.length && credits.every((c) => c === credits[0])) {
            similarities.push(`${t.modules.compare.fields.studycredit}: ${credits[0]} ECTS`);
        }

        // Check niveau - met null/lege string checks
        const levels = modules
            .map((m) => m.level?.toUpperCase()?.trim() || '')
            .filter((l) => l !== '');
        if (levels.length === modules.length && levels.every((l) => l === levels[0])) {
            similarities.push(`${t.modules.compare.fields.level}: ${levels[0]}`);
        }

        // Check locatie - met null/lege string checks
        const locations = modules.map((m) => m.location?.trim() || '').filter((l) => l !== '');
        if (locations.length === modules.length && locations.every((l) => l === locations[0])) {
            similarities.push(`${t.modules.compare.fields.location}: ${locations[0]}`);
        }

        // Check gemeenschappelijke tags - alleen modules met tags
        const modulesWithTags = modules.filter(
            (m) => m.tags && Array.isArray(m.tags) && m.tags.length > 0,
        );
        if (modulesWithTags.length >= 2) {
            const tagSets = modulesWithTags.map((m) => new Set(m.tags));
            const commonTags = new Set<string>();
            // Vind intersectie van alle tag sets
            tagSets[0].forEach((tag) => {
                if (tagSets.every((tagSet) => tagSet.has(tag))) {
                    commonTags.add(tag);
                }
            });
            if (commonTags.size > 0) {
                similarities.push(
                    `${t.modules.compare.fields.tags}: ${Array.from(commonTags).join(', ')}`,
                );
            }
        }

        return similarities;
    };

    const similarities = findSimilarities();

    const getFieldValue = (module: Module, key: keyof Module): string | JSX.Element => {
        const value = module[key];
        // Special handling for tags
        if (key === 'tags' && Array.isArray(value)) {
            if (value.length === 0) return '-';
            return (
                <div className="flex flex-wrap gap-2">
                    {value.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-violet-600 text-white px-2 py-1 rounded text-xs font-medium"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            );
        }

        // Handle null/undefined
        if (value == null) return '-';

        // Handle arrays
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(', ') : '-';
        }

        // Handle numbers
        if (typeof value === 'number') {
            return String(value);
        }

        // Handle strings
        if (typeof value === 'string') {
            return value.trim() || '-';
        }

        return String(value);
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-modal-title"
        >
            <div className="bg-neutral-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-800">
                {/* Header - sticky */}
                <div className="sticky top-0 bg-gradient-to-r from-violet-900 to-purple-900 border-b border-violet-700 p-4 md:p-6 z-10 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                            {t.modules.compare.title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                            aria-label={t.modules.compare.close}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 space-y-6">
                    {/* Similarities Section */}
                    {similarities.length > 0 && (
                        <div className="bg-gradient-to-br from-green-900 to-emerald-900 bg-opacity-40 border-2 border-green-600 rounded-xl p-5 shadow-lg">
                            <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {t.modules.compare.similarities}
                            </h3>
                            <ul className="space-y-2">
                                {similarities.map((similarity, index) => (
                                    <li key={index} className="text-green-200 flex items-start">
                                        <svg
                                            className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-400"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="font-medium">{similarity}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Differences Section - Mobile: Cards, Desktop: Table */}
                    <div>
                        <h3 className="text-xl font-bold text-violet-300 mb-4 flex items-center gap-2">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            {t.modules.compare.differences}
                        </h3>

                        {/* Mobile View - Cards */}
                        <div className="md:hidden space-y-6">
                            {modules.map((module) => (
                                <div
                                    key={module.id}
                                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 shadow-lg hover:border-violet-500 transition-colors"
                                >
                                    <h4 className="text-lg font-bold text-white mb-4 pb-3 border-b border-gray-700 flex items-center gap-2">
                                        <span className="bg-violet-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                            {modules.indexOf(module) + 1}
                                        </span>
                                        {module.name}
                                    </h4>
                                    <div className="space-y-4">
                                        {compareFields.map((field) => (
                                            <div key={field.key} className="space-y-1">
                                                <div className="text-sm text-violet-300 font-semibold">
                                                    {field.label}
                                                </div>
                                                <div className="text-white bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                                                    {getFieldValue(module, field.key)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View - Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-violet-900 to-purple-900 border-b-2 border-violet-600">
                                        <th className="text-left p-4 text-violet-200 font-semibold w-48 rounded-tl-lg">
                                            &nbsp;
                                        </th>
                                        {modules.map((module, index) => (
                                            <th
                                                key={module.id}
                                                className={`text-left p-4 text-white font-bold ${
                                                    index === modules.length - 1
                                                        ? 'rounded-tr-lg'
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 max-w-xs">
                                                    <span className="bg-violet-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                        {index + 1}
                                                    </span>
                                                    <span>{module.name}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {compareFields.map((field, fieldIndex) => (
                                        <tr
                                            key={field.key}
                                            className={`border-b border-gray-800 transition-colors hover:bg-gray-800 ${
                                                fieldIndex % 2 === 0
                                                    ? 'bg-gray-900 bg-opacity-50'
                                                    : ''
                                            }`}
                                        >
                                            <td className="p-4 text-violet-300 font-semibold">
                                                {field.label}
                                            </td>
                                            {modules.map((module) => (
                                                <td key={module.id} className="p-4 text-white">
                                                    <div className="max-w-xs break-words">
                                                        {getFieldValue(module, field.key)}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer - sticky */}
                <div className="sticky bottom-0 bg-gradient-to-r from-violet-900 to-purple-900 border-t border-violet-700 p-4 md:p-6 rounded-b-xl">
                    <button
                        onClick={onClose}
                        style={{ backgroundColor: '#c4b5fd' }}
                        className="w-full md:w-auto px-8 py-3 rounded-lg font-semibold text-black hover:bg-violet-400 transition-all hover:shadow-lg transform hover:scale-105"
                    >
                        {t.modules.compare.close}
                    </button>
                </div>
            </div>
        </div>
    );
}
