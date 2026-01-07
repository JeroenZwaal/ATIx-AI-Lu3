import { Link } from 'react-router-dom';

export default function Dashboard() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-4">
            <div className="text-center">
                <h1 className="text-white text-4xl font-bold mb-4">Dashboard</h1>
                <p className="text-neutral-400 text-lg mb-8">Welkom bij je dashboard</p>
                <div className="flex gap-4 justify-center">
                    <Link
                        to="/keuzemodules"
                        className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Bekijk Keuzemodules
                    </Link>
                </div>
            </div>
        </div>
    );
}

