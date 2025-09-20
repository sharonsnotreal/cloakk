// src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";

const DashboardContainer = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  min-height: 80vh;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${({ theme }) => theme.inputBg};
  padding: 0.5rem 1rem;
  border-radius: 30px;
`;

const UserIcon = styled.span`
  font-size: 1.5rem;
`;

const UserName = styled.span`
  font-weight: bold;
`;

const LogoutButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.text};
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 1rem;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const adminInfo = localStorage.getItem("adminInfo");
    if (adminInfo) {
      setAdmin(JSON.parse(adminInfo));
    } else {
      // If no admin info is found, redirect to login
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  if (!admin) {
    // Render nothing or a loader while checking auth
    return null;
  }

  return (
    <DashboardContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header>
        <Title>Submissions Dashboard</Title>
        <UserProfile>
          <UserIcon>👤</UserIcon>
          <UserName>{admin.username}</UserName>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </UserProfile>
      </Header>
      {/* The rest of your dashboard content (submission list, filters, etc.) will go here */}
      <p>
        Welcome to the admin dashboard. Submission list will be displayed here.
      </p>
    </DashboardContainer>
  );
};

export default AdminDashboard;
