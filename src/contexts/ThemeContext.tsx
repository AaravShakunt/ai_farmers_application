import React, { createContext, useContext, useState, useEffect } from 'react'
import { THEME_CONFIG, type Theme, type ThemeColors } from '../config'

interface ThemeContextType {
  theme: Theme
  colors: ThemeColors
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // Initialize with light theme
    console.log('🌟 ThemeProvider: Initializing with light theme')
    localStorage.setItem(THEME_CONFIG.storageKey, 'light')
    setTheme('light')
    
    // Set body styles directly
    document.body.style.backgroundColor = 'white'
    document.body.style.color = '#111827'
    
    console.log('🌟 ThemeProvider: Light theme applied')
  }, [])

  useEffect(() => {
    // Apply theme to document body
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#111827'
      document.body.style.color = '#f9fafb'
    } else {
      document.body.style.backgroundColor = 'white'
      document.body.style.color = '#111827'
    }
    // Save to localStorage
    localStorage.setItem(THEME_CONFIG.storageKey, theme)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    console.log(`🎨 Theme toggle: ${theme} → ${newTheme}`)
    setTheme(newTheme)
    
    // Apply body styles immediately
    if (newTheme === 'dark') {
      document.body.style.backgroundColor = '#111827'
      document.body.style.color = '#f9fafb'
      console.log('🌙 Dark theme applied')
    } else {
      document.body.style.backgroundColor = 'white'
      document.body.style.color = '#111827'
      console.log('☀️ Light theme applied')
    }
  }

  // Get current theme colors
  const colors = THEME_CONFIG.themes[theme].colors

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
