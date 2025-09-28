// src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- STYLED COMPONENTS ---

const DashboardContainer = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  min-height: 80vh;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-size: 2rem;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${({ theme }) => theme.inputBg};
  padding: 0.5rem 1rem;
  border-radius: 30px;
`;

const UserIcon = styled.span`
  font-size: 1.5rem;
`;

const UserName = styled.span`
  font-weight: bold;
`;

const LogoutButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.text};
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.7;
  &:hover { opacity: 1; }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Select = styled.select`
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 8px;
  padding: 0.5rem 1rem;
`;

const SearchInput = styled.input`
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  width: 250px;
`;

const ViewBinButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
`;
const BackButton = styled(ViewBinButton)`
  background: ${({ theme }) => theme.buttonBg};
  color: ${({ theme }) => theme.buttonText};
`;

const SubmissionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SubmissionItemCard = styled(motion.div)`
  background: ${({ theme, isViewed }) => isViewed ? theme.inputBg : theme.cardBg};
  padding: 1.5rem;
  border-radius: 15px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-left: 5px solid ${({ theme, flag }) => 
    flag === 'urgent' ? '#ef4444' : 
    flag === 'important' ? '#f59e0b' : 
    theme.borderColor
  };
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
`;

const MessageContent = styled.div`
  flex: 1;
`;

const MessageText = styled.p`
  margin: 0;
  white-space: pre-wrap; /* Respects newlines in the message */
`;

const MetaData = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 1rem;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.borderColor};
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.borderColor};
  }
`;
const DeleteButton = styled(ActionButton)`
  color: #ef4444;
  &:hover {
    background: #ef4444;
    color: white;
  }
`;


// --- MAIN COMPONENT ---

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'bin'
  const [filters, setFilters] = useState({ viewed: 'all', flagged: 'all' });
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- AUTHENTICATION & DATA FETCHING ---

  const getToken = () => {
    const adminInfo = localStorage.getItem('adminInfo');
    return adminInfo ? JSON.parse(adminInfo).token : null;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = getToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    try {
      let url = '';
      if (view === 'bin') {
        url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/bin`;
        const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setBinItems(data);
      } else {
        const params = new URLSearchParams();
        if (filters.viewed !== 'all') params.append('viewed', filters.viewed);
        if (filters.flagged !== 'all') params.append('flagged', filters.flagged);
        if (searchTerm) params.append('search', searchTerm);
        params.append('sort', sortBy);
        
        url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions?${params.toString()}`;
        const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setSubmissions(data);
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate, view, filters, sortBy, searchTerm]);

  useEffect(() => {
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      setAdmin(JSON.parse(adminInfo));
    } else {
      navigate('/admin/login');
    }
    fetchData();
  }, [navigate, fetchData]);

  // --- HANDLER FUNCTIONS ---

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
      fetchData(); // Refetch to show updated state
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
        fetchData(); // Refetch to remove from list
      } catch (err) {
        alert('Failed to delete submission.');
      }
    }
  };


  // --- RENDER LOGIC ---

  if (!admin) return null;

  return (
    <DashboardContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header>
        <Title>{view === 'dashboard' ? 'Submissions Dashboard' : 'Deleted Items Bin'}</Title>
        <UserProfile>
          <UserIcon>👤</UserIcon>
          <UserName>{admin.username}</UserName>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </UserProfile>
      </Header>

      {/* --- CONTROLS --- */}
      <ControlsContainer>
        {view === 'dashboard' ? (
          <>
            <FilterGroup>
              <Select value={filters.viewed} onChange={e => setFilters({...filters, viewed: e.target.value})}>
                <option value="all">All Statuses</option>
                <option value="false">Unviewed</option>
                <option value="true">Viewed</option>
              </Select>
              <Select value={filters.flagged} onChange={e => setFilters({...filters, flagged: e.target.value})}>
                <option value="all">All Flags</option>
                <option value="urgent">Urgent</option>
                <option value="important">Important</option>
              </Select>
              <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="createdAt_desc">Sort by Newest</option>
                  <option value="createdAt_asc">Sort by Oldest</option>
              </Select>
            </FilterGroup>
            <SearchInput
              type="text"
              placeholder="Search by keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <ViewBinButton onClick={() => setView('bin')}>View Bin</ViewBinButton>
          </>
        ) : (
          <BackButton onClick={() => setView('dashboard')}>Back to Dashboard</BackButton>
        )}
      </ControlsContainer>

      {/* --- SUBMISSION LIST / BIN --- */}
      <SubmissionList>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <AnimatePresence>
          {!loading && view === 'dashboard' && submissions.map(sub => (
            <SubmissionItemCard
              key={sub._id}
              isViewed={sub.isViewed}
              flag={sub.isFlagged}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MessageContent>
                <MessageText>{sub.textMessage}</MessageText>
                <MetaData>
                  Received: {new Date(sub.createdAt).toLocaleString()}
                </MetaData>
              </MessageContent>
              <Actions>
                {sub.file && <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${sub.file.path}`} target="_blank" rel="noopener noreferrer"><ActionButton>Download Attachment</ActionButton></a>}
                <ActionButton onClick={() => handleUpdate(sub._id, { isViewed: !sub.isViewed })}>
                  {sub.isViewed ? 'Mark as Unviewed' : 'Mark as Viewed'}
                </ActionButton>
                <Select
                  value={sub.isFlagged || 'none'}
                  onChange={e => handleUpdate(sub._id, { isFlagged: e.target.value })}
                >
                  <option value="none">No Flag</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </Select>
                <DeleteButton onClick={() => handleDelete(sub._id)}>Delete</DeleteButton>
              </Actions>
            </SubmissionItemCard>
          ))}

          {!loading && view === 'bin' && binItems.map(item => (
             <SubmissionItemCard key={item._id} isViewed={true} layout>
                <MessageContent>
                    <MessageText>{item.textMessage}</MessageText>
                    <MetaData>
                        Deleted by: {item.deletedBy?.username || 'Unknown'} on {new Date(item.deletedAt).toLocaleString()}
                    </MetaData>
                </MessageContent>
            </SubmissionItemCard>
          ))}
        </AnimatePresence>
      </SubmissionList>
    </DashboardContainer>
  );
};

export default AdminDashboard;