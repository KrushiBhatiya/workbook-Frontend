import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { Plus } from 'lucide-react';

const Questions = () => {
    const [questions, setQuestions] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [topics, setTopics] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [formData, setFormData] = useState({
        question: '',
        languageId: '',
        topicId: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [fullScreenImage, setFullScreenImage] = useState(null); // Full screen preview state
    const [loading, setLoading] = useState(false);
    const [filterLanguage, setFilterLanguage] = useState('');
    const [filterTopic, setFilterTopic] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchData = async () => {
        try {
            const [questionsRes, languagesRes, topicsRes] = await Promise.all([
                api.get('/questions'),
                api.get('/languages'),
                api.get('/topics')
            ]);
            setQuestions(questionsRes.data);
            setLanguages(languagesRes.data);
            setTopics(topicsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Derived state for available topics in form based on selected language
    const formTopics = topics.filter(t => {
        const tLangId = t.languageId?._id || t.languageId;
        return tLangId === formData.languageId;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.question && !formData.image && (!currentQuestion || !currentQuestion.imageUrl)) {
            alert('Please provide either question text or an image.');
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('question', formData.question);
        data.append('languageId', formData.languageId);
        data.append('topicId', formData.topicId);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (currentQuestion) {
                await api.put(`/questions/${currentQuestion._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/questions', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error saving question:', error);
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (question) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                await api.delete(`/questions/${question._id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting question:', error);
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit.');
                return;
            }
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const openModal = (question = null) => {
        if (question) {
            const langId = question.languageId?._id || question.languageId;
            setCurrentQuestion(question);
            setFormData({
                question: question.question || '',
                languageId: langId,
                topicId: question.topicId?._id || question.topicId,
                image: null
            });
            setImagePreview(question.imageUrl);
        } else {
            setCurrentQuestion(null);
            setFormData({ question: '', languageId: '', topicId: '', image: null });
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentQuestion(null);
        setFormData({ question: '', languageId: '', topicId: '', image: null });
        setImagePreview(null);
    };

    const filteredQuestions = questions.filter(q => {
        const qLangId = q.languageId?._id || q.languageId;
        const qTopicId = q.topicId?._id || q.topicId;
        const matchesLanguage = filterLanguage ? qLangId === filterLanguage : true;
        const matchesTopic = filterTopic ? qTopicId === filterTopic : true;
        return matchesLanguage && matchesTopic;
    });

    // Filter topics for the filter dropdown
    const filterTopics = filterLanguage
        ? topics.filter(t => (t.languageId?._id || t.languageId) === filterLanguage)
        : [];

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);

    const handleLanguageFilterChange = (e) => {
        setFilterLanguage(e.target.value);
        setFilterTopic(''); // Reset topic filter on language change
        setCurrentPage(1);
    };

    const handleTopicFilterChange = (e) => {
        setFilterTopic(e.target.value);
        setCurrentPage(1);
    };

    const columns = [
        {
            header: 'Question',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    {row.question && <p className="line-clamp-2">{row.question}</p>}
                    {row.imageUrl && (
                        <img
                            src={row.imageUrl}
                            alt="Question"
                            className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setFullScreenImage(row.imageUrl)}
                        />
                    )}
                </div>
            )
        },
        { header: 'Language', render: (row) => row.languageId?.name || '-' },
        { header: 'Topic', render: (row) => row.topicId?.name || '-' }
    ];

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Question Management</h1>
                    <p className="text-gray-500 mt-1">Create and manage your question bank.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="w-full md:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Question
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative w-full sm:w-64">
                    <select
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm appearance-none cursor-pointer"
                        value={filterLanguage}
                        onChange={handleLanguageFilterChange}
                    >
                        <option value="">All Languages</option>
                        {languages.map(lang => (
                            <option key={lang._id} value={lang._id}>{lang.name}</option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full sm:w-64">
                    <select
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                        value={filterTopic}
                        onChange={handleTopicFilterChange}
                        disabled={!filterLanguage}
                    >
                        <option value="">All Topics</option>
                        {filterTopics.map(topic => (
                            <option key={topic._id} value={topic._id}>{topic.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={currentItems}
                onEdit={openModal}
                onDelete={handleDelete}
            />

            <Pagination
                totalItems={filteredQuestions.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={currentQuestion ? 'Edit Question' : 'Add Question'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Language</label>
                        <select
                            name="languageId"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.languageId}
                            onChange={(e) => setFormData({
                                ...formData,
                                languageId: e.target.value,
                                topicId: '' // Reset topic on language change
                            })}
                        >
                            <option value="">Select Language</option>
                            {languages.map(lang => (
                                <option key={lang._id} value={lang._id}>{lang.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Topic</label>
                        <select
                            name="topicId"
                            required
                            disabled={!formData.languageId}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                            value={formData.topicId}
                            onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                        >
                            <option value="">Select Topic</option>
                            {formTopics.map(topic => (
                                <option key={topic._id} value={topic._id}>{topic.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Question Text</label>
                        <textarea
                            rows="3"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            placeholder="Type question text here..."
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Question Image</label>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {imagePreview && (
                            <div className="mt-2 relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-40 rounded border"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, image: null });
                                        setImagePreview(currentQuestion?.imageUrl || null);
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Allowed: JPG, JPEG, PNG (Max 5MB). Either text or image is required.</p>
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

            {/* Full Screen Image Preview Modal */}
            {fullScreenImage && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
                    onClick={() => setFullScreenImage(null)}
                >
                    <div className="relative max-w-4xl w-full flex items-center justify-center">
                        <button
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-white/10 rounded-full p-2"
                            onClick={() => setFullScreenImage(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={fullScreenImage}
                            alt="Full screen preview"
                            className="max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Questions;

