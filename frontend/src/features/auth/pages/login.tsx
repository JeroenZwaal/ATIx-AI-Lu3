import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';

function isValidToken(token: string | null): boolean {
    if (!token) return false;

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        const payload = JSON.parse(atob(parts[1]));
        if (!payload.exp) return false;

        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showError, setShowError] = useState(false);
    const { login, isLoading, error, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const currentToken = token || storedToken;
        if (currentToken && isValidToken(currentToken)) {
            navigate('/dashboard', { replace: true });
        } else if (storedToken && !isValidToken(storedToken)) {
            localStorage.removeItem('token');
        }
    }, [token, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setShowError(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard', { replace: true });
        } catch {
            setShowError(true);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6 py-4">
            <div className="w-full max-w-sm">
                <h1 className="text-white text-4xl font-normal text-center mb-8">Login</h1>

                <form onSubmit={handleSubmit} className="bg-neutral-800 rounded-3xl p-6 space-y-4">
                    {showError && error && (
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-white text-sm mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-white text-sm mb-2">
                            Wachtwoord
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ backgroundColor: '#c4b5fd' }}
                        className="w-full hover:bg-violet-400 text-black font-medium rounded-lg px-4 py-3 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Inloggen...' : 'Inloggen'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link to="/register" className="text-white text-sm hover:underline">
                        Nog geen account? Registreren
                    </Link>
                    <p className="text-white text-sm mt-2">
                        Problemen met inloggen? <br />
                        Neem <span className="font-bold">contact</span> op!
                    </p>
                </div>
            </div>

            <div className="fixed bottom-4 left-4 text-red-600 text-xl font-bold">Avans</div>
        </div>
    );
}
