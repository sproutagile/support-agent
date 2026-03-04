/* global chrome */

/**
 * Jira Service
 * Handles authentication and API requests to Jira Cloud REST API.
 */

// Keys for chrome.storage.local
const STORAGE_KEYS = {
    JIRA_DOMAIN: 'jira_domain',
    JIRA_EMAIL: 'jira_email',
    JIRA_TOKEN: 'jira_token'
};

/**
 * Retrieve credentials from local storage.
 * @returns {Promise<{domain: string, email: string, token: string}>}
 */
export const getCredentials = async () => {
    // Check if we are in a chrome extension environment
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
            chrome.storage.local.get([STORAGE_KEYS.JIRA_DOMAIN, STORAGE_KEYS.JIRA_EMAIL, STORAGE_KEYS.JIRA_TOKEN], (result) => {
                resolve({
                    domain: result[STORAGE_KEYS.JIRA_DOMAIN] || '',
                    email: result[STORAGE_KEYS.JIRA_EMAIL] || '',
                    token: result[STORAGE_KEYS.JIRA_TOKEN] || ''
                });
            });
        });
    } else {
        // Fallback for local development (outside extension)
        console.warn('Chrome storage not available. Using mock credentials.');
        return { domain: '', email: '', token: '' };
    }
};

/**
 * Save credentials to local storage.
 * @param {string} domain - Jira domain (e.g., https://your-domain.atlassian.net)
 * @param {string} email - Jira email
 * @param {string} token - Jira API token
 */
export const saveCredentials = async (domain, email, token) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
            chrome.storage.local.set({
                [STORAGE_KEYS.JIRA_DOMAIN]: domain,
                [STORAGE_KEYS.JIRA_EMAIL]: email,
                [STORAGE_KEYS.JIRA_TOKEN]: token
            }, resolve);
        });
    }
};

/**
 * Construct the Authorization header.
 * @param {string} email 
 * @param {string} token 
 * @returns {string} Basic Auth header value
 */
const getAuthHeader = (email, token) => {
    return `Basic ${btoa(`${email}:${token}`)}`;
};

/**
 * Clean up the domain URL to ensure it's just the base (e.g., https://company.atlassian.net)
 * @param {string} input 
 * @returns {string}
 */
const formatBaseUrl = (input) => {
    try {
        const url = new URL(input.startsWith('http') ? input : `https://${input}`);
        return `${url.protocol}//${url.hostname}`;
    } catch (e) {
        return input.split('/')[0]; // Simple fallback
    }
};

/**
 * Fetch a single ticket by its key (e.g., EAB-123).
 * @param {string} ticketKey 
 * @returns {Promise<object>} Ticket data
 */
export const fetchTicketByKey = async (ticketKey) => {
    const { domain, email, token } = await getCredentials();

    if (!domain || !email || !token) {
        throw new Error('Missing Jira credentials. Please configure them in Settings.');
    }

    // Jira ticket keys are case-sensitive and must be uppercase
    const normalizedKey = ticketKey.trim().toUpperCase();
    const baseUrl = formatBaseUrl(domain);
    // Migrating to v3 for improved reliability and features
    const url = `${baseUrl}/rest/api/3/issue/${normalizedKey}`;

    console.log(`[JiraService] Fetching ticket: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'omit', // CRITICAL: Skip browser cookies to force use of API Token
            headers: {
                'Authorization': getAuthHeader(email, token),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`[JiraService] Error fetching ${normalizedKey}:`, response.status, response.statusText);
            if (response.status === 401) throw new Error('Unauthorized (401). Check your email and API token.');
            if (response.status === 403) throw new Error('Forbidden (403). Your account might not have access to this ticket.');
            if (response.status === 404) throw new Error(`Ticket "${normalizedKey}" not found (404). Check if the key is correct.`);
            if (response.status === 410) throw new Error(`Error 410: Resource "Gone". Attempted URL: ${url}`);
            throw new Error(`Jira API Error (${response.status}): ${response.statusText || 'Unknown Error'}`);
        }

        return await response.json();
    } catch (err) {
        if (err.message.includes('Failed to fetch')) {
            throw new Error(`Network Error: Verification failed. Is your Jira Domain correct? (${baseUrl})`);
        }
        throw err;
    }
};

/**
 * Search tickets using JQL.
 * @param {string} jql - JQL query string
 * @returns {Promise<object>} Search results
 */
export const searchTickets = async (jql) => {
    const { domain, email, token } = await getCredentials();

    if (!domain || !email || !token) {
        throw new Error('Missing Jira credentials. Please configure them in Settings.');
    }

    const baseUrl = formatBaseUrl(domain);
    const url = `${baseUrl}/rest/api/3/search/jql`;

    const makeRequest = async (payload) => {
        console.log(`[JiraService] POST search/jql: ${jql}`);
        return await fetch(url, {
            method: 'POST',
            credentials: 'omit', // CRITICAL: Skip browser cookies to force use of API Token
            headers: {
                'Authorization': getAuthHeader(email, token),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    };

    try {
        // Try with fieldIds first
        let response = await makeRequest({
            jql,
            fieldIds: ["key", "summary", "status", "priority", "description", "resolution"],
            maxResults: 50
        });

        if (!response.ok) {
            console.warn(`[JiraService] Search attempt 1 failed (${response.status}). Retrying...`);
            // Fallback to just JQL
            response = await makeRequest({ jql, maxResults: 50 });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[JiraService] Search Final Error:`, response.status, errorText);
                throw new Error(`Jira API Error (${response.status}): ${response.statusText || 'Search failed'}`);
            }
        }

        const data = await response.json();

        if (data.results) {
            return {
                issues: data.results.map(r => r.issue),
                total: data.results.length
            };
        }

        return {
            issues: data.issues || [],
            total: data.total || 0
        };
    } catch (err) {
        console.error(`[JiraService] Exception in searchTickets:`, err);
        throw err;
    }
};
