const jiraService = require('./jiraService');

// In-memory cache
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Trial 11: One-time cache clear on service start to avoid stale 0 results
console.log('[MetricsService] Initializing Trial 11 - Cache cleared.');
cache.clear();

/**
 * Core logic to fetch and aggregate metrics from Jira
 */
const getAggregatedMetrics = async (params, credentials) => {
    const { startDate, endDate, priority, refresh } = params;
    const cacheKey = JSON.stringify({ startDate, endDate, priority });

    if (refresh !== 'true') {
        const cached = cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            console.log(`[MetricsService] Returning cached data for ${cacheKey}`);
            return cached.data;
        }
    }

    console.log(`[MetricsService] Fetching Master Pool for ${cacheKey}`);

    // TRIAL 13: Single "Catch-All" Query
    // We fetch everything created OR resolved in the range to ensure we have the full pool
    const masterJQL = `text ~ "EAB" AND (created >= "${startDate}" OR resolved >= "${startDate}")`;

    try {
        const result = await jiraService.fetchJiraData(masterJQL, credentials);
        const rawIssues = result.issues || [];

        // TRIAL 14: Strict Project Filter
        // Filter out SHR, L3, etc. that just mention EAB
        const allIssues = rawIssues.filter(i => i.key && i.key.startsWith('EAB-'));

        // IN-MEMORY GROUPING
        const createdRaw = allIssues.filter(i => {
            const cDate = i.fields?.created;
            return cDate && cDate >= startDate && (!endDate || cDate <= endDate + 'T23:59:59');
        });

        const resolvedRaw = allIssues.filter(i => {
            const rDate = i.fields?.resolutiondate || i.fields?.resolved;
            return rDate && rDate >= startDate && (!endDate || rDate <= endDate + 'T23:59:59');
        });

        const internalRaw = resolvedRaw.filter(i => {
            const labels = i.fields?.labels || [];
            return labels.some(l => ["InternalSupport", "internal-support", "Internal_Support"].includes(l));
        });

        const deliveryRaw = resolvedRaw.filter(i => {
            const labels = i.fields?.labels || [];
            return labels.some(l => ["Delivery", "delivery-team"].includes(l));
        });

        const escalatedRaw = resolvedRaw.filter(i => {
            const status = i.fields?.status?.name;
            return ["Escalated", "Escalated to Engineering", "Engineering"].includes(status);
        });

        const aggregated = {
            total: allIssues.length,
            createdTrend: processTrend(createdRaw),
            resolvedInternal: {
                total: internalRaw.length,
                trend: []
            },
            resolvedDelivery: {
                total: deliveryRaw.length,
                trend: []
            },
            escalated: {
                total: escalatedRaw.length,
                trend: []
            },
            velocity: calculateVelocity(internalRaw, deliveryRaw),
            leadTimeAvgDays: calculateAverageDays(resolvedRaw, 'created', 'resolutiondate'),
            cycleTimeAvgDays: calculateAverageDays(resolvedRaw, 'customfield_workstarted', 'resolutiondate'),
            lastUpdated: new Date().toISOString()
        };

        // TRIAL 15: Deep Discovery
        const allLabels = [...new Set(allIssues.flatMap(i => i.fields?.labels || []))];
        const allStatuses = [...new Set(allIssues.map(i => i.fields?.status?.name).filter(Boolean))];

        // VERIFICATION LOG
        console.log('\n--- TRIAL 15 DEEP DISCOVERY ---');
        console.log(`Strict EAB- Tickets: ${allIssues.length}`);
        console.log(`- Created in range: ${createdRaw.length}`);
        console.log(`- Resolved in range: ${resolvedRaw.length}`);
        console.log(`- Internal Support: ${internalRaw.length}`);
        console.log(`- Delivery Team: ${deliveryRaw.length}`);
        console.log(`- Escalated: ${escalatedRaw.length}`);
        console.log(`\n[Discovery] Found Labels: ${allLabels.join(', ') || 'NONE'}`);
        console.log(`[Discovery] Found Statuses: ${allStatuses.join(', ') || 'NONE'}`);
        console.log(`Sample Keys: ${allIssues.slice(0, 5).map(i => i.key).join(', ')}`);
        console.log('-------------------------------\n');

        cache.set(cacheKey, { data: aggregated, timestamp: Date.now() });
        return aggregated;

    } catch (error) {
        console.error('[MetricsService] Master Aggregation failed:', error);
        throw error;
    }
};

// --- Helper Functions ---

function processTrend(issues) {
    const counts = {};
    if (!issues || !Array.isArray(issues)) return { dates: [], counts: [] };

    issues.forEach(issue => {
        try {
            const dateStr = issue?.fields?.created || issue?.created;
            if (dateStr) {
                const date = dateStr.split('T')[0];
                counts[date] = (counts[date] || 0) + 1;
            }
        } catch (e) {
            // Silent skip for bad ticket
        }
    });

    const sortedDates = Object.keys(counts).sort();
    return {
        dates: sortedDates,
        counts: sortedDates.map(d => counts[d])
    };
}

function calculateVelocity(internal, delivery) {
    const all = [...(internal || []), ...(delivery || [])];
    const weeks = {};

    all.forEach(issue => {
        try {
            const resDate = issue?.fields?.resolutiondate || issue?.fields?.resolved || issue?.resolutiondate;
            if (resDate) {
                const date = new Date(resDate);
                const week = `W${getWeekNumber(date)}`;
                weeks[week] = (weeks[week] || 0) + 1;
            }
        } catch (e) {
            // Silent skip
        }
    });

    const sortedWeeks = Object.keys(weeks).sort();
    return {
        weeks: sortedWeeks,
        counts: sortedWeeks.map(w => weeks[w])
    };
}

function calculateAverageDays(issues, startField, endField) {
    if (!issues || issues.length === 0) return 0;

    let totalDays = 0;
    let count = 0;

    issues.forEach(issue => {
        try {
            const startStr = issue?.fields?.[startField] || issue?.[startField];
            const endStr = issue?.fields?.[endField] || issue?.[endField];

            if (startStr && endStr) {
                const start = new Date(startStr);
                const end = new Date(endStr);

                // Ensure valid dates and calculate diff
                if (!isNaN(start) && !isNaN(end)) {
                    const diffTime = end - start;
                    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                    totalDays += diffDays;
                    count++;
                }
            }
        } catch (e) {
            // Silent skip
        }
    });

    return count > 0 ? Math.round(totalDays / count) : 0;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = {
    getAggregatedMetrics
};
