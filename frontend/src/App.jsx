import './App.css';
import LeftPanel from './components/LeftPanel';
import { useState } from 'react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <>
      {isSidebarOpen ? (
        <LeftPanel onCollapse={() => setIsSidebarOpen(false)} />
      ) : (
        <button className="sidebar-open-btn" onClick={() => setIsSidebarOpen(true)}>
          <i className="fa-solid fa-angles-right"></i>
        </button>
      )}
    </>
  );
}

export default App;
