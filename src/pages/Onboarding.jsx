import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PaymentGate from '../components/Payment/PaymentGate';
import CreateProfile from '../components/Profile/CreateProfile';
import { auth } from '../firebase/config';

export default function Onboarding() {
    const { userData, dataLoading } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(false);

    // After SumUp redirect, verify payment
    useEffect(() => {
        const checkoutId = searchParams.get('checkout_id');
        if (!checkoutId || userData?.paid) return;

        setVerifying(true);
        auth.currentUser?.getIdToken(true).then(async (token) => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/payment/verify/${checkoutId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                if (data.status !== 'PAID') {
                    alert('Payment not confirmed yet. Please contact support.');
                }
            } catch (err) {
                console.error('Verify error:', err);
            } finally {
                setVerifying(false);
            }
        });
    }, [searchParams, userData]);

    // ← KEY FIX: Show loader while Firestore is still loading
    if (dataLoading || verifying) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#08080f',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                fontFamily: 'DM Sans, sans-serif',
            }}>
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.08)',
                    borderTopColor: '#fff',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                    {verifying ? 'Confirming payment…' : 'Loading your account…'}
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Only make decisions AFTER data is fully loaded
    if (!userData?.paid) return <PaymentGate />;
    if (!userData?.profileComplete) return <CreateProfile />;

    // All good — go to home
    navigate('/home');
    return null;
}