import { useEffect, useState, useRef } from 'react';
import { db, auth } from '../../firebase/config';
import {
    collection, addDoc, query, orderBy,
    onSnapshot, serverTimestamp
} from 'firebase/firestore';

export default function MessageThread({ otherUserId, otherUser }) {
    const uid = auth.currentUser.uid;
    const threadId = [uid, otherUserId].sort().join('_');
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const q = query(
            collection(db, 'messages', threadId, 'thread'),
            orderBy('createdAt')
        );
        return onSnapshot(q, (snap) =>
            setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        );
    }, [threadId]);

    // Auto scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async () => {
        if (!text.trim() || sending) return;
        setSending(true);
        try {
            await addDoc(collection(db, 'messages', threadId, 'thread'), {
                text: text.trim(),
                from: uid,
                createdAt: serverTimestamp(),
            });
            setText('');
            inputRef.current?.focus();
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
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

    const formatDate = (ts) => {
        if (!ts) return '';
        const date = ts.toDate?.() || new Date(ts);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const dateKey = msg.createdAt
            ? formatDate(msg.createdAt)
            : 'Just now';
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(msg);
        return groups;
    }, {});

    return (
        <div className="flex flex-col h-full bg-[#080810]">

            {/* ── Message List ── */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth">

                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
                        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                            💬
                        </div>
                        <p className="text-white/30 text-sm font-medium">
                            No messages yet — say hello!
                        </p>
                    </div>
                )}

                {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date} className="space-y-3">

                        {/* Date separator */}
                        <div className="flex items-center gap-3 py-1">
                            <div className="flex-1 h-px bg-white/8" />
                            <span className="text-white/25 text-[10px] font-semibold tracking-widest uppercase px-2">
                                {date}
                            </span>
                            <div className="flex-1 h-px bg-white/8" />
                        </div>

                        {/* Messages */}
                        {msgs.map((m, i) => {
                            const isMine = m.from === uid;
                            const isFirst = i === 0 || msgs[i - 1]?.from !== m.from;
                            const isLast = i === msgs.length - 1 || msgs[i + 1]?.from !== m.from;

                            return (
                                <div
                                    key={m.id}
                                    className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar — only show on last message in group */}
                                    <div className="w-7 h-7 flex-shrink-0">
                                        {!isMine && isLast && (
                                            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 overflow-hidden">
                                                {otherUser?.photos?.[0] ? (
                                                    <img
                                                        src={otherUser.photos[0]}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-bold">
                                                        {otherUser?.displayName?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`flex flex-col gap-1 max-w-[75%] sm:max-w-[60%] ${isMine ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className={`
                        px-4 py-2.5 text-sm leading-relaxed break-words
                        ${isMine
                                                    ? 'bg-white text-black rounded-2xl rounded-br-md'
                                                    : 'bg-white/8 text-white border border-white/8 rounded-2xl rounded-bl-md'
                                                }
                        ${isFirst && isMine ? 'rounded-tr-2xl' : ''}
                        ${isFirst && !isMine ? 'rounded-tl-2xl' : ''}
                      `}
                                        >
                                            {m.text}
                                        </div>

                                        {/* Timestamp — show on last in group */}
                                        {isLast && (
                                            <span className="text-white/20 text-[10px] px-1">
                                                {formatTime(m.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                <div ref={bottomRef} />
            </div>

            {/* ── Input Bar ── */}
            <div className="flex-shrink-0 border-t border-white/8 bg-[#080810] px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">

                    {/* Textarea */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                // Auto resize
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message…"
                            rows={1}
                            className="
                w-full resize-none overflow-hidden
                bg-white/6 border border-white/10
                hover:border-white/20 focus:border-white/25
                rounded-2xl px-4 py-3
                text-white text-sm leading-relaxed
                placeholder-white/20
                outline-none transition-colors duration-200
                max-h-[120px]
              "
                            style={{ height: 'auto' }}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={send}
                        disabled={!text.trim() || sending}
                        className="
              flex-shrink-0 w-11 h-11 rounded-full
              bg-white text-black
              flex items-center justify-center
              font-bold text-base
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

                {/* Hint */}
                <p className="text-center text-white/15 text-[10px] mt-2 hidden sm:block">
                    Enter to send · Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}