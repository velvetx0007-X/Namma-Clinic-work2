import React from 'react';

const StatCard = ({ icon: Icon, number, label, subtextIcon: SubIcon, subtext, colorClass = "text-blue-500" }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-100 transition-all duration-300 relative overflow-hidden group">
            {/* Background design */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${colorClass} opacity-5 group-hover:scale-110 transition-transform duration-300`} />
            
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').concat('/10')} dark:${colorClass.replace('text-', 'bg-').concat('/20')}`}>
                        <Icon className={colorClass} size={24} />
                    </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                    {number}
                </h3>
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">
                {label}
            </p>

            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                {SubIcon && <SubIcon size={14} className="text-gray-400 dark:text-gray-500" />}
                <span>{subtext}</span>
            </div>
        </div>
    );
};

export default React.memo(StatCard);
