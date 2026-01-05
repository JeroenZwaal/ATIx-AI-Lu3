// PersonalInfo.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";

export default function PersonalInfo() {
    const [opleiding, setOpleiding] = useState('');
    const [leerjaar, setLeerjaar] = useState('');
    const [studielocatie, setStudielocatie] = useState('');
    const [studiepunten, setStudiepunten] = useState('');
    const navigate = useNavigate();

    function handleNext() {
        const form = { opleiding, leerjaar, studielocatie, studiepunten };
        navigate('/profile/skillsAndIntrests', { state: form });
    }

    
    return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-sm">
            <h1 className="text-white text-4xl font-normal text-center mb-8">Profiel aanmaken</h1>
            
            <div className="bg-neutral-800 rounded-3xl p-6 space-y-4">
            
            <h2 className="text-white text-2xl font-normal text-center mb-4">Persoonlijke gegevens</h2>
            <div className="relative flex items-center w-full max-w-md">
                {/* Connecting line */}
                <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-gray-600" />
                {/* Step 1 */}
                <p className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-black">1</p>
                {/* Step 2 */}
                <p className="relative z-10 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-medium text-white">2</p>
            </div>
            <div>
                <label htmlFor="email" className="block text-white text-sm mb-2">
                Opleiding
                </label>
                <input
                type="email"
                id="email"
                value={opleiding}
                onChange={(e) => setOpleiding(e.target.value)}
                className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
            </div>

            <div>
                <label htmlFor="leerjaar" className="block text-white text-sm mb-2">
                Leerjaar
                </label>
                <input
                type="text"
                id="leerjaar"
                value={leerjaar}
                onChange={(e) => setLeerjaar(e.target.value)}
                className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
            </div>

            <div>
                <label htmlFor="studielocatie" className="block text-white text-sm mb-2">
                Studielocatie
                </label>
                <input
                type="text"
                id="studielocatie"
                value={studielocatie}
                onChange={(e) => setStudielocatie(e.target.value)}
                className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
            </div>

            <div>
                <label htmlFor="studiepunten" className="block text-white text-sm mb-2">
                Studiepunten
                </label>
                <input
                type="number"
                id="studiepunten"
                value={studiepunten}
                onChange={(e) => setStudiepunten(e.target.value)}
                className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
            </div>


            <button 
                onClick={handleNext}
                style={{ backgroundColor: '#c4b5fd' }}
                className="w-full hover:bg-violet-400 text-black font-medium rounded-lg px-4 py-3 mt-4 transition-colors"
            >
                Volgende
            </button>
            </div>

            <div className="text-center mt-6">
            <p className="text-white text-sm">
                Al een profiel?{' '}
                <br />
                Ga naar de <span className="font-bold">login</span> pagina.
            </p>
            </div>
        </div>

        <div className="fixed bottom-4 left-4 text-red-600 text-xl font-bold">
            Avans
        </div>
    </div>
  );
};

