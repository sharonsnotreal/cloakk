
// import React, { useState, useRef } from 'react';
// import styled from 'styled-components';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import { FiAlertTriangle, FiShield, FiFileText, FiX } from 'react-icons/fi';
// import { encryptBytesForRecipients, fileToUint8Array } from '../lib/e2e'; // adjust path if needed
// import sodium from 'libsodium-wrappers';
// import crypto from "crypto";
// import { MD5 } from "crypto-js";
// import Axios from "axios";
// import pbkdf2 from "pbkdf2";
// // (existing styled components omitted for brevity)
// // ... REUSE your existing styled components from the original file ...

// // For brevity I reuse the exact styled components you provided originally.
// // Paste them here if you keep this whole file in your codebase.

// const PageContainer = styled.div`/* ... same as before ... */`;
// const MainCard = styled(motion.div)`/* ... */`;
// const DisclaimerPanel = styled.div`/* ... */`;
// const DisclaimerItem = styled.div`/* ... */`;
// const FormPanel = styled.div`/* ... */`;
// const Title = styled.h2`/* ... */`;
// const DragDropArea = styled.label`/* ... */`;
// const MessageInput = styled.textarea`/* ... */`;
// const SubmitButton = styled.button`/* ... */`;
// const ErrorMessage = styled.p`/* ... */`;

// const SubmissionPage = () => {
//   const [textMessage, setTextMessage] = useState("");
//   const [files, setFiles] = useState([]); // array of File objects
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState([]);
//   const navigate = useNavigate();
//   const passphrase =  getPassphrase();
//   const inputRef = useRef(null);

//   const ALLOWED_TYPES = [
//     "application/pdf",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
//     "image/jpeg",
//     "image/png",
//     "video/mp4",
//   ];
//   const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file
//   const MAX_FILES = 5;
//   const generateReceiptCode = () => {
//   const code = uuidv4().split("-").join("").substring(0, 12).toUpperCase();
//   return `CLOAKK-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
// };

//   //   const userECDH = getECDH();

//   // const source = Axios.CancelToken.source();

//   //  function getECDH() {
//   //   const pvkStr = localStorage.getItem("pvk");

//   //   const pvkParse = JSON.parse(pvkStr);

//   //   const pvk = Buffer.from(pvkParse.data);

//   //   const ecdh = crypto.createECDH("secp521r1");
//   //   ecdh.setPrivateKey(pvk);

//   //   return ecdh;
//   // }
   



//   // function getPassphrase() {
//   //   const chatMatePbkStr = localStorage.getItem("chatmate_pbk");
//   //   const chatMatePbkParsed = JSON.parse(chatMatePbkStr);
//   //   const chatMatePbk = Buffer.from(chatMatePbkParsed.data);

//   //   if (!userECDH) return console.log("ECDH is null");

//   //   const passphrase = userECDH.computeSecret(chatMatePbk).toString("hex");
//   //   return passphrase;
//   // }

//    function decryptMsg(msg) {
//     const _message = [...message];
//     const _msg = _message.find(m => m === msg);

//     _msg.name = AES.decrypt(_msg.name, passphrase).toString(CryptoJS.enc.Utf8);
//     _msg.timestamp = AES.decrypt(_msg.timestamp, passphrase).toString(
//       CryptoJS.enc.Utf8
//     );
//     _msg.message = AES.decrypt(_msg.message, passphrase).toString(
//       CryptoJS.enc.Utf8
//     );
//     _msg.decrypted = true;

//     setMessage(_message);
//   }
//   const handleFileChange = (e) => {
//     const selectedFiles = Array.from(e.target.files || []);
//     addFiles(selectedFiles);
//     e.target.value = null;
//   };

//   const addFiles = (selectedFiles) => {
//     if (!selectedFiles.length) return;

//     // Filter and validate files
//     const validated = [];
//     for (const f of selectedFiles) {
//       if (files.length + validated.length >= MAX_FILES) {
//         setError(`Maximum of ${MAX_FILES} files allowed.`);
//         break;
//       }
//       if (!ALLOWED_TYPES.includes(f.type)) {
//         setError(`File type not allowed: ${f.name}`);
//         continue;
//       }
//       if (f.size > MAX_FILE_SIZE) {
//         setError(
//           `File too large: ${f.name} (max ${MAX_FILE_SIZE / (1024 * 1024)}MB)`
//         );
//         continue;
//       }
//       validated.push(f);
//     }

//     if (validated.length) {
//       setFiles((prev) => [...prev, ...validated]);
//       setError("");
//     }
//   };

