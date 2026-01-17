import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './register';

const mockRegister = vi.fn();
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
        register: mockRegister,
        isLoading: false,
        error: null,
    }),
}));

vi.mock('../../../shared/contexts/useLanguage', () => ({
    useLanguage: () => ({
        language: 'nl',
        setLanguage: vi.fn(),
        t: {
            auth: {
                register: {
                    title: 'Registreren',
                    firstName: 'Voornaam',
                    lastName: 'Achternaam',
                    email: 'E-mail',
                    password: 'Wachtwoord',
                    confirmPassword: 'Bevestig wachtwoord',
                    submit: 'Registreren',
                    hasAccount: 'Al een account?',
                    login: 'Inloggen',
                },
                validation: {
                    firstNameRequired: 'Voornaam is verplicht',
                    lastNameRequired: 'Achternaam is verplicht',
                    emailRequired: 'E-mail is verplicht',
                    passwordRequired: 'Wachtwoord is verplicht',
                    passwordsNoMatch: 'Wachtwoorden komen niet overeen',
                    passwordMinLength: 'Wachtwoord moet minimaal 6 tekens bevatten',
                    passwordComplexity:
                        'Wachtwoord moet hoofdletters, kleine letters, cijfers en speciale tekens bevatten',
                },
            },
        },
    }),
}));

vi.mock('../../../shared/components/AvansLogo', () => ({
    default: () => <div data-testid="avans-logo">Logo</div>,
}));

describe('Register', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render register form', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>,
        );

        expect(screen.getByRole('heading', { name: 'Registreren' })).toBeInTheDocument();
        expect(screen.getByLabelText('Voornaam')).toBeInTheDocument();
        expect(screen.getByLabelText('Achternaam')).toBeInTheDocument();
        expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
        expect(screen.getByLabelText('Wachtwoord')).toBeInTheDocument();
        expect(screen.getByLabelText('Bevestig wachtwoord')).toBeInTheDocument();
    });

    it('should update form fields on input change', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>,
        );

        const firstNameInput = screen.getByLabelText('Voornaam') as HTMLInputElement;
        const lastNameInput = screen.getByLabelText('Achternaam') as HTMLInputElement;
        const emailInput = screen.getByLabelText('E-mail') as HTMLInputElement;

        fireEvent.change(firstNameInput, { target: { value: 'John' } });
        fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

        expect(firstNameInput.value).toBe('John');
        expect(lastNameInput.value).toBe('Doe');
        expect(emailInput.value).toBe('john@example.com');
    });

    it('should show validation error when passwords do not match', async () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>,
        );

        fireEvent.change(screen.getByLabelText('Voornaam'), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText('Achternaam'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText('E-mail'), {
            target: { value: 'john@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Wachtwoord'), {
            target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByLabelText('Bevestig wachtwoord'), {
            target: { value: 'Password456!' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Registreren' }));

        await waitFor(() => {
            expect(screen.getByText('Wachtwoorden komen niet overeen')).toBeInTheDocument();
        });
    });

    it('should show validation error when password is too short', async () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>,
        );

        fireEvent.change(screen.getByLabelText('Voornaam'), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText('Achternaam'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText('E-mail'), {
            target: { value: 'john@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Wachtwoord'), { target: { value: 'Pas1!' } });
        fireEvent.change(screen.getByLabelText('Bevestig wachtwoord'), {
            target: { value: 'Pas1!' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Registreren' }));

        await waitFor(() => {
            expect(
                screen.getByText('Wachtwoord moet minimaal 6 tekens bevatten'),
            ).toBeInTheDocument();
        });
    });

    it('should show validation error when password lacks complexity', async () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>,
        );

        fireEvent.change(screen.getByLabelText('Voornaam'), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText('Achternaam'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText('E-mail'), {
            target: { value: 'john@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Wachtwoord'), {
            target: { value: 'password123' },
        }); // Missing uppercase and special char
        fireEvent.change(screen.getByLabelText('Bevestig wachtwoord'), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Registreren' }));

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Wachtwoord moet hoofdletters, kleine letters, cijfers en speciale tekens bevatten',
                ),
            ).toBeInTheDocument();
        });
    });

    it('should call register with valid data', async () => {
        mockRegister.mockResolvedValue({ token: 'test-token' });

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>,
        );

        fireEvent.change(screen.getByLabelText('Voornaam'), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText('Achternaam'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText('E-mail'), {
            target: { value: 'john@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Wachtwoord'), {
            target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByLabelText('Bevestig wachtwoord'), {
            target: { value: 'Password123!' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Registreren' }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith(
                'John',
                'Doe',
                'john@example.com',
                'Password123!',
            );
        });
    });

    it('should navigate to dashboard after successful registration', async () => {
        mockRegister.mockResolvedValue({ token: 'test-token' });

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>,
        );

        fireEvent.change(screen.getByLabelText('Voornaam'), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText('Achternaam'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText('E-mail'), {
            target: { value: 'john@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Wachtwoord'), {
            target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByLabelText('Bevestig wachtwoord'), {
            target: { value: 'Password123!' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Registreren' }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('should validate firstName is required', async () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>,
        );

        fireEvent.change(screen.getByLabelText('Achternaam'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText('E-mail'), {
            target: { value: 'john@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Wachtwoord'), {
            target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByLabelText('Bevestig wachtwoord'), {
            target: { value: 'Password123!' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Registreren' }));

        await waitFor(() => {
            expect(screen.getByText('Voornaam is verplicht')).toBeInTheDocument();
        });
    });

    it('should clear validation errors when user types', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>,
        );

        const firstNameInput = screen.getByLabelText('Voornaam');
        fireEvent.change(firstNameInput, { target: { value: 'John' } });

        expect(screen.queryByText(/verplicht/i)).not.toBeInTheDocument();
    });
});
