import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons";

function Info({ info, isDark }) {
  if (!info?.length) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '256px',
        color: 'var(--text-tertiary)',
      }}>
        <p>No information available</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      {/* Path badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '32px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '12px',
          border: '1px solid var(--border-default)',
        }}>
          <FontAwesomeIcon
            icon={faFolder}
            style={{
              fontSize: '16px',
              color: 'var(--accent-accepted)',
            }}
          />
          <span style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
          }}>
            {info[1]}
          </span>
        </div>
      </div>

      {/* Report content */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-default)',
        padding: '24px',
      }}>
        <p style={{
          fontSize: '14px',
          lineHeight: 1.8,
          color: 'var(--text-secondary)',
          whiteSpace: 'pre-wrap',
          textAlign: 'left',
          margin: 0,
        }}>
          {info[0]}
        </p>
      </div>
    </div>
  );
}

export default Info;
