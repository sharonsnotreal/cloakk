// src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { 
    FiInbox, FiTrash2, FiArchive, FiLogOut, FiEdit, FiChevronLeft, FiChevronRight, 
    FiSearch, FiDownload, FiCheckCircle, FiAlertCircle, FiEyeOff, FiUser, FiEye 
} from 'react-icons/fi';

// --- STYLED COMPONENTS 

const DashboardLayout = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.bg};
`;

// --- Sidebar ---
const Sidebar = styled.div`
  width: 250px;
  background-color: ${({ theme }) => theme.bg};
  border-right: 1px solid ${({ theme }) => theme.border};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const NavGroup = styled.div`
  margin-bottom: 2rem;
`;

const NavGroupTitle = styled.h5`
    color: ${({ theme }) => theme.textSecondary};
    font-size: 0.8rem;
    text-transform: uppercase;
    margin: 0 0 0.5rem 0.8rem;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  color: ${({ theme, active }) => active ? theme.text : theme.textSecondary};
  background-color: ${({ theme, active }) => active ? theme.cardBg : 'transparent'};
  
  &:hover {
    background-color: ${({ theme }) => theme.cardBg};
    color: ${({ theme }) => theme.text};
  }
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.border};
  padding-top: 1rem;
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
// --- Message List Panel ---
const MessageListPanel = styled.div`
  width: 350px;
  background-color: ${({ theme }) => theme.bg};
  border-right: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
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
`;

const MessageListItem = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;
  background-color: ${({ theme, active }) => active ? theme.cardBg : 'transparent'};
  
  h4, p {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  h4 { font-weight: 600; margin-bottom: 0.3rem; font-size: 0.9rem; }
  p { font-size: 0.9rem; color: ${({ theme }) => theme.textSecondary}; }
`;


const MessageDetailPanel = styled.div`
  flex: 1;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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
  h2 { margin: 0; font-size: 1.5rem; }
  p { margin: 0; color: ${({ theme }) => theme.textSecondary}; font-size: 0.9rem; }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1.5rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.textSecondary};
  
  svg { 
    cursor: pointer; 
    &:hover { color: ${({ theme }) => theme.text}; } 
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



// --- MAIN COMPONENT ---
const AdminDashboard = () => {
  // --- STATE MANAGEMENT 
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

  // --- API & DATA LOGIC
  const getToken = () => {
    const adminInfo = localStorage.getItem('adminInfo');
    return adminInfo ? JSON.parse(adminInfo).token : null;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    setActiveSubmission(null); // Reset active view on re-fetch
    const token = getToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    try {
      if (view === 'bin') {
        const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/bin`;
        const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setBinItems(data);
        if (data.length > 0) setActiveSubmission(data[0]);
      } else {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        params.append('sort', sortBy)
        const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions?${params.toString()}`;
        const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setSubmissions(data);
        if (data.length > 0) setActiveSubmission(data[0]);
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate, view, searchTerm,  sortBy]);

  useEffect(() => {
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      setAdmin(JSON.parse(adminInfo));
    } else {
      navigate('/admin/login');
    }
    fetchData();
  }, [navigate, fetchData]);

  // --- HANDLER FUNCTIONS (Unchanged Logic, added activeSubmission logic) ---
  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };
  const handleUpdate = async (id, updateData) => {
    try {
      const token = getToken();
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch data to get the latest state for the entire list
      fetchData(); 
    } catch (err) {
      alert('Failed to update submission.');
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to move this to the bin?')) {
      try {
        const token = getToken();
        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData(); // Refetch to remove from list and update view
      } catch (err) {
        alert('Failed to delete submission.');
      }
    }
  };

  // --- RENDER LOGIC (New JSX Structure) ---
  if (!admin) return null; // Or a loading spinner

  const currentList = view === 'inbox' ? submissions : binItems;

  return (
    <DashboardLayout>
      <Sidebar>
        {/* Simplified sidebar based on the design */}
        <NavGroup>
          <NavItem active={view === "inbox"} onClick={() => setView("inbox")}>
            <FiInbox /> Inbox
          </NavItem>
          {/* Add your "Reviewed", "Important" etc. filters here if needed */}
        </NavGroup>

        <NavGroup>
          <NavGroupTitle>Status</NavGroupTitle>
          <NavItem
            active={filters.viewed === "all"}
            onClick={() => setFilters({ ...filters, viewed: "all" })}
          >
            <FiCheckCircle /> All
          </NavItem>
          <NavItem
            active={filters.viewed === "false"}
            onClick={() => setFilters({ ...filters, viewed: "false" })}
          >
            <FiEyeOff /> Unviewed
          </NavItem>
        </NavGroup>

        <NavGroup>
          <NavGroupTitle>Flags</NavGroupTitle>
          <NavItem
            active={filters.flagged === "urgent"}
            onClick={() => setFilters({ ...filters, flagged: "urgent" })}
          >
            <FiAlertCircle color="#ef4444" /> Urgent
          </NavItem>
          <NavItem
            active={filters.flagged === "important"}
            onClick={() => setFilters({ ...filters, flagged: "important" })}
          >
            <FiAlertCircle color="#f59e0b" /> Important
          </NavItem>
        </NavGroup>

        <NavGroup>
          <NavItem active={view === "bin"} onClick={() => setView("bin")}>
            <FiTrash2 /> Trash
          </NavItem>
          <NavItem>
            <FiArchive /> Archive
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
          <SearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBarContainer>

        {view === "inbox" && (
          <ListHeader>
            <SortSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt_desc">Sort by Newest</option>
              <option value="createdAt_asc">Sort by Oldest</option>
            </SortSelect>
          </ListHeader>
        )}
        
        <MessageList>
          {loading && <p style={{ padding: "1rem" }}>Loading...</p>}
          {error && <p style={{ padding: "1rem", color: "red" }}>{error}</p>}
          {!loading &&
            currentList.map((sub) => (
              <MessageListItem
                key={sub._id}
                active={activeSubmission?._id === sub._id}
                onClick={() => setActiveSubmission(sub)}
              >
                <h4>#{sub.receiptCode}</h4>
                <p>{sub.textMessage}</p>
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
                  title="Flag as Important"
                  className={`important-flag ${activeSubmission.isFlagged === 'important' ? 'active' : ''}`}
                  onClick={() => handleUpdate(activeSubmission._id, { isFlagged: activeSubmission.isFlagged === 'important' ? 'none' : 'important' })}
                />
                
                {/* Flag as Urgent */}
                <FiAlertCircle 
                  title="Flag as Urgent"
                  className={`urgent-flag ${activeSubmission.isFlagged === 'urgent' ? 'active' : ''}`}
                  onClick={() => handleUpdate(activeSubmission._id, { isFlagged: activeSubmission.isFlagged === 'urgent' ? 'none' : 'urgent' })}
                />
                <FiTrash2 onClick={() => handleDelete(activeSubmission._id)} />
              </HeaderActions>
            </DetailHeader>
            <MessageBody>
              {activeSubmission.textMessage}
              {activeSubmission.file && (
                <Attachment
                  href={`${
                    process.env.REACT_APP_API_URL || "http://localhost:5000"
                  }${activeSubmission.file.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiDownload />
                  {activeSubmission.file.originalName || "Download Attachment"}
                </Attachment>
              )}
            </MessageBody>
          </>
        ) : (
          <Placeholder>
            {loading ? "Loading..." : "Select a message to read."}
          </Placeholder>
        )}
      </MessageDetailPanel>
    </DashboardLayout>
  );
};

export default AdminDashboard;




