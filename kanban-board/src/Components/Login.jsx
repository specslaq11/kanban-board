import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import './login.css';

function Login({ onClose }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await login(email, password);
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel auth-panel" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Login</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}
                    {isLoading && <LoadingSpinner />}
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" className="auth-submit-button" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login; 