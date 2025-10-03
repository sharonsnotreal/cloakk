import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
`;

const MainCard = styled(motion.div)`
  background: ${({ theme }) => theme.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.borderColor};
  display: flex;
  width: 100%;
  max-width: 1100px;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  position: relative;
`;

const LogoImage = styled.img`
  width: 250px;
  height: auto;
`;

const AppName = styled.h1`
  position: absolute;
  color: white;
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0;
`;

const RightPanel = styled.div`
  flex: 1;
  background: #F9FAFB; 
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Description = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.darkGrey};
  margin-bottom: 2rem;
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.black};
  color: ${({ theme }) => theme.white};
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <MainCard initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <LeftPanel>
          <LogoImage src="/cloakk.png" alt="Cloakk Logo" />
          {/* <AppName>Cloakk</AppName> */}
        </LeftPanel>
        <RightPanel>
          <Description>
            Cloakk is a secure, anonymous submission platform designed for organizations to receive sensitive tips, reports, or files from insiders — without compromising their identity.
          </Description>
          <Description>
            Whether you’re reporting misconduct, raising a concern, or just speaking up, your submission remains encrypted, protected, and untraceable.
          </Description>
          <Description>
            <strong>Your identity is not recorded, stored, or required.</strong>
          </Description>
          <ActionButton onClick={() => navigate('/submit')}>
            make a submission
          </ActionButton>
        </RightPanel>
      </MainCard>
    </PageContainer>
  );
};

export default LandingPage;