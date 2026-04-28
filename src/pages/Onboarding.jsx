import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PaymentGate from '../components/Payment/PaymentGate';
import CreateProfile from '../components/Profile/CreateProfile';
import { auth } from '../firebase/config';

export default function Onboarding() {
    const { userData } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(false);

    // After SumUp redirect, verify payment
    useEffect(() => {
        const checkoutId = searchParams.get('checkout_id');
        if (!checkoutId || userData?.paid) return;

        setVerifying(true);
        auth.currentUser.getIdToken().then(async (token) => {
            const res = await fetch(`/api/payment/verify/${checkoutId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.status !== 'PAID') alert('Payment not confirmed yet.');
            setVerifying(false);
        });
    }, [searchParams, userData]);

    if (verifying) return <div className="loader">Confirming payment…</div>;
    if (!userData?.paid) return <PaymentGate />;
    if (!userData?.profileComplete) return <CreateProfile />;
    navigate('/home');
    return null;
}