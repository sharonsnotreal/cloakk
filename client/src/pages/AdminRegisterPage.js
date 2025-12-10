import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
`;

const LoginContainer = styled(motion.div)`
  display: flex;
  width: 100%;
  max-width: 900px;
  height: 600px;
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

const FormPanel = styled.div`
  flex: 1;
  background: #F9FAFB;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const LogoPanel = styled.div`
  flex: 1.2;
  background: ${({ theme }) => theme.white};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.lightGrey};
  border-radius: 8px;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const LoginButton = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.black};
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
`;


// const AppName = styled.h1`
//   font-size: 5rem;
//   font-weight: 700;
//   margin: 0;
// `;

const LogoImage = styled.img`
  width: 200px;
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  text-align: center;
  font-size: 0.9rem;
`;


const AdminRegisterPage = () => {
    // Same logic as before
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${apiUrl}/api/admin/register`, { username, password });
            localStorage.setItem('adminInfo', JSON.stringify(response.data));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <LoginContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <FormPanel as="form" onSubmit={handleSubmit}>
                    <label>Username</label>
                    <Input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                    <label>Password</label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    <LoginButton type="submit" disabled={loading}>Signup Admin</LoginButton>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </FormPanel>
                <LogoPanel>
                    {/* <AppName>Cloakk</AppName> */}
                    <LogoImage src="/cloakk.png" />
                </LogoPanel>
            </LoginContainer>
        </PageContainer>
    );
};

export default AdminRegisterPage;