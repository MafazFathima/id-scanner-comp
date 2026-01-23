/**
 * Theme Injector
 * Injects dynamic CSS variables based on SDK configuration
 */

import { useEffect } from 'react';
import { useTheme } from './context';

export function ThemeInjector() {
  const theme = useTheme();

  useEffect(() => {
    // Inject CSS variables
    const root = document.documentElement;

    // Colors
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (value) {
          const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          root.style.setProperty(cssVarName, value);
        }
      });
    }

    // Spacing
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--spacing-${key}`, value);
        }
      });
    }

    // Radius
    if (theme.radius) {
      Object.entries(theme.radius).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--radius-${key}`, value);
        }
      });
    }

    // Typography
    if (theme.typography) {
      if (theme.typography.fontFamily) {
        root.style.setProperty('--font-family', theme.typography.fontFamily);
      }
      if (theme.typography.fontFamilyMono) {
        root.style.setProperty('--font-family-mono', theme.typography.fontFamilyMono);
      }
    }

    // Breakpoints
    if (theme.breakpoints) {
      Object.entries(theme.breakpoints).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--breakpoint-${key}`, `${value}px`);
        }
      });
    }
  }, [theme]);

  return null;
}
