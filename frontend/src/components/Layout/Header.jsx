import React from 'react';
import { MdMenu, MdNotifications } from 'react-icons/md';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Header = ({ toggleSidebar }) => {
    const { admin } = useContext(AuthContext);

    return (
        <header className="h-14 sm:h-16 md:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 md:px-6 z-10 flex-shrink-0 shadow-sm">
            
            {/* Left: Hamburger + App name on mobile */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none flex-shrink-0"
                    aria-label="Toggle sidebar"
                >
                    <MdMenu className="text-2xl" />
                </button>
                {/* Show app name on mobile since sidebar is hidden */}
                <span className="lg:hidden text-base sm:text-lg font-bold text-blue-600 truncate">
                    Diya Market
                </span>
            </div>

            {/* Right: Notifications + User info */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors relative">
                    <MdNotifications className="text-xl sm:text-2xl" />
                    <span className="absolute top-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm sm:text-base md:text-lg flex-shrink-0">
                        {admin?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight">{admin?.username}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
