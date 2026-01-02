# Rica

[![DOI](https://zenodo.org/badge/391155862.svg)](https://zenodo.org/badge/latestdoi/391155862)

**Rica** (Reports for ICA) is an interactive visualization tool for reviewing and classifying ICA components from [tedana](https://github.com/ME-ICA/tedana) multi-echo fMRI analysis.

**Pronunciation:** [ˈrika]. [Hear it here](https://easypronunciation.com/en/spanish/word/rica).

## Features

- **Interactive scatter plots** - Kappa vs Rho, Kappa vs Variance with zoom/pan
- **Pie chart** - Component variance distribution, click to select
- **3D brain viewer** - Interactive stat-z maps using Niivue
- **Time series & FFT** - Component time courses and power spectra
- **Component table** - Full metrics with sorting and selection
- **Classification toggle** - Accept/reject components with keyboard shortcuts
- **Light/dark theme** - Toggle with the sun/moon button
- **Export** - Save modified classifications as TSV

## How to Use

For a video tutorial, see [this walkthrough](https://www.loom.com/share/ad37cf6f3c2d41e48721f62168a8284e).

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `A` | Accept component |
| `R` | Reject component |
| `←` | Previous component |
| `→` | Next component |

## Using Rica

### Option 1: Online (Easiest)

Visit **https://rica-fmri.netlify.app** and select your tedana output folder.

### Option 2: Local Server (Recommended for Local Use)

Run Rica directly from your tedana output folder with automatic data loading:

1. Download the latest release files:
   - `index.html`
   - `rica_server.py`
   - `favicon.ico`

2. Copy these files to your tedana output folder:
   ```bash
   cp index.html rica_server.py favicon.ico /path/to/tedana/output/
   ```

3. Run the server:
   ```bash
   cd /path/to/tedana/output/
   python rica_server.py
   ```

4. Your browser opens automatically and data loads instantly!

> **Note:** The "New" button is hidden in local server mode since data is loaded automatically.

### Option 3: Development Server

For development or if you want to load different folders:

```bash
# Clone and install
git clone https://github.com/ME-ICA/rica.git
cd rica
npm install

# Start development server
npm start
```

Then open http://localhost:3000 and select your tedana output folder.

### Option 4: Build from Source

Build a single-file HTML distribution:

```bash
# Install dependencies
npm install

# Build with inlined assets
npm run build
npx gulp

# Output files in build/
# - index.html (single-file app)
# - rica_server.py (local server)
# - favicon.ico
```

## Required Files

Rica expects these files from tedana output:

| File Pattern | Description |
|--------------|-------------|
| `*_metrics.tsv` | Component metrics table |
| `*_mixing.tsv` | ICA mixing matrix (time series) |
| `*stat-z_components.nii.gz` | 4D component stat maps |
| `*_mask.nii.gz` | Brain mask |
| `figures/comp_*.png` | Component figures |
| `*.svg` | Carpet plots |
| `report.txt` | Tedana report |

## Contributing

Questions, suggestions, or contributions? Open an issue on [GitHub](https://github.com/ME-ICA/rica/issues)!
