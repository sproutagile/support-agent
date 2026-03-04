/**
 * n8n Data Mapper
 * Adapts n8n's structured JSON output to the frontend component formats.
 */

/**
 * Maps n8n investigation data to the AI Chat message format.
 * @param {Object} n8nData - The unwrapped JSON from the n8n proxy.
 * @returns {Object} A structured message object for AIChat.
 */
export const mapN8nToAiMessage = (n8nData) => {
    let tickets = [];
    const query = (Array.isArray(n8nData) && n8nData.length > 0 ? n8nData[0].query : n8nData?.query) || '';

    // Robust recursive crawler (mirrors Investigate.jsx logic)
    const findTickets = (obj) => {
        if (Array.isArray(obj)) {
            obj.forEach(findTickets);
        } else if (obj && typeof obj === 'object') {
            // Handle "columnar" structure
            if (Array.isArray(obj.Key)) {
                obj.Key.forEach((k, i) => {
                    const ticket = {};
                    Object.keys(obj).forEach(field => {
                        ticket[field] = Array.isArray(obj[field]) ? obj[field][i] : obj[field];
                    });
                    tickets.push(ticket);
                });
            } else if (obj.Key || obj.key) {
                tickets.push(obj);
            } else {
                Object.values(obj).forEach(val => {
                    if (val && typeof val === 'object') findTickets(val);
                });
            }
        }
    };

    findTickets(n8nData);

    if (tickets.length > 0 || query) {
        return {
            role: 'assistant',
            type: 'ticket-results',
            query: query,
            tickets: tickets
        };
    }

    // Fallback for the old 'analysis' format or plain text
    if (!data || !data.steps) {
        return {
            role: 'assistant',
            type: 'text',
            content: typeof data === 'string' ? data : (data?.message || "I couldn't analyze this ticket. Please try again.")
        };
    }

    // ... rest of the existing analysis mapping logic if still needed as fallback
    return {
        role: 'assistant',
        type: 'analysis',
        analysis: {
            sections: [
                {
                    title: 'Root Cause Analysis',
                    confidence: data.confidence ? `${data.confidence.charAt(0).toUpperCase() + data.confidence.slice(1)} confidence` : 'Unknown confidence',
                    content: data.steps[0] || 'Investigation in progress.',
                    evidence: data.relatedTickets || []
                },
                {
                    title: 'Suggested Workarounds',
                    items: data.steps.slice(1).map((step, idx) => ({
                        title: `Step ${idx + 2}`,
                        desc: step
                    }))
                },
                {
                    title: 'Escalation Recommendation',
                    recommendation: {
                        tag: data.escalationRequired ? 'Escalation Recommended' : 'Try workaround first',
                        text: data.escalationRequired
                            ? 'Technical analysis suggests this issue requires developer intervention.'
                            : 'Historical data shows similar cases were resolved using the steps above.'
                    }
                }
            ]
        }
    };
};

/**
 * Extracts advisor data for the Investigate screen from n8n response.
 */
export const mapN8nToAdvisor = (n8nData) => {
    if (!n8nData) return null;

    return {
        confidenceBadge: n8nData.confidence || 'unknown',
        escalationBadge: n8nData.escalationRequired ? 'High' : 'Low',
        message: n8nData.steps ? n8nData.steps[0] : 'Search for a ticket to see analysis.',
        relatedCount: n8nData.relatedTickets ? n8nData.relatedTickets.length : 0
    };
};
