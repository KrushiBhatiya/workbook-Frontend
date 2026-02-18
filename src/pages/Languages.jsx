import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

const Languages = () => {
    const [languages, setLanguages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLanguages = async () => {
        try {
            const { data } = await api.get('/languages');
            setLanguages(data);
        } catch (error) {
            console.error('Error fetching languages:', error);
        }
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (currentLanguage) {
                await api.put(`/languages/${currentLanguage._id}`, formData);
            } else {
                await api.post('/languages', formData);
            }
            fetchLanguages();
            closeModal();
        } catch (error) {
            console.error('Error saving language:', error);
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (language) => {
        if (window.confirm('Are you sure you want to delete this language?')) {
            try {
                await api.delete(`/languages/${language._id}`);
                fetchLanguages();
            } catch (error) {
                console.error('Error deleting language:', error);
            }
        }
    };

    const openModal = (language = null) => {
        if (language) {
            setCurrentLanguage(language);
            setFormData({ name: language.name });
        } else {
            setCurrentLanguage(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentLanguage(null);
        setFormData({ name: '' });
    };

    const columns = [
        { header: 'Language Name', accessor: 'name' },
        { header: 'Created At', render: (row) => new Date(row.createdAt).toLocaleDateString() }
    ];

    const filteredLanguages = languages.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Language Management</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Language
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Filter by language name..."
                    className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredLanguages}
                onEdit={openModal}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={currentLanguage ? 'Edit Language' : 'Add Language'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Language Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:bg-indigo-400"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Languages;
