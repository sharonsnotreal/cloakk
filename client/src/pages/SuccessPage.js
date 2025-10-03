
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi'; 



const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
`;

const MainBox = styled(motion.div)`
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const IconWrapper = styled.div`
  color: #10b981; 
  font-size: 5rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 2rem;
  max-width: 400px;
`;

const ReceiptCode = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  font-family: 'Courier New', Courier, monospace;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 2.5rem;
  word-break: break-all;
`;

const SubmitButton = styled(Link)`
  background-color: ${({ theme }) => theme.buttonBg};
  color: ${({ theme }) => theme.buttonText};
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;



const SuccessPage = () => {
  const location = useLocation();
  const receipt = location.state?.receipt || 'NO-RECEIPT-FOUND';

  return (
    <PageContainer>
      <MainBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <IconWrapper>
          <FiCheckCircle />
        </IconWrapper>
        <Title>Submission Successful</Title>
        <Subtitle>
          Thank you. Please copy and save this receipt code. It is your only way to reference this submission in the future.
        </Subtitle>
        <ReceiptCode>{receipt}</ReceiptCode>
        <SubmitButton to="/submit">Make another submission</SubmitButton>
      </MainBox>
    </PageContainer>
  );
};

export default SuccessPage;