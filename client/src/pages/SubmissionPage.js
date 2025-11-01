import React, { useState , useRef} from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiShield, FiFileText, FiX } from 'react-icons/fi';

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
`;

const MainCard = styled(motion.div)`
  display: flex;
  width: 100%;
  max-width: 1100px;
  background: ${({ theme }) => theme.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.borderColor};
  overflow: hidden;
`;

const DisclaimerPanel = styled.div`
  flex: 1;
  background: #F9FAFB;
  padding: 2rem;
  color: ${({ theme }) => theme.darkGrey};
`;

const DisclaimerItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    margin-top: 3px;
    font-size: 1.2rem;
  }
`;

const FormPanel = styled.div`
  flex: 1.2;
  padding: 2rem;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 2rem 0;
  text-align: center;
`;

const DragDropArea = styled.label`
  border: 2px dashed ${({ theme }) => theme.lightGrey};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const MessageInput = styled.textarea`
  width: 100%;
  min-height: 150px;
  border: 1px solid ${({ theme }) => theme.lightGrey};
  border-radius: 8px;
  padding: 1rem;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  margin-bottom: 1rem;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.black};
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  text-align: center;
  font-size: 0.9rem;
`;

const SubmissionPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [files, setFiles] = useState([]); // array of File objects
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

 
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "image/jpeg",
    "image/png",
    "video/mp4",
  ];
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file
  const MAX_FILES = 5;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    e.target.value = null;
  };

  const addFiles = (selectedFiles) => {
    if (!selectedFiles.length) return;

    // Filter and validate files
    const validated = [];
    for (const f of selectedFiles) {
      if (files.length + validated.length >= MAX_FILES) {
        setError(`Maximum of ${MAX_FILES} files allowed.`);
        break;
      }
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`File type not allowed: ${f.name}`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError(
          `File too large: ${f.name} (max ${MAX_FILE_SIZE / (1024 * 1024)}MB)`
        );
        continue;
      }
      validated.push(f);
    }

    if (validated.length) {
      setFiles((prev) => [...prev, ...validated]);
      setError("");
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dtFiles = Array.from(e.dataTransfer.files || []);
    addFiles(dtFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textMessage) {
      setError("A text message is required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("textMessage", textMessage);

      // append multiple files using the same field name 'files'
      files.forEach((f) => {
        formData.append("files", f);
      });

      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await axios.post(`${apiUrl}/api/submissions`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/success", { state: { receipt: response.data.receiptCode } });
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <MainCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DisclaimerPanel>
          <DisclaimerItem>
            <FiAlertTriangle style={{ color: "#F59E0B" }} />
            <div>
              <strong>Disclaimer</strong>
              <p>
                Cloakk is a tool designed for honesty and accountability. By
                using this platform, you agree to submit truthful, accurate, and
                respectful content.
              </p>
              <p>
                Abuse of this system for malicious, harmful, or defamatory
                purposes is strictly discouraged...
              </p>
            </div>
          </DisclaimerItem>
          <DisclaimerItem>
            <FiShield style={{ color: "#10B981" }} />
            <div>
              Your submission will remain confidential, encrypted, and unlinked
              to your identity.
            </div>
          </DisclaimerItem>
          <DisclaimerItem>
            <FiFileText />
            <div>Supported file types: PDF, DOCX, JPG, PNG, MP4</div>
          </DisclaimerItem>
        </DisclaimerPanel>

        <FormPanel as="form" onSubmit={handleSubmit}>
          <Title>Submit Anonymously</Title>

          <DragDropArea
            onClick={openFileDialog}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            role="button"
            tabIndex={0}
            aria-label="Upload files"
          >
            {files.length === 0 ? (
              "drag and drop or click to upload"
            ) : (
              <div style={{ width: "100%" }}>
                <strong>
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </strong>
                <ul style={{ margin: "8px 0", paddingLeft: 16 }}>
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 260,
                        }}
                      >
                        {f.name}
                      </span>
                      <small style={{ color: "#6b7280" }}>
                        {(f.size / 1024 / 1024).toFixed(2)} MB
                      </small>
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          removeFile(i);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#ef4444",
                        }}
                        aria-label={`Remove ${f.name}`}
                      >
                        <FiX />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              hidden
              multiple
              onChange={handleFileChange}
              accept=".pdf,.docx,.jpg,.jpeg,.png,.mp4"
            />
          </DragDropArea>

          <MessageInput
            placeholder="Write message..."
            value={textMessage}
            onChange={(e) => setTextMessage(e.target.value)}
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </SubmitButton>
        </FormPanel>
      </MainCard>
    </PageContainer>
  );
};

export default SubmissionPage;