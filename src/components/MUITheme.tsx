import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, Paper, Chip, Divider } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import AnalyticsIcon from '@mui/icons-material/Analytics';

// Create Material UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
      marginTop: '2rem',
      marginBottom: '1rem',
      color: '#1976d2',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
      marginTop: '1.5rem',
      marginBottom: '0.75rem',
      color: '#424242',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      marginBottom: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      marginBottom: '0.75rem',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontSize: '0.75rem',
          fontWeight: 500,
        },
      },
    },
  },
});

// Material UI styled components for MDX content
export const MUIBox = ({ children, ...props }) => (
  <Box {...props}>
    {children}
  </Box>
);

export const MUITypography = ({ variant = 'body1', children, ...props }) => (
  <Typography variant={variant} {...props}>
    {children}
  </Typography>
);

export const MUIPaper = ({ children, elevation = 1, ...props }) => (
  <Paper elevation={elevation} {...props}>
    {children}
  </Paper>
);

export const MUIChip = ({ label, color = 'primary', ...props }) => (
  <Chip label={label} color={color} size="small" {...props} />
);

export const MUIDivider = ({ ...props }) => (
  <Divider sx={{ my: 2 }} {...props} />
);

// Code block wrapper with Material UI styling
export const MUICodeBlock = ({ children, language = 'json', ...props }) => (
  <MUIPaper elevation={2} sx={{ p: 2, mt: 2, mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <CodeIcon sx={{ mr: 1, fontSize: '1rem', color: 'primary.main' }} />
      <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
        {language.toUpperCase()}
      </Typography>
    </Box>
    <Box
      component="pre"
      sx={{
        backgroundColor: '#f5f5f5',
        padding: 2,
        borderRadius: 1,
        overflow: 'auto',
        fontSize: '0.875rem',
        fontFamily: '"Roboto Mono", "Monaco", "Consolas", monospace',
        lineHeight: 1.5,
        margin: 0,
        border: '1px solid #e0e0e0',
      }}
      {...props}
    >
      {children}
    </Box>
  </MUIPaper>
);

// Section wrapper with Material UI styling
export const MUISection = ({ title, children, icon, ...props }) => (
  <Box sx={{ mb: 4 }} {...props}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
      <Typography variant="h3" component="h2">
        {title}
      </Typography>
    </Box>
    <Box sx={{ pl: icon ? 3 : 0 }}>
      {children}
    </Box>
  </Box>
);

// Field display component
export const MUIField = ({ label, value, isCode = false, language = 'json', ...props }) => (
  <Box sx={{ mb: 2 }} {...props}>
    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
      {label}
    </Typography>
    {isCode ? (
      <MUICodeBlock language={language}>
        {value}
      </MUICodeBlock>
    ) : (
      <Typography variant="body1" sx={{ color: 'text.primary' }}>
        {value}
      </Typography>
    )}
  </Box>
);

// Tags display component
export const MUITags = ({ tags, ...props }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }} {...props}>
    {tags.map((tag, index) => (
      <MUIChip key={index} label={tag} color="primary" variant="outlined" />
    ))}
  </Box>
);

// Main wrapper component
export const MUIWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box sx={{ maxWidth: '100%', mx: 'auto', p: 3 }}>
      {children}
    </Box>
  </ThemeProvider>
);

export default theme;
