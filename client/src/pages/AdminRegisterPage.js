import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { postUser, updateUser } from '../service/userService';
import pbkdf2 from "pbkdf2";
// import crypto from "crypto";
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
      //     const auth = pbkdf2
      //   .pbkdf2Sync(password, username, 25000, 64, "sha512")
      //   .toString("hex");

      // const { data: user } = await postUser({ username, auth });

      // const { _id, auth: _auth, salt } = user;

      // const ecdh = crypto.createECDH("secp521r1");
      // const passphrase = pbkdf2
      //   .pbkdf2Sync(_auth + password, salt, 25000, 64, "sha512")
      //   .toString("hex");

      // const publicKey = JSON.stringify(ecdh.generateKeys());
      // const pbkHash = CryptoJS.SHA256(publicKey).toString();
      // const privateKey = ecdh.getPrivateKey();
      // const privateKeyCipher = CryptoJS.AES.encrypt(
      //   JSON.stringify(privateKey),
      //   passphrase
      // ).toString();
      //   const { data: _user } = await updateUser(_id, {
      //       username,
      //       privateKeyCipher,
      //       publicKey,
      //       pbkHash
      //     });

      // console.log(_user);
      // localStorage.setItem('adminInfo', JSON.stringify(_user));
      // alert("Account has been created.");
      // history.push("/login");

            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${apiUrl}/api/admin/create`, { username, password });
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