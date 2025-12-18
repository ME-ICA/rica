import React from "react";

function MobileMain() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '360px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '32px',
        }}>
          <img
            src="/favicon.ico"
            alt="Rica"
            style={{ width: '40px', height: '40px' }}
          />
          <span style={{
            fontSize: '28px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            Rica
          </span>
        </div>

        <h1 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '16px',
        }}>
          Desktop Required
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Rica requires a larger screen to visualize ICA components effectively. Please visit on a desktop or laptop computer.
        </p>

        <a
          href="https://github.com/ME-ICA/rica"
          target="_blank"
          rel="noreferrer noopener"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#ffffff',
            backgroundColor: '#111827',
            borderRadius: '10px',
            textDecoration: 'none',
            transition: 'opacity 0.15s ease',
          }}
        >
          Learn more
        </a>
      </div>
    </div>
  );
}

export default MobileMain;
