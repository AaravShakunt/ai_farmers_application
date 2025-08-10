// Theme Configuration
export const THEME_CONFIG = {
  // Default theme settings
  defaultTheme: 'light' as const,
  enableSystemPreference: false,
  
  // Theme definitions
  themes: {
    light: {
      name: 'Light',
      colors: {
        // Background colors
        background: {
          primary: 'bg-white',
          secondary: 'bg-gray-50',
          tertiary: 'bg-gray-100',
        },
        
        // Text colors
        text: {
          primary: 'text-gray-900',
          secondary: 'text-gray-700',
          tertiary: 'text-gray-500',
          muted: 'text-gray-400',
        },
        
        // Border colors
        border: {
          primary: 'border-gray-200',
          secondary: 'border-gray-300',
          light: 'border-gray-100',
        },
        
        // Brand colors
        brand: {
          primary: 'text-green-600',
          secondary: 'text-green-500',
          background: 'bg-green-50',
          hover: 'hover:bg-green-100',
        },
        
        // Interactive elements
        interactive: {
          hover: 'hover:bg-gray-50',
          active: 'bg-gray-100',
          focus: 'focus:ring-green-500',
        },
        
        // Status colors
        status: {
          success: 'text-green-600',
          warning: 'text-yellow-600',
          error: 'text-red-600',
          info: 'text-blue-600',
        },
        
        // Component-specific colors
        components: {
          // Cards
          card: {
            background: 'bg-white',
            border: 'border-gray-200',
            shadow: 'shadow-sm',
            hover: 'hover:shadow-md',
          },
          
          // Buttons
          button: {
            primary: 'bg-green-500 hover:bg-green-600 text-white',
            secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
            danger: 'bg-red-500 hover:bg-red-600 text-white',
            ghost: 'hover:bg-gray-100 text-gray-700',
          },
          
          // Navigation
          nav: {
            background: 'bg-white',
            border: 'border-gray-200',
            active: 'bg-green-50 text-green-600',
            inactive: 'text-gray-600 hover:text-green-600',
          },
          
          // Header
          header: {
            background: 'bg-white',
            border: 'border-gray-200',
            text: 'text-gray-800',
            icon: 'text-gray-600 hover:text-green-600',
          },
          
          // Modal
          modal: {
            background: 'bg-white',
            overlay: 'bg-black bg-opacity-50',
            border: 'border-gray-200',
            header: 'bg-gradient-to-r from-green-500 to-green-600',
          },
          
          // Input
          input: {
            background: 'bg-white',
            border: 'border-gray-300',
            focus: 'focus:border-green-500 focus:ring-green-200',
            text: 'text-gray-900',
            placeholder: 'placeholder-gray-500',
          },
          
          // Chat
          chat: {
            userMessage: 'bg-green-500 text-white',
            assistantMessage: 'bg-white text-gray-800',
            inputArea: 'bg-gradient-to-t from-white via-white to-white/95',
            inputBorder: 'border-gray-200/50',
          },
          
          // Weather Card
          weather: {
            background: 'bg-white',
            gradient: 'from-blue-50 to-cyan-50',
            text: 'text-gray-800',
            icon: 'text-blue-500',
          },
          
          // Prices Card
          prices: {
            background: 'bg-white',
            text: 'text-gray-800',
            change: {
              positive: 'text-green-600',
              negative: 'text-red-600',
            },
          },
          
          // Alert Banner
          alert: {
            background: 'bg-red-500',
            text: 'text-white',
            animation: 'animate-marquee',
          },
        },
      },
    },
    
    dark: {
      name: 'Dark',
      colors: {
        // Background colors
        background: {
          primary: 'bg-gray-900',
          secondary: 'bg-gray-800',
          tertiary: 'bg-gray-700',
        },
        
        // Text colors
        text: {
          primary: 'text-gray-100',
          secondary: 'text-gray-300',
          tertiary: 'text-gray-400',
          muted: 'text-gray-500',
        },
        
        // Border colors
        border: {
          primary: 'border-gray-700',
          secondary: 'border-gray-600',
          light: 'border-gray-800',
        },
        
        // Brand colors
        brand: {
          primary: 'text-green-400',
          secondary: 'text-green-300',
          background: 'bg-green-900/20',
          hover: 'hover:bg-green-900/30',
        },
        
        // Interactive elements
        interactive: {
          hover: 'hover:bg-gray-800',
          active: 'bg-gray-700',
          focus: 'focus:ring-green-400',
        },
        
        // Status colors
        status: {
          success: 'text-green-400',
          warning: 'text-yellow-400',
          error: 'text-red-400',
          info: 'text-blue-400',
        },
        
        // Component-specific colors
        components: {
          // Cards
          card: {
            background: 'bg-gray-800',
            border: 'border-gray-700',
            shadow: 'shadow-sm',
            hover: 'hover:shadow-md',
          },
          
          // Buttons
          button: {
            primary: 'bg-green-600 hover:bg-green-700 text-white',
            secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
            danger: 'bg-red-600 hover:bg-red-700 text-white',
            ghost: 'hover:bg-gray-800 text-gray-300',
          },
          
          // Navigation
          nav: {
            background: 'bg-gray-800',
            border: 'border-gray-700',
            active: 'bg-green-900/30 text-green-400',
            inactive: 'text-gray-400 hover:text-green-400',
          },
          
          // Header
          header: {
            background: 'bg-gray-800',
            border: 'border-gray-700',
            text: 'text-gray-100',
            icon: 'text-gray-400 hover:text-green-400',
          },
          
          // Modal
          modal: {
            background: 'bg-gray-800',
            overlay: 'bg-black bg-opacity-50',
            border: 'border-gray-700',
            header: 'bg-gradient-to-r from-green-600 to-green-700',
          },
          
          // Input
          input: {
            background: 'bg-gray-700',
            border: 'border-gray-600',
            focus: 'focus:border-green-500 focus:ring-green-800',
            text: 'text-gray-100',
            placeholder: 'placeholder-gray-400',
          },
          
          // Chat
          chat: {
            userMessage: 'bg-green-600 text-white',
            assistantMessage: 'bg-gray-800 text-gray-100',
            inputArea: 'bg-gradient-to-t from-gray-800 via-gray-800 to-gray-800/95',
            inputBorder: 'border-gray-700/50',
          },
          
          // Weather Card
          weather: {
            background: 'bg-gray-800',
            gradient: 'from-blue-900/20 to-cyan-900/20',
            text: 'text-gray-100',
            icon: 'text-blue-400',
          },
          
          // Prices Card
          prices: {
            background: 'bg-gray-800',
            text: 'text-gray-100',
            change: {
              positive: 'text-green-400',
              negative: 'text-red-400',
            },
          },
          
          // Alert Banner
          alert: {
            background: 'bg-red-600',
            text: 'text-white',
            animation: 'animate-marquee',
          },
        },
      },
    },
  },
  
  // Theme transition settings
  transition: {
    duration: '300ms',
    easing: 'ease-in-out',
  },
  
  // Storage key for theme persistence
  storageKey: 'farmers-ai-theme',
} as const

export type Theme = 'light' | 'dark'
export type ThemeColors = typeof THEME_CONFIG.themes.light.colors | typeof THEME_CONFIG.themes.dark.colors
