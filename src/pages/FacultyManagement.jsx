import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Trash2 } from 'lucide-react';

const FacultyManagement = () => {
    const [faculties, setFaculties] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: ''
    });

    const fetchFaculties = async () => {
        try {
            const { data } = await api.get('/faculty');
            setFaculties(data);
        } catch (error) {
            console.error('Error fetching faculties:', error);
        }
    };

    useEffect(() => {
        fetchFaculties();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/faculty', formData);
            fetchFaculties();
            setIsModalOpen(false);
            setFormData({ name: '', username: '', email: '', password: '' });
        } catch (error) {
            console.error('Error adding faculty:', error);
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (faculty) => {
        if (window.confirm('Are you sure you want to delete this faculty?')) {
            try {
                await api.delete(`/faculty/${faculty._id}`);
                fetchFaculties();
            } catch (error) {
                console.error('Error deleting faculty:', error);
            }
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Username', accessor: 'username' },
        { header: 'Email', accessor: 'email' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Faculty Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Faculty
                </button>
            </div>

            <DataTable
                columns={columns}
                data={faculties}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Faculty"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="name" required className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input type="text" name="username" required className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.username} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" required className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.email} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" required className="mt-1 block w-full px-3 py-2 border rounded-md" value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-indigo-600 rounded-md">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FacultyManagement;
