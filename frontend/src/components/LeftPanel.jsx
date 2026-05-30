import './LeftPanel.css';

function LeftPanel({ onCollapse, onNewChat }) {
  return (
    <div className="left-panel">
      <div className="left-header">
        <div className="left-brand">
          <img src="logo.png" alt="cortex-logo" className="logo" />

          <div className="brand-text">
            <h1 className="title">Cortex</h1>
            <p className="sub-title">Your second brain.</p>
          </div>
        </div>

        <span className="left-collapse" onClick={onCollapse}>
          <i className="fa-solid fa-angles-left"></i>
        </span>
      </div>

      <button type="button" className="new-chat-btn" onClick={onNewChat}>
        <i className="fa-solid fa-pen-to-square"></i>
        <span>New Chat</span>
      </button>

      <div className="profile-footer">
        <div className="profile-left">
          <div className="profile-avatar">Y</div>

          <div className="profile-text">
            <p className="profile-name">Yamini</p>
            <p className="profile-subtitle">Your memory workspace</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftPanel;
