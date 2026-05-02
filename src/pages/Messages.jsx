import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/config';
import {
    collection, addDoc, query, orderBy,
    onSnapshot, serverTimestamp, doc, getDoc,
} from 'firebase/firestore';

export default function Messages() {
    const { id: otherUserId } = useParams();
    const navigate = useNavigate();
    const uid = auth.currentUser.uid;
    const threadId = [uid, otherUserId].sort().join('_');

    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        getDoc(doc(db, 'users', otherUserId)).then((snap) => {
            if (snap.exists()) setOtherUser(snap.data());
        });
    }, [otherUserId]);

    useEffect(() => {
        const q = query(
            collection(db, 'messages', threadId, 'thread'),
            orderBy('createdAt', 'asc')
        );
        return onSnapshot(q, (snap) =>
            setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        );
    }, [threadId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!text.trim() || sending) return;
        setSending(true);
        try {
            await addDoc(collection(db, 'messages', threadId, 'thread'), {
                text: text.trim(),
                from: uid,
                createdAt: serverTimestamp(),
            });
            setText('');
            if (textareaRef.current) {
                textareaRef.current.style.height = '48px';
            }
        } finally {
            setSending(false);
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        e.target.style.height = '48px';
        e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const date = ts.toDate?.() || new Date(ts);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (ts) => {
        if (!ts) return null;
        const date = ts.toDate?.() || new Date(ts);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', {
            weekday: 'long', month: 'short', day: 'numeric',
        });
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .msg-page * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        .msg-page {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          background: #08080f;
          color: #fff;
          overflow: hidden;
        }

        /* ── Header ── */
        .msg-head {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: rgba(8,8,15,0.96);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .msg-back {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.7);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .msg-back:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
          transform: translateX(-2px);
        }

        .msg-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
          cursor: pointer;
        }

        .msg-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .msg-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          display: block;
        }

        .msg-avatar-placeholder {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          color: rgba(255,255,255,0.5);
        }

        .msg-online-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 11px;
          height: 11px;
          background: #34d399;
          border-radius: 50%;
          border: 2px solid #08080f;
        }

        .msg-name-block { min-width: 0; }

        .msg-name {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .msg-status {
          font-size: 11px;
          color: #34d399;
          font-weight: 500;
          margin-top: 1px;
        }

        .msg-profile-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.5);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .msg-profile-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
        }

        /* Skeleton */
        .msg-skeleton-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          animation: shimmer 1.5s ease infinite;
        }

        .msg-skeleton-text {
          height: 12px;
          width: 100px;
          border-radius: 6px;
          background: rgba(255,255,255,0.06);
          animation: shimmer 1.5s ease infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        /* ── Messages Area ── */
        .msg-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          scroll-behavior: smooth;
        }

        .msg-body::-webkit-scrollbar { width: 4px; }
        .msg-body::-webkit-scrollbar-track { background: transparent; }
        .msg-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        /* Empty state */
        .msg-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px;
          text-align: center;
        }

        .msg-empty-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
        }

        .msg-empty-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .msg-empty h3 {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 4px;
        }

        .msg-empty p {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          margin: 0;
        }

        /* Date separator */
        .msg-date-sep {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0 12px;
        }

        .msg-date-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .msg-date-label {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* Message rows */
        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .msg-row.mine { flex-direction: row-reverse; }
        .msg-row.theirs { flex-direction: row; }
        .msg-row.group-start { margin-top: 12px; }
        .msg-row.group-mid { margin-top: 2px; }

        .msg-row-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          flex-shrink: 0;
          align-self: flex-end;
        }

        .msg-row-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .msg-row-avatar-spacer {
          width: 28px;
          flex-shrink: 0;
        }

        /* Bubble */
        .msg-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-width: min(72%, 480px);
        }

        .msg-col.mine { align-items: flex-end; }
        .msg-col.theirs { align-items: flex-start; }

        .msg-bubble {
          padding: 10px 16px;
          font-size: 14px;
          line-height: 1.55;
          word-break: break-word;
          white-space: pre-wrap;
        }

        .msg-bubble.mine {
          background: #fff;
          color: #0a0a0a;
          border-radius: 20px 20px 6px 20px;
        }

        .msg-bubble.theirs {
          background: rgba(255,255,255,0.07);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px 20px 20px 6px;
        }

        .msg-bubble.mine.group-mid {
          border-radius: 8px 8px 6px 8px;
        }

        .msg-bubble.theirs.group-mid {
          border-radius: 8px 8px 8px 6px;
        }

        .msg-time {
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          padding: 0 4px;
          margin-top: 2px;
        }

        /* ── Input Bar ── */
        .msg-footer {
          flex-shrink: 0;
          padding: 16px 20px 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
          background: rgba(8,8,15,0.98);
        }

        .msg-input-row {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          max-width: 860px;
          margin: 0 auto;
        }

        .msg-textarea-wrap { flex: 1; }

        .msg-textarea {
          width: 100%;
          height: 48px;
          max-height: 140px;
          resize: none;
          overflow: hidden;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 12px 20px;
          color: #fff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          line-height: 1.5;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          display: block;
        }

        .msg-textarea::placeholder { color: rgba(255,255,255,0.22); }

        .msg-textarea:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.16);
        }

        .msg-textarea:focus {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.28);
        }

        .msg-send {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #fff;
          border: none;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.18s;
          box-shadow: 0 4px 20px rgba(255,255,255,0.12);
        }

        .msg-send:hover:not(:disabled) {
          background: rgba(255,255,255,0.9);
          transform: scale(1.06);
          box-shadow: 0 6px 28px rgba(255,255,255,0.18);
        }

        .msg-send:active:not(:disabled) { transform: scale(0.96); }

        .msg-send:disabled {
          opacity: 0.22;
          cursor: not-allowed;
          transform: none;
        }

        .msg-hint {
          text-align: center;
          font-size: 10px;
          color: rgba(255,255,255,0.12);
          margin-top: 10px;
          letter-spacing: 0.02em;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .msg-head { padding: 12px 16px; }
          .msg-body { padding: 16px; }
          .msg-footer { padding: 12px 16px 16px; }
          .msg-col { max-width: 82%; }
          .msg-hint { display: none; }
        }

        @media (min-width: 1024px) {
          .msg-body { padding: 32px 40px; }
          .msg-footer { padding: 20px 40px 28px; }
        }

        /* Spin animation */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.7s linear infinite; }
      `}</style>

            <div className="msg-page">

                {/* ── HEADER ── */}
                <div className="msg-head">
                    <button className="msg-back" onClick={() => navigate(-1)}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {otherUser ? (
                        <div
                            className="msg-user-info"
                            onClick={() => navigate(`/profile/${otherUserId}`)}
                        >
                            <div className="msg-avatar-wrap">
                                {otherUser.photos?.[0] ? (
                                    <img src={otherUser.photos[0]} alt="" className="msg-avatar" />
                                ) : (
                                    <div className="msg-avatar-placeholder">
                                        {otherUser.displayName?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <span className="msg-online-dot" />
                            </div>
                            <div className="msg-name-block">
                                <div className="msg-name">{otherUser.displayName}</div>
                                <div className="msg-status">Active now</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <div className="msg-skeleton-avatar" />
                            <div className="msg-skeleton-text" />
                        </div>
                    )}

                    <button
                        className="msg-profile-btn"
                        onClick={() => navigate(`/profile/${otherUserId}`)}
                        title="View profile"
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </button>
                </div>

                {/* ── MESSAGES ── */}
                <div className="msg-body">

                    {messages.length === 0 && (
                        <div className="msg-empty">
                            <div className="msg-empty-avatar">
                                {otherUser?.photos?.[0] ? (
                                    <img src={otherUser.photos[0]} alt="" />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                                        💬
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3>Say hello to {otherUser?.displayName || 'them'}</h3>
                                <p>Your messages are private and secure 🔒</p>
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => {
                        const isMine = m.from === uid;
                        const prev = messages[i - 1];
                        const next = messages[i + 1];
                        const isFirst = !prev || prev.from !== m.from;
                        const isLast = !next || next.from !== m.from;

                        const msgDate = m.createdAt ? formatDate(m.createdAt) : null;
                        const prevDate = prev?.createdAt ? formatDate(prev.createdAt) : null;
                        const showDate = msgDate && msgDate !== prevDate;

                        return (
                            <div key={m.id}>
                                {showDate && (
                                    <div className="msg-date-sep">
                                        <div className="msg-date-line" />
                                        <span className="msg-date-label">{msgDate}</span>
                                        <div className="msg-date-line" />
                                    </div>
                                )}

                                <div className={`msg-row ${isMine ? 'mine' : 'theirs'} ${isFirst ? 'group-start' : 'group-mid'}`}>

                                    {/* Avatar (theirs only, last in group) */}
                                    {!isMine ? (
                                        isLast ? (
                                            <div className="msg-row-avatar">
                                                {otherUser?.photos?.[0]
                                                    ? <img src={otherUser.photos[0]} alt="" />
                                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                                                        {otherUser?.displayName?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                }
                                            </div>
                                        ) : <div className="msg-row-avatar-spacer" />
                                    ) : null}

                                    {/* Bubble */}
                                    <div className={`msg-col ${isMine ? 'mine' : 'theirs'}`}>
                                        <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'} ${!isFirst ? 'group-mid' : ''}`}>
                                            {m.text}
                                        </div>

                                        {isLast && (
                                            <span className="msg-time">{formatTime(m.createdAt)}</span>
                                        )}
                                    </div>

                                </div>
                            </div>
                        );
                    })}

                    <div ref={bottomRef} style={{ height: 8 }} />
                </div>

                {/* ── INPUT BAR ── */}
                <div className="msg-footer">
                    <div className="msg-input-row">
                        <div className="msg-textarea-wrap">
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={handleTextChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message…"
                                rows={1}
                                className="msg-textarea"
                            />
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={!text.trim() || sending}
                            className="msg-send"
                        >
                            {sending ? (
                                <svg className="spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" opacity="0.75" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <p className="msg-hint">Enter to send · Shift+Enter for new line</p>
                </div>

            </div>
        </>
    );
}