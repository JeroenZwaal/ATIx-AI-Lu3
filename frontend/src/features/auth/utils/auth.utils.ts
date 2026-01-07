/**
 * Validates if an email address is in correct format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates password strength according to backend requirements
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 6) {
        errors.push('Wachtwoord moet minimaal 6 tekens bevatten');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Wachtwoord moet minimaal 1 kleine letter bevatten');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Wachtwoord moet minimaal 1 hoofdletter bevatten');
    }

    if (!/\d/.test(password)) {
        errors.push('Wachtwoord moet minimaal 1 cijfer bevatten');
    }

    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Wachtwoord moet minimaal 1 speciaal teken (!@#$%^&*) bevatten');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Formats user's full name
 */
export const formatFullName = (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
};

/**
 * Gets initials from user's name
 */
export const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
