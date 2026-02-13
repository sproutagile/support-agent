// Sprout Support Agent — Popup Script
// Handles tab switching, accordion, tools, and interactive elements

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAccordion();
  initTools();
  initSettings();
  initCopyButtons();
  initSearch();
  initRefresh();
  initAIChat();
  loadTicketContext();
});

// ==================== Tab Navigation ====================
function initTabs() {
  const tabs = document.querySelectorAll('.sp-tab');
  const panels = document.querySelectorAll('.sp-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = `panel-${tab.dataset.tab}`;

      // Remove active states
      tabs.forEach(t => t.classList.remove('sp-tab--active'));
      panels.forEach(p => p.classList.remove('sp-panel--active'));

      // Set active
      tab.classList.add('sp-tab--active');
      document.getElementById(targetId)?.classList.add('sp-panel--active');
    });
  });
}

// ==================== Accordion ====================
function initAccordion() {
  const triggers = document.querySelectorAll('.sp-accordion__trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.sp-accordion__item');
      const isOpen = item.classList.contains('sp-accordion__item--open');

      // Close all items
      document.querySelectorAll('.sp-accordion__item').forEach(i => {
        i.classList.remove('sp-accordion__item--open');
      });

      // Toggle clicked item
      if (!isOpen) {
        item.classList.add('sp-accordion__item--open');
      }
    });
  });
}

// ==================== Quick Tools ====================
function initTools() {
  // SSO Investigation Panel toggle
  const ssoInvBtn = document.getElementById('ssoInvBtn');
  const ssoInvestPanel = document.getElementById('ssoInvestPanel');
  const closeSsoPanel = document.getElementById('closeSsoPanel');

  if (ssoInvBtn && ssoInvestPanel) {
    ssoInvBtn.addEventListener('click', () => {
      ssoInvestPanel.style.display = ssoInvestPanel.style.display === 'none' ? 'block' : 'none';
    });
  }

  if (closeSsoPanel && ssoInvestPanel) {
    closeSsoPanel.addEventListener('click', () => {
      ssoInvestPanel.style.display = 'none';
    });
  }

  // CA Tool button
  const caToolBtn = document.getElementById('caToolBtn');
  if (caToolBtn) {
    caToolBtn.addEventListener('click', () => {
      showNotification('Customer Advocacy tool would open here. Configure URL in settings.');
    });
  }

  // Sync Tool button
  const syncToolBtn = document.getElementById('syncToolBtn');
  if (syncToolBtn) {
    syncToolBtn.addEventListener('click', () => {
      // Switch to FAQ tab and open the Full Sync accordion
      document.querySelector('[data-tab="faq"]')?.click();
      setTimeout(() => {
        const items = document.querySelectorAll('.sp-accordion__item');
        const syncItem = items[items.length - 1]; // Last item is Full Sync
        if (syncItem && !syncItem.classList.contains('sp-accordion__item--open')) {
          syncItem.querySelector('.sp-accordion__trigger')?.click();
        }
      }, 100);
    });
  }
}

// ==================== Settings ====================
function initSettings() {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsOverlay = document.getElementById('settingsOverlay');
  const closeSettings = document.getElementById('closeSettings');
  const cancelSettings = document.getElementById('cancelSettings');
  const saveSettings = document.getElementById('saveSettings');

  const openSettings = () => {
    if (settingsOverlay) settingsOverlay.style.display = 'flex';
  };

  const closeSettingsPanel = () => {
    if (settingsOverlay) settingsOverlay.style.display = 'none';
  };

  settingsBtn?.addEventListener('click', openSettings);
  closeSettings?.addEventListener('click', closeSettingsPanel);
  cancelSettings?.addEventListener('click', closeSettingsPanel);

  saveSettings?.addEventListener('click', () => {
    showNotification('Settings saved successfully!');
    closeSettingsPanel();
  });

  // Close on overlay click
  settingsOverlay?.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) closeSettingsPanel();
  });
}

