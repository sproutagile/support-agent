import { useState, useEffect } from 'react'
import { getCredentials } from './services/jiraService';
import { mapN8nToAiMessage } from './utils/n8nMapper';
import { formatPriority } from './utils/ticketUtils';
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
    priority: 'P2 (Urgent)'
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

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    // Add user message
    const newUserMsg = { role: 'user', content };
    setAiMessages(prev => [...prev, newUserMsg]);
    setAiInput('');
    setIsTyping(true);

    try {
      const creds = await getCredentials().catch(() => ({}));

      const response = await fetch('http://localhost:5000/api/proxy/investigate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-jira-domain': creds.domain || 'mock',
          'x-jira-email': creds.email || 'mock@example.com',
          'x-jira-token': creds.token || 'mock-token'
        },
        body: JSON.stringify({
          message: content,
          ticketContext: activeTicket,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      const data = await response.json();

      // Use the mapper to adapt n8n output to the component's expected format
      const aiResponse = mapN8nToAiMessage(data);

      setAiMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('[App] AI Investigation failed:', err);
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        type: 'text',
        content: "I'm having trouble reaching the investigation service. Please check if the backend is running and n8n is configured."
      }]);
    } finally {
      setIsTyping(false);
    }
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
        <span className="sp-badge sp-badge--warning" id="ticketPriority">{formatPriority(ticket.priority)}</span>
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
