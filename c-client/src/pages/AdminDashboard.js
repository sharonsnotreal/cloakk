// // src/pages/AdminDashboard.js
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import * as openpgp from "openpgp";

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
  FiMenu,
  FiX,
} from "react-icons/fi";

/* ---------------- STYLES (responsive + mobile slide-out) ---------------- */
const DashboardLayout = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.bg || "#f6f7fb"};
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
`;

/* Sidebar (desktop & mobile slide-out) */
const Sidebar = styled.aside`
  width: 250px;
  background: ${({ theme }) => theme.sidebarBg || "#fff"};
  border-right: 1px solid ${({ theme }) => theme.border || "#e6e9ef"};
  padding: 1.25rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transform: translateX(${(p) => (p.open ? "0" : "-100%")});
  transition: transform 220ms ease;
  z-index: 60;

  @media (min-width: 900px) {
    transform: translateX(0);
    position: relative;
  }

  @media (max-width: 900px) {
    position: absolute;
    height: 100%;
    left: 0;
    top: 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const SidebarClose = styled.button`
  background: transparent;
  border: none;
  font-size: 1.25rem;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
`;

const NavGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const NavGroupTitle = styled.h5`
  color: ${({ theme }) => theme.textSecondary || "#6b7280"};
  font-size: 0.75rem;
  text-transform: uppercase;
  margin: 0 0 0.5rem;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  background: ${(p) =>
    p.active ? p.theme.cardBg || "#eef2ff" : "transparent"};
  color: ${(p) =>
    p.active ? p.theme.text || "#111827" : p.theme.textSecondary || "#6b7280"};
  width: 100%;
  border: none;
  text-align: left;
  font-weight: 600;
`;

/* Topbar for mobile  */
const Topbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  border-bottom: 1px solid ${({ theme }) => theme.border || "#e6e9ef"};
  background: ${({ theme }) => theme.topbarBg || "#fff"};
  width: 9%;
  box-sizing: border-box;

  @media (min-width: 900px) {
    display: none;
  }
`;
//  padding: 0.5rem 1rem;
const TopbarTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
`;

/* Main content area */
const Main = styled.main`
  flex: 1;
  display: flex;
  min-width: 0; /* important for children overflow */
  flex-direction: row;

  @media (max-width: 900px) {
    flex-direction: column;
    overflow: auto;
  }
`;

/* List panel */
const MessageListPanel = styled.section`
  width: 360px;
  min-width: 260px;
  border-right: 1px solid ${({ theme }) => theme.border || "#e6e9ef"};
  background: ${({ theme }) => theme.bg || "#f8fafc"};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  @media (max-width: 900px) {
    width: 100%;
    min-width: 0;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.border || "#e6e9ef"};
  }
`;

const SearchBarContainer = styled.div`
  padding: 0.9rem;
  position: relative;
  border-bottom: 1px solid ${({ theme }) => theme.border || "#e6e9ef"};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 0.6rem 0.6rem 2.4rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border || "#e6e9ef"};
  background: ${({ theme }) => theme.cardBg || "#fff"};
  font-size: 0.95rem;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.textSecondary || "#9aa4b2"};
`;

/* list area */
const MessageList = styled.div`
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
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
const MessageListItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border || "#e6e9ef"};
  cursor: pointer;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: ${(p) =>
    p.active ? p.theme.cardBg || "#eef2ff" : "transparent"};

  &:hover {
    background: ${(p) => p.theme.cardBg || "#f3f6ff"};
  }

  .meta {
    flex: 1;
    min-width: 0;
  }

  .title {
    font-weight: 700;
    margin-bottom: 6px;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .excerpt {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.textSecondary || "#6b7280"};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #ef4444;
    margin-top: 6px;
    display: inline-block;
  }
`;

/* detail panel */
const MessageDetailPanel = styled.section`
  flex: 1;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border || "#e6e9ef"};
  padding-bottom: 1rem;
  margin-bottom: 1rem;
`;

const HeaderInfo = styled.div`
  h2 {
    margin: 0;
    font-size: 1.15rem;
  }
  p {
    margin: 0;
    color: ${({ theme }) => theme.textSecondary || "#6b7280"};
    font-size: 0.85rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  svg {
    cursor: pointer;
  }
`;

const MessageBody = styled.div`
  flex: 1;
  padding-top: 0.75rem;
  overflow-y: auto;
  white-space: pre-wrap;
  line-height: 1.6;
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

/* footer pagination area */
const FooterBar = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.border || "#e6e9ef"};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

/* simple pagination buttons */
const PageBtn = styled.button`
  border: none;
  background: ${(p) =>
    p.primary ? p.theme.primary || "#111827" : "transparent"};
  color: ${(p) => (p.primary ? "#fff" : p.theme.text || "#111827")};
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
`;

/* overlay to close mobile sidebar */
const Overlay = styled.div`
  display: ${(p) => (p.show ? "block" : "none")};
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.25);
  @media (min-width: 900px) {
    display: none;
  }
