import React, { useContext } from 'react';

import { wrapContext } from 'utils/hoc';
import { localStorage } from 'utils/storage';

const ThemeContext = React.createContext();

function getStoredTheme() {
  return localStorage.getItem('theme') || 'light';
}

function getSystemTheme() {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  return prefersDarkScheme.matches ? 'dark' : 'light';
}

export class ThemeProvider extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      theme: getStoredTheme(),
      systemTheme: getSystemTheme(),
    };
    this.apply();
  }

  componentDidMount() {
    this.mediaMonitor = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaMonitor.addEventListener('change', this.updateSystemTheme);
  }

  componentWillUnmount() {
    if (this.mediaMonitor) {
      this.mediaMonitor.removeEventListener('change', this.updateSystemTheme);
    }
  }

  updateSystemTheme = () => {
    this.setState(
      {
        systemTheme: getSystemTheme(),
      },
      this.apply
    );
  };

  setTheme = (theme) => {
    this.setState(
      {
        theme,
      },
      this.apply
    );
    localStorage.setItem('theme', theme);
  };

  apply = () => {
    const currentTheme = this.getCurrentTheme();
    document.body.classList.toggle('nocturnal-theme', currentTheme === 'dark');
  };

  getCurrentTheme = () => {
    const { theme } = this.state;
    return theme === 'system' ? getSystemTheme() : theme;
  };

  render() {
    return (
      <ThemeContext.Provider
        value={{
          ...this.state,
          setTheme: this.setTheme,
          currentTheme: this.getCurrentTheme(),
        }}>
        {this.props.children}
      </ThemeContext.Provider>
    );
  }
}

export function useTheme() {
  return useContext(ThemeContext);
}

export const withTheme = wrapContext(ThemeContext);
