import { createGlobalStyle } from 'styled-components';

export const theme = {
  // Colors
  background: '#F0F2F5', // Light grey background
  white: '#FFFFFF',
  darkGrey: '#737373',
  lightGrey: '#E5E7EB',
  black: '#000000',
  primary: '#333333',
  
  // Fonts
  fontFamily: "'Inter', sans-serif",

  // Borders
  borderRadius: '12px',
  borderColor: '#E5E7EB',
};

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  body {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.primary};
    font-family: ${({ theme }) => theme.fontFamily};
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *, *::before, *::after {
    box-sizing: inherit;
  }
`;