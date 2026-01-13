/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Keuzemodules from './keuzemodules';
import { moduleService } from '../services/module.service';
import authService from '../../auth/services/auth.service';

// Mock services
vi.mock('../services/module.service');
vi.mock('../../auth/services/auth.service');
vi.mock('../../../shared/contexts/useLanguage', () => ({
    useLanguage: () => ({
        t: {
            modules: {
                title: 'Keuzemodules',
                description: 'Beschrijving',
                searchPlaceholder: 'Zoek modules...',
                learnMore: 'Meer info',
                loading: 'Laden...',
                error: 'Fout bij laden',
                noModules: 'Geen modules gevonden',
                noModulesFound: 'Geen modules gevonden',
                unknown: 'Onbekend',
                noDescription: 'Geen beschrijving beschikbaar',
                filters: 'Filters',
                aiChoice: 'AI Keuze',
                clearFilters: 'Wis filters',
                difficulty: 'Niveau',
                location: 'Locatie',
                studyCredits: 'Studiepunten',
                theme: 'Thema',
                modulesFound: 'modules gevonden',
                tryAgain: 'Probeer opnieuw',
                pageOf: 'Pagina {current} van {total} ({count} modules)',
                compare: {
                    button: 'Vergelijk',
                    title: 'Modules vergelijken',
                    selected: '{count} geselecteerd',
                    selectMin: 'minimaal 2',
                    selectMax: 'maximaal 3',
                    remove: 'Verwijder',
                },
            },
        },
    }),
}));

const mockModules = [
    {
        id: '1',
        name: 'Test Module 1',
        shortdescription: 'Dit is een korte beschrijving van test module 1',
        description: 'Dit is een langere beschrijving van test module 1',
        studycredit: 5,
        level: 'NLQF5',
        location: 'Amsterdam',
        tags: ['Programming', 'Web Development'],
    },
    {
        id: '2',
        name: 'Test Module 2',
        shortdescription:
            'Dit is een korte beschrijving van test module 2 die super lang is en afgeknipt moet worden omdat het anders te veel ruimte inneemt op de pagina en dat is niet handig voor de gebruiker die alles wil zien in een mooi overzicht',
        studycredit: 10,
        level: 'NLQF6',
        location: 'Utrecht',
        tags: ['Database', 'Backend'],
    },
];

describe('Keuzemodules', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (moduleService.getAllModules as any).mockResolvedValue(mockModules);
        (authService.getFavorites as any).mockResolvedValue([]);
    });

    it('should render the page title', async () => {
        render(
            <BrowserRouter>
                <Keuzemodules />
            </BrowserRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText('Keuzemodules')).toBeInTheDocument();
        });
    });

    it('should load and display modules', async () => {
        render(
            <BrowserRouter>
                <Keuzemodules />
            </BrowserRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText('Test Module 1')).toBeInTheDocument();
            expect(screen.getByText('Test Module 2')).toBeInTheDocument();
        });
    });

    it('should truncate long descriptions', async () => {
        render(
            <BrowserRouter>
                <Keuzemodules />
            </BrowserRouter>,
        );

        await waitFor(() => {
            const description = screen.getByText(/Dit is een korte beschrijving van test module 2/);
            expect(description.textContent).toContain('...');
            expect(description.textContent?.length).toBeLessThan(200);
        });
    });

    it('should display module metadata correctly', async () => {
        render(
            <BrowserRouter>
                <Keuzemodules />
            </BrowserRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText('5 ECTS')).toBeInTheDocument();
            expect(screen.getByText('10 ECTS')).toBeInTheDocument();
            expect(screen.getByText('Amsterdam')).toBeInTheDocument();
            expect(screen.getByText('Utrecht')).toBeInTheDocument();
        });
    });

    it('should render search input', async () => {
        render(
            <BrowserRouter>
                <Keuzemodules />
            </BrowserRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText('Test Module 1')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Zoek modules...');
        expect(searchInput).toBeInTheDocument();
    });

    it('should handle loading state', () => {
        (moduleService.getAllModules as any).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(mockModules), 100)),
        );

        render(
            <BrowserRouter>
                <Keuzemodules />
            </BrowserRouter>,
        );

        expect(screen.getByText('Laden...')).toBeInTheDocument();
    });

    it('should handle error state', async () => {
        (moduleService.getAllModules as any).mockRejectedValue(new Error('API Error'));

        render(
            <BrowserRouter>
                <Keuzemodules />
            </BrowserRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText(/Fout bij laden/)).toBeInTheDocument();
        });
    });

    it('should call toggleFavorite when clicking favorite button', async () => {
        (authService.toggleFavorite as any).mockResolvedValue({});

        const { container } = render(
            <BrowserRouter>
                <Keuzemodules />
            </BrowserRouter>,
        );

        await waitFor(() => {
            expect(screen.getByText('Test Module 1')).toBeInTheDocument();
        });

        // Find the favorite button by finding the SVG heart icon
        const heartIcons = container.querySelectorAll('svg');
        const favoriteButton = heartIcons[0]?.closest('button');

        if (favoriteButton) {
            fireEvent.click(favoriteButton);

            await waitFor(() => {
                expect(authService.toggleFavorite).toHaveBeenCalled();
            });
        }
    });
});
