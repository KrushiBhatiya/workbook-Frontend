import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const isEmail = formData.identifier.includes('@');
            const payload = isEmail
                ? { email: formData.identifier, password: formData.password }
                : { username: formData.identifier, password: formData.password };

            const user = await login(payload);
            toast.success('Login successful!');
            navigate(user.role === 'faculty' ? '/dashboard' : '/my-workbook');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex text-gray-900 bg-gray-50 p-4 sm:p-8">
            <div className="w-full max-w-md m-auto bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 sm:p-10 border border-gray-100">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">CDMI TechX</h2>
                    {/* <p className="text-gray-500">Log in to your account to continue.</p> */}
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-6 text-sm font-medium border border-rose-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Username or Email</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                        >
                            Sign In
                        </button>
                    </div>
                </form>

                {/* <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                            Register now
                        </Link>
                    </p>
                </div> */}
            </div>
        </div>
    );
};

export default Login;
