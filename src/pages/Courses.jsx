import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus } from 'lucide-react';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null); // For edit
    const [formData, setFormData] = useState({ name: '', allowedLanguageIds: [] });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [languages, setLanguages] = useState([]);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        try {
            const { data } = await api.get('/languages');
            setLanguages(data);
        } catch (error) {
            console.error('Error fetching languages:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (currentCourse) {
                await api.put(`/courses/${currentCourse._id}`, formData);
            } else {
                await api.post('/courses', formData);
            }
            fetchCourses();
            closeModal();
        } catch (error) {
            console.error('Error saving course:', error);
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (course) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await api.delete(`/courses/${course._id}`);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    };

    const openModal = (course = null) => {
        if (course) {
            setCurrentCourse(course);
            setFormData({
                name: course.name,
                allowedLanguageIds: course.allowedLanguageIds?.map(l => l._id || l) || []
            });
        } else {
            setCurrentCourse(null);
            setFormData({ name: '', allowedLanguageIds: [] });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentCourse(null);
        setFormData({ name: '', allowedLanguageIds: [] });
    };

    const handleLanguageToggle = (langId) => {
        const currentAllowed = formData.allowedLanguageIds || [];
        if (currentAllowed.includes(langId)) {
            setFormData({
                ...formData,
                allowedLanguageIds: currentAllowed.filter(id => id !== langId)
            });
        } else {
            setFormData({
                ...formData,
                allowedLanguageIds: [...currentAllowed, langId]
            });
        }
    };

    const columns = [
        { header: 'Course Name', accessor: 'name' },
        {
            header: 'Languages',
            render: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row.allowedLanguageIds?.map(lang => (
                        <span key={lang._id} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            {lang.name}
                        </span>
                    ))}
                </div>
            )
        },
        { header: 'Created At', render: (row) => new Date(row.createdAt).toLocaleDateString() }
    ];

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Course Management</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Course
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Filter by course name..."
                    className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredCourses}
                onEdit={openModal}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={currentCourse ? 'Edit Course' : 'Add Course'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Course Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Languages</label>
                        <div className="grid grid-cols-2 gap-2 border p-3 rounded-md max-h-40 overflow-y-auto">
                            {languages.map(lang => (
                                <label key={lang._id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                                    <input
                                        type="checkbox"
                                        checked={(formData.allowedLanguageIds || []).includes(lang._id)}
                                        onChange={() => handleLanguageToggle(lang._id)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">{lang.name}</span>
                                </label>
                            ))}
                        </div>
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

export default Courses;
