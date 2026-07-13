import React from 'react';
import { MdMenu, MdNotifications } from 'react-icons/md';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Header = ({ toggleSidebar }) => {
    const { admin } = useContext(AuthContext);

    return (
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
            <div className="flex items-center">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
                >
                    <MdMenu className="text-2xl" />
                </button>
            </div>
            
            <div className="flex items-center gap-4">
                <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors relative">
                    <MdNotifications className="text-2xl" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                        {admin?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-gray-800">{admin?.username}</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
