import { Link } from 'react-router-dom';
import VideoBackground from '../components/shared/VideoBackground';

export default function Landing() {
    return (
        <div className="landing">
            <VideoBackground />
            <div className="landing-content">
                <h1 className="logo">aura</h1>
                <p className="tagline">No algorithm. No approval. Just chemistry.</p>
                <p className="sub">One payment. Real people. Genuine connections.</p>
                <div className="cta-group">
                    <Link to="/register" className="btn-primary">Get Access — $9.99</Link>
                    <Link to="/login" className="btn-ghost">Sign In</Link>
                </div>
            </div>
        </div>
    );
}