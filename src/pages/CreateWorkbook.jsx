import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CreateWorkbook = () => {
    const [courses, setCourses] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, languagesRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/languages')
                ]);
                setCourses(coursesRes.data);
                setLanguages(languagesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleLanguageToggle = (langId) => {
        if (selectedLanguages.includes(langId)) {
            setSelectedLanguages(selectedLanguages.filter(id => id !== langId));
        } else {
            setSelectedLanguages([...selectedLanguages, langId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/workbooks', {
                courseId: selectedCourse,
                languages: selectedLanguages
            });
            navigate('/workbooks'); // Redirect to view workbooks
        } catch (error) {
            console.error('Error creating workbook:', error);
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Create Workbook</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                    <select
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <option value="">-- Select Course --</option>
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>{course.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Languages for Workbook
                        {!selectedCourse && <span className="text-red-500 text-xs ml-2">(Please select a course first)</span>}
                    </label>
                    <div className={`grid grid-cols-2 gap-3 p-4 border rounded-lg ${!selectedCourse ? 'bg-gray-50 opacity-60 pointer-events-none' : ''}`}>
                        {languages
                            .filter(lang => {
                                if (!selectedCourse) return false;
                                const course = courses.find(c => c._id === selectedCourse);
                                return course?.allowedLanguageIds?.some(al => (al._id || al) === lang._id);
                            })
                            .map(lang => (
                                <label key={lang._id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                    <input
                                        type="checkbox"
                                        disabled={!selectedCourse}
                                        checked={selectedLanguages.includes(lang._id)}
                                        onChange={() => handleLanguageToggle(lang._id)}
                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="text-gray-700">{lang.name}</span>
                                </label>
                            ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading || !selectedCourse || selectedLanguages.length === 0}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create Workbook'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateWorkbook;
