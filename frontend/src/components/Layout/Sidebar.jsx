import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    MdDashboard,
    MdPeopleAlt,
    MdAssessment,
    MdLogout,
    MdPayment,
    MdInventory,
    MdClose
} from 'react-icons/md';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const navItems = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard /> },
    { name: 'Customers', path: '/customers', icon: <MdPeopleAlt /> },
    { name: 'Products', path: '/products', icon: <MdInventory /> },
    { name: 'Payments', path: '/payments', icon: <MdPayment /> },
    { name: 'Reports', path: '/reports', icon: <MdAssessment /> },
];

const Sidebar = ({ isOpen, setIsOpen, onNavClick }) => {
    const { logout } = useContext(AuthContext);

    const handleNav = () => {
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 1024) {
            onNavClick();
        }
    };

    return (
        <>
            {/* Sidebar panel */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-30
                    bg-gray-900 text-white w-64 flex-shrink-0
                    flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:hidden'}
                `}
            >
                {/* Logo + Close button */}
                <div className="flex items-center justify-between h-16 sm:h-20 px-6 border-b border-gray-700 flex-shrink-0">
                    <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 select-none">
                        Diya Market
                    </h1>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 mt-6 px-3 flex flex-col gap-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/'}
                            onClick={handleNav}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`
                            }
                        >
                            <span className="text-xl mr-3 flex-shrink-0">{item.icon}</span>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-gray-700 flex-shrink-0">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors text-sm font-medium"
                    >
                        <MdLogout className="text-xl mr-3 flex-shrink-0" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-gray-900 border-t border-gray-700 flex items-center justify-around px-2 py-1 safe-area-bottom">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-0 ${
                                isActive ? 'text-blue-400' : 'text-gray-500'
                            }`
                        }
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-[10px] font-medium truncate">{item.name}</span>
                    </NavLink>
                ))}
                <button
                    onClick={logout}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all text-red-500 min-w-0"
                >
                    <span className="text-2xl"><MdLogout /></span>
                    <span className="text-[10px] font-medium">Logout</span>
                </button>
            </nav>
        </>
    );
};

export default Sidebar;
