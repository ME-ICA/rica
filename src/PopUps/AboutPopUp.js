import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

function AboutPopup({ closePopup }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      }}
      onClick={closePopup}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          margin: '0 16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 20px 50px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closePopup}
          type="button"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = '#374151'; }}
          onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#9ca3af'; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M13.7 0.3c-0.4-0.4-1-0.4-1.4 0L7 5.6 1.7 0.3c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4L5.6 7l-5.3 5.3c-0.4 0.4-0.4 1 0 1.4 0.2 0.2 0.4 0.3 0.7 0.3s0.5-0.1 0.7-0.3L7 8.4l5.3 5.3c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4L8.4 7l5.3-5.3c0.4-0.4 0.4-1 0-1.4z"/>
          </svg>
        </button>

        <div style={{ padding: '32px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
            About Rica
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
            v2.0.0
          </p>

          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>
            Thank you for using Rica! Our goal is to make analyzing and revising ICA components of fMRI data as easy as possible.
          </p>

          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>
            Have questions or want to contribute? We'd love to hear from you.
          </p>

          <a
            href="https://github.com/ME-ICA/rica"
            target="_blank"
            rel="noreferrer noopener"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              height: '36px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: '#111827',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1f2937'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#111827'}
          >
            <FontAwesomeIcon icon={faGithub} />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export default AboutPopup;
