
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiShield, FiFileText, FiX } from 'react-icons/fi';
import { encryptBytesForRecipients, fileToUint8Array } from '../lib/e2e'; // adjust path if needed
import sodium from 'libsodium-wrappers';
import crypto from "crypto";
import { MD5 } from "crypto-js";
import Axios from "axios";
import pbkdf2 from "pbkdf2";
// (existing styled components omitted for brevity)
// ... REUSE your existing styled components from the original file ...

// For brevity I reuse the exact styled components you provided originally.
// Paste them here if you keep this whole file in your codebase.

const PageContainer = styled.div`/* ... same as before ... */`;
const MainCard = styled(motion.div)`/* ... */`;
const DisclaimerPanel = styled.div`/* ... */`;
const DisclaimerItem = styled.div`/* ... */`;
const FormPanel = styled.div`/* ... */`;
const Title = styled.h2`/* ... */`;
const DragDropArea = styled.label`/* ... */`;
const MessageInput = styled.textarea`/* ... */`;
const SubmitButton = styled.button`/* ... */`;
const ErrorMessage = styled.p`/* ... */`;

const SubmissionPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [files, setFiles] = useState([]); // array of File objects
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState([]);
  const navigate = useNavigate();
  const passphrase =  getPassphrase();
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
  const generateReceiptCode = () => {
  const code = uuidv4().split("-").join("").substring(0, 12).toUpperCase();
  return `CLOAKK-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
};

  //   const userECDH = getECDH();

  // const source = Axios.CancelToken.source();

  //  function getECDH() {
  //   const pvkStr = localStorage.getItem("pvk");

  //   const pvkParse = JSON.parse(pvkStr);

  //   const pvk = Buffer.from(pvkParse.data);

  //   const ecdh = crypto.createECDH("secp521r1");
  //   ecdh.setPrivateKey(pvk);

  //   return ecdh;
  // }
   



  // function getPassphrase() {
  //   const chatMatePbkStr = localStorage.getItem("chatmate_pbk");
  //   const chatMatePbkParsed = JSON.parse(chatMatePbkStr);
  //   const chatMatePbk = Buffer.from(chatMatePbkParsed.data);

  //   if (!userECDH) return console.log("ECDH is null");

  //   const passphrase = userECDH.computeSecret(chatMatePbk).toString("hex");
  //   return passphrase;
  // }

   function decryptMsg(msg) {
    const _message = [...message];
    const _msg = _message.find(m => m === msg);

    _msg.name = AES.decrypt(_msg.name, passphrase).toString(CryptoJS.enc.Utf8);
    _msg.timestamp = AES.decrypt(_msg.timestamp, passphrase).toString(
      CryptoJS.enc.Utf8
    );
    _msg.message = AES.decrypt(_msg.message, passphrase).toString(
      CryptoJS.enc.Utf8
    );
    _msg.decrypted = true;

    setMessage(_message);
  }
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

 function arrayBufferToWordArray(ab) {
  const u8 = new Uint8Array(ab);
  const words = [];
  for (let i = 0; i < u8.length; i += 4) {
    words.push(
      (u8[i] << 24) |
      ((u8[i + 1] || 0) << 16) |
      ((u8[i + 2] || 0) << 8) |
      (u8[i + 3] || 0)
    );
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
}

function wordArrayToBase64(wordArray) {
  return CryptoJS.enc.Base64.stringify(wordArray);
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => { fr.abort(); reject(new Error('File read error')); };
    fr.onload = () => resolve(fr.result);
    fr.readAsArrayBuffer(file);
  });
}
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!textMessage) {
    setError("A text message is required.");
    return;
  }
  setLoading(true);
  setError("");
   

  try {
    // encrypt text field
    const salt = crypto.randomBytes(16); // Buffer
    const saltHex = salt.toString('hex');;
    const ecdh = crypto.createECDH("secp521r1");
    const passphrase = pbkdf2
      .pbkdf2Sync("cloakencrypt123456789", saltHex, 25000, 64, "sha512")
      .toString("hex");

    const publicKey = JSON.stringify(ecdh.generateKeys());
    const pbkHash = CryptoJS.SHA256(publicKey).toString();
    const privateKey = ecdh.getPrivateKey();
    const privateKeyCipher = CryptoJS.AES.encrypt(
      JSON.stringify(privateKey),
      passphrase
    ).toString();
    const encText = CryptoJS.AES.encrypt(String(textMessage), publicKey).toString();

    const formData = new FormData();
    formData.append("textMessage", encText);
    formData.append("privateKeyCipher", privateKeyCipher);
    formData.append("publicKey", publicKey);
    formData.append("passphrase", passphrase);
    formData.append("pbkHash", pbkHash);
    
    // encrypt files: for each file, create a JSON metadata part and a Blob of base64 ciphertext
    await Promise.all(
      files.map(async (file, idx) => {
        const ab = await readFileAsArrayBuffer(file);
        const wa = arrayBufferToWordArray(ab);
        // AES.encrypt with WordArray returns CipherParams; use .ciphertext
        const cipherParams = CryptoJS.AES.encrypt(wa, publicKey);
        const ciphertextWA = cipherParams.ciphertext;
        const b64 = wordArrayToBase64(ciphertextWA);

        // create a binary Blob from base64 so multipart can send it as a file
        const binary = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const blob = new Blob([binary], { type: "application/octet-stream" });

        // file metadata so server knows original filename and mime
        const meta = {
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        };

        // append metadata and blob. Use distinct field names or pair with index.
        formData.append(`file_meta_${idx}`, JSON.stringify(meta));
        // name the blob to preserve original filename optionally
        formData.append("files", blob, file.name + ".enc");
      })
    );

    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    // const response = await axios.post(`${apiUrl}/api/submissions`, formData, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // });
   const response = await axios.post(`${apiUrl}/api/submissions`, formData);
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