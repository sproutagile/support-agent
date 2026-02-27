// Sprout Support Agent — Background Service Worker
// Handles API communication, caching, and message routing

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const cache = new Map();

// Open the side panel when the toolbar icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Side panel setup error:', error));

// Listen for messages from side panel or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_METRICS') {
    handleGetMetrics(message.payload).then(sendResponse);
    return true; // async response
  }

  if (message.type === 'SEARCH_RELATED') {
    handleSearchRelated(message.payload).then(sendResponse);
    return true;
  }

  if (message.type === 'GET_TICKET_CONTEXT') {
    // Forward to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'EXTRACT_TICKET' }, sendResponse);
      }
    });
    return true;
  }
});

async function handleGetMetrics(payload) {
  const cacheKey = `metrics_${payload?.range || '30d'}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { success: true, data: cached.data };
  }

  // TODO: Replace with actual Azure Function endpoint
  // const response = await fetch(`${AZURE_FUNCTION_URL}/api/metrics?range=${payload.range}`);
  // const data = await response.json();

  // Mock data for prototype
  const data = generateMockMetrics(payload?.range);
  cache.set(cacheKey, { data, timestamp: Date.now() });

  return { success: true, data };
}

async function handleSearchRelated(payload) {
  // TODO: Replace with actual Azure Function endpoint
  // const response = await fetch(`${AZURE_FUNCTION_URL}/api/search`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ query: payload.query, ticketKey: payload.ticketKey })
  // });

  // Mock data for prototype
  const data = generateMockRelatedTickets(payload?.ticketKey);
  return { success: true, data };
}

function generateMockMetrics(range) {
  return {
    createdTrend: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      P1: [2, 1, 3, 1],
      P2: [5, 8, 4, 6],
      P3: [12, 10, 15, 11],
      P4: [8, 6, 9, 7]
    },
    resolvedInternal: 34,
    resolvedDelivery: 18,
    escalated: 7,
    velocity: 12.5,
    leadTime: '4.2 days',
    cycleTime: '2.8 days'
  };
}

function generateMockRelatedTickets(ticketKey) {
  return [
    {
      key: 'EAB-1234',
      summary: 'SSO login fails after password reset',
      status: 'Resolved',
      priority: 'P2',
      workaround: 'Clear browser cache and re-authenticate via IdP portal. If persistent, re-sync user attributes.',
      similarity: 92
    },
    {
      key: 'EAB-1180',
      summary: 'SSO attribute mismatch causing auth loop',
      status: 'Resolved',
      priority: 'P1',
      workaround: 'Verify SAML attributes mapping in Azure AD. Check NameID format matches expected value.',
      similarity: 85
    },
    {
      key: 'EAB-1156',
      summary: 'User unable to access after SSO migration',
      status: 'In Progress',
      priority: 'P2',
      workaround: null,
      similarity: 78
    }
  ];
}
