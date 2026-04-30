import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Landing() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&family=DM+Sans:wght@300;400;500;600;700;800&display=swap"
                rel="stylesheet"
            />

            <div
                className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >

                {/* ── BACKGROUND ── */}
                <div className="absolute inset-0 z-0">
                    {/* 👇 REPLACE THIS WITH YOUR VIDEO */}
                    <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                        <source src="/bg-video.mp4" type="video/mp4" />
                    </video>

                    {/* Placeholder until video added */}
                    <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950" />

                    {/* Desktop: fade from sides + bottom */}
                    <div className="absolute inset-0 hidden md:block bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
                    {/* Mobile: heavy bottom fade */}
                    <div className="absolute inset-0 md:hidden bg-gradient-to-t from-black via-black/40 to-black/60" />
                </div>

                {/* ── NAVBAR ── */}
                <nav className={`relative z-20 flex items-center justify-between px-6 sm:px-10 lg:px-16 pt-8 pb-4 transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
                    <span
                        className="text-white text-3xl font-black tracking-tighter"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        aura
                    </span>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/login" className="text-white/60 hover:text-white text-sm font-semibold transition-colors duration-200 tracking-wide">
                            Sign In
                        </Link>
                        <Link to="/register" className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-white/90 transition-all duration-200 hover:scale-105">
                            Get Access
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button className="md:hidden flex flex-col gap-1.5 p-2 group">
                        <span className="w-6 h-0.5 bg-white/70 group-hover:bg-white transition-colors" />
                        <span className="w-6 h-0.5 bg-white/70 group-hover:bg-white transition-colors" />
                        <span className="w-4 h-0.5 bg-white/70 group-hover:bg-white transition-colors ml-auto" />
                    </button>
                </nav>

                {/* ── DESKTOP LAYOUT: centered hero ── */}
                <div className="hidden md:flex relative z-10 flex-1 flex-col items-center justify-center text-center px-10 pb-20">

                    <div className={`transition-all duration-700 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <h1
                            className="text-white font-black tracking-tighter leading-none"
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: 'clamp(5rem, 10vw, 8.5rem)',
                            }}
                        >
                            Find Your<br />
                            <span className="italic text-white/25">Match</span>
                            <span className="not-italic text-white">™</span>
                        </h1>
                    </div>

                    <p className={`mt-6 max-w-lg text-white/45 text-lg font-light leading-relaxed transition-all duration-700 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        No algorithm. No approval. No swiping.<br />
                        Just real people who paid to be here — same as you.
                    </p>
                    <br />
                    <div className={`mt-10 flex items-center gap-4 transition-all duration-700 delay-[400ms] ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <Link
                            to="/register"
                            className="w-[150px] h-[40px] flex items-center justify-center text-center bg-white text-black font-bold rounded-full"
                        >
                            Create account
                            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                        </Link>
                        <Link
                            to="/login"
                            className="w-[100px] h-[40px] flex items-center justify-center text-center bg-white text-black font-bold rounded-full"
                        >
                            Log in
                        </Link>
                    </div>
                    <br />
                    {/* Trust indicators */}
                    <div className={`mt-10 flex items-center gap-8 transition-all duration-700 delay-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
                        {['One-time payment of £500', 'Lifetime access', 'No subscriptions'].map((text, i) => (
                            <div key={text} className="flex items-center gap-2 text-white/25 text-xs font-medium tracking-wide">
                                {i > 0 && <span className="w-px h-3 bg-white/10" />}
                                {text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── MOBILE LAYOUT ── */}
                <div className="md:hidden relative z-10 flex-1" />

                <div className={`md:hidden relative z-20 px-5 pb-10 flex flex-col items-center gap-3 transition-all duration-700 delay-200 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

                    {/* Mobile headline */}
                    <h1
                        className="text-white font-black tracking-tighter leading-tight text-center mb-3 w-full"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 'clamp(3rem, 14vw, 4.5rem)',
                        }}
                    >
                        Find Your <span className="italic text-white/30">Match</span>™
                    </h1>

                    {/* Create Account - Solid White */}
                    <Link
                        to="/register"
                        className="w-full max-w-[320px] h-[52px] flex items-center justify-center bg-white text-black font-bold rounded-full transition-transform active:scale-95"
                    >
                        Create account
                    </Link>

                    {/* Log in - NOW MATCHES EXACTLY */}
                    <Link
                        to="/login"
                        className="w-full max-w-[320px] h-[52px] flex items-center justify-center bg-white text-black font-bold rounded-full transition-transform active:scale-95"
                    >
                        Log in
                    </Link>

                    {/* Trust Footer */}
                    <div className="text-center mt-2">
                        <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider">
                            One-time payment · Lifetime access
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-white/30 text-[11px] font-medium tracking-wide">Members active now</span>
                        </div>
                    </div>
                </div>                {/* ── Bottom stats bar — desktop only ── */}
                <div className={`hidden md:block absolute bottom-0 left-0 right-0 z-20 border-t border-white/8 bg-black/30 backdrop-blur-md transition-all duration-700 delay-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center justify-between px-16 py-4 max-w-6xl mx-auto">
                        {[
                            { value: '100%', label: 'Verified members' },
                            { value: '£500', label: 'One-time only' },
                            { value: '∞', label: 'Lifetime access' },
                        ].map(({ value, label }) => (
                            <div key={label} className="flex items-center gap-3">
                                <span
                                    className="text-white font-black text-2xl tracking-tighter"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    {value}
                                </span>
                                <span className="text-white/30 text-xs font-medium uppercase tracking-widest">
                                    {label}
                                </span>
                            </div>
                        ))}
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-white/30 text-xs font-medium tracking-wide">Members active now</span>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
















