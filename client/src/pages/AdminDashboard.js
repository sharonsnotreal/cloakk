// src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import {
  FiInbox,
  FiTrash2,
  FiArchive,
  FiLogOut,
  FiEdit,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiEyeOff,
  FiUser,
  FiEye,
} from 'react-icons/fi';

import {
  arrayBufferToWordArray,
  wordArrayToArrayBuffer,
  base64ToWordArray,
  decryptText,
  decryptBase64FileToBlob,
} from '../lib/decrypt';

import CryptoJS from 'crypto-js';

import crypto from 'crypto';

// ---------------- STYLED COMPONENTS ----------------
const DashboardLayout = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.bg};
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 900px) {
    flex-direction: column;
    height: auto;
    width: 100%;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    overflow: hidden;
  }
`;

/* Sidebar */
const Sidebar = styled.div`
  flex: 0 0 250px;
  background-color: ${({ theme }) => theme.bg};
  border-right: 1px solid ${({ theme }) => theme.border};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  @media (max-width: 900px) {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    overflow-x: auto;
    white-space: nowrap;
  }

  @media (max-width: 600px) {
    gap: 0.3rem;
    padding: 0.4rem 0.6rem;
  }
`;

const NavGroup = styled.div`
  margin-bottom: 2rem;
  display: inline-block;
`;

const NavGroupTitle = styled.h5`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.8rem;
  text-transform: uppercase;
  margin: 0 0 0.5rem 0.8rem;

  @media (max-width: 900px) {
    display: none;
  }
`;

const NavItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: ${({ theme, active }) => (active ? theme.text : theme.textSecondary)};
  background-color: ${({ theme, active }) => (active ? theme.cardBg : 'transparent')};

  &:hover {
    background-color: ${({ theme }) => theme.cardBg};
    color: ${({ theme }) => theme.text};
  }

  svg {
    flex-shrink: 0;
  }
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.border};
  padding-top: 1rem;

  @media (max-width: 900px) {
    margin-top: 0;
    border-top: none;
    padding-top: 0;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem;
  border-radius: 4px;
`;

const UserIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.2rem;
`;

const UserName = styled.span`
  font-weight: 600;
  flex: 1; /* Pushes the logout button to the far right */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 900px) {
    display: none; /* hide username on narrow screens to save space */
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${({ theme }) => theme.cardBg};
    color: ${({ theme }) => theme.text};
  }
`;

/* Message List Panel */
const MessageListPanel = styled.div`
  flex: 0 0 350px;
  background-color: ${({ theme }) => theme.bg};
  border-right: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 260px;

  @media (max-width: 900px) {
    order: 2;
    flex: 0 0 auto;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`;

const SearchBarContainer = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.cardBg};
  font-family: inherit;
  font-size: 0.9rem;
  &:focus {
    outline: 1px solid ${({ theme }) => theme.text};
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 1.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.textSecondary};
`;

const MessageList = styled.div`
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
`;

const MessageListItem = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;
  background-color: ${({ theme, active }) => (active ? theme.cardBg : 'transparent')};

  h4, p {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  h4 {
    font-weight: 600;
    margin-bottom: 0.3rem;
    font-size: 0.9rem;
  }

  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.textSecondary};
  }

  @media (max-width: 900px) {
    h4, p {
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
    }
  }
`;

/* Message Detail Panel */
const MessageDetailPanel = styled.div`
  flex: 1;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  @media (max-width: 900px) {
    order: 3;
    padding: 1rem 1rem;
  }

  @media (max-width: 600px) {
    padding: 0.8rem;
    height: auto;
  }
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 1.5rem;
`;

const HeaderInfo = styled.div`
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  p {
    margin: 0;
    color: ${({ theme }) => theme.textSecondary};
    font-size: 0.9rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.textSecondary};

  svg {
    cursor: pointer;
    &:hover {
      color: ${({ theme }) => theme.text};
    }
  }

  .urgent-flag.active {
    color: #ef4444;
  }
  .important-flag.active {
    color: #f59e0b;
  }
`;

const MessageBody = styled.div`
  font-size: 1rem;
  line-height: 1.7;
  flex: 1;
  white-space: pre-wrap;
`;

const Attachment = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.cardBg};
`;

const Placeholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.textSecondary};
`;

const ListHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const SortSelect = styled.select`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  &:focus {
    outline: none;
  }
