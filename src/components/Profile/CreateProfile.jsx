import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CLOUDINARY_CLOUD_NAME = 'dl0al50jn';
const CLOUDINARY_UPLOAD_PRESET = 'Freedinary';

export default function CreateProfile() {
    const [bio, setBio] = useState('');
    const [photos, setPhotos] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [dragOver, setDragOver] = useState(false);
    const navigate = useNavigate();

    const addPhotos = (files) => {
        const newFiles = Array.from(files);
        const merged = [...photos, ...newFiles].slice(0, 5);
        setPhotos(merged);
        setPreviews(merged.map((f) => URL.createObjectURL(f)));
    };

    const handlePhotos = (e) => addPhotos(e.target.files);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        addPhotos(e.dataTransfer.files);
    };

    const removePhoto = (index) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        setPhotos(newPhotos);
        setPreviews(newPhotos.map((f) => URL.createObjectURL(f)));
    };

    const uploadToCloudinary = async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `aura/profiles/${auth.currentUser.uid}`);
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        );
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message || `Failed to upload photo ${index + 1}`);
        }
        return (await res.json()).secure_url;
    };

    const handleSubmit = async () => {
        setError('');
        if (photos.length < 3) { setError('Please upload at least 3 photos.'); return; }
        if (bio.trim().length < 10) { setError('Please write a longer bio.'); return; }
        setSaving(true);
        try {
            const urls = [];
            for (let i = 0; i < photos.length; i++) {
                setUploadProgress(`Uploading ${i + 1} of ${photos.length}…`);
                urls.push(await uploadToCloudinary(photos[i], i));
            }
            setUploadProgress('Saving profile…');
            await setDoc(doc(db, 'users', auth.currentUser.uid), {
                bio: bio.trim(), photos: urls, profileComplete: true,
                displayName: auth.currentUser.displayName || 'Aura User',
                createdAt: new Date().toISOString(),
            }, { merge: true });
            navigate('/home');
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
            setUploadProgress('');
        }
    };

    const prompts = ["I'm happiest when…", "My love language is…", "I'm looking for…", "Fun fact about me…"];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .cp-wrap {
          min-height: 100vh;
          background: #080810;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
        }

        /* ── LEFT PANEL ── */
        .cp-panel {
          width: 380px;
          flex-shrink: 0;
          background: linear-gradient(175deg, #12121e 0%, #080810 100%);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          padding: 48px 40px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }

        @media (max-width: 900px) { .cp-panel { display: none; } }

        .cp-panel-logo {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #fff;
          margin: 0 0 4px;
        }

        .cp-panel-sub {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.35);
          margin: 0 0 48px;
          letter-spacing: 0.02em;
        }

        .cp-stepper {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 48px;
        }

        .cp-stepper-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          position: relative;
        }

        .cp-stepper-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 15px;
          top: 32px;
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.08);
        }

        .cp-stepper-item.active::after { background: rgba(255,255,255,0.2); }

        .cp-step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          font-weight: 700;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.3);
          transition: all 0.3s;
          margin-top: 2px;
        }

        .cp-stepper-item.active .cp-step-num,
        .cp-stepper-item.done .cp-step-num {
          background: #fff;
          color: #000;
          border-color: #fff;
        }

        .cp-step-label { padding: 6px 0 32px; }
        .cp-step-label h4 {
          font-size: 0.92rem;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          margin: 0 0 3px;
          transition: color 0.3s;
        }
        .cp-stepper-item.active .cp-step-label h4,
        .cp-stepper-item.done .cp-step-label h4 { color: #fff; }

        .cp-step-label p {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.2);
          margin: 0;
          transition: color 0.3s;
        }
        .cp-stepper-item.active .cp-step-label p { color: rgba(255,255,255,0.45); }

        /* Photo fan preview */
        .cp-fan {
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 40px;
        }

        .cp-fan-inner {
          position: relative;
          width: 160px;
          height: 220px;
        }

        .cp-fan-img {
          position: absolute;
          width: 140px;
          height: 190px;
          object-fit: cover;
          border-radius: 18px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cp-fan-placeholder {
          position: absolute;
          width: 140px;
          height: 190px;
          border-radius: 18px;
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(255,255,255,0.08);
        }

        /* ── RIGHT PANEL ── */
        .cp-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
          overflow-y: auto;
        }

        @media (max-width: 600px) { .cp-main { padding: 40px 24px; } }

        .cp-content {
          width: 100%;
          max-width: 520px;
        }

        .cp-heading {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .cp-desc {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.4);
          margin: 0 0 36px;
          line-height: 1.6;
        }

        /* Drop zone */
        .cp-dropzone {
          border: 1.5px dashed rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 40px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(255,255,255,0.02);
          margin-bottom: 24px;
        }

        .cp-dropzone.active {
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.05);
        }

        .cp-dropzone-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 1.4rem;
        }

        .cp-dropzone h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 6px;
        }

        .cp-dropzone p {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
          margin: 0;
        }

        /* Photo grid */
        .cp-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: auto auto;
          gap: 10px;
          margin-bottom: 8px;
        }

        .cp-grid-main {
          grid-row: 1 / 3;
          aspect-ratio: 3/4;
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .cp-grid-side {
          aspect-ratio: 1/1;
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .cp-grid-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .cp-grid-empty {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.15);
          font-size: 1.4rem;
        }

        .cp-main-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 50px;
        }

        .cp-remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0,0,0,0.7);
          border: none;
          color: #fff;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s, background 0.2s;
          z-index: 2;
        }

        .cp-grid-main:hover .cp-remove-btn,
        .cp-grid-side:hover .cp-remove-btn { opacity: 1; }

        .cp-remove-btn:hover { background: rgba(200,40,40,0.9); }

        /* Add more row */
        .cp-more-row {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
        }

        .cp-more-slot {
          flex: 1;
          aspect-ratio: 1/1;
          border-radius: 14px;
          border: 1.5px dashed rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.2);
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,0.02);
        }

        .cp-more-slot:hover {
          border-color: rgba(255,255,255,0.3);
          color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.05);
        }

        .cp-more-slot img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cp-more-slot input { display: none; }

        .cp-photo-status {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
          margin: 0 0 28px;
          text-align: center;
        }

        .cp-photo-status span { color: #fff; font-weight: 600; }

        /* Bio step */
        .cp-bio-wrap {
          position: relative;
          margin-bottom: 8px;
        }

        .cp-bio-textarea {
          width: 100%;
          min-height: 160px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px;
          padding: 20px;
          color: #fff;
          font-size: 1rem;
          font-family: 'DM Sans', sans-serif;
          line-height: 1.7;
          resize: none;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .cp-bio-textarea::placeholder { color: rgba(255,255,255,0.18); }
        .cp-bio-textarea:focus { border-color: rgba(255,255,255,0.25); }

        .cp-char {
          text-align: right;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
          margin: 6px 0 24px;
          transition: color 0.2s;
        }

        .cp-char.warn { color: #f4a261; }

        .cp-prompts-title {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.25);
          font-weight: 600;
          margin: 0 0 12px;
        }

        .cp-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 32px;
        }

        .cp-chip {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          color: rgba(255,255,255,0.55);
          font-size: 0.82rem;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .cp-chip:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.25);
        }

        /* Error */
        .cp-error {
          background: rgba(220,53,69,0.1);
          border: 1px solid rgba(220,53,69,0.3);
          color: #ff6b6b;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          text-align: center;
        }

        /* Progress */
        .cp-progress {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        .cp-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Buttons */
        .cp-actions {
          display: flex;
          gap: 12px;
        }

        .cp-btn-back {
          padding: 15px 24px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .cp-btn-back:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .cp-btn-next {
          flex: 1;
          padding: 15px 24px;
          background: #fff;
          border: none;
          border-radius: 14px;
          color: #000;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }

        .cp-btn-next:hover:not(:disabled) {
          background: rgba(255,255,255,0.88);
          transform: translateY(-1px);
        }

        .cp-btn-next:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          transform: none;
        }

        .cp-hint {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
          text-align: center;
          margin-top: 16px;
        }
      `}</style>

            <div className="cp-wrap">

                {/* ── LEFT PANEL ── */}
                <div className="cp-panel">
                    <div>
                        <h1 className="cp-panel-logo">aura</h1>
                        <p className="cp-panel-sub">Your profile, your story</p>
                    </div>

                    <div className="cp-stepper">
                        {[
                            { n: 1, title: 'Add photos', desc: 'Upload 3–5 of your best shots' },
                            { n: 2, title: 'Write your bio', desc: 'Tell people who you are' },
                        ].map(({ n, title, desc }) => (
                            <div
                                key={n}
                                className={`cp-stepper-item ${step === n ? 'active' : step > n ? 'done' : ''}`}
                            >
                                <div className="cp-step-num">
                                    {step > n ? '✓' : n}
                                </div>
                                <div className="cp-step-label">
                                    <h4>{title}</h4>
                                    <p>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Fan preview */}
                    <div className="cp-fan">
                        <div className="cp-fan-inner">
                            {previews.length === 0 ? (
                                <>
                                    <div className="cp-fan-placeholder" style={{ transform: 'rotate(-6deg) translate(-10px, 10px)' }} />
                                    <div className="cp-fan-placeholder" style={{ transform: 'rotate(-2deg) translate(-4px, 4px)' }} />
                                    <div className="cp-fan-placeholder" style={{ transform: 'rotate(0deg)' }} />
                                </>
                            ) : (
                                previews.slice(0, 3).map((url, i) => (
                                    <img
                                        key={i}
                                        src={url}
                                        className="cp-fan-img"
                                        alt=""
                                        style={{
                                            transform: `rotate(${(i - 1) * 5}deg) translate(${(i - 1) * -8}px, ${i * 6}px)`,
                                            zIndex: i,
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ── MAIN CONTENT ── */}
                <div className="cp-main">
                    <div className="cp-content">

                        {/* STEP 1 — Photos */}
                        {step === 1 && (
                            <>
                                <h2 className="cp-heading">Show your best self</h2>
                                <p className="cp-desc">Your first photo is your main photo — make it count. Upload 3 to 5 photos.</p>

                                {previews.length === 0 ? (
                                    <label
                                        className={`cp-dropzone ${dragOver ? 'active' : ''}`}
                                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                    >
                                        <input type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display: 'none' }} />
                                        <div className="cp-dropzone-icon">📷</div>
                                        <h3>Drop photos here</h3>
                                        <p>or click to browse · JPG, PNG, WEBP · max 10MB each</p>
                                    </label>
                                ) : (
                                    <>
                                        {/* Main grid — first 3 photos */}
                                        <div className="cp-grid">
                                            {/* Main large photo */}
                                            <div className="cp-grid-main">
                                                {previews[0] ? (
                                                    <>
                                                        <img src={previews[0]} className="cp-grid-img" alt="Main" />
                                                        <div className="cp-main-badge">Main Photo</div>
                                                        <button className="cp-remove-btn" onClick={() => removePhoto(0)} type="button">✕</button>
                                                    </>
                                                ) : (
                                                    <div className="cp-grid-empty">＋</div>
                                                )}
                                            </div>

                                            {/* Side photos */}
                                            {[1, 2].map((i) => (
                                                <div key={i} className="cp-grid-side">
                                                    {previews[i] ? (
                                                        <>
                                                            <img src={previews[i]} className="cp-grid-img" alt="" />
                                                            <button className="cp-remove-btn" onClick={() => removePhoto(i)} type="button">✕</button>
                                                        </>
                                                    ) : (
                                                        <label style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <input type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display: 'none' }} />
                                                            <span className="cp-grid-empty">＋</span>
                                                        </label>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Extra photos row */}
                                        {photos.length < 5 && (
                                            <div className="cp-more-row">
                                                {[3, 4].map((i) => (
                                                    <label key={i} className="cp-more-slot">
                                                        <input type="file" accept="image/*" multiple onChange={handlePhotos} />
                                                        {previews[i] ? (
                                                            <>
                                                                <img src={previews[i]} alt="" />
                                                                <button
                                                                    className="cp-remove-btn"
                                                                    style={{ opacity: 1 }}
                                                                    onClick={(e) => { e.preventDefault(); removePhoto(i); }}
                                                                    type="button"
                                                                >✕</button>
                                                            </>
                                                        ) : '＋'}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                <p className="cp-photo-status">
                                    {photos.length === 0
                                        ? 'No photos yet — upload at least 3'
                                        : photos.length < 3
                                            ? <><span>{photos.length}</span> of 3 minimum — add {3 - photos.length} more</>
                                            : <><span>{photos.length} photos</span> selected ✓</>}
                                </p>

                                {error && <div className="cp-error">{error}</div>}

                                <div className="cp-actions">
                                    <button
                                        className="cp-btn-next"
                                        onClick={() => { setError(''); setStep(2); }}
                                        disabled={photos.length < 3}
                                    >
                                        Continue →
                                    </button>
                                </div>

                                <p className="cp-hint">You can always update your photos later</p>
                            </>
                        )}

                        {/* STEP 2 — Bio */}
                        {step === 2 && (
                            <>
                                <h2 className="cp-heading">Tell your story</h2>
                                <p className="cp-desc">Keep it real, keep it you. A good bio gets 3× more messages.</p>

                                <div className="cp-bio-wrap">
                                    <textarea
                                        className="cp-bio-textarea"
                                        placeholder="I'm into long walks, honest conversations, and good food. Looking for someone who laughs easily and isn't afraid to be real…"
                                        maxLength={300}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <p className={`cp-char ${bio.length > 250 ? 'warn' : ''}`}>{bio.length} / 300</p>

                                <p className="cp-prompts-title">Need a nudge?</p>
                                <div className="cp-chips">
                                    {prompts.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            className="cp-chip"
                                            onClick={() => setBio((b) => b ? `${b} ${p}` : p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>

                                {error && <div className="cp-error">{error}</div>}

                                {uploadProgress && (
                                    <div className="cp-progress">
                                        <div className="cp-spinner" />
                                        <span>{uploadProgress}</span>
                                    </div>
                                )}

                                <div className="cp-actions">
                                    <button className="cp-btn-back" onClick={() => setStep(1)} disabled={saving}>
                                        ← Back
                                    </button>
                                    <button
                                        className="cp-btn-next"
                                        onClick={handleSubmit}
                                        disabled={saving || bio.trim().length < 10}
                                    >
                                        {saving ? 'Publishing…' : 'Go Live ✦'}
                                    </button>
                                </div>

                                <p className="cp-hint">By continuing you agree to our community guidelines</p>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}