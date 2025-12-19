import FFT from "fft.js";

/**
 * Compute one-sided power spectrum from time series data
 *
 * @param {number[]} timeSeries - Array of time series values
 * @param {number} sampleRate - Sample rate in Hz (default: 1, meaning frequencies in cycles/TR)
 * @returns {{ frequencies: number[], power: number[] }} - Frequency bins and power values
 */
export function computePowerSpectrum(timeSeries, sampleRate = 1) {
  if (!timeSeries || timeSeries.length === 0) {
    return { frequencies: [], power: [] };
  }

  // Pad to next power of 2 for FFT efficiency
  const originalLength = timeSeries.length;
  const n = Math.pow(2, Math.ceil(Math.log2(originalLength)));
  const fft = new FFT(n);

  // Create complex input array (interleaved real/imaginary)
  const input = fft.createComplexArray();
  for (let i = 0; i < originalLength; i++) {
    input[i * 2] = timeSeries[i]; // real part
    input[i * 2 + 1] = 0; // imaginary part
  }
  // Zero-pad the rest (already initialized to 0 by createComplexArray)

  const output = fft.createComplexArray();
  fft.transform(output, input);

  // Compute one-sided power spectrum (only positive frequencies)
  const nyquist = Math.floor(n / 2) + 1;
  const frequencies = [];
  const power = [];

  for (let i = 0; i < nyquist; i++) {
    const re = output[i * 2];
    const im = output[i * 2 + 1];

    // Magnitude squared (power)
    let p = (re * re + im * im) / (n * n);

    // Double the power for all frequencies except DC and Nyquist
    // (to account for the discarded negative frequencies)
    if (i > 0 && i < nyquist - 1) {
      p *= 2;
    }

    frequencies.push((i * sampleRate) / n);
    power.push(p);
  }

  return { frequencies, power };
}

/**
 * Convert power spectrum to decibels (dB)
 *
 * @param {number[]} power - Array of power values
 * @param {number} reference - Reference value for dB calculation (default: max power)
 * @returns {number[]} - Power in decibels
 */
export function powerToDecibels(power, reference = null) {
  if (!power || power.length === 0) return [];

  const ref = reference || Math.max(...power);
  if (ref === 0) return power.map(() => 0);

  return power.map((p) => {
    if (p <= 0) return -100; // Floor for log(0)
    return 10 * Math.log10(p / ref);
  });
}
