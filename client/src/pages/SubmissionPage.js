import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  position: relative;
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

const TextArea = styled.textarea`
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 10px;
  padding: 1rem;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.buttonBg};
  }
`;

const FileInputLabel = styled.label`
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  border: 2px dashed ${({ theme }) => theme.borderColor};
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &:hover {
    border-color: ${({ theme }) => theme.buttonBg};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const SubmitButton = styled(motion.button)`
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
`;

const SubmissionPage = ({ toggleTheme, currentTheme }) => {
  const [textMessage, setTextMessage] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('Click to attach a file (optional)');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textMessage) {
      setError('A text message is required.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('textMessage', textMessage);
    if (file) {
      formData.append('file', file);
    }
    
    try {
      // Remember to set this in your environment variables for production
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/submissions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/success', { state: { receipt: response.data.receiptCode } });
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again later.');
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
      <ThemeToggle toggleTheme={toggleTheme} currentTheme={currentTheme} />
      <Title>Hello Cloakker 🐱‍💻🐱‍💻🐱</Title>
      <Form onSubmit={handleSubmit}>
        <TextArea
          placeholder="Enter your anonymous message here..."
          value={textMessage}
          onChange={(e) => setTextMessage(e.target.value)}
          required
        />
        <FileInputLabel>
          {fileName}
          <FileInput type="file" onChange={handleFileChange} />
        </FileInputLabel>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <SubmitButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Securely'}
        </SubmitButton>
      </Form>
    </Card>
  );
};

export default SubmissionPage;