//   const removeFile = (index) => {
//     setFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     const dtFiles = Array.from(e.dataTransfer.files || []);
//     addFiles(dtFiles);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const openFileDialog = () => {
//     inputRef.current?.click();
//   };

//  function arrayBufferToWordArray(ab) {
//   const u8 = new Uint8Array(ab);
//   const words = [];
//   for (let i = 0; i < u8.length; i += 4) {
//     words.push(
//       (u8[i] << 24) |
//       ((u8[i + 1] || 0) << 16) |
//       ((u8[i + 2] || 0) << 8) |
//       (u8[i + 3] || 0)
//     );
//   }
//   return CryptoJS.lib.WordArray.create(words, u8.length);
// }

// function wordArrayToBase64(wordArray) {
//   return CryptoJS.enc.Base64.stringify(wordArray);
// }

// function readFileAsArrayBuffer(file) {
//   return new Promise((resolve, reject) => {
//     const fr = new FileReader();
//     fr.onerror = () => { fr.abort(); reject(new Error('File read error')); };
//     fr.onload = () => resolve(fr.result);
//     fr.readAsArrayBuffer(file);
//   });
// }
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!textMessage) {
//     setError("A text message is required.");
//     return;
//   }
//   setLoading(true);
//   setError("");
   

//   try {
//     // encrypt text field
//     const salt = crypto.randomBytes(16); // Buffer
//     const saltHex = salt.toString('hex');;
//     const ecdh = crypto.createECDH("secp521r1");
//     const passphrase = pbkdf2
//       .pbkdf2Sync("cloakencrypt123456789", saltHex, 25000, 64, "sha512")
//       .toString("hex");

//     const publicKey = JSON.stringify(ecdh.generateKeys());
//     const pbkHash = CryptoJS.SHA256(publicKey).toString();
//     const privateKey = ecdh.getPrivateKey();
//     const privateKeyCipher = CryptoJS.AES.encrypt(


import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiShield, FiFileText, FiX } from 'react-icons/fi';
import { encryptBytesForRecipients, fileToUint8Array } from "../lib/e2e"; // adjust path if needed



// import { sha256 } from "js-sha256";
// import { MD5, CryptoJs } from "crypto-js";
import CryptoJS from "crypto-js";
import {
  bufferToBase64,
  base64ToUint8Array,
  hexFromUint8,
  uint8FromHex,
  pbkdf2Hex,
  randomBytes,
  generateECDHKeyPair,
  exportPublicKeyToBase64,
  exportPrivateKeyArrayBuffer,
  importPublicKeyFromBase64,
  arrayBufferToWordArray,
  wordArrayToBase64,
  readFileAsArrayBuffer,
} from '../lib/web-crypto-utils';
import Axios from "axios";

// import pbkdf2 from "pbkdf2";
// import
const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const MainCard = styled(motion.div)`
  display: flex;
  width: 100%;
  max-width: 1100px;
  background: ${({ theme }) => theme.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.borderColor};
  overflow: hidden;

  @media (max-width: 900px) {
    flex-direction: column;
    max-width: 95%;
  }
`;

const DisclaimerPanel = styled.div`
  flex: 1;
  background: #f9fafb;
  padding: 2rem;
  color: ${({ theme }) => theme.darkGrey};

  @media (max-width: 900px) {
    padding: 1.5rem;
  }

  @media (max-width: 600px) {
    padding: 1rem;
  }
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

  @media (max-width: 600px) {
    font-size: 0.85rem;
    gap: 0.7rem;

    svg {
      font-size: 1rem;
    }
  }
`;

const FormPanel = styled.div`
  flex: 1.2;
  padding: 2rem;
  display: flex;
  flex-direction: column;

  @media (max-width: 900px) {
    padding: 1.5rem;
  }

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 2rem 0;
  text-align: center;

  @media (max-width: 600px) {
    font-size: 1.25rem;
    margin-bottom: 1.2rem;
  }
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

  @media (max-width: 600px) {
    padding: 1.5rem;
    font-size: 0.9rem;
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

  @media (max-width: 600px) {
    min-height: 120px;
    font-size: 0.9rem;
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

  @media (max-width: 600px) {
    padding: 0.7rem;
    font-size: 0.95rem;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  text-align: center;
  font-size: 0.9rem;

  @media (max-width: 600px) {
    font-size: 0.85rem;
  }
`;

const SubmissionPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [files, setFiles] = useState([]); // array of File objects
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState([]);
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
  // function wordArrayToUint8Array(words, sigBytes) {
  //   const u8 = new Uint8Array(sigBytes);
  //   let offset = 0;

  //   for (let i = 0; i < words.length; i++) {
  //     const word = words[i];

  //     u8[offset++] = (word >> 24) & 0xff;
  //     u8[offset++] = (word >> 16) & 0xff;
  //     u8[offset++] = (word >> 8) & 0xff;
  //     u8[offset++] = word & 0xff;
  //   }

  //   return u8;
  // }

  // function arrayBufferToWordArray(ab) {
  //   const u8 = new Uint8Array(ab);
  //   const words = [];
  //   for (let i = 0; i < u8.length; i += 4) {
  //     words.push(
  //       (u8[i] << 24) |
  //         ((u8[i + 1] || 0) << 16) |
  //         ((u8[i + 2] || 0) << 8) |
  //         (u8[i + 3] || 0)
  //     );
  //   }
  //   return wordArrayToUint8Array(words, u8.length);
  // }
//  function arrayBufferToWordArray(ab) {
//   const u8 = new Uint8Array(ab);
//   const words = [];
//   for (let i = 0; i < u8.length; i += 4) {
//     words.push(
//       (u8[i] << 24) |
//       ((u8[i + 1] || 0) << 16) |
//       ((u8[i + 2] || 0) << 8) |
//       (u8[i + 3] || 0)
//     );
//   }
//   return CryptoJS.lib.WordArray.create(words, u8.length);
// }
  // function wordArrayToBase64(wordArray) {
  //   return CryptoJS.enc.Base64.stringify(wordArray);
  // }

  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => {
        fr.abort();
        reject(new Error("File read error"));
      };
      fr.onload = () => resolve(fr.result);
      fr.readAsArrayBuffer(file);
    });
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textMessage) { setError('A text message is required.'); return; }
    setLoading(true); setError('');

    try {
      // 1) salt and passphrase via PBKDF2 (Web Crypto)
      const saltArr = randomBytes(16);
      const saltHex = hexFromUint8(saltArr);
      const passphrase = await pbkdf2Hex('cloakencrypt123456789', saltHex, 25000, 64, 'SHA-512');

      // 2) generate ECDH keypair (P-521)
      const kp = await generateECDHKeyPair();
      const publicKeyB64 = await exportPublicKeyToBase64(kp.publicKey);
      const privateKeyArrBuf = await exportPrivateKeyArrayBuffer(kp.privateKey); // ArrayBuffer
   
      // 3) hash publicKey for pbkHash
      const pbkHash = CryptoJS.SHA256(publicKeyB64).toString();
      
      // 4) encrypt private key (ArrayBuffer) using AES with passphrase (CryptoJS expects WordArray)
      const privateKeyWA = arrayBufferToWordArray(privateKeyArrBuf);
      
      const privateKeyCipher = CryptoJS.AES.encrypt(privateKeyWA, passphrase).toString();
        
      // 5) encrypt textMessage using publicKeyB64 as passphrase (keeps your previous pattern)
      const encText = CryptoJS.AES.encrypt(String(textMessage), publicKeyB64).toString();
    //  const encText = "123456"
      // 6) Prepare FormData
      const formData = new FormData();
      formData.append('textMessage', encText);
      formData.append('privateKeyCipher', privateKeyCipher);
      formData.append('publicKey', publicKeyB64);
      formData.append('passphrase', passphrase);
      formData.append('pbkHash', pbkHash);
      formData.append('saltHex', saltHex);
       console.log(encText, privateKeyCipher, publicKeyB64, passphrase, pbkHash, saltHex)
      // 7) Encrypt files: AES encrypt file bytes with publicKeyB64 as key (retaining your existing CryptoJS approach)
      await Promise.all(files.map(async (file, idx) => {
        const ab = await readFileAsArrayBuffer(file);
        const wa = arrayBufferToWordArray(ab);
        const cipherParams = CryptoJS.AES.encrypt(wa, publicKeyB64);
        // const cipherParams = "djfhfkdldkld"
        const ciphertextWA = cipherParams.ciphertext;
        const b64 = wordArrayToBase64(ciphertextWA);
        const binary = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const blob = new Blob([binary], { type: 'application/octet-stream' });
        const meta = { originalName: file.name, mimeType: file.type, size: file.size };
        formData.append(`file_meta_${idx}`, JSON.stringify(meta));
        formData.append('files', blob, file.name + '.enc');
      }));

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      // console.log(formData)
      // const out = [];
      // for (const [k,v] of formData.entries()) {
      //   out.push({ key: k, value: v instanceof Blob ? `${v.type} ${v.size} bytes` : v });
      // }
      // console.log(out);
      const response = await axios.post(`${apiUrl}/api/submissions`, formData);
      navigate('/success', { state: { receipt: response.data.receiptCode } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Submission failed.');
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