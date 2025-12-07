import { NavLink } from 'react-router-dom';
import { FiCalendar, FiUsers, FiSettings } from 'react-icons/fi';
import './Sidebar.scss';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <NavLink to="/calendar" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <FiCalendar />
                    <span>Calendar</span>
                </NavLink>

                <NavLink to="/employees" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <FiUsers />
                    <span>Employees</span>
                </NavLink>

                <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <FiSettings />
                    <span>Settings</span>
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