`;

/* ---------- COMPONENT ---------- */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // auth/admin
  const [admin, setAdmin] = useState(null);

  // data lists
  const [submissions, setSubmissions] = useState([]);
  const [binItems, setBinItems] = useState([]);

  // active item
  const [activeSubmission, setActiveSubmission] = useState(null);

  // UI state
  const [view, setView] = useState("inbox"); // inbox | bin
  const [filters, setFilters] = useState({ viewed: "all", flagged: "all" });

  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // sidebar mobile open
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // pagination (server-side preferred)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // serach term
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const mountedRef = useRef(false);

  // helper: token retrieval
  const getToken = () => {
    const adminInfo = localStorage.getItem("adminInfo");
    return adminInfo ? JSON.parse(adminInfo).token : null;
  };

  // helper to build params object for server-side pagination / filtering
  const buildParams = () => {
    const params = {
      page,
      limit,
      sort: sortBy,
    };
    if (searchTerm) params.search = searchTerm;
    if (filters.viewed && filters.viewed !== "all")
      params.viewed = filters.viewed; // 'false' or 'true'
    if (filters.flagged && filters.flagged !== "all")
      params.flagged = filters.flagged; // 'urgent' or 'important'
    return params;
  };

  // fetchData with server-side pagination; fallback to simple array usage
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    const token = getToken();
    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const params = buildParams();
      const query = new URLSearchParams(params).toString();

      // 🔐 helper: decrypt a list once
      const decryptList = async (items, viewName) => {
        return Promise.all(
          items.map(async (item) => {
            try {
              const decrypted = await decryptActiveSubmission(item);
              return { ...decrypted, view: viewName };
            } catch {
              return { ...item, view: viewName };
            }
          })
        );
      };

      if (view === "bin") {
        const res = await axios.get(`${base}/api/submissions/bin?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawItems = Array.isArray(res.data)
          ? res.data
          : res.data.items || [];

        const decryptedItems = await decryptList(rawItems, "bin");

        setBinItems(decryptedItems);
        setTotalCount(res.data.total || decryptedItems.length);
        setTotalPages(
          Math.max(
            1,
            Math.ceil((res.data.total || decryptedItems.length) / limit)
          )
        );

        if (decryptedItems.length > 0) {
          if (!activeSubmission || activeSubmission.view !== "bin") {
            setActiveSubmission(decryptedItems[0]);
          }
        } else {
          setActiveSubmission(null);
        }
      } else {
        const res = await axios.get(`${base}/api/submissions?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawItems = Array.isArray(res.data)
          ? res.data
          : res.data.items || [];

        const decryptedItems = await decryptList(rawItems, "inbox");

        setSubmissions(decryptedItems);
        setTotalCount(res.data.total || decryptedItems.length);
        setTotalPages(
          Math.max(
            1,
            Math.ceil((res.data.total || decryptedItems.length) / limit)
          )
        );

        if (decryptedItems.length > 0) {
          if (!activeSubmission || activeSubmission.view !== "inbox") {
            setActiveSubmission(decryptedItems[0]);
          }
        } else {
          setActiveSubmission(null);
        }
      }
    } catch (err) {
      console.error("fetchData error", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    navigate,
    view,
    page,
    limit,
    sortBy,
    // searchTerm,
    filters.flagged,
    filters.viewed,
  ]);

  useEffect(() => {
    const adminInfo = localStorage.getItem("adminInfo");
    if (adminInfo) setAdmin(JSON.parse(adminInfo));
    else navigate("/admin/login");
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchData,
    view,
    page,
    limit,
    sortBy,
    searchTerm,
    filters.flagged,
    filters.viewed,
  ]);

  const visibleItems = useMemo(() => {
    const source = view === "bin" ? binItems : submissions;
    if (!debouncedSearchTerm) return source;

    const words = debouncedSearchTerm
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return source.filter((s) => {
      const stack = [s.plainTextMessage, s.receiptCode, s.senderEmail]
        .join(" ")
        .toLowerCase();

      return words.every((w) => stack.includes(w));
    });
  }, [view, binItems, submissions, debouncedSearchTerm]);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(id);
  }, [searchTerm]);

  const highlightText = (text, term) => {
    if (!term) return text;

    const words = term.split(/\s+/).filter(Boolean);
    const regex = new RegExp(`(${words.join("|")})`, "gi");

    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} style={{ backgroundColor: "#fde68a" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // ----------  decryption function ----------
  const decryptActiveSubmission = async (submission) => {
    if (!submission) return null;

    const sub = { ...submission };
    try {
      // if no privateKey stored on server for this admin (or missing) -> can't decrypt
      if (!sub.privateKey) {
        sub.plainTextMessage = null;
        return sub;
      }

      const armoredMessage = sub.textMessage;
      if (!armoredMessage) {
        sub.plainTextMessage = null;
        return sub;
      }

      // read keys
      const privKeyObj = await openpgp.readPrivateKey({
        armoredKey: sub.privateKey,
      });
      const pubKeyObj = sub.publicKey
        ? await openpgp.readKey({ armoredKey: sub.publicKey })
        : null;

      // TODO: replace with secure retrieval of passphrase
      const PASS = "super long and hard to guess secret"; // <-- REPLACE in prod

      const unlockedPriv = await openpgp.decryptKey({
        privateKey: privKeyObj,
        passphrase: PASS,
      });

      const message = await openpgp.readMessage({ armoredMessage });
      const { data: decrypted } = await openpgp.decrypt({
        message,
        verificationKeys: pubKeyObj || undefined,
        decryptionKeys: unlockedPriv,
      });

      sub.plainTextMessage = decrypted;
      return sub;
    } catch (e) {
      console.warn("decrypt text failed", e);
      sub.plainTextMessage = null;
      return sub;
    }
  };

  // helper that decrypts then sets activeSubmission (used on click)
  const handleOpenSubmission = async (sub) => {
    // optimistic UI: mark it as loading in detail pane
    setActiveSubmission({ ...sub, _loading: true });
    try {
      const decrypted = await decryptActiveSubmission(sub);
      decrypted.view = view;

      // update active submission
      setActiveSubmission(decrypted);

      // update the list so encrypted version is replaced
      if (view === "inbox") {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === decrypted._id ? decrypted : s))
        );
      } else {
        setBinItems((prev) =>
          prev.map((s) => (s._id === decrypted._id ? decrypted : s))
        );
      }
    } catch (err) {
      console.error("open submission error", err);
      setActiveSubmission(sub);
    } finally {
      // ensure loading false
      setActiveSubmission((prev) =>
        prev ? { ...prev, _loading: false } : prev
      );
    }
  };

  // update handler - toggles flags & view state
  const handleUpdate = async (id, updateData) => {
    try {
      const token = getToken();
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      await axios.put(`${base}/api/submissions/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // optimistic local update: submissions & binItems & activeSubmission
      setSubmissions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, ...updateData } : s))
      );
      setBinItems((prev) =>
        prev.map((s) => (s._id === id ? { ...s, ...updateData } : s))
      );
      setActiveSubmission((prev) =>
        prev && prev._id === id ? { ...prev, ...updateData } : prev
      );

      // refresh list so server filters/pagination are kept in sync
      // await fetchData();
    } catch (err) {
      console.error("handleUpdate error", err);
      throw err;
    }
  };

  // delete -> move to bin (if not in bin). If already in bin and clicking "Restore", restore it.
  const handleDeleteOrRestore = async (id) => {
    try {
      const token = getToken();
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      if (view === "bin") {
        // Restore action - call restore endpoint or update deleted:false
        try {
          const res = await axios.patch(
            `${base}/api/submissions/${id}/restore`,
            null,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const restored = res.data.submission;

          //  REMOVE from bin
          setBinItems((prev) => prev.filter((i) => i._id !== restored._id));

          //  ADD back to inbox
          setSubmissions((prev) => [restored, ...prev]);
          setActiveSubmission(null);
          // setActiveSubmission(restored);
        } catch (e) {
          // fallback
          await axios.put(
            `${base}/api/submissions/${id}`,
            { deleted: false },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else {
        // move to bin
        await axios.delete(`${base}/api/submissions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // refresh data & active selection
      await fetchData();
    } catch (err) {
      console.error("delete/restore error", err);
      alert("Failed to complete action.");
    }
  };

  // logout
  const handleLogout = () => {
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  // pagination controls
  const gotoNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };
  const gotoPrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const renderSnippet = (s) => {
    const text = s.plainTextMessage?.slice(0, 140) || "Encrypted message";

    return highlightText(text, debouncedSearchTerm);
  };

  useEffect(() => {
    if (!activeSubmission) return;

    const exists = visibleItems.some((i) => i._id === activeSubmission._id);

    if (!exists && visibleItems.length > 0) {
      setActiveSubmission(visibleItems[0]);
    }
  }, [visibleItems, activeSubmission]);

  /* ---------- UI RENDER ---------- */
  return (
    <DashboardLayout>
      <Overlay show={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      {/* Mobile topbar */}
      <Topbar>
        <button
          aria-label="menu"
          onClick={() => setSidebarOpen(true)}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 20,
            marginTop: -700,
          }}
        >
          <FiMenu />
        </button>
        {/* <TopbarTitle>Admin Dashboard</TopbarTitle> */}
      </Topbar>

      {/* Sidebar (desktop + mobile slide-out) */}
      <Sidebar open={sidebarOpen}>
        <SidebarHeader>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong>Admin</strong>
            <small style={{ color: "#6b7280" }}>{admin?.username}</small>
          </div>
          <SidebarClose
            onClick={() => setSidebarOpen(false)}
            aria-label="close"
          >
            <FiX />
          </SidebarClose>
        </SidebarHeader>

        <NavGroup>
          <NavItem
            active={view === "inbox"}
            onClick={() => {
              setView("inbox");
              setPage(1);
              setSidebarOpen(false);
            }}
          >
            <FiInbox /> Inbox
          </NavItem>
        </NavGroup>

        <NavGroup>
          <NavGroupTitle>Status</NavGroupTitle>
          <NavItem
            active={filters.viewed === "all"}
            onClick={() => {
              setFilters((f) => ({ ...f, viewed: "all" }));
              setPage(1);
            }}
          >
            <FiCheckCircle /> All
          </NavItem>
          <NavItem
            active={filters.viewed === "false"}
            onClick={() => {
              setFilters((f) => ({ ...f, viewed: "false" }));
              setPage(1);
            }}
          >
            <FiEyeOff /> Unviewed
          </NavItem>
        </NavGroup>

        <NavGroup>
          <NavGroupTitle>Flags</NavGroupTitle>
          <NavItem
            active={filters.flagged === "urgent"}
            onClick={() => {
              setFilters((f) => ({
                ...f,
                flagged: f.flagged === "urgent" ? "all" : "urgent",
              }));
              setPage(1);
            }}
          >
            <FiAlertCircle color="#ef4444" /> Urgent
          </NavItem>
          <NavItem
            active={filters.flagged === "important"}
            onClick={() => {
              setFilters((f) => ({
                ...f,
                flagged: f.flagged === "important" ? "all" : "important",
              }));
              setPage(1);
            }}
          >
            <FiAlertCircle color="#f59e0b" /> Important
          </NavItem>
        </NavGroup>

        <NavGroup>
          <NavItem
            active={view === "bin"}
            onClick={() => {
              setView("bin");
              setPage(1);
            }}
          >
            <FiTrash2 /> Trash
          </NavItem>
          <NavItem
            onClick={() => {
              alert("Archive feature not implemented yet.");
            }}
          >
            <FiArchive /> Archive
          </NavItem>
        </NavGroup>

        <div style={{ marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                background: "#e6eefc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiUser />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{admin?.username}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {admin?.email}
              </div>
            </div>
            <LogoutButton onClick={handleLogout} title="Logout">
              <FiLogOut />
            </LogoutButton>
          </div>
        </div>
      </Sidebar>

      {/* Main area: list + detail */}
      <Main>
        <MessageListPanel>
          <SearchBarContainer>
            <SearchIcon />
            <SearchInput
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </SearchBarContainer>

          <div
            style={{
              padding: 10,
              borderBottom: "1px solid #e6e9ef",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {view === "bin" ? "Trash" : "Inbox"}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                style={{ borderRadius: 8, padding: "6px 8px" }}
              >
                <option value="createdAt_desc">Newest</option>
                <option value="createdAt_asc">Oldest</option>
              </select>
            </div>
          </div>

          <MessageList>
            {loading && <div style={{ padding: 16 }}>Loading...</div>}
            {error && <div style={{ padding: 16, color: "red" }}>{error}</div>}

            {!loading &&
              (view === "inbox" ? submissions : binItems).length === 0 && (
                <div style={{ padding: 16, color: "#6b7280" }}>No messages</div>
              )}

            {/* {!loading &&
              (view === "inbox" ? submissions : binItems).map((s) => (
                <MessageListItem
                  key={s._id}
                  active={activeSubmission?._id === s._id}
                  onClick={() => handleOpenSubmission(s)}
                >
                  <div style={{ width: 8 }}>
                    {!s.isViewed && <span className="dot" title="Unread" />}
                  </div>
                  <div className="meta">
                    <div className="title">
                      #{s.receiptCode} —{" "}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                    <div className="excerpt">{renderSnippet(s)}</div>
                  </div>
                </MessageListItem>
              ))} */}
            {!loading &&
              visibleItems.map((s) => (
                <MessageListItem
                  key={s._id}
                  active={activeSubmission?._id === s._id}
                  onClick={() => handleOpenSubmission(s)}
                >
                  <div style={{ width: 8 }}>
                    {!s.isViewed && <span className="dot" title="Unread" />}
                  </div>
                  <div className="meta">
                    <div className="title">
                      #{s.receiptCode}{" "}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>

                    <div className="excerpt">{renderSnippet(s)}</div>
                  </div>
                </MessageListItem>
              ))}
          </MessageList>

          <FooterBar>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <PageBtn
                onClick={() => {
                  setPage(1);
                }}
                disabled={page === 1}
              >
                First
              </PageBtn>
              <PageBtn onClick={gotoPrev} disabled={page === 1}>
                Prev
              </PageBtn>
              <div>
                Page {page} / {totalPages}
              </div>
              <PageBtn onClick={gotoNext} disabled={page === totalPages}>
                Next
              </PageBtn>
              <PageBtn
                onClick={() => {
                  setPage(totalPages);
                }}
                disabled={page === totalPages}
              >
                Last
              </PageBtn>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ color: "#6b7280" }}>{totalCount} total</div>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </FooterBar>
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
                  <FiChevronLeft
                    onClick={() => {
                      /* TODO: prev navigation */
                    }}
                  />
                  <FiChevronRight
                    onClick={() => {
                      /* TODO: next navigation */
                    }}
                  />
                  <FiEdit onClick={() => alert("Edit not implemented")} />

                  {activeSubmission.isViewed ? (
                    <FiEyeOff
                      title="Mark as Unviewed"
                      onClick={() =>
                        handleUpdate(activeSubmission._id, { isViewed: false })
                      }
                    />
                  ) : (
                    <FiEye
                      title="Mark as Viewed"
                      onClick={() =>
                        handleUpdate(activeSubmission._id, { isViewed: true })
                      }
                    />
                  )}

                  {/* Important toggle */}
                  <FiAlertCircle
                    title="Toggle Important"
                    className={`important-flag ${
                      activeSubmission.isFlagged === "important" ? "active" : ""
                    }`}
                    onClick={() =>
                      handleUpdate(activeSubmission._id, {
                        isFlagged:
                          activeSubmission.isFlagged === "important"
                            ? "normal"
                            : "important",
                      })
                    }
                    style={{
                      color:
                        activeSubmission.isFlagged === "important"
                          ? "#f59e0b"
                          : undefined,
                    }}
                  />

                  {/* Urgent toggle */}
                  <FiAlertCircle
                    title="Toggle Urgent"
                    className={`urgent-flag ${
                      activeSubmission.isFlagged === "urgent" ? "active" : ""
                    }`}
                    onClick={() =>
                      handleUpdate(activeSubmission._id, {
                        isFlagged:
                          activeSubmission.isFlagged === "urgent"
                            ? "normal"
                            : "urgent",
                      })
                    }
                    style={{
                      color:
                        activeSubmission.isFlagged === "urgent"
                          ? "#ef4444"
                          : undefined,
                    }}
                  />

                  {/* Delete or Restore depending on view */}
                  <FiTrash2
                    title={view === "bin" ? "Restore" : "Move to bin"}
                    onClick={() => {
                      if (
                        window.confirm(
                          view === "bin"
                            ? "Restore this message?"
                            : "Move this message to the bin?"
                        )
                      ) {
                        handleDeleteOrRestore(activeSubmission._id);
                      }
                    }}
                  />
                </HeaderActions>
              </DetailHeader>

              <MessageBody>
                {/* show decrypted text only - decrypted content is in plainTextMessage */}
                {activeSubmission._loading && <div>Decrypting…</div>}
                {!activeSubmission._loading && (
                  <>
                    <div style={{ marginBottom: 10, color: "#111827" }}>
                      {activeSubmission.plainTextMessage || "Encrypted message"}
                    </div>

                    {/* decrypted files (if server returns decryptedFiles when decrypted) */}
                    {Array.isArray(activeSubmission.files) &&
                      activeSubmission.files.map((f, idx) => {
                        const name =
                          f.originalName || f.name || `attachment-${idx + 1}`;
                        const path = f.path;
                        return (
                          <div key={idx} style={{ marginTop: 8 }}>
                            {path ? (
                              <Attachment
                                href={`${
                                  process.env.REACT_APP_API_URL ||
                                  "http://localhost:5000"
                                }${f.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FiDownload />
                                {f.originalName || "Download Attachment"}
                              </Attachment>
                            ) : (
                              <div style={{ color: "#6b7280" }}>
                                {name} (not available)
                              </div>
                            )}
                          </div>
                        );
                      })}
                    {activeSubmission.file && (
                      <Attachment
                        href={`${
                          process.env.REACT_APP_API_URL ||
                          "http://localhost:5000"
                        }${activeSubmission.file.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FiDownload />
                        {activeSubmission.file.originalName ||
                          "Download Attachment"}
                      </Attachment>
                    )}
                  </>
                )}
              </MessageBody>
            </>
          ) : (
            <Placeholder>
              {loading ? "Loading..." : "Select a message to read."}
            </Placeholder>
          )}
        </MessageDetailPanel>
      </Main>
    </DashboardLayout>
  );
};

export default AdminDashboard;
