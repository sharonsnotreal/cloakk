// src/pages/AdminLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import axios from "axios";

// Re-using and adapting styles from SubmissionPage for consistency
const Card = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px; // A bit smaller for a login form
  border: 1px solid ${({ theme }) => theme.borderColor};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 10px;
  padding: 1rem;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.buttonBg};
  }
`;

const LoginButton = styled(motion.button)`
  background: ${({ theme }) => theme.buttonBg};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  border-radius: 10px;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  text-align: center;
  margin-top: 1rem;
`;

const AdminLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await axios.post(`${apiUrl}/api/admin/login`, {
        username,
        password,
      });

      // On successful login, store user data and token
      localStorage.setItem("adminInfo", JSON.stringify(response.data));

      navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>Admin Access</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <LoginButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </LoginButton>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </Card>
  );
};

export default AdminLoginPage;
