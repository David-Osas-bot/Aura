import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileCard({ profile }) {
    const [currentPhoto, setCurrentPhoto] = useState(0);
    const navigate = useNavigate();

    return (
        <div className="profile-card" onClick={() => navigate(`/profile/${profile.id}`)}>
            {/* Photo */}
            <div className="card-photo-wrapper">
                <img
                    src={profile.photos[currentPhoto]}
                    alt={profile.displayName}
                    className="card-photo"
                />

                {/* Photo dot indicators */}
                {profile.photos.length > 1 && (
                    <div className="photo-dots">
                        {profile.photos.map((_, i) => (
                            <span
                                key={i}
                                className={`dot ${i === currentPhoto ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentPhoto(i);
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Left / Right tap zones to cycle photos */}
                <div
                    className="photo-zone left"
                    onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhoto((p) =>
                            p === 0 ? profile.photos.length - 1 : p - 1
                        );
                    }}
                />
                <div
                    className="photo-zone right"
                    onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhoto((p) =>
                            p === profile.photos.length - 1 ? 0 : p + 1
                        );
                    }}
                />

                {/* Gradient overlay with name */}
                <div className="card-gradient" />
                <div className="card-info">
                    <h3 className="card-name">{profile.displayName}</h3>
                    <p className="card-bio">{profile.bio}</p>
                </div>
            </div>

            {/* Message button */}
            <button
                className="card-msg-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/messages/${profile.id}`);
                }}
            >
                Message
            </button>
        </div>
    );
}