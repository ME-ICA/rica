import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFileDownload } from "@fortawesome/free-solid-svg-icons";

function ResetAndSave({ handleReset, handleSave, isDark = false }) {
  const [hoveredButton, setHoveredButton] = useState(null);

  const buttonStyle = (isHovered) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    fontSize: '13px',
    color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
    backgroundColor: isHovered ? 'var(--bg-tertiary)' : 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <button
        onClick={handleReset}
        style={buttonStyle(hoveredButton === 'reset')}
        onMouseEnter={() => setHoveredButton('reset')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <FontAwesomeIcon icon={faTrash} style={{ marginRight: 8 }} />
        Reset
      </button>
      <button
        onClick={handleSave}
        style={buttonStyle(hoveredButton === 'save')}
        onMouseEnter={() => setHoveredButton('save')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <FontAwesomeIcon icon={faFileDownload} style={{ marginRight: 8 }} />
        Save
      </button>
    </div>
  );
}

export default ResetAndSave;
