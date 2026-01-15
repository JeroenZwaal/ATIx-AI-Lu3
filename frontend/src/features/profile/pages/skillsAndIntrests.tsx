import React, { useState, useRef, type Dispatch, type SetStateAction, type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { PersonalInfo, CreateProfileDto } from '../types/profile.types';
import { useProfile, useGetAllTags } from '../hooks/useProfile';
import AvansLogo from '../../../shared/components/AvansLogo';

const normalizeTag = (tag: string): string => tag.trim().toLowerCase();
const hasTag = (tags: string[], candidate: string): boolean =>
    tags.some((t) => normalizeTag(t) === normalizeTag(candidate));

export default function SkillsAndIntrests(): JSX.Element {
    const [skills, setSkills] = useState<string[]>([]);
    const [interests, setInterests] = useState<string[]>([]);

    const [skillSearchInput, setSkillSearchInput] = useState<string>('');
    const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
    const [interestSearchInput, setInterestSearchInput] = useState<string>('');
    const [isInterestDropdownOpen, setIsInterestDropdownOpen] = useState(false);

    // Local error state (validation + provider errors)
    const [showError, setShowError] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const { tags: availableTags, isLoading: tagsLoading } = useGetAllTags();

    const MAX_TAGS: number = 5;
    const navigate = useNavigate();

    // Use refs to track if we've done initial prefill
    const prefillDoneRef = useRef(false);

    const addSkillTag = (value: string): void => {
        if (!value.trim()) return;
        if (skills.length >= MAX_TAGS) return;
        if (!hasTag(skills, value)) {
            setSkills([...skills, value.trim()]);
            setSkillSearchInput('');
            setIsSkillDropdownOpen(false);
            // clear any previous errors
            setShowError(false);
            setLocalError(null);
        }
    };

    const addInterestTag = (value: string): void => {
        if (!value.trim()) return;
        if (interests.length >= MAX_TAGS) return;
        if (!hasTag(interests, value)) {
            setInterests([...interests, value.trim()]);
            setInterestSearchInput('');
            setIsInterestDropdownOpen(false);
            // clear any previous errors
            setShowError(false);
            setLocalError(null);
        }
    };

    const removeTag = (
        index: number,
        setter: Dispatch<SetStateAction<string[]>>,
        tags: string[],
    ): void => {
        setter(tags.filter((_, i) => i !== index));
        setShowError(false);
        setLocalError(null);
    };

    const location = useLocation();
    const { createProfile, draft, userProfile, fetchUserProfile, error } = useProfile();

    // Prefill skills and interests from existing profile (only once)
    React.useEffect(() => {
        // Only prefill once
        if (prefillDoneRef.current) return;

        // If no userProfile yet, try to fetch it
        if (!userProfile) {
            fetchUserProfile().catch(() => {});
            return;
        }

        // Now we have userProfile, do the prefill
        prefillDoneRef.current = true;

        if (skills.length === 0 && userProfile?.skills?.length) {
            setSkills(userProfile.skills);
        }
        if (interests.length === 0 && userProfile?.interests?.length) {
            setInterests(userProfile.interests);
        }
    }, [userProfile, fetchUserProfile, skills.length, interests.length]);

    // If the provider reports an error (server-side), show it
    React.useEffect(() => {
        if (error) {
            setLocalError(null);
            setShowError(true);
        }
    }, [error]);

    // Prefer draft from context (set on previous step). If not available (fallback), use navigation state.
    const personalInfo =
        (draft as PersonalInfo | null) ?? (location.state as PersonalInfo | undefined) ?? null;

    // Debugging: log mount and changes to draft or location
    React.useEffect(() => {
        console.log('SkillsAndIntrests mounted/updated', {
            pathname: location.pathname,
            draft,
            state: location.state,
        });
    }, [draft, location.pathname, location.state]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Build a CreateProfileDto ensuring correct types and defaults
        if (skills.length === 0 || interests.length === 0) {
            setLocalError('Voeg ten minste één vaardigheid en één interesse toe.');
            setShowError(true);
            return;
        }
        const createProfileData: CreateProfileDto = {
            opleiding: personalInfo?.opleiding ?? '',
            leerjaar: personalInfo?.leerjaar ?? '',
            studielocatie: personalInfo?.studielocatie ?? '',
            studiepunten: String(personalInfo?.studiepunten ?? ''),
            skills,
            interests,
        };

        try {
            console.log('test calling api call');

            await createProfile(createProfileData);
            navigate('/dashboard'); // Redirect after successful creation
        } catch (err: unknown) {
            console.error('Error creating profile:', err);
            setLocalError(
                err instanceof Error
                    ? err.message
                    : 'Er is iets misgegaan bij het aanmaken van het profiel.',
            );
            setShowError(true);
        }
    };

    return (
        <div className="min-h-screen theme-page flex flex-col items-center justify-center px-6 py-4">
            <div className="w-full max-w-sm mb-8">
                <h1 className="theme-text-primary text-4xl text-center mb-8">Profiel aanmaken</h1>

                <div className="theme-card rounded-3xl p-6 space-y-4">
                    <h2 className="theme-text-primary text-2xl text-center">
                        Vaardigheden & Intresses
                    </h2>
                    {showError && (localError || error) && (
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                            <p className="text-red-300 text-sm">{localError ?? error}</p>
                        </div>
                    )}

                    <div className="relative flex items-center w-full max-w-md">
                        {/* Connecting line */}
                        <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 theme-button-secondary" />
                        {/* Step 1 */}
                        <p className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full theme-button-secondary text-sm font-medium theme-text-primary">
                            1
                        </p>
                        {/* Step 2 */}
                        <p className="relative z-10 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-200 text-sm font-medium text-black">
                            2
                        </p>
                    </div>
                    {/* SKILLS */}
                    <div>
                        <p className="theme-text-secondary mb-1 text-sm">Vaardigheden</p>
                        <div className="relative">
                            {/* Selected tags */}
                            <div
                                className="border theme-border rounded-xl p-3 flex flex-wrap gap-2 theme-card-alt cursor-pointer"
                                onClick={() => setIsSkillDropdownOpen(true)}
                            >
                                {skills.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="bg-[#312A48] text-[#A89ECD] px-3 py-1 rounded-full text-sm flex items-center"
                                    >
                                        {tag}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeTag(i, setSkills, skills);
                                            }}
                                            className="!py-1 !px-2 ml-1 text-xs leading-none hover:text-red-400"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}

                                <input
                                    type="text"
                                    value={skillSearchInput}
                                    onChange={(e) => {
                                        setSkillSearchInput(e.target.value);
                                        setIsSkillDropdownOpen(true);
                                        setShowError(false);
                                        setLocalError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addSkillTag(skillSearchInput);
                                        }
                                    }}
                                    onFocus={() => setIsSkillDropdownOpen(true)}
                                    onBlur={() =>
                                        setTimeout(() => setIsSkillDropdownOpen(false), 200)
                                    }
                                    placeholder={
                                        skills.length === 0 ? 'Zoek een vaardigheid...' : ''
                                    }
                                    className="flex-1 bg-transparent outline-none theme-text-primary placeholder:theme-text-muted min-w-[120px]"
                                />
                            </div>

                            {/* Dropdown menu */}
                            {isSkillDropdownOpen && (
                                <div className="absolute z-10 w-full mt-2 theme-card border theme-border rounded-xl max-h-48 overflow-y-auto">
                                    {tagsLoading ? (
                                        <div className="p-3 theme-text-muted text-center">
                                            Laden...
                                        </div>
                                    ) : (
                                        <>
                                            {skillSearchInput.trim() &&
                                                !hasTag(skills, skillSearchInput) &&
                                                !availableTags.some(
                                                    (t) =>
                                                        normalizeTag(t) ===
                                                        normalizeTag(skillSearchInput),
                                                ) && (
                                                    <div
                                                        onClick={() =>
                                                            addSkillTag(skillSearchInput)
                                                        }
                                                        className="p-3 theme-text-secondary hover:theme-card-alt cursor-pointer transition-colors"
                                                    >
                                                        Voeg toe:{' '}
                                                        <span className="theme-text-primary">
                                                            {skillSearchInput.trim()}
                                                        </span>
                                                    </div>
                                                )}

                                            {availableTags
                                                .filter(
                                                    (tag) =>
                                                        tag
                                                            .toLowerCase()
                                                            .includes(
                                                                skillSearchInput.toLowerCase(),
                                                            ) && !hasTag(skills, tag),
                                                )
                                                .map((tag) => (
                                                    <div
                                                        key={tag}
                                                        onClick={() => addSkillTag(tag)}
                                                        className="p-3 theme-text-secondary hover:theme-card-alt cursor-pointer transition-colors"
                                                    >
                                                        {tag}
                                                    </div>
                                                ))}
                                        </>
                                    )}
                                    {!tagsLoading &&
                                        availableTags.filter(
                                            (tag) =>
                                                tag
                                                    .toLowerCase()
                                                    .includes(skillSearchInput.toLowerCase()) &&
                                                !hasTag(skills, tag),
                                        ).length === 0 && (
                                            <div className="p-3 theme-text-muted text-center text-sm">
                                                Geen vaardigheden gevonden
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* INTERESTS */}
                    <div>
                        <p className="theme-text-secondary mb-1 text-sm">Intresses</p>
                        <div className="relative">
                            {/* Selected tags */}
                            <div
                                className="border theme-border rounded-xl p-3 flex flex-wrap gap-2 theme-card-alt cursor-pointer"
                                onClick={() => setIsInterestDropdownOpen(true)}
                            >
                                {interests.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="bg-[#312A48] text-[#A89ECD] px-3 py-1 rounded-full text-sm flex items-center"
                                    >
                                        {tag}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeTag(i, setInterests, interests);
                                            }}
                                            className="!py-1 !px-2 ml-1 text-xs leading-none hover:text-red-400"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}

                                <input
                                    type="text"
                                    value={interestSearchInput}
                                    onChange={(e) => {
                                        setInterestSearchInput(e.target.value);
                                        setIsInterestDropdownOpen(true);
                                        setShowError(false);
                                        setLocalError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addInterestTag(interestSearchInput);
                                        }
                                    }}
                                    onFocus={() => setIsInterestDropdownOpen(true)}
                                    onBlur={() =>
                                        setTimeout(() => setIsInterestDropdownOpen(false), 200)
                                    }
                                    placeholder={
                                        interests.length === 0 ? 'Zoek een interesse...' : ''
                                    }
                                    className="flex-1 bg-transparent outline-none theme-text-primary placeholder:theme-text-muted min-w-[120px]"
                                />
                            </div>

                            {/* Dropdown menu */}
                            {isInterestDropdownOpen && (
                                <div className="absolute z-10 w-full mt-2 theme-card border theme-border rounded-xl max-h-48 overflow-y-auto">
                                    {tagsLoading ? (
                                        <div className="p-3 theme-text-muted text-center">
                                            Laden...
                                        </div>
                                    ) : (
                                        <>
                                            {interestSearchInput.trim() &&
                                                !hasTag(interests, interestSearchInput) &&
                                                !availableTags.some(
                                                    (t) =>
                                                        normalizeTag(t) ===
                                                        normalizeTag(interestSearchInput),
                                                ) && (
                                                    <div
                                                        onClick={() =>
                                                            addInterestTag(interestSearchInput)
                                                        }
                                                        className="p-3 theme-text-secondary hover:theme-card-alt cursor-pointer transition-colors"
                                                    >
                                                        Voeg toe:{' '}
                                                        <span className="theme-text-primary">
                                                            {interestSearchInput.trim()}
                                                        </span>
                                                    </div>
                                                )}

                                            {availableTags
                                                .filter(
                                                    (tag) =>
                                                        tag
                                                            .toLowerCase()
                                                            .includes(
                                                                interestSearchInput.toLowerCase(),
                                                            ) && !hasTag(interests, tag),
                                                )
                                                .map((tag) => (
                                                    <div
                                                        key={tag}
                                                        onClick={() => addInterestTag(tag)}
                                                        className="p-3 theme-text-secondary hover:theme-card-alt cursor-pointer transition-colors"
                                                    >
                                                        {tag}
                                                    </div>
                                                ))}
                                        </>
                                    )}
                                    {!tagsLoading &&
                                        availableTags.filter(
                                            (tag) =>
                                                tag
                                                    .toLowerCase()
                                                    .includes(interestSearchInput.toLowerCase()) &&
                                                !hasTag(interests, tag),
                                        ).length === 0 && (
                                            <div className="p-3 theme-text-muted text-center text-sm">
                                                Geen tags gevonden
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={handleSave} className="btn-accent w-full py-3 mt-4">
                        Opslaan
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setShowError(false);
                            setLocalError(null);
                            navigate('/profile/createProfile');
                        }}
                        className="btn-secondary w-full py-3"
                    >
                        Terug
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
