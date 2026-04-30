// import { useEffect, useState } from 'react';
// import { db, auth } from '../../firebase/config';
// import {
//     collection, addDoc, query, orderBy,
//     onSnapshot, serverTimestamp
// } from 'firebase/firestore';

// export default function MessageThread({ otherUserId }) {
//     const uid = auth.currentUser.uid;
//     const threadId = [uid, otherUserId].sort().join('_');
//     const [messages, setMessages] = useState([]);
//     const [text, setText] = useState('');

//     useEffect(() => {
//         const q = query(
//             collection(db, 'messages', threadId, 'thread'),
//             orderBy('createdAt')
//         );
//         return onSnapshot(q, (snap) =>
//             setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
//         );
//     }, [threadId]);

//     const send = async () => {
//         if (!text.trim()) return;
//         await addDoc(collection(db, 'messages', threadId, 'thread'), {
//             text,
//             from: uid,
//             createdAt: serverTimestamp(),
//         });
//         setText('');
//     };

//     return (
//         <div className="thread">
//             <div className="messages">
//                 {messages.map((m) => (
//                     <div key={m.id} className={`msg ${m.from === uid ? 'mine' : 'theirs'}`}>
//                         {m.text}
//                     </div>
//                 ))}
//             </div>
//             <div className="input-row">
//                 <input value={text} onChange={(e) => setText(e.target.value)}
//                     onKeyDown={(e) => e.key === 'Enter' && send()}
//                     placeholder="Type a message…" />
//                 <button onClick={send}>Send</button>
//             </div>
//         </div>
//     );
// }







import { useEffect, useState, useRef } from 'react';
import { db, auth } from '../../firebase/config';
import {
    collection, addDoc, query, orderBy,
    onSnapshot, serverTimestamp
} from 'firebase/firestore';

export default function MessageThread({ otherUserId }) {
    const uid = auth.currentUser.uid;
    const threadId = [uid, otherUserId].sort().join('_');
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const q = query(
            collection(db, 'messages', threadId, 'thread'),
            orderBy('createdAt')
        );
        return onSnapshot(q, (snap) =>
            setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        );
    }, [threadId]);

    const send = async () => {
        if (!text.trim()) return;
        await addDoc(collection(db, 'messages', threadId, 'thread'), {
            text,
            from: uid,
            createdAt: serverTimestamp(),
        });
        setText('');
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Header - Purple Gradient like the image */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 shadow-md">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 text-white font-bold">
                        {/* Placeholder for Avatar */}
                        ?
                    </div>
                    <div>
                        <h2 className="text-white font-semibold text-sm">Chat Support</h2>
                        <p className="text-indigo-100 text-xs flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-white"
                style={{ scrollBehavior: 'smooth' }}
            >
                {messages.map((m) => {
                    const isMine = m.from === uid;
                    return (
                        <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all
                                ${isMine
                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                                }`}
                            >
                                {m.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Row */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-purple-400 transition-all">
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && send()}
                        placeholder="Type a message…"
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1"
                    />
                    <button
                        onClick={send}
                        className="ml-2 bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded-full transition-colors disabled:opacity-50"
                        disabled={!text.trim()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}