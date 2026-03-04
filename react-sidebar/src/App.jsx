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
  const [activeTicket, setActiveTicket] = useState({
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
      showNotif(`Loaded context for ${activeTicket.key}`);
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/proxy/investigate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'chat',
          query: content,
          ticketContext: activeTicket,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}`);
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
        content: `Investigation issue: ${err.message}. Please check if n8n is responding correctly to "${content}".`
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
          <span className="sp-badge sp-badge--primary" id="ticketKey">{activeTicket.key}</span>
          <span className="sp-context-bar__summary" id="ticketSummary">{activeTicket.summary}</span>
        </div>
        <span className="sp-badge sp-badge--warning" id="ticketPriority">{formatPriority(activeTicket.priority)}</span>
      </div>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="sp-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'investigate' && <Investigate activeTicket={activeTicket} onCopy={handleCopy} />}
        {activeTab === 'ai' && (
          <AIChat
            messages={aiMessages}
            isTyping={isTyping}
            inputValue={aiInput}
            onInputChange={setAiInput}
            onSendMessage={handleSendMessage}
            activeTicket={activeTicket}
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
