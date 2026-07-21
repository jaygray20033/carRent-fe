// src/test/setup.js — Vitest global setup (Day 42).
// Adds jest-dom matchers (toBeInTheDocument, etc.) and cleans up the DOM
// between tests so component trees don't leak across cases.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
