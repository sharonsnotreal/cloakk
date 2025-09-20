import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  border: 1px solid ${({ theme }) => theme.borderColor};
`;

const Title = styled.h1`
  color: #10b981;
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const ReceiptCode = styled.div`
  background: ${({ theme }) => theme.inputBg};
  border: 2px dashed ${({ theme }) => theme.borderColor};
  color: ${({ theme }) => theme.text};
  font-family: 'Courier New', Courier, monospace;
  padding: 1.5rem;
  border-radius: 10px;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 2rem;
`;

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.buttonBg};
  text-decoration: none;
  font-weight: bold;
`;

const SuccessPage = () => {
  const location = useLocation();
  const receipt = location.state?.receipt || 'NO-RECEIPT-FOUND';

  return (
    <Card
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Title>Submission Successful</Title>
      <Subtitle>
        Thank you. Please save this receipt code for your records.
      </Subtitle>
      <ReceiptCode>{receipt}</ReceiptCode>
      <BackLink to="/">Submit another message</BackLink>
    </Card>
  );
};

export default SuccessPage;