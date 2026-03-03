/**
 * Ticket Utilities
 * Shared logic for parsing and normalizing Jira ticket keys.
 */

const PROJECT_KEY = 'EAB';

/**
 * Normalizes a potential ticket key into the standard project format.
 * Examples:
 * "eab-123" -> "EAB-123"
 * "eab 123" -> "EAB-123"
 * "123" -> "EAB-123" (if only digits provided)
 * @param {string} input - The raw user input.
 * @returns {string|null} Normalized key or null if invalid.
 */
export const normalizeTicketKey = (input) => {
    if (!input) return null;

    // Remove whitespace and convert to uppercase
    const clean = input.trim().toUpperCase().replace(/\s+/g, '-');

    // Pattern 1: Starts with Project Key (e.g., EAB-123 or EAB123)
    if (clean.startsWith(PROJECT_KEY)) {
        // Ensure there is a hyphen
        if (clean.length > PROJECT_KEY.length && clean[PROJECT_KEY.length] !== '-') {
            const numPart = clean.substring(PROJECT_KEY.length);
            return `${PROJECT_KEY}-${numPart}`;
        }
        return clean;
    }

    // Pattern 2: Only digits provided (e.g., "123")
    if (/^\d+$/.test(clean)) {
        return `${PROJECT_KEY}-${clean}`;
    }

    // Pattern 3: Hybrid (e.g., "123-EAB" - rare but possible)
    const hybridMatch = clean.match(/(\d+)-?EAB/);
    if (hybridMatch) {
        return `EAB-${hybridMatch[1]}`;
    }

    // Final Validation: Standard Jira Key format
    if (/^[A-Z0-9]+-\d+$/.test(clean)) {
        return clean;
    }

    return null;
};

/**
 * Checks if a string contains a ticket key.
 * @param {string} text 
 * @returns {boolean}
 */
export const hasTicketKey = (text) => {
    if (!text) return false;
    const keyPattern = new RegExp(`${PROJECT_KEY}-\\d+|\\b\\d{3,5}\\b`, 'i');
    return keyPattern.test(text);
};
/**
 * Formats a priority key into the new descriptive label.
 * @param {string} priority - E.g., "P1", "P2"
 * @returns {string} E.g., "P1 (Very Urgent)"
 */
export const formatPriority = (priority) => {
    if (!priority) return 'P?';
    const clean = priority.toUpperCase();
    const map = {
        'P1': 'P1 (Very Urgent)',
        'P2': 'P2 (Urgent)',
        'P3': 'P3 (Standard)',
        'P4': 'P4 (Low)',
        'CRITICAL': 'P1 (Very Urgent)',
        'HIGH': 'P2 (Urgent)',
        'MEDIUM': 'P3 (Standard)',
        'LOW': 'P4 (Low)'
    };
    return map[clean] || map[clean.split(' ')[0]] || priority;
};
