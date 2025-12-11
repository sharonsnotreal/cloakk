import React from "react";
import styled from "styled-components";

const ToggleButton = styled.button`
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.text};
  border-radius: 30px;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.6rem;
  position: absolute;
  top: 20px;
  right: 20px;
`;

const ThemeToggle = ({ toggleTheme, currentTheme }) => {
  return (
    <ToggleButton onClick={toggleTheme}>
      {currentTheme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
    </ToggleButton>
  );
};

export default ThemeToggle;
