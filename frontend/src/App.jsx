import './App.css';
import LeftPanel from './components/LeftPanel';
import ChatPanel from './components/ChatPanel';
import { useState } from 'react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="app-layout">
      {isSidebarOpen && <LeftPanel onCollapse={() => setIsSidebarOpen(false)} />}

      <ChatPanel isSidebarOpen={isSidebarOpen} onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
}

export default App;
