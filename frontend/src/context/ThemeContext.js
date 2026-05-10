import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const isDarkMode = false; // Forced pure white theme

    useEffect(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.removeAttribute('data-theme');
    }, []);

    const toggleTheme = () => {
        // Disabled per user request to force white theme
    };

    const value = {
        isDarkMode,
        toggleTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
