import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

const NAV_LINKS = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Keuzemodules', path: '/keuzemodules' },
    { label: 'AI Keuzemodules', path: '/aikeuzemodules' },
    { label: 'Instellingen', path: '/instellingen' },
];

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            {/* Overlay for mobile menu */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 backdrop-blur-md z-30 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
            
            <header className="text-white py-2 px-4 md:px-6 relative z-50">
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center justify-between px-6 py-3">
                    <Link to="/dashboard" className="text-2xl font-bold !text-red-600 hover:!text-red-500 transition-colors">
                        Avans
                    </Link>

                    <nav className="flex items-center gap-1 bg-[#2a2a2a] rounded-full p-1 shadow-lg">
                        {NAV_LINKS.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.label}
                                    to={link.path}
                                    className={`
                                        ${isActive
                                            ? '!text-black bg-white hover:bg-gray-100' 
                                            : '!text-white bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                                        }
                                        transition-all duration-200 px-5 py-2 rounded-full font-medium text-sm
                                    `}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-3">
                        {user && (
                            <span className="text-sm text-gray-300">
                                {user.firstName} {user.lastName}
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                            Uitloggen
                        </button>
                    </div>
                </div>

            {/* Mobile Navigation */}
            <div className="md:hidden rounded-2xl bg-[#2a2a2a] shadow-lg relative">
                <div className="flex items-center justify-between px-4 py-4">
                    <Link to="/dashboard" className="text-2xl font-bold !text-red-600 hover:!text-red-500 transition-colors">
                        Avans
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-white p-2 hover:bg-[#3a3a3a] rounded-lg transition-all duration-200"
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        <div className="w-6 h-5 flex flex-col justify-between">
                            <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                            <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </div>
                    </button>
                </div>

                {/* Mobile Menu with animation */}
                {mobileMenuOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 mx-4 bg-[#2a2a2a] rounded-2xl shadow-lg z-40 overflow-hidden animate-slideDown">
                        <nav className="flex flex-col px-4 py-6 space-y-2">
                        {NAV_LINKS.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.label}
                                    to={link.path}
                                    className={`
                                        ${isActive
                                            ? '!text-black bg-white hover:bg-gray-100'
                                            : '!text-white bg-[#3a3a3a] hover:bg-[#4a4a4a]'
                                        }
                                        transition-all duration-200 px-4 py-3 rounded-lg font-medium text-center
                                    `}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                        <div className="pt-4 border-t border-gray-600 space-y-3">
                            {user && (
                                <div className="text-sm text-gray-300 text-center px-4">
                                    {user.firstName} {user.lastName}
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg transition-colors font-medium"
                            >
                                Uitloggen
                            </button>
                        </div>
                    </nav>
                </div>
                )}
            </div>
            </header>
        </>
    );
}
