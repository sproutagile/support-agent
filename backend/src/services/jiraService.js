/**
 * Jira Service (Backend)
 * Handles communication with the Jira REST API.
 */

/**
 * Fetch data from Jira using a JQL query.
 * @param {string} jql 
 * @param {object} credentials { domain, email, token }
 * @param {string} fields Comma-separated list of fields to return
 * @returns {Promise<object>} Jira search results
 */
const fetchJiraData = async (jql, credentials) => {
    const { domain, email, token } = credentials;

    // Auth debug: see what's actually reaching the backend
    const maskedToken = token ? `${token.substring(0, 3)}...${token.substring(token.length - 3)}` : 'MISSING';
    console.log(`[JiraService] Target: ${domain} | User: ${email} | Token: [${maskedToken}] (Len: ${token?.length})`);

    const basicAuth = Buffer.from(`${email}:${token}`).toString('base64');

    // Formatting domain robustly
    let baseUrl = domain;
    try {
        const urlObj = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
        baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
    } catch (e) {
        if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
        baseUrl = baseUrl.replace(/\/$/, '');
    }

    const url = `${baseUrl}/rest/api/3/search/jql`;

    let currentAuthHeader = `Basic ${basicAuth}`;

    const makeRequest = async (payload) => {
        console.log(`[JiraService] POST search/jql: ${JSON.stringify(payload)}`);
        return await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': currentAuthHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    };

    // Trial 11: Mirror frontend EXACTLY
    const mirrorPayload = {
        jql,
        fieldIds: ["key", "summary", "status", "priority", "description", "resolution"],
        maxResults: 100
    };

    let res = await makeRequest(mirrorPayload);

    // Fallback: If 401, try Bearer Auth
    if (res.status === 401) {
        console.warn(`[JiraService] Basic Auth failed (401). Retrying as Bearer Token...`);
        currentAuthHeader = `Bearer ${token}`;
        res = await makeRequest(mirrorPayload);
    }

    if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[JiraService] API Error (${res.status}): ${errorText.substring(0, 100)}`);

        // Final fallback: if 400, try sending just JQL string in body (The frontend fallback)
        if (res.status === 400 || res.status === 404) {
            console.log(`[JiraService] Retrying with JQL only payload...`);
            res = await makeRequest({ jql, maxResults: 100 });
        }
    }

    if (!res.ok) throw new Error(`Jira API Error (${res.status}): ${jql}`);

    const rawBody = await res.text();
    // RAW AUDIT: See the literal truth from Jira
    console.log(`[JiraService] RAW DATA (first 250 chars): ${rawBody.substring(0, 250)}`);

    const data = JSON.parse(rawBody);
    const rawIssues = data.issues || data.results || [];

    // NORMALIZE discovered issues
    const issues = rawIssues.map(issue => {
        const item = issue.issue || issue;
        return {
            id: item.id,
            key: item.key || item.id,
            fields: item.fields || {}
        };
    });

    // AUDITOR: Log normalized structure
    if (issues.length > 0) {
        const sample = issues[0];
        console.log(`[JiraService] AUDIT - Sample Issue:`, JSON.stringify({
            id: sample.id,
            key: sample.key,
            has_fields: !!Object.keys(sample.fields).length,
            has_created: !!sample.fields?.created
        }));
    }

    // TRIAL 12: ENRICHMENT (The Investigate Method)
    // If the issues are "naked" (no fields or missing key), fetch them individually
    const needsEnrichment = issues.length > 0 && (!issues[0].fields || !issues[0].fields.created);

    if (needsEnrichment) {
        console.log(`[JiraService] Detected naked issues. Enriching ${issues.length} tickets using 'Investigate' method...`);
        // Limit enrichment to first 100 to stay safe and fast (Trial 13)
        const targetIssues = issues.slice(0, 100);

        const enrichedIssues = await Promise.all(targetIssues.map(async (issue) => {
            try {
                const issueUrl = `${baseUrl}/rest/api/3/issue/${issue.id}`;
                const issueRes = await fetch(issueUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': currentAuthHeader,
                        'Accept': 'application/json'
                    }
                });
                if (issueRes.ok) {
                    const fullData = await issueRes.json();
                    return {
                        id: fullData.id,
                        key: fullData.key,
                        fields: fullData.fields
                    };
                }
            } catch (e) {
                console.warn(`[JiraService] Enrichment failed for ${issue.id}:`, e.message);
            }
            return issue; // Fallback to naked issue if enrichment fails
        }));

        return {
            issues: enrichedIssues,
            total: data.total || rawIssues.length
        };
    }

    return {
        issues,
        total: data.total || rawIssues.length
    };
};

/**
 * Diagnostic: Fetch a specific issue to see its real data structure
 */
const inspectIssue = async (credentials, idOrKey = 'EAB-1174') => {
    const { domain, email, token } = credentials;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    let baseUrl = domain;
    if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
    baseUrl = baseUrl.replace(/\/$/, '');

    console.log(`[Diagnostic] Inspecting issue ${idOrKey}...`);
    const response = await fetch(`${baseUrl}/rest/api/3/issue/${idOrKey}`, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
        }
    });

    if (response.ok) {
        const issue = await response.json();
        console.log(`[Diagnostic] Issue ${idOrKey} found!`);
        console.log(`[Diagnostic] Project: ${issue.fields.project?.key} | Status: ${issue.fields.status?.name}`);
        console.log(`[Diagnostic] Labels: ${JSON.stringify(issue.fields.labels)}`);
        // Log all field keys available on this specific issue
        console.log(`[Diagnostic] Field keys on issue: ${Object.keys(issue.fields).join(', ')}`);
    } else {
        const err = await response.text();
        console.error(`[Diagnostic] Issue ${idOrKey} NOT FOUND: ${response.status}`, err);
    }
};

/**
 * Diagnostic: Fetch available fields to verify names
 */
const getAvailableFields = async (credentials) => {
    const { domain, email, token } = credentials;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    let baseUrl = domain;
    if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
    baseUrl = baseUrl.replace(/\/$/, '');

    const response = await fetch(`${baseUrl}/rest/api/3/field`, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
        }
    });

    if (response.ok) {
        const fields = await response.json();
        console.log(`[Diagnostic] Found ${fields.length} available fields.`);
        // Log ALL field IDs and names since there are only 28
        const mapped = fields.map(f => ({ id: f.id, name: f.name, clauseNames: f.clauseNames }));
        console.log('[Diagnostic] ALL available fields:', JSON.stringify(mapped, null, 2));
    }
};

/**
 * Diagnostic: Fetch available projects to verify EAB key
 */
const getAvailableProjects = async (credentials) => {
    const { domain, email, token } = credentials;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    let baseUrl = domain;
    if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
    baseUrl = baseUrl.replace(/\/$/, '');

    // Try both project and project search
    const response = await fetch(`${baseUrl}/rest/api/3/project`, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
        }
    });

    if (response.ok) {
        const projects = await response.json();
        console.log('[Diagnostic] Available projects:', JSON.stringify(projects.map(p => ({ key: p.key, name: p.name })), null, 2));
    }
};

/**
 * Diagnostic: Verify if project EAB exists directly
 */
const checkProjectExistence = async (credentials, projectKey = 'EAB') => {
    const { domain, email, token } = credentials;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    let baseUrl = domain;
    if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
    baseUrl = baseUrl.replace(/\/$/, '');

    console.log(`[Diagnostic] Checking project ${projectKey} directly...`);
    const response = await fetch(`${baseUrl}/rest/api/3/project/${projectKey}`, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
        }
    });

    if (response.ok) {
        const p = await response.json();
        console.log(`[Diagnostic] Project ${projectKey} exists: ${p.name}`);
    } else {
        const err = await response.text();
        console.error(`[Diagnostic] Project ${projectKey} NOT FOUND or NO ACCESS: ${response.status}`, err);
    }
};

/**
 * Diagnostic: Check who the current user is
 */
const getMyself = async (credentials) => {
    const { domain, email, token } = credentials;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    let baseUrl = domain;
    if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
    baseUrl = baseUrl.replace(/\/$/, '');

    const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
        }
    });

    if (response.ok) {
        const me = await response.json();
        console.log(`[Diagnostic] Logged in as: ${me.emailAddress} (${me.displayName})`);
    } else {
        console.error('[Diagnostic] Failed to fetch myself:', response.status);
    }
};

/**
 * Diagnostic: Sample latest issues regardless of project to find the real project key
 */
const sampleLatestIssues = async (credentials) => {
    try {
        // Try restricted search based on user theory: key ~ "EAB"
        const data = await fetchJiraData('key ~ "EAB" AND created >= "2024-01-01" order by created desc', credentials, 'project,created,summary');
        if (data.issues && data.issues.length > 0) {
            console.log('[Diagnostic] SAMPLE ISSUES DISCOVERED (key ~ "EAB"):');
            data.issues.slice(0, 5).forEach(issue => {
                console.log(`  - Key: ${issue.key} | Project: ${issue.fields.project?.key} | Created: ${issue.fields.created}`);
            });
        }
    } catch (e) {
        console.warn('[Diagnostic] Sample fetch failed with restricted JQL too.');
    }
};

module.exports = {
    fetchJiraData,
    getAvailableFields,
    getAvailableProjects,
    checkProjectExistence,
    getMyself,
    inspectIssue,
    sampleLatestIssues
};
