import React, { useState, type Dispatch, type SetStateAction, type KeyboardEvent, type JSX } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { PersonalInfo, CreateProfileDto } from "../types/profile.types";
import { useProfile } from '../hooks/useProfile';


export default function SkillsAndIntrests(): JSX.Element {
    const [skills, setSkills] = useState<string[]>([]);
    const [interests, setInterests] = useState<string[]>([]);

    const [skillInput, setSkillInput] = useState<string>("");
    const [interestInput, setInterestInput] = useState<string>("");

    const MAX_TAGS: number = 5;
    const navigate = useNavigate();

    const addTag = (
        value: string,
        setter: Dispatch<SetStateAction<string[]>>,
        tags: string[]
    ): void => {
        if (!value.trim()) return;

        if (tags.length >= MAX_TAGS) return;

        if (!tags.includes(value.trim())) {
            setter([...tags, value.trim()]);
        }
    };

    const handleKey = (e: KeyboardEvent<HTMLInputElement>, type: "skills" | "interests"): void => {
        if (e.key === "Enter") {
            e.preventDefault();

            if (type === "skills") {
                addTag(skillInput, setSkills, skills);
                setSkillInput("");
            } else {
                addTag(interestInput, setInterests, interests);
                setInterestInput("");
            }
        }
    };

    const removeTag = (
        index: number,
        setter: Dispatch<SetStateAction<string[]>>,
        tags: string[]
    ): void => {
        setter(tags.filter((_, i) => i !== index));
    };

    const location = useLocation();
    const { createProfile, draft, userProfile, fetchUserProfile } = useProfile();

    // if we have a profile from the backend, prefill skills/interests, but only
    // when the local inputs are still empty so we don't overwrite user edits
    React.useEffect(() => {
        // fetch if not present yet
        if (!userProfile) {
            fetchUserProfile().catch(() => {});
            return;
        }

        // Only prefill when the local state is empty (length === 0)
        if (skills.length === 0 && userProfile?.skills?.length) {
            setSkills(userProfile.skills);
        }
        if (interests.length === 0 && userProfile?.interests?.length) {
            setInterests(userProfile.interests);
        }
    }, [userProfile, fetchUserProfile, skills.length, interests.length]);

    // Prefer draft from context (set on previous step). If not available (fallback), use navigation state.
    const personalInfo = (draft as PersonalInfo | null) ?? (location.state as PersonalInfo | undefined) ?? null;

    // Debugging: log mount and changes to draft or location
    React.useEffect(() => {
        console.log('SkillsAndIntrests mounted/updated', {
            pathname: location.pathname,
            draft,
            state: location.state,
        });
    }, [draft, location.pathname, location.state]);

    const handleSave = async (e: React.FormEvent) =>  {
        e.preventDefault();

        // Build a CreateProfileDto ensuring correct types and defaults
        if(skills.length === 0 || interests.length === 0) {
            alert("Voeg ten minste één vaardigheid en één interesse toe.");
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
            console.log("test calling api call");

            await createProfile(createProfileData);
            navigate('/dashboard'); // Redirect after successful creation
        } catch (err) {
            console.error('Error creating profile:', err);
        }
    }

return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-sm">
            <h1 className="text-white text-4xl text-center mb-8">Profiel aanmaken</h1>

            <div className="bg-neutral-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-white text-2xl text-center">
                Vaardigheden & Intresses
            </h2>

            <div className="relative flex items-center w-full max-w-md">
                {/* Connecting line */}
                <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-gray-200" />
                {/* Step 1 */}
                <p className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-medium text-white">1</p>
                {/* Step 2 */}
                <p className="relative z-10 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-black">2</p>
            </div>
            {/* SKILLS */}
            <div>
                <p className="text-neutral-300 mb-1 text-sm">Vaardigheden</p>
                <div className="border border-neutral-700 rounded-xl p-3 flex flex-wrap gap-2 bg-neutral-900">
                {skills.map((tag, i) => (
                    <span
                    key={i}
                    className="bg-violet-400/20 text-violet-300 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                    {tag}
                    <button
                        onClick={() => removeTag(i, setSkills, skills)}
                        className="ml-2 hover:text-red-400"
                    >
                        &times;
                    </button>
                    </span>
                ))}

                <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => handleKey(e, "skills")}
                    placeholder="Typ een vaardigheid..."
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-neutral-500 min-w-[120px]"
                />
                </div>
            </div>

            {/* INTERESTS */}
            <div>
                <p className="text-neutral-300 mb-1 text-sm">Intresses</p>
                <div className="border border-neutral-700 rounded-xl p-3 flex flex-wrap gap-2 bg-neutral-900">
                {interests.map((tag, i) => (
                    <span
                    key={i}
                    className="bg-violet-400/20 text-violet-300 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                    {tag}
                    <button
                        onClick={() => removeTag(i, setInterests, interests)}
                        className="ml-2 hover:text-red-400"
                    >
                        &times;
                    </button>
                    </span>
                ))}

                <input
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => handleKey(e, "interests")}
                    placeholder="Typ een interesse..."
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-neutral-500 min-w-[120px]"
                />
                </div>
            </div>

            <button
            onClick={handleSave}
                style={{ backgroundColor: "#c4b5fd" }}
                className="w-full hover:bg-violet-400 text-black font-medium rounded-lg px-4 py-3 mt-4 transition-colors"
            >
                Opslaan
            </button>
            </div>
        </div>

        <div className="fixed bottom-4 left-4 text-red-600 font-bold">Avans</div>
        </div>
    );
}
