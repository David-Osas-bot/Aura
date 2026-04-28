import { useEffect, useState } from 'react';
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
        <div className="thread">
            <div className="messages">
                {messages.map((m) => (
                    <div key={m.id} className={`msg ${m.from === uid ? 'mine' : 'theirs'}`}>
                        {m.text}
                    </div>
                ))}
            </div>
            <div className="input-row">
                <input value={text} onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder="Type a message…" />
                <button onClick={send}>Send</button>
            </div>
        </div>
    );
}