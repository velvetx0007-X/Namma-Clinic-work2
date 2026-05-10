import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import BrandText from './BrandText';

import NotificationBell from '../NotificationBell';

const TopNavbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        const confirmed = window.confirm("Are you sure you want to logout from NAMMA CLINIC?");
        if (confirmed) {
            logout();
            navigate('/login');
        }
    };

    const getProfileImage = () => {
        if (user?.profilePhoto) {
            return `http://localhost:5000/${user.profilePhoto}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.userName || user?.name || 'User')}&background=10b981&color=fff`;
    };

    return (
        <header className="bg-white/90 backdrop-blur-md dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 fixed top-0 left-0 right-0 z-[1000] h-16 transition-all duration-200">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                
                {/* Left side: Hamburger (Mobile) + Brand */}
                <div className="flex items-center gap-3 lg:gap-4">
                    <button 
                        onClick={onMenuClick}
                        className="p-2 -ml-2 lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    
                    <div className="flex items-center gap-2 lg:gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src={logo} alt="NAMMA CLINIC Logo" className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg object-contain shadow-sm" />
                        <BrandText className="text-lg lg:text-xl hidden sm:flex" />
                    </div>
                </div>

                {/* Right side: Actions & Profile */}
                <div className="flex items-center gap-2 lg:gap-4">
                    <NotificationBell />


                    {/* Profile & Logout Desktop */}
                    <div className="hidden sm:flex items-center gap-3 pl-2 lg:pl-4 border-l border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <img 
                                src={getProfileImage()} 
                                alt="Profile" 
                                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm object-cover"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight">
                                    {user?.role === 'doctor' ? `Dr. ${user?.userName || user?.name}` : (user?.userName || user?.name)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize leading-tight">
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="ml-2 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>

                    {/* Mobile Profile/Logout Icon Only */}
                    <div className="flex items-center gap-3 sm:hidden">
                         <img 
                            src={getProfileImage()} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                        />
                         <button 
                            onClick={handleLogout}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

            </div>
        </header>
    );
};

export default TopNavbar;
