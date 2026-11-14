import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // API Gateway එක හරහා Register request එක යැවීම
            // මෙහිදී role එක ස්වයංක්‍රීයවම 'Customer' ලෙස යවයි
            await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
                role: 'Customer' 
            });

            toast.success('Account created successfully! Please sign in.', {
                style: { background: '#08327d', color: '#fff' }
            });
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        toast('Google Sign Up Integration Coming Soon!', { icon: '🚀' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E73E8] to-[#0A45A6] p-4 sm:p-8 font-sans">
            
            <div className="w-full max-w-[1000px] bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[650px] relative">
                
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#1E73E8] rounded-full opacity-90 hidden md:block"></div>

                <div className="w-full md:w-[45%] bg-[#0f4eb5] relative overflow-hidden flex flex-col justify-center p-8 lg:p-12 hidden md:flex">
                    
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#1e61d6] rounded-full mix-blend-multiply opacity-100"></div>
                    <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#0a3a8a] rounded-full mix-blend-multiply opacity-100 shadow-2xl"></div>

                    <div className="relative z-10 flex flex-col items-center text-center bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
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
                            Join us to experience the most intelligent fleet and rental management system.
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-[55%] p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-transparent relative z-10">
                    
                    <h2 className="text-[2.2rem] font-bold text-gray-800 mb-2">Sign up</h2>
                    <p className="text-xs text-gray-400 mb-6 font-medium">Create your DriveSync account to get started</p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        
                        {/* Name Input */}
                        <div className="relative flex items-center bg-[#f4f7f9] rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1E73E8] transition-all">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <input 
                                type="text" 
                                required
                                className="bg-transparent w-full ml-3 outline-none text-sm text-gray-700 font-medium placeholder-gray-400"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Email Input */}
                        <div className="relative flex items-center bg-[#f4f7f9] rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1E73E8] transition-all">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <input 
                                type="email" 
                                required
                                className="bg-transparent w-full ml-3 outline-none text-sm text-gray-700 font-medium placeholder-gray-400"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative flex items-center bg-[#f4f7f9] rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1E73E8] transition-all">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required
                                className="bg-transparent w-full ml-3 outline-none text-sm text-gray-700 font-medium placeholder-gray-400"
                                placeholder="Create Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-xs font-bold text-[#1E73E8] hover:text-[#0A45A6] ml-2 tracking-wide"
                            >
                                {showPassword ? 'HIDE' : 'SHOW'}
                            </button>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-center mt-2 px-1">
                            <label className="flex items-center text-xs font-medium text-gray-500 cursor-pointer">
                                <input type="checkbox" required className="mr-2 w-4 h-4 rounded border-gray-300 text-[#1E73E8] focus:ring-[#1E73E8]" />
                                I agree to the <span className="text-[#1E73E8] ml-1 hover:underline">Terms & Conditions</span>
                            </label>
                        </div>

                        {/* Sign up Button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full rounded-xl py-3.5 mt-2 text-white font-bold tracking-wide transition-all shadow-md
                                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0b2b63] hover:bg-[#071c42] active:scale-[0.98]'}`}
                        >
                            {loading ? 'Creating Account...' : 'Sign up'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-5">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="px-4 text-xs text-gray-400 font-bold uppercase">Or</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>

                    {/* Sign up with Google Button */}
                    <button 
                        type="button" 
                        onClick={handleGoogleSignUp}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl py-3 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign up with Google
                    </button>

                    <p className="mt-6 text-center text-xs text-gray-500 font-semibold">
                        Already have an account?{' '}
                        <a href="/login" className="text-[#1E73E8] font-bold hover:underline">
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;