import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/config';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    getDoc,
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

    // Fetch other user's profile
    useEffect(() => {
        getDoc(doc(db, 'users', otherUserId)).then((snap) => {
            if (snap.exists()) setOtherUser(snap.data());
        });
    }, [otherUserId]);

    // Subscribe to message thread
    useEffect(() => {
        const q = query(
            collection(db, 'messages', threadId, 'thread'),
            orderBy('createdAt', 'asc')
        );
        const unsub = onSnapshot(q, (snap) => {
            setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, [threadId]);

    // Auto-scroll to bottom on new message
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
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const date = ts.toDate?.() || new Date(ts);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="messages-page">
            {/* Header */}
            <div className="msg-header">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                {otherUser && (
                    <div
                        className="msg-header-user"
                        onClick={() => navigate(`/profile/${otherUserId}`)}
                    >
                        <img
                            src={otherUser.photos?.[0]}
                            alt={otherUser.displayName}
                            className="msg-avatar"
                        />
                        <span className="msg-header-name">{otherUser.displayName}</span>
                    </div>
                )}
            </div>

            {/* Message list */}
            <div className="msg-list">
                {messages.length === 0 && (
                    <div className="msg-empty">
                        Say hello to {otherUser?.displayName || 'them'} 👋
                    </div>
                )}

                {messages.map((m) => {
                    const isMine = m.from === uid;
                    return (
                        <div key={m.id} className={`msg-row ${isMine ? 'mine' : 'theirs'}`}>
                            <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                <p>{m.text}</p>
                                <span className="msg-time">{formatTime(m.createdAt)}</span>
                            </div>
                        </div>
                    );
                })}

                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="msg-input-bar">
                <textarea
                    className="msg-input"
                    placeholder="Type a message…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                />
                <button
                    className="msg-send-btn"
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                >
                    {sending ? '…' : '↑'}
                </button>
            </div>
        </div>
    );
}