export default function VideoBackground() {
    return (
        <div className="video-bg">
            <video autoPlay muted loop playsInline>
                {/* Use a royalty-free video from mixkit.co or pexels.com */}
                <source src="/bg-video.mp4" type="video/mp4" />
            </video>
            <div className="video-overlay" />
        </div>
    );
}