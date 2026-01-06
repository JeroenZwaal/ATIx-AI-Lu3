import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showError, setShowError] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const { register, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setShowError(false);
        setValidationError(null);
    };

    const validateForm = (): string | null => {
        if (!formData.firstName.trim()) return 'Voornaam is verplicht';
        if (!formData.lastName.trim()) return 'Achternaam is verplicht';
        if (!formData.email.trim()) return 'Email is verplicht';
        if (!formData.password) return 'Wachtwoord is verplicht';
        if (formData.password !== formData.confirmPassword) {
            return 'Wachtwoorden komen niet overeen';
        }
        if (formData.password.length < 6) {
            return 'Wachtwoord moet minimaal 6 tekens bevatten';
        }

        // Check password complexity
        const hasLowerCase = /[a-z]/.test(formData.password);
        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasDigit = /\d/.test(formData.password);
        const hasSpecialChar = /[!@#$%^&*]/.test(formData.password);

        if (!hasLowerCase || !hasUpperCase || !hasDigit || !hasSpecialChar) {
            return 'Wachtwoord moet minimaal 1 hoofdletter, 1 kleine letter, 1 cijfer en 1 speciaal teken (!@#$%^&*) bevatten';
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validateForm();
        if (validation) {
            setValidationError(validation);
            return;
        }

        try {
            await register(
                formData.firstName,
                formData.lastName,
                formData.email,
                formData.password,
            );
            navigate('/dashboard'); // Redirect after successful registration
        } catch {
            setShowError(true);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6 py-4">
            <div className="w-full max-w-sm">
                <h1 className="text-white text-4xl font-normal text-center mb-8">Register</h1>

                <form onSubmit={handleSubmit} className="bg-neutral-800 rounded-3xl p-6 space-y-4">
                    {(showError && error) || validationError ? (
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                            <p className="text-red-300 text-sm">{validationError || error}</p>
                        </div>
                    ) : null}

                    <div>
                        <label htmlFor="firstName" className="block text-white text-sm mb-2">
                            Voornaam
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-white text-sm mb-2">
                            Achternaam
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-neutral-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                    </div>

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

                    <div>
                        <label htmlFor="confirmPassword" className="block text-white text-sm mb-2">
                            Herhaal wachtwoord
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
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
                        {isLoading ? 'Registreren...' : 'Register'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link to="/login" className="text-white text-sm hover:underline">
                        Al een account? Inloggen
                    </Link>
                    <p className="text-white text-sm mt-2">
                        Problemen met Registereren? <br />
                        Neem <span className="font-bold">contact</span> op!
                    </p>
                </div>
            </div>

            <div className="fixed bottom-4 left-4 text-red-600 text-xl font-bold">Avans</div>
        </div>
    );
}
