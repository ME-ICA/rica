import React from "react";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 0',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--border-default)',
        borderTopColor: 'var(--accent-accepted)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{
        marginTop: '16px',
        color: 'var(--text-tertiary)',
        fontSize: '14px',
      }}>
        {message}
      </p>
    </div>
  );
}

export default LoadingSpinner;
