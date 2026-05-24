import './App.css';
import LeftPanel from './components/LeftPanel';
import ChatPanel from './components/ChatPanel';
import { useState } from 'react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="app-layout">
      {isSidebarOpen ? (
        <LeftPanel onCollapse={() => setIsSidebarOpen(false)} />
      ) : (
        <button className="sidebar-open-btn" onClick={() => setIsSidebarOpen(true)}>
          <i className="fa-solid fa-angles-right"></i>
        </button>
      )}

      <ChatPanel />
    </div>
  );
}

export default App;
