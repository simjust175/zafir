/**
 * plugins/vuetify.js
 * Enterprise-grade design system
 */

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'

const lightTheme = {
  dark: false,
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    'surface-variant': '#F1F5F9',
    'surface-bright': '#FFFFFF',
    primary: '#6366F1',
    'primary-darken-1': '#4F46E5',
    secondary: '#0EA5E9',
    'secondary-darken-1': '#0284C7',
    accent: '#8B5CF6',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
    'on-background': '#0F172A',
    'on-surface': '#1E293B',
    'on-surface-variant': '#475569',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-error': '#FFFFFF',
    'on-success': '#FFFFFF',
    'on-warning': '#FFFFFF',
    'on-info': '#FFFFFF',
    'grey-50': '#F8FAFC',
    'grey-100': '#F1F5F9',
    'grey-200': '#E2E8F0',
    'grey-300': '#CBD5E1',
    'grey-400': '#94A3B8',
    'grey-500': '#64748B',
    'grey-600': '#475569',
    'grey-700': '#334155',
    'grey-800': '#1E293B',
    'grey-900': '#0F172A',
  },
}

const darkTheme = {
  dark: true,
  colors: {
    background: '#0F172A',
    surface: '#1E293B',
    'surface-variant': '#334155',
    'surface-bright': '#475569',
    primary: '#818CF8',
    'primary-darken-1': '#6366F1',
    secondary: '#38BDF8',
    'secondary-darken-1': '#0EA5E9',
    accent: '#A78BFA',
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    info: '#60A5FA',
    'on-background': '#F8FAFC',
    'on-surface': '#E2E8F0',
    'on-surface-variant': '#94A3B8',
    'on-primary': '#0F172A',
    'on-secondary': '#0F172A',
    'on-error': '#0F172A',
    'on-success': '#0F172A',
    'on-warning': '#0F172A',
    'on-info': '#0F172A',
    'grey-50': '#F8FAFC',
    'grey-100': '#F1F5F9',
    'grey-200': '#E2E8F0',
    'grey-300': '#CBD5E1',
    'grey-400': '#94A3B8',
    'grey-500': '#64748B',
    'grey-600': '#475569',
    'grey-700': '#334155',
    'grey-800': '#1E293B',
    'grey-900': '#0F172A',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      fontWeight: 500,
      style: 'text-transform: none; letter-spacing: 0;',
    },
    VCard: {
      rounded: 'xl',
      elevation: 0,
      border: true,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VChip: {
      rounded: 'lg',
    },
    VDialog: {
      rounded: 'xl',
    },
    VNavigationDrawer: {
      rounded: 0,
    },
    VList: {
      rounded: 'lg',
    },
    VListItem: {
      rounded: 'lg',
    },
  },
})
