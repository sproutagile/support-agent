import { useState, useEffect } from 'react'
import './App.css'

// Import Components
import Header from './components/Header'
import Tabs from './components/Tabs'
import Dashboard from './components/Dashboard'
import Investigate from './components/Investigate'
import AIChat from './components/AIChat'
import FAQ from './components/FAQ'
import SettingsModal from './components/SettingsModal'
import Toast from './components/Toast'

function App() {
  // --- States ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showSsoPanel, setShowSsoPanel] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [ticket, setTicket] = useState({
    key: 'EAB-1542',
    summary: 'SSO login fails intermittently after IdP migration',
    priority: 'P2'
  });
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', type: 'text', content: "Hi! I'm your AI investigation assistant. I can help you analyze EAB tickets. Try asking me about the current ticket, or paste any EAB ticket key to analyze." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiInput, setAiInput] = useState('');

  // --- Effects ---
  useEffect(() => {
    // Simulate initial ticket context detection
    setTimeout(() => {
      showNotif(`Loaded context for ${ticket.key}`);
    }, 800);
  }, []);

  // --- Handlers ---
  const showNotif = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => setNotification({ message: '', visible: false }), 2500);
  };

  const handleSendMessage = (content) => {
    if (!content.trim()) return;

    // Add user message
    const newUserMsg = { role: 'user', content };
    setAiMessages(prev => [...prev, newUserMsg]);
    setAiInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const response = generateAIResponse(content);
      setAiMessages(prev => [...prev, response]);
    }, 1500);
  };

  const generateAIResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('root cause') || q.includes('analyze')) {
      return {
        role: 'assistant',
        type: 'analysis',
        analysis: {
          sections: [
            {
              title: 'Root Cause Analysis',
              confidence: 'High confidence',
              content: 'Based on analysis of 3 related tickets, this appears to be a SAML attribute mapping mismatch introduced during the IdP migration.',
              evidence: ['EAB-1234', 'EAB-1180']
            },
            {
              title: 'Suggested Workarounds',
              items: [
                { title: 'Update SAML NameID format', desc: 'Change format to emailAddress in Azure AD.', status: 'Resolved EAB-1234' },
                { title: 'Re-sync user attributes', desc: 'Trigger a full attribute sync from the new IdP.', status: 'Resolved EAB-1180' }
              ]
            },
            {
              title: 'Escalation Recommendation',
              recommendation: {
                tag: 'Try workaround first',
                text: 'Workaround #1 has resolved 2 similar tickets. Recommend trying the fix before escalating.'
              }
            }
          ]
        }
      };
    }
    return {
      role: 'assistant',
      type: 'text',
      content: `I found 4 related tickets in the EAB project. Most common resolution is clearing cached credentials.`
    };
  };

  const handleRefresh = (e) => {
    const btn = e.currentTarget;
    btn.style.animation = 'spin 0.6s ease';
    showNotif('Data refreshed!');
    setTimeout(() => {
      btn.style.animation = '';
    }, 600);
  };

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotif('Copied to clipboard!');
    });
  };

  return (
    <div id="app">
      <Toast message={notification.message} visible={notification.visible} />

      <Header onRefresh={handleRefresh} onOpenSettings={() => setShowSettings(true)} />

      {/* Jira Context Bar */}
      <div className="sp-context-bar" id="contextBar">
        <div className="sp-context-bar__ticket">
          <span className="sp-badge sp-badge--primary" id="ticketKey">{ticket.key}</span>
          <span className="sp-context-bar__summary" id="ticketSummary">{ticket.summary}</span>
        </div>
        <span className="sp-badge sp-badge--warning" id="ticketPriority">{ticket.priority}</span>
      </div>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="sp-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'investigate' && <Investigate onCopy={handleCopy} />}
        {activeTab === 'ai' && (
          <AIChat
            messages={aiMessages}
            isTyping={isTyping}
            inputValue={aiInput}
            onInputChange={setAiInput}
            onSendMessage={handleSendMessage}
          />
        )}
        {activeTab === 'faq' && (
          <FAQ
            showSsoPanel={showSsoPanel}
            onToggleSsoPanel={() => setShowSsoPanel(!showSsoPanel)}
            openAccordion={openAccordion}
            onToggleAccordion={toggleAccordion}
          />
        )}
      </main>

      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={() => { showNotif('Settings saved!'); setShowSettings(false); }}
      />
    </div>
  )
}

export default App
