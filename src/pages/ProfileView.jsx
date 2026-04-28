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

    if (loading) return <div className="loader">Loading…</div>;
    if (!profile) return <div className="loader">Profile not found.</div>;

    return (
        <div className="profile-view">
            {/* Back button */}
            <button className="back-btn" onClick={() => navigate('/home')}>
                ← Back
            </button>

            <div className="pv-inner">
                {/* Left — Photos */}
                <div className="pv-photos">
                    <div className="pv-main-photo-wrap">
                        <img
                            src={profile.photos[currentPhoto]}
                            alt={profile.displayName}
                            className="pv-main-photo"
                        />

                        {/* Left / Right tap zones */}
                        <div
                            className="photo-zone left"
                            onClick={() =>
                                setCurrentPhoto((p) =>
                                    p === 0 ? profile.photos.length - 1 : p - 1
                                )
                            }
                        />
                        <div
                            className="photo-zone right"
                            onClick={() =>
                                setCurrentPhoto((p) =>
                                    p === profile.photos.length - 1 ? 0 : p + 1
                                )
                            }
                        />

                        {/* Dot indicators */}
                        <div className="photo-dots">
                            {profile.photos.map((_, i) => (
                                <span
                                    key={i}
                                    className={`dot ${i === currentPhoto ? 'active' : ''}`}
                                    onClick={() => setCurrentPhoto(i)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Thumbnail strip */}
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

                {/* Right — Info */}
                <div className="pv-info">
                    <h2 className="pv-name">{profile.displayName}</h2>
                    <p className="pv-joined">
                        Joined {new Date(profile.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>

                    <div className="pv-divider" />

                    <p className="pv-bio">{profile.bio}</p>

                    <div className="pv-divider" />

                    <button
                        className="btn-primary full"
                        onClick={() => navigate(`/messages/${profile.id}`)}
                    >
                        Send a Message
                    </button>
                </div>
            </div>
        </div>
    );
}