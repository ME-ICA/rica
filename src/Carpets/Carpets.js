import React, { useState, useCallback } from "react";

function Carpets({ images, isDark }) {
  const [carpetPlot, setCarpetPlot] = useState(images?.[0]?.img || "");

  const handleChange = useCallback((e) => {
    setCarpetPlot(e.target.value);
  }, []);

  if (!images?.length) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '256px',
        color: 'var(--text-tertiary)',
      }}>
        <p>No carpet plots available</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px',
    }}>
      <select
        onChange={handleChange}
        value={carpetPlot}
        style={{
          padding: '10px 16px',
          fontSize: '14px',
          color: 'var(--text-primary)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          cursor: 'pointer',
          outline: 'none',
          marginBottom: '20px',
        }}
      >
        {images.map((carpet) => (
          <option key={carpet.name} value={carpet.img}>
            {carpet.name}
          </option>
        ))}
      </select>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-default)',
        padding: '16px',
        maxWidth: '100%',
      }}>
        <img
          id="imgCarpetPlot"
          alt="Carpet plot"
          src={carpetPlot}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
          }}
        />
      </div>
    </div>
  );
}

export default Carpets;
