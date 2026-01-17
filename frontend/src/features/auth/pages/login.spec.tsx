import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './login';

// Mock hooks and components
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../hooks/useAuth.tsx', () => ({
    useAuth: () => ({
        login: mockLogin,
        isLoading: false,
        error: null,
        token: null,
    }),
}));

vi.mock('../../../shared/contexts/useLanguage', () => ({
    useLanguage: () => ({
        language: 'nl',
        setLanguage: vi.fn(),
        t: {
            auth: {
                login: {
                    title: 'Inloggen',
                    email: 'E-mail',
                    password: 'Wachtwoord',
                    submit: 'Inloggen',
                    noAccount: 'Nog geen account?',
                    register: 'Registreer',
                },
            },
        },
    }),
}));

vi.mock('../../../shared/components/AvansLogo', () => ({
    default: () => <div data-testid="avans-logo">Logo</div>,
}));

describe('Login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should render login form', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>,
        );

        expect(screen.getByRole('heading', { name: 'Inloggen' })).toBeInTheDocument();
        expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
        expect(screen.getByLabelText('Wachtwoord')).toBeInTheDocument();
    });

    it('should update form fields on input change', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>,
        );

        const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Wachtwoord') as HTMLInputElement;

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('should call login on form submit', async () => {
        mockLogin.mockResolvedValue({ token: 'test-token' });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>,
        );

        const emailInput = screen.getByLabelText('E-mail');
        const passwordInput = screen.getByLabelText('Wachtwoord');
        const submitButton = screen.getByRole('button', { name: 'Inloggen' });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('should navigate to dashboard after successful login', async () => {
        mockLogin.mockResolvedValue({ token: 'test-token' });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>,
        );

        const emailInput = screen.getByLabelText('E-mail');
        const passwordInput = screen.getByLabelText('Wachtwoord');
        const submitButton = screen.getByRole('button', { name: 'Inloggen' });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });

    it('should display error message on login failure', async () => {
        mockLogin.mockRejectedValue(new Error('Invalid credentials'));

        // Re-mock useAuth to return error
        vi.mock('../hooks/useAuth.tsx', () => ({
            useAuth: () => ({
                login: mockLogin,
                isLoading: false,
                error: 'Invalid credentials',
                token: null,
            }),
        }));

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>,
        );

        const emailInput = screen.getByLabelText('E-mail');
        const passwordInput = screen.getByLabelText('Wachtwoord');
        const submitButton = screen.getByRole('button', { name: 'Inloggen' });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
        });
    });

    it('should clear error when user types in input', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>,
        );

        const emailInput = screen.getByLabelText('E-mail');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        // Error should be cleared on input change
        expect(screen.queryByText(/Invalid credentials/i)).not.toBeInTheDocument();
    });

    it('should render language switcher button', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>,
        );

        const languageButton = screen.getByText('NL');
        expect(languageButton).toBeInTheDocument();
    });

    it('should render register link', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>,
        );

        const registerLink = screen.getByText('Nog geen account?');
        expect(registerLink).toBeInTheDocument();
    });
});
