// Sprout Support Agent — Content Script
// Injects into Jira pages to extract ticket context

(function () {
  'use strict';

  // Listen for messages from the background worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTRACT_TICKET') {
      const context = extractTicketContext();
      sendResponse(context);
    }
    return true;
  });

  function extractTicketContext() {
    try {
      // Extract ticket key from URL
      const urlMatch = window.location.href.match(/\/browse\/(EAB-\d+)/);
      const ticketKey = urlMatch ? urlMatch[1] : null;

      // Extract summary
      const summaryEl =
        document.querySelector('[data-testid="issue.views.issue-base.foundation.summary.heading"]') ||
        document.querySelector('#summary-val') ||
        document.querySelector('h1');
      const summary = summaryEl ? summaryEl.textContent.trim() : '';

      // Extract description
      const descriptionEl =
        document.querySelector('[data-testid="issue.views.field.rich-text.description"]') ||
        document.querySelector('#description-val');
      const description = descriptionEl ? descriptionEl.textContent.trim() : '';

      // Extract priority
      const priorityEl =
        document.querySelector('[data-testid="issue.views.issue-base.foundation.priority.priority-field"]') ||
        document.querySelector('#priority-val');
      const priority = priorityEl ? priorityEl.textContent.trim() : '';

      // Extract status
      const statusEl =
        document.querySelector('[data-testid="issue.views.issue-base.foundation.status.status-field"]') ||
        document.querySelector('#status-val');
      const status = statusEl ? statusEl.textContent.trim() : '';

      return {
        success: true,
        ticketKey,
        summary,
        description,
        priority,
        status,
        url: window.location.href
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
})();
