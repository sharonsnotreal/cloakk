import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lightTheme, darkTheme, GlobalStyles } from './theme';
import SubmissionPage from './pages/SubmissionPage';
import SuccessPage from './pages/SuccessPage';
import AdminLoginPage from "./pages/AdminLoginPage"; // Import the new login page
import AdminDashboard from "./pages/AdminDashboard";
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const localTheme = localStorage.getItem('theme');
    localTheme && setTheme(localTheme);
  }, []);


  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <GlobalStyles />
      <Router>
        <AppContainer>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <SubmissionPage
                  toggleTheme={toggleTheme}
                  currentTheme={theme}
                />
              }
            />
            <Route path="/success" element={<SuccessPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;