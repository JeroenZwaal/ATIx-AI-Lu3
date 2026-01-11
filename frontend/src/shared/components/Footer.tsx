import { Link } from 'react-router-dom';

const Logo = () => <span className="text-2xl font-bold text-red-600">Avans</span>;

export default function Footer() {
    return (
        <footer className="theme-text-primary py-4 px-4 md:px-6">
            <div className="flex justify-between items-center max-w-6xl mx-auto md:px-6 py-3">
                <Logo />
                <Link
                    to="/dashboard"
                    className="text-base theme-text-primary hover:theme-text-accent transition-colors"
                >
                    Contact
                </Link>
            </div>
        </footer>
    );
}
