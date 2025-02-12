import { useState, useEffect } from 'react';

function Settings({ isOpen, onClose, darkMode, setDarkMode }) {
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return isOpen ? (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-panel settings-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button 
                        className="close-button"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div className="settings-content">
                    <div className="setting-item">
                        <label className="setting-label">
                            Dark Mode
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={darkMode}
                                    onChange={() => setDarkMode(!darkMode)}
                                />
                                <span className="toggle-slider"></span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
}

export default Settings; 