`;

const getECDH = () => {
  try {
    return crypto.createECDH('secp521r1');
  } catch (e) {
    console.warn('crypto.createECDH not available in this environment. Make sure Node polyfills are present or adapt to WebCrypto.');
    return null;
  }
};

// ---------------- MAIN COMPONENT ----------------
const AdminDashboard = () => {
  // state
  const [admin, setAdmin] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [view, setView] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [filters, setFilters] = useState({ viewed: 'all', flagged: 'all' });

  const navigate = useNavigate();
  const userECDH = getECDH();

  // get token helper
  const getToken = () => {
    const adminInfo = localStorage.getItem('adminInfo');
    return adminInfo ? JSON.parse(adminInfo).token : null;
  };

  // fetch data: inbox or bin
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    setActiveSubmission(null);
    const token = getToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      if (view === 'bin') {
        const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/bin`;
        const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setBinItems(data || []);
        if ((data || []).length > 0) setActiveSubmission((data || [])[0]);
      } else {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        params.append('sort', sortBy);
        const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions?${params.toString()}`;
        const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setSubmissions(data || []);
        if ((data || []).length > 0) setActiveSubmission((data || [])[0]);
      }
    } catch (err) {
      console.error('fetchData error', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate, view, searchTerm, sortBy]);

  useEffect(() => {
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      setAdmin(JSON.parse(adminInfo));
    } else {
      navigate('/admin/login');
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, fetchData, view, searchTerm, sortBy]);

  // decrypt the activeSubmission and attach decrypted fields for UI
  const decryptActiveSubmission = async (submission = activeSubmission) => {
    if (!submission) return;

    // create shallow copy so we don't mutate original refs
    const sub = { ...submission };

    try {
      
      if (!sub.privateKeyCipher || !sub.passphrase) {
        // nothing to decrypt; leave as-is
        setActiveSubmission(sub);
        return;
      }

      // Decrypt privateKeyCipher using CryptoJS AES (ensure format matches server)
      const privateKeyStr = CryptoJS.AES.decrypt(sub.privateKeyCipher, sub.passphrase).toString(CryptoJS.enc.Utf8);

      let pvkParse;
      try {
        pvkParse = JSON.parse(privateKeyStr);
      } catch (e) {
        // If privateKeyStr isn't JSON, try treating it as raw base64
        pvkParse = { data: privateKeyStr };
      }

      // convert stored data into Buffer (you may need to adapt depending on your storage format)
      const pvkBuffer = Buffer.isBuffer(pvkParse.data)
        ? pvkParse.data
        : Buffer.from(pvkParse.data || '', 'base64');

      const ecdh = getECDH();
      if (!ecdh) {
        console.warn('ECDH not available — cannot compute shared secret to decrypt message.');
        setActiveSubmission(sub);
        return;
      }

      ecdh.setPrivateKey(pvkBuffer);
      const msgPbkStr = sub.publicKey;
      const msgPbkParsed = (() => {
        try {
          return JSON.parse(msgPbkStr);
        } catch (e) {
          return msgPbkStr;
        }
      })();

      const msgPbkBuffer = Buffer.isBuffer(msgPbkParsed) ? msgPbkParsed : Buffer.from(msgPbkParsed || '', 'base64');

      const passphrase = ecdh.computeSecret(msgPbkBuffer).toString('hex');

      // decrypt textMessage using your decryptText helper (which expects ciphertext + passphrase)
      try {
        sub.plainTextMessage = decryptText(sub.textMessage, passphrase);
      } catch (e) {
        console.warn('decrypt text failed', e);
        sub.plainTextMessage = null;
      }

      // decrypt files if present
      if (Array.isArray(sub.files) && sub.files.length) {
        const decryptedFiles = await Promise.all(
          sub.files.map(async (f) => {
            // Case A: server returned base64 ciphertext in f.data
            if (f.data && typeof f.data === 'string') {
              try {
                const blob = decryptBase64FileToBlob(f.data, passphrase, f.mimetype);
                const url = URL.createObjectURL(blob);
                return { ...f, blob, url, decrypted: true };
              } catch (e) {
                return { ...f, decrypted: false, error: 'decrypt_failed' };
              }
            }

            // Case B: server returned a URL to ciphertext (f.url or f.path)
            if (f.url || f.path) {
              const fileUrl = f.url || f.path;
              try {
                const res = await fetch(fileUrl);
                const arr = await res.arrayBuffer();
                const cipherWA = arrayBufferToWordArray(arr);
                const plainWA = CryptoJS.AES.decrypt({ ciphertext: cipherWA }, passphrase);
                const ab = wordArrayToArrayBuffer(plainWA);
                const blob = new Blob([ab], { type: f.mimetype || 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                return { ...f, blob, url, decrypted: true };
              } catch (e) {
                return { ...f, decrypted: false, error: 'fetch_or_decrypt_failed' };
              }
            }

            return { ...f, decrypted: false, error: 'no_cipher_provided' };
          })
        );

        sub.decryptedFiles = decryptedFiles;
      }

      // attach computed passphrase for debugging if needed (remove in prod)
      sub._debug_passphrase = passphrase;

      setActiveSubmission(sub);
    } catch (err) {
      console.error('decryptActiveSubmission error', err);
      setActiveSubmission(submission); // fall back
    }
  };

  // Re-run decryption whenever activeSubmission changes (or when it is set)
  useEffect(() => {
    if (activeSubmission) {
      decryptActiveSubmission(activeSubmission);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubmission]);

  // update (view/unview/flag) handler — re-fetch after update to ensure lists & filters are correct
  const handleUpdate = async (id, updateData) => {
    try {
      const token = getToken();
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/${id}`;
      await axios.put(url, updateData, { headers: { Authorization: `Bearer ${token}` } });

      // Optimistic local update
      setSubmissions((prev) => prev.map((s) => (s._id === id ? { ...s, ...updateData } : s)));
      setBinItems((prev) => prev.map((s) => (s._id === id ? { ...s, ...updateData } : s)));
      setActiveSubmission((prev) => (prev && prev._id === id ? { ...prev, ...updateData } : prev));

      // Re-fetch to ensure filters and server state are in sync
      await fetchData();
    } catch (err) {
      console.error('handleUpdate error', err);
      alert('Failed to update submission.');
    }
  };

  // delete (move to bin)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to move this to the bin?')) return;

    try {
      const token = getToken();
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove locally
      setSubmissions((prev) => prev.filter((s) => s._id !== id));
      setBinItems((prev) => prev.filter((s) => s._id !== id));

      // If deleted item was active, choose next sensible one
      setActiveSubmission((prev) => {
        if (!prev) return null;
        if (prev._id === id) {
          const remaining = submissions.filter((s) => s._id !== id);
          return remaining.length > 0 ? remaining[0] : null;
        }
        return prev;
      });

      // re-fetch to keep state consistent
      await fetchData();
    } catch (err) {
      console.error('handleDelete error', err);
      alert('Failed to delete submission.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  // Filtering logic applied to lists
  let currentList = view === 'inbox' ? submissions : binItems;

  if (filters.viewed === 'false') {
    currentList = currentList.filter((s) => !s.isViewed);
  }

  if (filters.flagged === 'urgent') {
    currentList = currentList.filter((s) => s.isFlagged === 'urgent');
  } else if (filters.flagged === 'important') {
    currentList = currentList.filter((s) => s.isFlagged === 'important');
  }

  // If user not authenticated yet, don't render dashboard
  if (!admin) return null;

  // Render
  return (
    <DashboardLayout>
      <Sidebar>
        <NavGroup>
          <NavItem active={view === 'inbox'} onClick={() => setView('inbox')}>
            <FiInbox /> <span style={{ marginLeft: 6 }}>Inbox</span>
          </NavItem>
        </NavGroup>

        <NavGroup>
          <NavGroupTitle>Status</NavGroupTitle>
          <NavItem active={filters.viewed === 'all'} onClick={() => setFilters({ ...filters, viewed: 'all' })}>
            <FiCheckCircle /> <span style={{ marginLeft: 6 }}>All</span>
          </NavItem>
          <NavItem active={filters.viewed === 'false'} onClick={() => setFilters({ ...filters, viewed: 'false' })}>
            <FiEyeOff /> <span style={{ marginLeft: 6 }}>Unviewed</span>
          </NavItem>
        </NavGroup>

        <NavGroup>
          <NavGroupTitle>Flags</NavGroupTitle>
          <NavItem
            active={filters.flagged === 'urgent'}
            onClick={() => setFilters({ ...filters, flagged: filters.flagged === 'urgent' ? 'all' : 'urgent' })}
          >
            <FiAlertCircle color="#ef4444" /> <span style={{ marginLeft: 6 }}>Urgent</span>
          </NavItem>
          <NavItem
            active={filters.flagged === 'important'}
            onClick={() => setFilters({ ...filters, flagged: filters.flagged === 'important' ? 'all' : 'important' })}
          >
            <FiAlertCircle color="#f59e0b" /> <span style={{ marginLeft: 6 }}>Important</span>
          </NavItem>
        </NavGroup>

        <NavGroup>
          <NavItem active={view === 'bin'} onClick={() => setView('bin')}>
            <FiTrash2 /> <span style={{ marginLeft: 6 }}>Trash</span>
          </NavItem>
          <NavItem>
            <FiArchive /> <span style={{ marginLeft: 6 }}>Archive</span>
          </NavItem>
        </NavGroup>

        <SidebarFooter>
          <UserProfile>
            <UserIcon>
              <FiUser />
            </UserIcon>
            <UserName>{admin.username}</UserName>
            <LogoutButton onClick={handleLogout} title="Logout">
              <FiLogOut />
            </LogoutButton>
          </UserProfile>
        </SidebarFooter>
      </Sidebar>

      <MessageListPanel>
        <SearchBarContainer>
          <SearchIcon />
          <SearchInput placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </SearchBarContainer>

        {view === 'inbox' && (
          <ListHeader>
            <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt_desc">Sort by Newest</option>
              <option value="createdAt_asc">Sort by Oldest</option>
            </SortSelect>
          </ListHeader>
        )}

        <MessageList>
          {loading && <p style={{ padding: '1rem' }}>Loading...</p>}
          {error && <p style={{ padding: '1rem', color: 'red' }}>{error}</p>}
          {!loading &&
            currentList.map((sub) => (
              <MessageListItem
                key={sub._id}
                active={activeSubmission?._id === sub._id}
                onClick={() => {
                  // set active and let the effect handle decryption
                  setActiveSubmission(sub);
                }}
              >
                <h4>#{sub.receiptCode}</h4>
                <p>{sub.plainTextMessage ? sub.plainTextMessage.substring(0, 120) : sub.textMessage || 'Encrypted message'}</p>
              </MessageListItem>
            ))}
        </MessageList>
      </MessageListPanel>

      <MessageDetailPanel>
        {activeSubmission ? (
          <>
            <DetailHeader>
              <HeaderInfo>
                <h2>#{activeSubmission.receiptCode}</h2>
                <p>{new Date(activeSubmission.createdAt).toLocaleString()}</p>
              </HeaderInfo>
              <HeaderActions>
                <FiChevronLeft />
                <FiChevronRight />
                <FiEdit />

                {/* View/Unview Toggle */}
                {activeSubmission.isViewed ? (
                  <FiEyeOff title="Mark as Unviewed" onClick={() => handleUpdate(activeSubmission._id, { isViewed: false })} />
                ) : (
                  <FiEye title="Mark as Viewed" onClick={() => handleUpdate(activeSubmission._id, { isViewed: true })} />
                )}

                {/* Flag as Important */}
                <FiAlertCircle
                  title="Toggle Important"
                  className={`important-flag ${activeSubmission.isFlagged === 'important' ? 'active' : ''}`}
                  onClick={() => handleUpdate(activeSubmission._1d || activeSubmission._id, { isFlagged: activeSubmission.isFlagged === 'important' ? 'none' : 'important' })}
                />

                {/* Flag as Urgent */}
                <FiAlertCircle
                  title="Toggle Urgent"
                  className={`urgent-flag ${activeSubmission.isFlagged === 'urgent' ? 'active' : ''}`}
                  onClick={() => handleUpdate(activeSubmission._id, { isFlagged: activeSubmission.isFlagged === 'urgent' ? 'none' : 'urgent' })}
                />

                <FiTrash2 onClick={() => handleDelete(activeSubmission._id)} />
              </HeaderActions>
            </DetailHeader>

            <MessageBody>
              {activeSubmission.plainTextMessage ? activeSubmission.plainTextMessage : activeSubmission.textMessage || 'Encrypted message'}

              {/* Render decrypted files if available */}
              {Array.isArray(activeSubmission.decryptedFiles) &&
                activeSubmission.decryptedFiles.map((f, idx) => {
                  const name = f.originalName || f.name || `attachment-${idx + 1}`;
                  const url = f.url || (f.blob ? URL.createObjectURL(f.blob) : null);
                  return (
                    <div key={idx}>
                      {url ? (
                        <Attachment href={url} target="_blank" rel="noopener noreferrer">
                          <FiDownload />
                          {name}
                        </Attachment>
                      ) : (
                        <div style={{ marginTop: 12, color: '#888' }}>{name} (not viewable)</div>
                      )}
                    </div>
                  );
                })}
              {/* Fallback if server gave a single file prop */}
              {activeSubmission.file && (
                <Attachment
                  href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${activeSubmission.file.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiDownload />
                  {activeSubmission.file.originalName || 'Download Attachment'}
                </Attachment>
              )}
            </MessageBody>
          </>
        ) : (
          <Placeholder>{loading ? 'Loading...' : 'Select a message to read.'}</Placeholder>
        )}
      </MessageDetailPanel>
    </DashboardLayout>
  );
};

export default AdminDashboard;
