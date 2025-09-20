import { createGlobalStyle } from 'styled-components';

export const lightTheme = {
  body: '#F4F7FC',
  text: '#1a1a1a',
  cardBg: '#FFFFFF',
  inputBg: '#E9EEF7',
  buttonBg: '#3b82f6',
  buttonText: '#FFFFFF',
  borderColor: '#D1D9E6',
};

export const darkTheme = {
  body: '#1a202c',
  text: '#e2e8f0',
  cardBg: '#2d3748',
  inputBg: '#4a5568',
  buttonBg: '#60a5fa',
  buttonText: '#1a202c',
  borderColor: '#4a5568',
};

export const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: all 0.30s linear;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;