import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';

export default function Dashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-neutral-950">
            <nav className="bg-neutral-800 border-b border-neutral-700 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h1 className="text-white text-2xl font-bold">Avans KeuzeKompas</h1>
                        <div className="flex gap-4">
                            <Link
                                to="/dashboard"
                                className="text-white hover:text-violet-400 transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/keuzemodules"
                                className="text-white hover:text-violet-400 transition-colors"
                            >
                                Keuzemodules
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <span className="text-white text-sm">
                                {user.firstName} {user.lastName}
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Uitloggen
                        </button>
                    </div>
                </div>
            </nav>

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
        </div>
    );
}

