import { useState } from 'react';
import { auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PaymentGate() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, userData } = useAuth();
    const navigate = useNavigate();

    const handlePay = async () => {
        setError('');

        // Guard: make sure user is actually logged in
        if (!auth.currentUser) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();

            // const res = await fetch('http://localhost:4000/api/payment/create-checkout', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         Authorization: `Bearer ${token}`,
            //     },
            // });
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }); 

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Server error');
            }

            const { checkoutUrl } = await res.json();

            if (!checkoutUrl) throw new Error('No checkout URL returned');

            window.location.href = checkoutUrl;
        } catch (err) {
            console.error(err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Still loading auth state — don't render yet
    if (!user) {
        return (
            <div className="payment-gate">
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>Checking session…</p>
            </div>
        );
    }

    return (
        <div className="payment-gate">
            <div className="pg-card">
                <div className="pg-badge">One-time payment</div>
                <h2 className="pg-price">£500</h2>
                <p className="pg-title">Lifetime Access to Aura</p>

                <ul className="pg-perks">
                    <li>✦ Browse all profiles</li>
                    <li>✦ Send unlimited messages</li>
                    <li>✦ No subscription, ever</li>
                    <li>✦ Pay once, stay forever</li>
                </ul>

                {error && <div className="auth-error">{error}</div>}

                <button
                    className="btn-primary full"
                    onClick={handlePay}
                    disabled={loading}
                >
                    {loading ? 'Redirecting to payment…' : 'Pay & Join Aura'}
                </button>

                <p className="pg-note">
                    Secured by SumUp · No card stored on our servers
                </p>
            </div>
        </div>
    );
}