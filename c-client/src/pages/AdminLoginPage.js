import { useState } from 'react';
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
  padding: 1rem;

  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const LoginContainer = styled(motion.div)`
  display: flex;
  width: 100%;
  max-width: 900px;
  height: 600px;
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;

  @media (max-width: 900px) {
    flex-direction: column-reverse;
    height: auto;
    max-width: 95%;
  }
`;

const FormPanel = styled.div`
  flex: 1;
  background: #F9FAFB;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 900px) {
    padding: 2rem;
  }

  @media (max-width: 600px) {
    padding: 1.2rem;
  }

  label {
    font-size: 1rem;

    @media (max-width: 600px) {
      font-size: 0.9rem;
    }
  }
`;

const LogoPanel = styled.div`
  flex: 1.2;
  background: ${({ theme }) => theme.white};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  @media (max-width: 900px) {
    padding: 2rem 1rem;
  }
`;

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.lightGrey};
  border-radius: 8px;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 600px) {
    padding: 0.7rem 0.9rem;
    font-size: 0.95rem;
  }
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

  @media (max-width: 600px) {
    padding: 0.7rem;
    font-size: 0.95rem;
  }
`;

const RegisterText = styled.span`
font-size: 0.9rem;
font-weight: 600;
color: ${({theme}) => theme.primary||'#4f46e5'};
cursor: pointer;
transition: color 100ms ease, opacity 100ms ease;
&: hover {opacity 0.85; text-decoration: underline};
`

const LogoImage = styled.img`
  width: 200px;

  @media (max-width: 900px) {
    width: 170px;
  }

  @media (max-width: 600px) {
    width: 140px;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  text-align: center;
  font-size: 0.9rem;
  margin-top: 1rem;

  @media (max-width: 600px) {
    font-size: 0.85rem;
  }
`;


const AdminLoginPage = () => {
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
            const response = await axios.post(`${apiUrl}/api/admin/login`, { username, password });
            localStorage.setItem('adminInfo', JSON.stringify(response.data));
            
            navigate('/admin/dashboard');
        } catch (err) {
           if (status === 401) setError("Invalid username or password.");
           else if (status === 403) setError("Access denied: admin required.");
           else setError("Login failed.");

           alert(
             `Authentication Failed: ${
               err.response?.data?.message || "Wrong Credentials"
             }`
           );
           // remove only auth info
           setError(err.response?.data?.message || "Login failed.");
           localStorage.removeItem("adminInfo");
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
                    <LoginButton type="submit" disabled={loading}>Login Admin</LoginButton>
                    <RegisterText onClick={() => navigate("/admin/register")}>Register</RegisterText>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </FormPanel>
                <LogoPanel>
                    {/* <AppName></AppName> */}
                    <LogoImage src="/cloakk.png" />
                </LogoPanel>
            </LoginContainer>
        </PageContainer>
    );
};

export default AdminLoginPage;