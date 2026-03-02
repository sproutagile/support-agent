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
    if (!n8nData || !n8nData.steps) {
        return {
            role: 'assistant',
            type: 'text',
            content: typeof n8nData === 'string' ? n8nData : "I couldn't analyze this ticket. Please try again."
        };
    }

    return {
        role: 'assistant',
        type: 'analysis',
        analysis: {
            sections: [
                {
                    title: 'Root Cause Analysis',
                    confidence: n8nData.confidence ? `${n8nData.confidence.charAt(0).toUpperCase() + n8nData.confidence.slice(1)} confidence` : 'Unknown confidence',
                    content: n8nData.steps[0] || 'Investigation in progress.',
                    evidence: n8nData.relatedTickets || []
                },
                {
                    title: 'Suggested Workarounds',
                    items: n8nData.steps.slice(1).map((step, idx) => ({
                        title: `Step ${idx + 2}`,
                        desc: step
                    }))
                },
                {
                    title: 'Escalation Recommendation',
                    recommendation: {
                        tag: n8nData.escalationRequired ? 'Escalation Recommended' : 'Try workaround first',
                        text: n8nData.escalationRequired
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
