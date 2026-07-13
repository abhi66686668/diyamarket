import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    MdDashboard, 
    MdPeopleAlt, 
    MdAssessment, 
    MdSettings,
    MdLogout,
    MdPayment,
    MdInventory
} from 'react-icons/md';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { logout } = useContext(AuthContext);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <MdDashboard /> },
        { name: 'Customers', path: '/customers', icon: <MdPeopleAlt /> },
        { name: 'Products', path: '/products', icon: <MdInventory /> },
        { name: 'Payments', path: '/payments', icon: <MdPayment /> },
        { name: 'Reports', path: '/reports', icon: <MdAssessment /> },
        // { name: 'Settings', path: '/settings', icon: <MdSettings /> },
    ];

    return (
        <aside className={`bg-dark text-white w-64 min-h-screen flex-shrink-0 transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full fixed z-20'}`}>
            <div className="flex items-center justify-center h-20 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-gradient select-none">Diya Market</h1>
            </div>
            
            <nav className="mt-8 px-4 flex flex-col gap-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex items-center px-4 py-3 rounded-xl transition-colors ${
                                isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        <span className="text-xl mr-3">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
                <button 
                    onClick={logout}
                    className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"
                >
                    <MdLogout className="text-xl mr-3" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
