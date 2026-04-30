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
                textareaRef.current.style.height = 'auto';
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
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
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
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    // Group messages by date
    let lastDate = null;

    return (
        <div
            className="flex flex-col bg-[#080810] text-white"
            style={{ height: '100dvh' }}
        >

            {/* ── Header ── */}
            <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 sm:px-6 border-b border-white/8 bg-[#080810]/95 backdrop-blur-md">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 border border-white/10 text-white/70 hover:text-white transition-all duration-200 flex-shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* User info */}
                {otherUser ? (
                    <div
                        className="flex items-center gap-3 flex-1 cursor-pointer group"
                        onClick={() => navigate(`/profile/${otherUserId}`)}
                    >
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/15 bg-white/8">
                                {otherUser.photos?.[0] ? (
                                    <img
                                        src={otherUser.photos[0]}
                                        alt={otherUser.displayName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/40 font-bold text-sm">
                                        {otherUser.displayName?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {/* Online dot */}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#080810] rounded-full" />
                        </div>

                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm text-white group-hover:text-white/80 transition-colors truncate">
                                {otherUser.displayName}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-medium">Active now</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-white/6 animate-pulse" />
                        <div className="h-3 w-24 bg-white/6 rounded animate-pulse" />
                    </div>
                )}

                {/* View profile button */}
                <button
                    onClick={() => navigate(`/profile/${otherUserId}`)}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 border border-white/10 text-white/50 hover:text-white transition-all duration-200"
                    title="View profile"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </button>
            </div>

            {/* ── Message List ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">

                {/* Empty state */}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-white/5">
                            {otherUser?.photos?.[0] ? (
                                <img src={otherUser.photos[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">💬</div>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-white font-semibold text-sm mb-1">
                                Start a conversation with {otherUser?.displayName || 'them'}
                            </p>
                            <p className="text-white/30 text-xs">
                                Say hello — your message is private 🔒
                            </p>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="space-y-1">
                    {messages.map((m, i) => {
                        const isMine = m.from === uid;
                        const prevMsg = messages[i - 1];
                        const nextMsg = messages[i + 1];
                        const isFirstInGroup = !prevMsg || prevMsg.from !== m.from;
                        const isLastInGroup = !nextMsg || nextMsg.from !== m.from;

                        // Date separator
                        const msgDate = m.createdAt ? formatDate(m.createdAt) : null;
                        const prevDate = prevMsg?.createdAt ? formatDate(prevMsg.createdAt) : null;
                        const showDate = msgDate && msgDate !== prevDate;

                        return (
                            <div key={m.id}>
                                {/* Date separator */}
                                {showDate && (
                                    <div className="flex items-center gap-3 py-4">
                                        <div className="flex-1 h-px bg-white/8" />
                                        <span className="text-white/25 text-[10px] font-semibold tracking-widest uppercase px-1">
                                            {msgDate}
                                        </span>
                                        <div className="flex-1 h-px bg-white/8" />
                                    </div>
                                )}

                                {/* Message row */}
                                <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}>

                                    {/* Avatar */}
                                    <div className="w-7 flex-shrink-0 self-end mb-0.5">
                                        {!isMine && isLastInGroup && (
                                            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/15 bg-white/8">
                                                {otherUser?.photos?.[0] ? (
                                                    <img src={otherUser.photos[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-bold">
                                                        {otherUser?.displayName?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble + time */}
                                    <div className={`flex flex-col gap-1 max-w-[78%] sm:max-w-[60%] ${isMine ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className={`
                        px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap
                        ${isMine
                                                    ? `bg-white text-black
                             ${isFirstInGroup ? 'rounded-t-2xl' : 'rounded-t-lg'}
                             ${isLastInGroup ? 'rounded-bl-2xl rounded-br-md' : 'rounded-b-lg'}`
                                                    : `bg-white/8 text-white border border-white/8
                             ${isFirstInGroup ? 'rounded-t-2xl' : 'rounded-t-lg'}
                             ${isLastInGroup ? 'rounded-br-2xl rounded-bl-md' : 'rounded-b-lg'}`
                                                }
                      `}
                                        >
                                            {m.text}
                                        </div>

                                        {/* Time — only on last in group */}
                                        {isLastInGroup && (
                                            <span className="text-white/20 text-[10px] px-1 select-none">
                                                {formatTime(m.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div ref={bottomRef} className="h-2" />
            </div>

            {/* ── Input Bar ── */}
            <div className="flex-shrink-0 border-t border-white/8 bg-[#080810] px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">

                    {/* Textarea */}
                    <div className="flex-1">
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={handleTextChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message…"
                            rows={1}
                            className="
                w-full resize-none overflow-hidden
                bg-white/6 hover:bg-white/8
                border border-white/10 hover:border-white/20 focus:border-white/25
                rounded-2xl px-4 py-3
                text-white text-sm leading-relaxed
                placeholder:text-white/20
                outline-none transition-all duration-200
              "
                            style={{ maxHeight: '120px' }}
                        />
                    </div>

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={!text.trim() || sending}
                        className="
              flex-shrink-0 w-11 h-11 rounded-full
              bg-white text-black
              flex items-center justify-center
              hover:bg-white/90 active:scale-95
              disabled:opacity-25 disabled:cursor-not-allowed disabled:active:scale-100
              transition-all duration-150
              shadow-lg shadow-white/10
            "
                    >
                        {sending ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Hint — desktop only */}
                <p className="text-center text-white/12 text-[10px] mt-2 hidden sm:block select-none">
                    Enter to send · Shift+Enter for new line
                </p>
            </div>

        </div>
    );
}