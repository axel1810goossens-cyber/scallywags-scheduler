import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi';
import './Navbar.scss';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <h1>Scallywags Scheduler</h1>
                </div>

                <div className="navbar-actions">
                    <div className="navbar-user">
                        <FiUser />
                        <span>{currentUser?.email}</span>
                    </div>

                    <button onClick={handleLogout} className="navbar-logout">
                        <FiLogOut />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
