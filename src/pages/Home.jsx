import { useEffect, useState } from 'react';
import { db, auth } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getDocs(collection(db, 'users')).then((snap) => {
            const all = snap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .filter((u) => u.profileComplete);
            // Show ALL profiles including your own for testing
            // In production change to: .filter((u) => u.profileComplete && u.id !== auth.currentUser.uid)
            setProfiles(all);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={styles.loader}>
            <div style={styles.loaderDot} />
        </div>
    );

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        .home-wrap {
          min-height: 100vh;
          background: #080810;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
        }

        /* Navbar */
        .home-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          background: rgba(8,8,16,0.9);
          backdrop-filter: blur(20px);
          z-index: 100;
        }

        @media (max-width: 600px) { .home-nav { padding: 16px 20px; } }

        .home-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
          cursor: pointer;
        }

        .home-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          color: rgba(255,255,255,0.7);
          font-size: 0.85rem;
          font-weight: 500;
          padding: 8px 18px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .nav-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .nav-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          overflow: hidden;
          cursor: pointer;
        }

        .nav-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Page header */
        .home-header {
          padding: 48px 40px 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 600px) { .home-header { padding: 32px 20px 24px; } }

        .home-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }

        .home-subtitle {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }

        /* Grid */
        .home-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          padding: 0 40px 60px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 600px) {
          .home-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 0 16px 40px;
          }
        }

        /* Profile card */
        .pcard {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          aspect-ratio: 3/4;
          background: #111;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
        }

        .pcard:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }

        .pcard-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .pcard:hover .pcard-img { transform: scale(1.04); }

        .pcard-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.92) 0%,
            rgba(0,0,0,0.3) 50%,
            transparent 100%
          );
        }

        .pcard-body {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
        }

        .pcard-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }

        @media (max-width: 600px) { .pcard-name { font-size: 1rem; } }

        .pcard-bio {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.6);
          margin: 0 0 14px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }

        @media (max-width: 600px) { .pcard-bio { display: none; } }

        .pcard-actions {
          display: flex;
          gap: 8px;
        }

        .pcard-msg-btn {
          flex: 1;
          padding: 10px 0;
          background: #fff;
          border: none;
          border-radius: 50px;
          color: #000;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s;
          letter-spacing: 0.02em;
        }

        .pcard-msg-btn:hover { opacity: 0.85; }

        .pcard-view-btn {
          width: 38px;
          height: 38px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50%;
          color: #fff;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .pcard-view-btn:hover { background: rgba(255,255,255,0.2); }

        /* Photo dots */
        .pcard-dots {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          z-index: 2;
        }

        .pcard-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          transition: background 0.2s, transform 0.2s;
        }

        .pcard-dot.active {
          background: #fff;
          transform: scale(1.3);
        }

        /* Empty state */
        .home-empty {
          text-align: center;
          padding: 80px 40px;
          grid-column: 1 / -1;
        }

        .home-empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          display: block;
          opacity: 0.3;
        }

        .home-empty h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: rgba(255,255,255,0.5);
          margin: 0 0 8px;
        }

        .home-empty p {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.25);
          margin: 0;
        }

        /* Loader */
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>

            <div className="home-wrap">
                {/* Navbar */}
                <nav className="home-nav">
                    <div className="home-logo">aura</div>
                    <div className="home-nav-right">
                        <button className="nav-btn" onClick={() => navigate(`/profile/${auth.currentUser.uid}`)}>
                            My Profile
                        </button>
                        <div className="nav-avatar">
                            {profiles.find(p => p.id === auth.currentUser.uid)?.photos?.[0] && (
                                <img src={profiles.find(p => p.id === auth.currentUser.uid).photos[0]} alt="" />
                            )}
                        </div>
                    </div>
                </nav>

                {/* Header */}
                <div className="home-header">
                    <h1 className="home-title">Browse Members</h1>
                    <p className="home-subtitle">
                        {profiles.length} {profiles.length === 1 ? 'member' : 'members'} · Paid access only
                    </p>
                </div>

                {/* Grid */}
                <div className="home-grid">
                    {profiles.length === 0 ? (
                        <div className="home-empty">
                            <span className="home-empty-icon">✦</span>
                            <h3>You're the first one here</h3>
                            <p>Share the app — new members will appear here once they join</p>
                        </div>
                    ) : (
                        profiles.map((profile) => (
                            <ProfileCard
                                key={profile.id}
                                profile={profile}
                                onMessage={() => navigate(`/messages/${profile.id}`)}
                                onView={() => navigate(`/profile/${profile.id}`)}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

function ProfileCard({ profile, onMessage, onView }) {
    const [currentPhoto, setCurrentPhoto] = useState(0);

    return (
        <div className="pcard">
            <img
                src={profile.photos[currentPhoto]}
                alt={profile.displayName}
                className="pcard-img"
            />

            {/* Tap zones */}
            <div
                style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '80%', zIndex: 2 }}
                onClick={() => setCurrentPhoto(p => p === 0 ? profile.photos.length - 1 : p - 1)}
            />
            <div
                style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '80%', zIndex: 2 }}
                onClick={() => setCurrentPhoto(p => p === profile.photos.length - 1 ? 0 : p + 1)}
            />

            {/* Photo dots */}
            {profile.photos.length > 1 && (
                <div className="pcard-dots">
                    {profile.photos.map((_, i) => (
                        <div key={i} className={`pcard-dot ${i === currentPhoto ? 'active' : ''}`} />
                    ))}
                </div>
            )}

            <div className="pcard-gradient" />

            <div className="pcard-body">
                <p className="pcard-name">{profile.displayName}</p>
                <p className="pcard-bio">{profile.bio}</p>
                <div className="pcard-actions">
                    <button className="pcard-msg-btn" onClick={(e) => { e.stopPropagation(); onMessage(); }}>
                        Message
                    </button>
                    <button className="pcard-view-btn" onClick={(e) => { e.stopPropagation(); onView(); }}>
                        →
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    loader: {
        minHeight: '100vh',
        background: '#080810',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loaderDot: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.4)',
        animation: 'pulse 1.2s ease infinite',
    },
};