import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/appConfig';

const BrandPanel = ({ subtitle, roundedSide = 'left' }) => {
    const roundedClass =
        roundedSide === 'left'
            ? 'rounded-l-[2rem]'
            : 'rounded-r-[2rem]';

    return (
        <div
            className={`w-full h-full bg-[#0f4eb5] relative overflow-hidden flex flex-col justify-center p-8 lg:p-12 ${roundedClass}`}
        >
            {/* Background decorative circles */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#1e61d6] rounded-full mix-blend-multiply opacity-100 pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#0a3a8a] rounded-full mix-blend-multiply opacity-100 shadow-2xl pointer-events-none" />

            {/* Glassmorphism Card */}
            <div className="relative z-10 flex flex-col items-center text-center bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]">
                <div className="bg-white p-3 rounded-2xl shadow-xl mb-6 transform transition-transform hover:scale-105 duration-300">
                    <img
                        src="/drivesync_logo.png"
                        alt="DriveSync Logo"
                        className="w-24 h-24 object-contain rounded-xl"
                    />
                </div>

                <h2 className="text-[2rem] font-extrabold text-white mb-3 tracking-wide drop-shadow-md">
                    DriveSync
                </h2>

                <p className="text-blue-50 text-sm leading-relaxed max-w-[250px] font-medium opacity-90">
                    {subtitle}
                </p>
            </div>
        </div>
    );
};

const AuthBook = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isSignUp = location.pathname === '/register';

    // Track whether the user has flipped pages after initial load
    const [hasInteracted, setHasInteracted] = useState(isSignUp);

    // Sign In state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Sign Up state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regLoading, setRegLoading] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);

    useEffect(() => {
        if (isSignUp) {
            setHasInteracted(true);
        }
    }, [isSignUp]);

    const switchToSignUp = (e) => {
        if (e) e.preventDefault();
        setHasInteracted(true);
        navigate('/register');
    };

    const switchToSignIn = (e) => {
        if (e) e.preventDefault();
        setHasInteracted(true);
        navigate('/login');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email: loginEmail,
                password: loginPassword,
            });

            const loggedUser = response.data.user;
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(loggedUser));

            toast.success('Successfully logged in!', {
                style: { background: '#08327d', color: '#fff' },
            });

            const returnTo = location.state?.from;
            const pendingVehicleId = location.state?.vehicleId;
            const isAdminUser = String(loggedUser?.role || '').toLowerCase() === 'admin';

            setTimeout(() => {
                if (returnTo) {
                    navigate(returnTo, { replace: true, state: { vehicleId: pendingVehicleId } });
                } else {
                    navigate(isAdminUser ? '/payments/dashboard' : '/catalog', { replace: true });
                }
            }, 1000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/api/auth/register`, {
                name: regName,
                email: regEmail,
                password: regPassword,
                role: 'Customer',
            });

            toast.success('Account created successfully! Please sign in.', {
                style: { background: '#08327d', color: '#fff' },
            });

            setRegName('');
            setRegEmail('');
            setRegPassword('');

            setTimeout(() => {
                switchToSignIn();
            }, 1200);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setRegLoading(false);
        }
    };

    const handleGoogleAuth = (mode) => {
        toast(`Google ${mode} Integration Coming Soon!`, { icon: '🚀' });
    };

    const renderSignInForm = () => (
        <div className="w-full h-full bg-white p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative overflow-hidden rounded-[2rem] md:rounded-l-none md:rounded-r-[2rem]">
            <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-[#1E73E8] rounded-full opacity-90 hidden md:block pointer-events-none" />

            <div className="relative z-10">
                <h2 className="text-[2.1rem] font-bold text-gray-800 mb-1.5">Sign in</h2>
                <p className="text-xs text-gray-400 mb-7 font-medium">Log in to your account to continue</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email Input */}
                    <div className="relative flex items-center bg-[#f4f7f9] rounded-xl px-4 py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1E73E8] transition-all">
                        <svg className="w-5 h-5 text-gray-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="email"
                            required
                            className="bg-transparent w-full ml-3 outline-none text-sm text-gray-700 font-medium placeholder-gray-400"
                            placeholder="Email Address"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative flex items-center bg-[#f4f7f9] rounded-xl px-4 py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1E73E8] transition-all">
                        <svg className="w-5 h-5 text-gray-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <input
                            type={showLoginPassword ? 'text' : 'password'}
                            required
                            className="bg-transparent w-full ml-3 outline-none text-sm text-gray-700 font-medium placeholder-gray-400"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="text-xs font-bold text-[#1E73E8] hover:text-[#0A45A6] ml-2 tracking-wide"
                        >
                            {showLoginPassword ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>

                    {/* Remember me & Forgot Password */}
                    <div className="flex items-center justify-between mt-2 px-1">
                        <label className="flex items-center text-xs font-medium text-gray-500 cursor-pointer">
                            <input type="checkbox" className="mr-2 w-4 h-4 rounded border-gray-300 text-[#1E73E8] focus:ring-[#1E73E8]" />
                            Remember me
                        </label>
                        <a href="#" className="text-xs font-bold text-[#1E73E8] hover:underline">
                            Forgot Password?
                        </a>
                    </div>

                    {/* Sign in Button */}
                    <button
                        type="submit"
                        disabled={loginLoading}
                        className={`w-full rounded-xl py-3.5 mt-2 text-white font-bold tracking-wide transition-all shadow-md cursor-pointer
                            ${loginLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0b2b63] hover:bg-[#071c42] active:scale-[0.98]'}`}
                    >
                        {loginLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-5">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="px-4 text-xs text-gray-400 font-bold uppercase">Or</span>
                    <div className="flex-1 border-t border-gray-200" />
                </div>

                {/* Sign in with Google Button */}
                <button
                    type="button"
                    onClick={() => handleGoogleAuth('Login')}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl py-3 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] cursor-pointer"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                </button>

                <p className="mt-7 text-center text-xs text-gray-500 font-semibold">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={switchToSignUp}
                        className="text-[#1E73E8] font-bold hover:underline cursor-pointer"
                    >
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );

    const renderSignUpForm = () => (
        <div className="w-full h-full bg-white p-8 sm:p-11 lg:p-12 flex flex-col justify-center relative overflow-hidden rounded-[2rem] md:rounded-r-none md:rounded-l-[2rem]">
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#1E73E8] rounded-full opacity-90 hidden md:block pointer-events-none" />

            <div className="relative z-10">
                <h2 className="text-[2.1rem] font-bold text-gray-800 mb-1.5">Sign up</h2>
                <p className="text-xs text-gray-400 mb-6 font-medium">Create your DriveSync account to get started</p>

                <form onSubmit={handleRegister} className="space-y-3.5">
                    {/* Name Input */}
                    <div className="relative flex items-center bg-[#f4f7f9] rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1E73E8] transition-all">
                        <svg className="w-5 h-5 text-gray-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="text"
                            required
                            className="bg-transparent w-full ml-3 outline-none text-sm text-gray-700 font-medium placeholder-gray-400"
                            placeholder="Full Name"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                        />
                    </div>

                    {/* Email Input */}
                    <div className="relative flex items-center bg-[#f4f7f9] rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1E73E8] transition-all">
                        <svg className="w-5 h-5 text-gray-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <input
                            type="email"
                            required
                            className="bg-transparent w-full ml-3 outline-none text-sm text-gray-700 font-medium placeholder-gray-400"
                            placeholder="Email Address"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative flex items-center bg-[#f4f7f9] rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1E73E8] transition-all">
                        <svg className="w-5 h-5 text-gray-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            className="bg-transparent w-full ml-3 outline-none text-sm text-gray-700 font-medium placeholder-gray-400"
                            placeholder="Create Password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="text-xs font-bold text-[#1E73E8] hover:text-[#0A45A6] ml-2 tracking-wide"
                        >
                            {showRegPassword ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-center mt-1 px-1">
                        <label className="flex items-center text-xs font-medium text-gray-500 cursor-pointer">
                            <input type="checkbox" required className="mr-2 w-4 h-4 rounded border-gray-300 text-[#1E73E8] focus:ring-[#1E73E8]" />
                            I agree to the <span className="text-[#1E73E8] ml-1 hover:underline">Terms & Conditions</span>
                        </label>
                    </div>

                    {/* Sign up Button */}
                    <button
                        type="submit"
                        disabled={regLoading}
                        className={`w-full rounded-xl py-3.5 mt-1 text-white font-bold tracking-wide transition-all shadow-md cursor-pointer
                            ${regLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0b2b63] hover:bg-[#071c42] active:scale-[0.98]'}`}
                    >
                        {regLoading ? 'Creating Account...' : 'Sign up'}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="px-4 text-xs text-gray-400 font-bold uppercase">Or</span>
                    <div className="flex-1 border-t border-gray-200" />
                </div>

                {/* Sign up with Google Button */}
                <button
                    type="button"
                    onClick={() => handleGoogleAuth('Sign Up')}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl py-3 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] cursor-pointer"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign up with Google
                </button>

                <p className="mt-5 text-center text-xs text-gray-500 font-semibold">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={switchToSignIn}
                        className="text-[#1E73E8] font-bold hover:underline cursor-pointer"
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E73E8] to-[#0A45A6] p-4 sm:p-8 font-sans overflow-hidden">
            {/* Desktop / Tablet: 3D Open-Book Spread */}
            <div className="hidden md:block w-full max-w-[1000px] book-perspective">
                <div className="relative w-full min-h-[640px] book-preserve-3d rounded-[2rem] shadow-[0_30px_70px_-15px_rgba(5,20,60,0.6)] animate-book-enter">
                    {/* LEFT BASE PAGE: Brand/Logo Panel (revealed in Sign In mode) */}
                    <div
                        className={`absolute inset-y-0 left-0 w-1/2 rounded-l-[2rem] overflow-hidden ${
                            !hasInteracted ? 'animate-book-open-left' : ''
                        }`}
                    >
                        <BrandPanel
                            roundedSide="left"
                            subtitle="The intelligent fleet and rental management system designed for seamless operations."
                        />
                    </div>

                    {/* RIGHT BASE PAGE: Brand/Logo Panel (revealed in Sign Up mode) */}
                    <div className="absolute inset-y-0 right-0 w-1/2 rounded-r-[2rem] overflow-hidden">
                        <BrandPanel
                            roundedSide="right"
                            subtitle="Join us to experience the most intelligent fleet and rental management system."
                        />
                    </div>

                    {/* CENTER BOOK SPINE SHADOW */}
                    <div
                        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-10 z-20"
                        style={{
                            background:
                                'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.14) 55%, rgba(0,0,0,0) 100%)',
                        }}
                    />

                    {/* 3D FLIPPING PAGE LEAF (Swings across center spine between Right <-> Left) */}
                    <div
                        className={`absolute inset-y-0 right-0 w-1/2 book-preserve-3d origin-left transition-transform duration-[850ms] ease-[cubic-bezier(0.645,0.045,0.355,1)] z-30 ${
                            !hasInteracted ? 'animate-book-open-right' : ''
                        }`}
                        style={
                            hasInteracted
                                ? {
                                      transform: isSignUp ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                                  }
                                : undefined
                        }
                    >
                        {/* FRONT FACE: Sign In Form (sits on Right side when not flipped) */}
                        <div
                            className={`absolute inset-0 book-backface-hidden rounded-r-[2rem] overflow-hidden shadow-inner ${
                                isSignUp ? 'pointer-events-none' : 'pointer-events-auto'
                            }`}
                        >
                            {renderSignInForm()}
                        </div>

                        {/* BACK FACE: Sign Up Form (lands on Left side when flipped -180deg) */}
                        <div
                            className={`absolute inset-0 book-backface-hidden rounded-l-[2rem] overflow-hidden shadow-inner ${
                                isSignUp ? 'pointer-events-auto' : 'pointer-events-none'
                            }`}
                            style={{ transform: 'rotateY(180deg)' }}
                        >
                            {renderSignUpForm()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Fallback (< 768px): Clean single-card view */}
            <div className="md:hidden w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-book-enter">
                <div className="bg-[#0f4eb5] p-6 text-center text-white flex items-center justify-center gap-3">
                    <div className="bg-white p-1.5 rounded-xl shadow">
                        <img src="/drivesync_logo.png" alt="DriveSync Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-extrabold tracking-wide">DriveSync</h2>
                        <p className="text-[11px] text-blue-100">Fleet & Rental Management</p>
                    </div>
                </div>
                {isSignUp ? renderSignUpForm() : renderSignInForm()}
            </div>
        </div>
    );
};

export default AuthBook;
