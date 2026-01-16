/* eslint-disable react-hooks/set-state-in-effect */
// PersonalInfo.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import AvansLogo from '../../../shared/components/AvansLogo';

export default function PersonalInfo() {
    const [showStudielocatieInfo, setShowStudielocatieInfo] = useState(false);
    const [opleiding, setOpleiding] = useState('');
    const [leerjaar, setLeerjaar] = useState('');
    const [studielocatie, setStudielocatie] = useState('');
    const [studiepunten, setStudiepunten] = useState('');
    const navigate = useNavigate();
    const { setDraft, userProfile, error } = useProfile();
    const [showError, setShowError] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const hasPrefilled = useRef(false);

    useEffect(() => {
        if (!userProfile || hasPrefilled.current) return;

        hasPrefilled.current = true;

        // Set the form fields with existing profile data
        setOpleiding(userProfile.studyProgram ?? '');
        setLeerjaar(String(userProfile.yearOfStudy ?? ''));
        setStudiepunten(String(userProfile.studyCredits ?? ''));
        setStudielocatie(userProfile.studyLocation ?? '');
    }, [userProfile]);

    // Show error from provider if it exists
    useEffect(() => {
        if (error) {
            setLocalError(null);
            setShowError(true);
        }
    }, [error]);

    function handleNext() {
        if (!opleiding || !leerjaar || !studiepunten) {
            setLocalError('Vul alle velden in.');
            setShowError(true);
            return;
        }
        const form = { opleiding, leerjaar, studielocatie, studiepunten };
        console.log('handleNext - form:', form);

        // save partial form in profile context so it persists across navigation and refresh
        setDraft(form);
        console.log('handleNext - draft set');

        // navigate to next step
        console.log('handleNext - location before navigate', window.location.pathname);
        navigate('/profile/skillsAndIntrests');
        console.log('handleNext - navigate called');
        console.log('handleNext - location after navigate', window.location.pathname);
    }

    return (
        <div className="min-h-screen theme-page flex flex-col items-center justify-center px-6 py-4">
            <div className="w-full max-w-sm mb-8">
                <h1 className="theme-text-primary text-4xl font-normal text-center mb-8">
                    Profiel aanmaken
                </h1>

                <div className="theme-card rounded-3xl p-6 space-y-4">
                    <h2 className="theme-text-primary text-2xl font-normal text-center mb-4">
                        Persoonlijke gegevens
                    </h2>
                    <div className="relative flex items-center w-full max-w-md">
                        {/* Connecting line */}
                        <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 theme-button-secondary" />
                        {/* Step 1 */}
                        <p className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-black">
                            1
                        </p>
                        {/* Step 2 */}
                        <p className="relative z-10 ml-auto flex h-8 w-8 items-center justify-center rounded-full theme-button-secondary text-sm font-medium theme-text-primary">
                            2
                        </p>
                    </div>
                    <div>
                        <p className="theme-text-secondary">
                            {' '}
                            Vul hieronder je persoonlijke gegevens in om je profiel aan te maken die
                            de Ai recommender zal gebruiken om modules voor jou te vinden.
                        </p>
                    </div>
                    {showError && (localError || error) && (
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                            <p className="text-red-300 text-sm">{localError ?? error}</p>
                        </div>
                    )}
                    <div>
                        <label
                            htmlFor="opleiding"
                            className="block theme-text-primary text-sm mb-2"
                        >
                            Opleiding
                        </label>
                        <input
                            type="text"
                            id="opleiding"
                            value={opleiding}
                            onChange={(e) => {
                                setOpleiding(e.target.value);
                                setShowError(false);
                                setLocalError(null);
                            }}
                            className="w-full theme-card-alt theme-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e38094]"
                        />
                    </div>

                    <div>
                        <label htmlFor="leerjaar" className="block theme-text-primary text-sm mb-2">
                            Leerjaar
                        </label>
                        <input
                            type="number"
                            id="leerjaar"
                            value={leerjaar}
                            onChange={(e) => {
                                setLeerjaar(e.target.value);
                                setShowError(false);
                                setLocalError(null);
                            }}
                            className="w-full theme-card-alt theme-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e38094]"
                        />
                    </div>
                    {showStudielocatieInfo && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                            <div className="theme-card-alt rounded-2xl p-6 w-full max-w-sm theme-text-primary relative">
                                <h3 className="text-lg font-medium mb-2">Studielocatie</h3>

                                <p className="text-sm theme-text-secondary leading-relaxed">
                                    Vul hier een locatie in waar je zou willen studeren. Dit veld is
                                    NIET verplicht om in te vullen!
                                </p>

                                <button
                                    onClick={() => setShowStudielocatieInfo(false)}
                                    className="btn-accent w-full py-2 mt-6"
                                >
                                    Sluiten
                                </button>
                            </div>
                        </div>
                    )}
                    <div>
                        <label
                            htmlFor="studielocatie"
                            className="flex items-center gap-2 theme-text-primary text-sm mb-2"
                        >
                            Studielocatie
                            {/* Info icon */}
                            <button
                                type="button"
                                onClick={() => setShowStudielocatieInfo(true)}
                                className="flex h-5 w-5 items-center justify-center rounded-full theme-button-secondary text-xs font-bold theme-text-primary hover:opacity-80 transition"
                                aria-label="Studielocatie informatie"
                            >
                                i
                            </button>
                        </label>

                        <select
                            id="studielocatie"
                            value={studielocatie}
                            onChange={(e) => {
                                setStudielocatie(e.target.value);
                                setShowError(false);
                                setLocalError(null);
                            }}
                            className="w-full theme-card-alt theme-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e38094]"
                        >
                            <option value="">Selecteer studielocatie</option>
                            <option value="Breda">Breda</option>
                            <option value="Tilburg">Tilburg</option>
                            <option value="Den Bosch">Den Bosch</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="studiepunten"
                            className="block theme-text-primary text-sm mb-2"
                        >
                            Studiepunten
                        </label>
                        <select
                            id="studiepunten"
                            value={studiepunten}
                            onChange={(e) => {
                                setStudiepunten(e.target.value);
                                setShowError(false);
                                setLocalError(null);
                            }}
                            className="w-full theme-card-alt theme-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e38094]"
                        >
                            <option value="0">Selecteer studiepunten</option>
                            <option value="15">15</option>
                            <option value="30">30</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleNext}
                        className="btn-accent w-full py-3 mt-4"
                    >
                        Volgende
                    </button>
                </div>
            </div>

            {/* AvansLogo staat nu linksonder */}
            <div className="mt-auto w-full">
                <div className="ml-4 mb-6">
                    <AvansLogo />
                </div>
            </div>
        </div>
    );
}
