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
import Toast from './components/Toast'

function App() {
  // --- States ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSsoPanel, setShowSsoPanel] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [activeTicket, setActiveTicket] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', type: 'text', content: "Hi! I'm your AI investigation assistant. I can help you analyze EAB tickets. Try asking me about the current ticket, or paste any EAB ticket key to analyze." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiInput, setAiInput] = useState('');

  // --- Effects ---
  useEffect(() => {
    // Simulated readiness check
    setTimeout(() => {
      showNotif(`Support Agent Ready`);
    }, 800);
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      setAiMessages([
        { role: 'assistant', type: 'text', content: "Hi! I'm your AI investigation assistant. I can help you analyze EAB tickets. Try asking me about the current ticket, or paste any EAB ticket key to analyze." }
      ]);
      setAiInput('');
    }
  }, [refreshKey]);

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
    if (btn) btn.style.animation = 'spin 0.6s ease';

    setRefreshKey(prev => prev + 1);
    showNotif('Data refreshing...');

    if (btn) {
      setTimeout(() => {
        btn.style.animation = '';
      }, 600);
    }
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

      <Header onRefresh={handleRefresh} />


      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="sp-main">
        {activeTab === 'dashboard' && <Dashboard refreshKey={refreshKey} />}
        {activeTab === 'investigate' && <Investigate activeTicket={activeTicket} onCopy={handleCopy} refreshKey={refreshKey} />}
        {activeTab === 'ai' && (
          <AIChat
            messages={aiMessages}
            isTyping={isTyping}
            inputValue={aiInput}
            onInputChange={setAiInput}
            onSendMessage={handleSendMessage}
            activeTicket={activeTicket}
            refreshKey={refreshKey}
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
    </div>
  )
}

export default App
