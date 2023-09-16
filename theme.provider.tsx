import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { ThemeObject } from 'react-json-view';
import { useTheme } from '@ui-kit/hooks';
import type { ThemeColor } from '@ui-kit/hooks';
import localStorage from '@ui-kit/lib/local.storage';

type ThemeContextType = {
  theme: ThemeColor;
  styles: ThemeObject | undefined;
  setDarkMode: (theme: ThemeColor) => void;
};

const createElem = (id, className) => {
  const span = document.createElement('span');
  span.id = id;
  span.classList.add(className);
  document.body.append(span);
};

const removeElem = (id) => {
  document.body.removeChild(document.getElementById(id) as HTMLElement);
};

const getColor = (id) => {
  return window.getComputedStyle(document.getElementById(id) as HTMLElement).color;
};

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider = (props: PropsWithChildren<{ theme?: ThemeColor }>) => {
  const { theme: controlledTheme, children } = props;
  const [mode, setDarkMode] = useTheme(controlledTheme);
  const [styles, setStyles] = useState<ThemeObject | undefined>(undefined);

  const applyDarkMode = (nextTheme) => {
    const root = window.document.documentElement;
    const isDark = mode === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(nextTheme);

    localStorage.setItem('color-scheme', nextTheme);
  };

  const setStylesReactJson = () => {
    createElem('spanGray50', 'text-gray-50');
    createElem('spanZinc700', 'text-zinc-700');
    createElem('spanBlue500', 'text-blue-500');
    createElem('spanGray700', 'text-gray-700');

    const spanGray50 = getColor('spanGray50');
    const spanZinc700 = getColor('spanZinc700');
    const spanBlue500 = getColor('spanBlue500');
    const spanGray700 = getColor('spanGray700');

    if (mode === 'light') {
      setStyles({
        base00: spanGray50,
        base01: spanGray50,
        base02: spanGray50,
        base03: spanZinc700,
        base04: spanGray50,
        base05: spanZinc700,
        base06: spanZinc700,
        base07: spanZinc700,
        base08: spanZinc700,
        base09: spanBlue500,
        base0A: spanBlue500,
        base0B: spanBlue500,
        base0C: spanBlue500,
        base0D: spanBlue500,
        base0E: spanBlue500,
        base0F: spanBlue500,
      });
    } else {
      setStyles({
        base00: spanGray700,
        base01: spanGray50,
        base02: spanGray50,
        base03: spanGray50,
        base04: spanGray700,
        base05: spanGray50,
        base06: spanGray50,
        base07: spanGray50,
        base08: spanGray50,
        base09: spanBlue500,
        base0A: spanBlue500,
        base0B: spanBlue500,
        base0C: spanBlue500,
        base0D: spanBlue500,
        base0E: spanBlue500,
        base0F: spanBlue500,
      });
    }

    removeElem('spanGray50');
    removeElem('spanBlue500');
    removeElem('spanGray700');
    removeElem('spanZinc700');
  };

  useEffect(() => {
    applyDarkMode(mode);
    setStylesReactJson();
  }, [mode]);

  const values = useMemo(() => {
    return {
      theme: mode,
      styles,
      setDarkMode,
    };
  }, [mode, styles]);

  return <ThemeContext.Provider value={values}>{children}</ThemeContext.Provider>;
};
ThemeProvider.displayName = 'ThemeProvider';
