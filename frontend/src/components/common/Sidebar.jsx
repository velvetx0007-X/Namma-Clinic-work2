import React from 'react';
import { X } from 'lucide-react';

const Sidebar = ({ links, activeTab, setActiveTab, isOpen, setIsOpen }) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside 
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64 bg-white/95 backdrop-blur-md dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
                    transform transition-all duration-300 ease-in-out shadow-[-4px_0_24px_rgba(0,0,0,0.02)]
                    flex flex-col h-screen
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = activeTab === link.id;
                        return (
                            <button
                                key={link.id}
                                onClick={() => {
                                    if (link.action) {
                                        link.action();
                                    } else {
                                        setActiveTab(link.id);
                                    }
                                    setIsOpen(false); // Close on mobile after click
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                    ${isActive 
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium' 
                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                                    }
                                `}
                            >
                                <Icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} />
                                <span className="text-sm">{link.label}</span>
                            </button>
                        );
                    })}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
