import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import './Login.scss';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Failed to login');
        }

        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="login-blob login-blob-1"></div>
                <div className="login-blob login-blob-2"></div>
                <div className="login-blob login-blob-3"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1 className="login-title">Scallywags</h1>
                        <p className="login-subtitle">Shift Scheduler</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">
                                <FiMail /> Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="manager@scallywags.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <FiLock /> Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner"></span>
                            ) : (
                                <>
                                    <FiLogIn /> Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Manager Access Only</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
