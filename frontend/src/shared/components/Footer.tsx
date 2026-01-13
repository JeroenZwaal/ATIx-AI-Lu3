import { Link } from 'react-router-dom';

const LOGO = () => <span className="text-2xl font-bold text-red-600">Avans</span>;

export default function Footer() {
    return (
        <footer className="theme-text-primary py-4 px-4 md:px-6">
            <div className="flex justify-between items-center max-w-6xl mx-auto md:px-6 py-3">
                <LOGO />
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
