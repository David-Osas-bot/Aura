import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext({
    user: null,
    userData: null,
    loading: true,
    dataLoading: true,
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        let unsubSnap = null;

        const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
            // Clean up previous snapshot listener
            if (unsubSnap) unsubSnap();

            setUser(firebaseUser);

            if (firebaseUser) {
                setDataLoading(true);
                const ref = doc(db, 'users', firebaseUser.uid);
                unsubSnap = onSnapshot(
                    ref,
                    (snap) => {
                        setUserData(snap.exists() ? snap.data() : null);
                        setDataLoading(false);
                        setLoading(false);
                    },
                    (err) => {
                        console.error('Firestore snapshot error:', err);
                        setDataLoading(false);
                        setLoading(false);
                    }
                );
            } else {
                setUserData(null);
                setDataLoading(false);
                setLoading(false);
            }
        });

        return () => {
            unsubAuth();
            if (unsubSnap) unsubSnap();
        };
    }, []);

    const value = { user, userData, loading, dataLoading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}