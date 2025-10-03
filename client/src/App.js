import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { theme, GlobalStyles } from './theme'; 
import SubmissionPage from './pages/SubmissionPage';
import LandingPage from './pages/LandingPage';
import SuccessPage from './pages/SuccessPage';
import AdminRegisterPage from "./pages/AdminRegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
// import styled from "styled-components";

// const AppContainer = styled.div`
//   min-height: 100vh;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   padding: 2rem;
// `;

function App() {
  // const [theme, setTheme] = useState("light");

  // const toggleTheme = () => {
  //   const newTheme = theme === "light" ? "dark" : "light";
  //   setTheme(newTheme);
  //   localStorage.setItem("theme", newTheme);
  // };

  // useEffect(() => {
  //   const localTheme = localStorage.getItem("theme");
  //   localTheme && setTheme(localTheme);
  // }, []);

  return (
   <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/submit" element={<SubmissionPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/Register" element={<AdminRegisterPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;