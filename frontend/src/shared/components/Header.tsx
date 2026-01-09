import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useLanguage } from '../contexts/useLanguage';

interface User {
    firstName: string;
    lastName: string;
}

function Logo() {
    return (
        <Link
            to="/dashboard"
            className="text-2xl font-bold !text-red-600 hover:!text-red-500 transition-colors"
        >
            Avans
        </Link>
    );
}

function UserInfo({ user }: { user: User | null }) {
    return user ? (
        <span className="text-sm text-gray-300">
            {user.firstName} {user.lastName}
        </span>
    ) : null;
}

function LogoutButton({
    onClick,
    className = '',
    label,
}: {
    onClick: () => void;
    className?: string;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg transition-colors font-medium ${className}`}
        >
            {label}
        </button>
    );
}

interface NavLinkType {
    label: string;
    path: string;
}

function NavLink({
    link,
    isActive,
    onClick,
}: {
    link: NavLinkType;
    isActive: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            to={link.path}
            onClick={onClick}
            className={`
            ${isActive ? '!text-black bg-white hover:bg-gray-100' : '!text-white bg-[#2a2a2a] hover:bg-[#3a3a3a]'}
            transition-all duration-200 px-6 py-2.5 rounded-full font-medium text-sm
        `}
        >
            {link.label}
        </Link>
    );
}

function MobileNavLink({
    link,
    isActive,
    onClick,
}: {
    link: NavLinkType;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <Link
            to={link.path}
            onClick={onClick}
            className={`
            ${isActive ? '!text-black bg-white hover:bg-gray-100' : '!text-white bg-[#3a3a3a] hover:bg-[#4a4a4a]'}
            transition-all duration-200 px-4 py-3 rounded-lg font-medium text-center
        `}
        >
            {link.label}
        </Link>
    );
}

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <div className="w-6 h-6 flex flex-col justify-center items-center relative">
            <span
                className={`block h-0.5 w-full bg-white transition-all duration-300 ${isOpen ? 'absolute rotate-45' : 'mb-1.5'}`}
            />
            <span
                className={`block h-0.5 w-full bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : 'mb-1.5'}`}
            />
            <span
                className={`block h-0.5 w-full bg-white transition-all duration-300 ${isOpen ? 'absolute -rotate-45' : ''}`}
            />
        </div>
    );
}

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { logout, user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const navLinks = [
        { label: t.nav.dashboard, path: '/dashboard' },
        { label: t.nav.modules, path: '/keuzemodules' },
        { label: t.nav.aiModules, path: '/aikeuzemodules' },
        { label: t.nav.settings, path: '/settings' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <>
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 backdrop-blur-md z-30 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            <header className="sticky top-0 bg-neutral-950 text-white py-2 px-4 md:px-6 z-50">
                <div className="hidden md:flex items-center max-w-6xl mx-auto px-6 py-3">
                    <div className="flex-1">
                        <Logo />
                    </div>

                    <nav className="flex items-center gap-2 bg-[#2a2a2a] rounded-full p-1.5 shadow-lg">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                link={link}
                                isActive={
                                    location.pathname === link.path ||
                                    location.pathname.startsWith(link.path + '/')
                                }
                            />
                        ))}
                    </nav>

                    <div className="flex-1 flex items-center justify-end gap-3">
                        <UserInfo user={user} />
                        <LogoutButton
                            onClick={handleLogout}
                            className="text-sm"
                            label={t.nav.logout}
                        />
                    </div>
                </div>

                <div className="md:hidden relative">
                    <div className="flex items-center justify-between px-4 py-4">
                        <Logo />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-white p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-all duration-200 shadow-lg"
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <HamburgerIcon isOpen={mobileMenuOpen} />
                        </button>
                    </div>

                    {mobileMenuOpen && (
                        <div className="absolute left-4 right-4 top-full mt-2 bg-[#2a2a2a] rounded-2xl shadow-lg z-40 overflow-hidden">
                            <nav className="flex flex-col px-5 py-8 space-y-3">
                                {navLinks.map((link) => (
                                    <MobileNavLink
                                        key={link.path}
                                        link={link}
                                        isActive={
                                            location.pathname === link.path ||
                                            location.pathname.startsWith(link.path + '/')
                                        }
                                        onClick={closeMobileMenu}
                                    />
                                ))}
                                <div className="pt-5 border-t border-gray-600 space-y-3">
                                    {user && (
                                        <div className="text-center">
                                            <div className="text-white font-medium">
                                                {user.firstName} {user.lastName}
                                            </div>
                                        </div>
                                    )}
                                    <LogoutButton
                                        onClick={() => {
                                            handleLogout();
                                            closeMobileMenu();
                                        }}
                                        className="w-full"
                                        label={t.nav.logout}
                                    />
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}
