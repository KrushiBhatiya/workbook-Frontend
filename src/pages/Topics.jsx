import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

const Topics = () => {
    const [topics, setTopics] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [formData, setFormData] = useState({ name: '', languageId: '' });
    const [loading, setLoading] = useState(false);
    const [filterLanguage, setFilterLanguage] = useState('');
    const [topicQuery, setTopicQuery] = useState('');

    const fetchData = async () => {
        try {
            const [topicsRes, languagesRes] = await Promise.all([
                api.get('/topics'),
                api.get('/languages')
            ]);
            setTopics(topicsRes.data);
            setLanguages(languagesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (currentTopic) {
                await api.put(`/topics/${currentTopic._id}`, formData);
            } else {
                await api.post('/topics', formData);
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error saving topic:', error);
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (topic) => {
        if (window.confirm('Are you sure you want to delete this topic?')) {
            try {
                await api.delete(`/topics/${topic._id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting topic:', error);
            }
        }
    };

    const openModal = (topic = null) => {
        if (topic) {
            setCurrentTopic(topic);
            setFormData({
                name: topic.name,
                languageId: topic.languageId?._id || topic.languageId
            });
        } else {
            setCurrentTopic(null);
            setFormData({ name: '', languageId: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTopic(null);
        setFormData({ name: '', languageId: '' });
    };

    const filteredTopics = topics.filter(topic => {
        const matchesLanguage = filterLanguage ? (topic.languageId?._id || topic.languageId) === filterLanguage : true;
        const matchesName = topic.name.toLowerCase().includes(topicQuery.toLowerCase());
        return matchesLanguage && matchesName;
    });

    const columns = [
        { header: 'Topic Name', accessor: 'name' },
        { header: 'Language', render: (row) => row.languageId?.name || '-' }
    ];

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Topic Management</h1>
                <div className="flex gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search topics..."
                        className="px-4 py-2 border rounded-lg w-full md:w-64"
                        value={topicQuery}
                        onChange={(e) => setTopicQuery(e.target.value)}
                    />
                    <select
                        className="px-4 py-2 border rounded-lg w-full md:w-64"
                        value={filterLanguage}
                        onChange={(e) => setFilterLanguage(e.target.value)}
                    >
                        <option value="">All Languages</option>
                        {languages.map(lang => (
                            <option key={lang._id} value={lang._id}>{lang.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Topic
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredTopics}
                onEdit={openModal}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={currentTopic ? 'Edit Topic' : 'Add Topic'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Language</label>
                        <select
                            name="languageId"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.languageId}
                            onChange={(e) => setFormData({ ...formData, languageId: e.target.value })}
                        >
                            <option value="">Select Language</option>
                            {languages.map(lang => (
                                <option key={lang._id} value={lang._id}>{lang.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Topic Name</label>
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

export default Topics;
