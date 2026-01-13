import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import { useLanguage } from '../../../shared/contexts/useLanguage';

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
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'nl' ? 'en' : 'nl');
    };

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
        if (!formData.firstName.trim()) return t.auth.validation.firstNameRequired;
        if (!formData.lastName.trim()) return t.auth.validation.lastNameRequired;
        if (!formData.email.trim()) return t.auth.validation.emailRequired;
        if (!formData.password) return t.auth.validation.passwordRequired;
        if (formData.password !== formData.confirmPassword) {
            return t.auth.validation.passwordsNoMatch;
        }
        if (formData.password.length < 6) {
            return t.auth.validation.passwordMinLength;
        }

        // Check password complexity
        const hasLowerCase = /[a-z]/.test(formData.password);
        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasDigit = /\d/.test(formData.password);
        const hasSpecialChar = /[!@#$%^&*]/.test(formData.password);

        if (!hasLowerCase || !hasUpperCase || !hasDigit || !hasSpecialChar) {
            return t.auth.validation.passwordComplexity;
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
        <div className="min-h-screen theme-page flex items-center justify-center px-6 py-4">
            {/* Language Switcher */}
            <button
                onClick={toggleLanguage}
                className="fixed top-4 right-4 theme-card hover:opacity-80 theme-text-primary px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
                <span className="text-lg">{language === 'nl' ? '🇳🇱' : '🇬🇧'}</span>
                <span className="text-sm font-medium">{language === 'nl' ? 'NL' : 'EN'}</span>
            </button>

            <div className="w-full max-w-sm">
                <h1 className="theme-text-primary text-4xl font-normal text-center mb-8">
                    {t.auth.register.title}
                </h1>

                <form onSubmit={handleSubmit} className="theme-card rounded-3xl p-6 space-y-4">
                    {(showError && error) || validationError ? (
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                            <p className="text-red-300 text-sm">{validationError || error}</p>
                        </div>
                    ) : null}

                    <div>
                        <label
                            htmlFor="firstName"
                            className="block theme-text-primary text-sm mb-2"
                        >
                            {t.auth.register.firstName}
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full theme-card-alt theme-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block theme-text-primary text-sm mb-2">
                            {t.auth.register.lastName}
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full theme-card-alt theme-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block theme-text-primary text-sm mb-2">
                            {t.auth.register.email}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full theme-card-alt theme-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block theme-text-primary text-sm mb-2">
                            {t.auth.register.password}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full theme-card-alt theme-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block theme-text-primary text-sm mb-2"
                        >
                            {t.auth.register.confirmPassword}
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full theme-card-alt theme-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ backgroundColor: 'var(--accent)' }}
                        className="w-full hover:opacity-80 text-black font-medium rounded-lg px-4 py-3 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t.auth.register.loading : t.auth.register.submit}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link to="/login" className="theme-text-primary text-sm hover:underline">
                        {t.auth.register.hasAccount}
                    </Link>
                    <p className="theme-text-primary text-sm mt-2">
                        {t.auth.register.problems} <br />
                        <span className="font-bold">{t.auth.register.contact}</span>
                    </p>
                </div>
            </div>

            <div className="fixed bottom-4 left-4 text-red-600 text-xl font-bold">Avans</div>
        </div>
    );
}
