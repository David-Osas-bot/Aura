import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfileView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [currentPhoto, setCurrentPhoto] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDoc(doc(db, 'users', id)).then((snap) => {
            if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
            setLoading(false);
        });
    }, [id]);

    if (loading) return (
        <div style={{
            minHeight: '100vh', background: '#08080f',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.08)',
                borderTopColor: '#fff',
                animation: 'spin 0.8s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!profile) return (
        <div style={{
            minHeight: '100vh', background: '#08080f', color: 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontFamily: 'DM Sans, sans-serif'
        }}>
            Profile not found.
        </div>
    );

    const prevPhoto = () =>
        setCurrentPhoto(p => p === 0 ? profile.photos.length - 1 : p - 1);
    const nextPhoto = () =>
        setCurrentPhoto(p => p === profile.photos.length - 1 ? 0 : p + 1);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pv-page {
          min-height: 100vh;
          background: #08080f;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Navbar ── */
        .pv-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(8,8,15,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .pv-logo {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #fff;
          cursor: pointer;
        }

        .pv-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pv-back-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          transform: translateX(-2px);
        }

        /* ── Main content ── */
        .pv-content {
          max-width: 1080px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .pv-content {
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 24px 16px 60px;
          }
        }

        /* ── Photo section ── */
        .pv-photos { display: flex; flex-direction: column; gap: 12px; }

        .pv-main-wrap {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          aspect-ratio: 3/4;
          background: #111;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }

        .pv-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        /* Tap zones */
        .pv-zone {
          position: absolute;
          top: 0;
          width: 40%;
          height: 88%;
          z-index: 2;
          cursor: pointer;
        }

        .pv-zone.left { left: 0; }
        .pv-zone.right { right: 0; }

        /* Arrow buttons */
        .pv-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
        }

        .pv-arrow:hover { background: rgba(0,0,0,0.75); transform: translateY(-50%) scale(1.08); }
        .pv-arrow.left { left: 12px; }
        .pv-arrow.right { right: 12px; }

        /* Dot indicators */
        .pv-dots {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
          z-index: 3;
        }

        .pv-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          padding: 0;
        }

        .pv-dot.active {
          background: #fff;
          transform: scale(1.3);
        }

        /* Bottom gradient */
        .pv-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 30%;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
          z-index: 1;
          pointer-events: none;
        }

        /* Photo count badge */
        .pv-count {
          position: absolute;
          bottom: 14px;
          right: 14px;
          z-index: 3;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
        }

        /* Thumbnails */
        .pv-thumbs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pv-thumb {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          object-fit: cover;
          cursor: pointer;
          border: 2px solid transparent;
          opacity: 0.55;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .pv-thumb:hover { opacity: 0.85; }

        .pv-thumb.active {
          border-color: #fff;
          opacity: 1;
        }

        /* ── Info section ── */
        .pv-info {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-top: 8px;
        }

        .pv-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 50px;
          padding: 5px 12px;
          font-size: 11px;
          font-weight: 600;
          color: #34d399;
          letter-spacing: 0.04em;
          margin-bottom: 20px;
          width: fit-content;
        }

        .pv-tag-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .pv-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 8px;
        }

        .pv-joined {
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          font-weight: 400;
          margin-bottom: 32px;
        }

        .pv-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin-bottom: 28px;
        }

        .pv-bio-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 12px;
        }

        .pv-bio {
          font-size: 15px;
          line-height: 1.75;
          color: rgba(255,255,255,0.7);
          margin-bottom: 36px;
          white-space: pre-wrap;
        }

        /* Stats row */
        .pv-stats {
          display: flex;
          gap: 0;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 28px;
        }

        .pv-stat {
          flex: 1;
          padding: 16px 12px;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        .pv-stat:last-child { border-right: none; }

        .pv-stat-val {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.02em;
          display: block;
        }

        .pv-stat-label {
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 3px;
          display: block;
        }

        /* CTA buttons */
        .pv-actions { display: flex; flex-direction: column; gap: 12px; }

        .pv-btn-primary {
          width: 100%;
          padding: 16px 24px;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.01em;
        }

        .pv-btn-primary:hover {
          background: rgba(255,255,255,0.9);
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(255,255,255,0.12);
        }

        .pv-btn-primary:active { transform: translateY(0); }

        .pv-btn-secondary {
          width: 100%;
          padding: 15px 24px;
          background: transparent;
          color: rgba(255,255,255,0.6);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .pv-btn-secondary:hover {
          border-color: rgba(255,255,255,0.3);
          color: #fff;
          background: rgba(255,255,255,0.04);
        }

        /* Safety note */
        .pv-safety {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          font-weight: 500;
        }
      `}</style>

            <div className="pv-page">

                {/* ── Navbar ── */}
                <nav className="pv-nav">
                    <span className="pv-logo" onClick={() => navigate('/home')}>aura</span>
                    <button className="pv-back-btn" onClick={() => navigate('/home')}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Browse
                    </button>
                </nav>

                {/* ── Content Grid ── */}
                <div className="pv-content">

                    {/* LEFT — Photos */}
                    <div className="pv-photos">
                        <div className="pv-main-wrap">
                            <img
                                src={profile.photos[currentPhoto]}
                                alt={profile.displayName}
                                className="pv-main-img"
                            />

                            {/* Gradient overlay */}
                            <div className="pv-gradient" />

                            {/* Tap zones */}
                            <div className="pv-zone left" onClick={prevPhoto} />
                            <div className="pv-zone right" onClick={nextPhoto} />

                            {/* Arrow buttons */}
                            {profile.photos.length > 1 && (
                                <>
                                    <button className="pv-arrow left" onClick={prevPhoto}>
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button className="pv-arrow right" onClick={nextPhoto}>
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}

                            {/* Dot indicators */}
                            {profile.photos.length > 1 && (
                                <div className="pv-dots">
                                    {profile.photos.map((_, i) => (
                                        <button
                                            key={i}
                                            className={`pv-dot ${i === currentPhoto ? 'active' : ''}`}
                                            onClick={() => setCurrentPhoto(i)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Photo count */}
                            <span className="pv-count">
                                {currentPhoto + 1} / {profile.photos.length}
                            </span>
                        </div>

                        {/* Thumbnails */}
                        <div className="pv-thumbs">
                            {profile.photos.map((url, i) => (
                                <img
                                    key={i}
                                    src={url}
                                    alt=""
                                    className={`pv-thumb ${i === currentPhoto ? 'active' : ''}`}
                                    onClick={() => setCurrentPhoto(i)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — Info */}
                    <div className="pv-info">

                        {/* Active badge */}
                        <div className="pv-tag">
                            <span className="pv-tag-dot" />
                            Active member
                        </div>

                        <h1 className="pv-name">{profile.displayName}</h1>
                        <p className="pv-joined">
                            Joined {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                month: 'long', year: 'numeric',
                            })}
                        </p>

                        <div className="pv-divider" />

                        {/* Stats */}
                        <div className="pv-stats">
                            <div className="pv-stat">
                                <span className="pv-stat-val">{profile.photos.length}</span>
                                <span className="pv-stat-label">Photos</span>
                            </div>
                            <div className="pv-stat">
                                <span className="pv-stat-val">✦</span>
                                <span className="pv-stat-label">Verified</span>
                            </div>
                            <div className="pv-stat">
                                <span className="pv-stat-val">{profile.bio?.length > 0 ? '✓' : '—'}</span>
                                <span className="pv-stat-label">Bio</span>
                            </div>
                        </div>

                        {/* Bio */}
                        <p className="pv-bio-label">About</p>
                        <p className="pv-bio">{profile.bio || 'No bio yet.'}</p>

                        <div className="pv-divider" />

                        {/* Actions */}
                        <div className="pv-actions">
                            <button
                                className="pv-btn-primary"
                                onClick={() => navigate(`/messages/${profile.id}`)}
                            >
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Send a Message
                            </button>

                            <button
                                className="pv-btn-secondary"
                                onClick={() => navigate('/home')}
                            >
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                Browse other profiles
                            </button>
                        </div>

                        {/* Safety note */}
                        <div className="pv-safety">
                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            All members are verified paying users
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}