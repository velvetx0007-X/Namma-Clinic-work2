import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, sidebarLinks, activeTab, setActiveTab }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
            {/* Top Navigation */}
            <TopNavbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
            
            {/* Header Spacer */}
            <div className="h-16 w-full flex-shrink-0" />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <Sidebar 
                    links={sidebarLinks} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    isOpen={isMobileSidebarOpen}
                    setIsOpen={setIsMobileSidebarOpen}
                />

                {/* Dashboard Viewport */}
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