// ==================== Copy Buttons ====================
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const workaround = btn.closest('.sp-ticket-card__workaround');
      const text = workaround?.querySelector('.sp-workaround-text')?.textContent;

      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
          `;
          btn.classList.add('copied');

          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('copied');
          }, 2000);
        });
      }
    });
  });
}

// ==================== Search ====================
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const faqSearchInput = document.getElementById('faqSearchInput');

  // Investigate tab search
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          showNotification(`Searching for: "${query}" — Results would load from Jira API`);
        }
      }
    });
  }

  // FAQ tab search
  if (faqSearchInput) {
    faqSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const items = document.querySelectorAll('.sp-accordion__item');

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }
}

// ==================== Refresh ====================
function initRefresh() {
  const refreshBtn = document.getElementById('refreshBtn');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.style.animation = 'spin 0.6s ease';
      showNotification('Data refreshed!');

      setTimeout(() => {
        refreshBtn.style.animation = '';
      }, 600);
    });
  }
}

// ==================== AI Chat ====================
function initAIChat() {
  const aiInput = document.getElementById('aiInput');
  const aiSendBtn = document.getElementById('aiSendBtn');
  const aiMessages = document.getElementById('aiMessages');

  // Quick action buttons
  document.querySelectorAll('.sp-ai-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.dataset.prompt;
      if (prompt) {
        sendAIMessage(prompt);
      }
    });
  });

  // Send button
  if (aiSendBtn) {
    aiSendBtn.addEventListener('click', () => {
      const query = aiInput?.value.trim();
      if (query) sendAIMessage(query);
    });
  }

  // Enter key
  if (aiInput) {
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const query = aiInput.value.trim();
        if (query) sendAIMessage(query);
      }
    });
  }

  // Feedback buttons
  document.querySelectorAll('.sp-ai-feedback__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const siblings = btn.parentElement.querySelectorAll('.sp-ai-feedback__btn');
      siblings.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');

      const isUp = btn.classList.contains('sp-ai-feedback__btn--up');
      showNotification(isUp ? 'Thanks for the feedback! This helps improve suggestions.' : 'Noted. We\'ll work on improving this analysis.');
    });
  });

  function sendAIMessage(query) {
    if (!aiMessages || !aiInput) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'sp-ai-msg sp-ai-msg--user';
    userMsg.innerHTML = `
      <div class="sp-ai-msg__content">
        <div class="sp-ai-msg__text">${escapeHtml(query)}</div>
      </div>
    `;
    aiMessages.appendChild(userMsg);
    aiInput.value = '';

    // Show typing indicator
    const typingMsg = document.createElement('div');
    typingMsg.className = 'sp-ai-msg sp-ai-msg--assistant';
    typingMsg.id = 'aiTyping';
    typingMsg.innerHTML = `
      <div class="sp-ai-msg__avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"></path>
        </svg>
      </div>
      <div class="sp-ai-msg__content">
        <div class="sp-ai-msg__name">Sprout AI</div>
        <div class="sp-ai-typing">
          <div class="sp-ai-typing__dot"></div>
          <div class="sp-ai-typing__dot"></div>
          <div class="sp-ai-typing__dot"></div>
        </div>
      </div>
    `;
    aiMessages.appendChild(typingMsg);
    scrollToBottom();

    // Simulate AI response after delay
    setTimeout(() => {
      const typing = document.getElementById('aiTyping');
      if (typing) typing.remove();

      const response = generateMockAIResponse(query);
      const assistantMsg = document.createElement('div');
      assistantMsg.className = 'sp-ai-msg sp-ai-msg--assistant';
      assistantMsg.innerHTML = `
        <div class="sp-ai-msg__avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"></path>
          </svg>
        </div>
        <div class="sp-ai-msg__content">
          <div class="sp-ai-msg__name">Sprout AI</div>
          <div class="sp-ai-msg__text">${response}</div>
          <div class="sp-ai-feedback">
            <span class="sp-ai-feedback__label">Was this helpful?</span>
            <button class="sp-ai-feedback__btn sp-ai-feedback__btn--up" title="Helpful" onclick="this.classList.toggle('active'); showNotification('Thanks for the feedback!');">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            </button>
            <button class="sp-ai-feedback__btn sp-ai-feedback__btn--down" title="Not helpful" onclick="this.classList.toggle('active'); showNotification('Noted, we\\'ll improve this.');">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
            </button>
          </div>
        </div>
      `;
      aiMessages.appendChild(assistantMsg);
      scrollToBottom();
    }, 1800);
  }

  function scrollToBottom() {
    if (aiMessages) {
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function generateMockAIResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('root cause') || q.includes('why')) {
      return `
        <div class="sp-ai-analysis">
          <div class="sp-ai-analysis__section">
            <div class="sp-ai-analysis__header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <strong>Root Cause Analysis</strong>
              <span class="sp-ai-confidence sp-ai-confidence--high">High confidence</span>
            </div>
            <p>Based on historical patterns in the EAB project, this type of issue is most commonly caused by a <strong>configuration drift during infrastructure updates</strong>. In 73% of similar cases, the root cause was traced to cached authentication tokens that reference outdated endpoints after migration.</p>
            <div class="sp-ai-evidence">
              <span class="sp-ai-evidence__label">Pattern seen in:</span>
              <span class="sp-badge sp-badge--primary">EAB-1098</span>
              <span class="sp-badge sp-badge--primary">EAB-1201</span>
              <span class="sp-badge sp-badge--primary">EAB-1334</span>
            </div>
          </div>
        </div>`;
    }

    if (q.includes('workaround') || q.includes('fix') || q.includes('solution')) {
      return `
        <div class="sp-ai-analysis">
          <div class="sp-ai-analysis__section">
            <div class="sp-ai-analysis__header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <strong>Recommended Workarounds</strong>
            </div>
            <ol class="sp-ai-workaround-list">
              <li><strong>Clear and re-provision SSO session</strong> — Invalidate existing tokens and trigger a fresh SAML handshake. This resolved 4 similar tickets. <span class="sp-ai-confidence sp-ai-confidence--high">High success rate</span></li>
              <li><strong>Verify IdP metadata URL</strong> — Ensure the federation metadata endpoint is pointing to the new IdP. Stale metadata causes intermittent auth failures. <span class="sp-ai-confidence sp-ai-confidence--medium">Medium confidence</span></li>
              <li><strong>Force attribute re-sync</strong> — Run a manual SCIM sync to ensure user profiles reflect current IdP attributes.</li>
            </ol>
          </div>
        </div>`;
    }

    if (q.includes('escalat') || q.includes('dev') || q.includes('assign')) {
      return `
        <div class="sp-ai-analysis">
          <div class="sp-ai-analysis__section">
            <div class="sp-ai-analysis__header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <strong>Escalation Assessment</strong>
            </div>
            <div class="sp-ai-escalation">
              <span class="sp-badge sp-badge--warning">Medium — Try workaround first</span>
              <p>This issue has been seen <strong>5 times</strong> in the last 30 days. In 3 of those cases, the workaround resolved it without dev intervention. I recommend trying the known fixes first. If the issue persists after attempting the top 2 workarounds, escalate to dev with the following attached: SAML trace logs, IdP configuration screenshots, and timeline of when the issue started.</p>
            </div>
          </div>
        </div>`;
    }

    // Default response
    return `
      <p>I analyzed the query and here's what I found across the EAB project:</p>
      <div class="sp-ai-analysis">
        <div class="sp-ai-analysis__section">
          <div class="sp-ai-analysis__header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <strong>Analysis Summary</strong>
          </div>
          <p>I found <strong>4 related tickets</strong> in the EAB project that match this query pattern. The most common resolution path involves verifying the service configuration and clearing cached credentials. 2 of the related tickets were resolved by the internal support team, while 2 required dev assistance for deeper investigation.</p>
          <div class="sp-ai-evidence">
            <span class="sp-ai-evidence__label">Related:</span>
            <span class="sp-badge sp-badge--primary">EAB-1456</span>
            <span class="sp-badge sp-badge--primary">EAB-1389</span>
            <span class="sp-badge sp-badge--primary">EAB-1267</span>
            <span class="sp-badge sp-badge--primary">EAB-1145</span>
          </div>
        </div>
      </div>
      <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">Try asking me for a <strong>root cause analysis</strong>, <strong>workarounds</strong>, or <strong>escalation recommendation</strong> for more specific guidance.</p>`;
  }
}

// ==================== Ticket Context ====================
function loadTicketContext() {
  // In production, this would communicate with the content script
  // For prototype, we use the mock data displayed in HTML
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'GET_TICKET_CONTEXT' }, (response) => {
        if (response?.success && response.ticketKey) {
          document.getElementById('ticketKey').textContent = response.ticketKey;
          document.getElementById('ticketSummary').textContent = response.summary;
          document.getElementById('ticketPriority').textContent = response.priority;
        }
      });
    }
  } catch (e) {
    // Running outside extension context (e.g., in browser for dev)
    console.log('Running in development mode — using mock data');
  }
}

// ==================== Notification Toast ====================
function showNotification(message) {
  // Remove existing notification
  const existing = document.querySelector('.sp-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'sp-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: toastIn 0.3s ease;
    white-space: nowrap;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to { opacity: 0; transform: translateX(-50%) translateY(10px); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
