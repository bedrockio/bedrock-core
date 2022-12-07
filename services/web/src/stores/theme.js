import React, { useContext } from 'react';
import { wrapContext } from 'utils/hoc';
import { localStorage } from 'utils/storage';

const ThemeContext = React.createContext();

function getDefaultTheme() {
  const theme = localStorage.getItem('theme');
  if (['dark', 'light', 'system'].includes(theme)) {
    return theme;
  }
  return 'light';
}

function getSystemTheme() {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  return prefersDarkScheme.matches ? 'dark' : 'light';
}

function getRenderedTheme() {
  const theme = getDefaultTheme();
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

export class ThemeProvider extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      theme: getDefaultTheme(),
      renderedTheme: getRenderedTheme(),
    };
  }

  componentDidMount() {
    this.mediaMonitor = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaMonitor.addEventListener('change', this.updateSystemTheme);
    this.bootstrap();
  }

  componentWillUnmount() {
    if (this.mediaMonitor) {
      this.mediaMonitor.removeEventListener('change', this.updateSystemTheme);
    }
  }

  bootstrap() {
    this.setTheme(this.state.theme);
  }

  updateSystemTheme = ({ matches }) => {
    if (this.state.theme === 'system') {
      this.setTheme(matches ? 'dark' : 'light');
    }
  };

  setTheme = (theme, store) => {
    const newTheme = theme === 'system' ? getSystemTheme() : theme;
    if (newTheme == 'dark') {
      document.body.classList.add('nocturnal-theme');
    } else {
      document.body.classList.remove('nocturnal-theme');
    }
    this.setState({
      renderedTheme: newTheme,
    });
    if (store) {
      localStorage.setItem('theme', theme);
    }
  };

  render() {
    return (
      <ThemeContext.Provider
        value={{
          ...this.state,
          setTheme: this.setTheme,
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
