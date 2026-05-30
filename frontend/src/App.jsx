import './App.css';
import LeftPanel from './components/LeftPanel';
import ChatPanel from './components/ChatPanel';
import { useState } from 'react';

function createDraftInstanceId() {
  return crypto.randomUUID();
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  /** null = unsaved new chat; string = conversation id from API (future) */
  const [activeConversationId, setActiveConversationId] = useState(null);
  /** Remount key for draft chats while activeConversationId stays null */
  const [draftInstanceId, setDraftInstanceId] = useState(createDraftInstanceId);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setDraftInstanceId(createDraftInstanceId());
  };

  const chatPanelKey = activeConversationId ?? draftInstanceId;

  return (
    <div className="app-layout">
      {isSidebarOpen && (
        <LeftPanel onCollapse={() => setIsSidebarOpen(false)} onNewChat={handleNewChat} />
      )}

      <ChatPanel
        key={chatPanelKey}
        conversationId={activeConversationId}
        isSidebarOpen={isSidebarOpen}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
    </div>
  );
}

export default App;
