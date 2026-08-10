import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../productionLink/productionLink';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new one.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Password reset successful! Please login.');
                navigate('/login');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (error && !token) {
        return <div className="text-center text-red-600 mt-10">{error}</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Reset Password</h2>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;