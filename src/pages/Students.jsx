import { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { Plus, Eye } from 'lucide-react';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterName, setFilterName] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // History modal state
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyStudent, setHistoryStudent] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const initialFormState = {
        name: '',
        email: '',
        password: '',
        batchTime: '',
        contact: '',
        courseId: '',
        allowedLanguageIds: []
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        // Fetch Students
        try {
            const { data } = await api.get('/students');
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }

        // Fetch Courses
        try {
            const { data } = await api.get('/courses');
            console.log('Fetched Courses:', data);
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }

        // Fetch Languages
        try {
            const { data } = await api.get('/languages');
            setLanguages(data);
        } catch (error) {
            console.error('Error fetching languages:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (currentStudent) {
                // Don't send password if empty (backend handles this check)
                const dataToSend = { ...formData };
                if (!dataToSend.password) delete dataToSend.password;

                await api.put(`/students/${currentStudent._id}`, dataToSend);
            } else {
                await api.post('/students', formData);
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error saving student:', error);
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (student) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.delete(`/students/${student._id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting student:', error);
            }
        }
    };

    const openModal = (student = null) => {
        if (student) {
            setCurrentStudent(student);
            setFormData({
                name: student.name,
                email: student.email,
                password: '', // Look blank on edit
                batchTime: student.batchTime,
                contact: student.contact,
                courseId: student.courseId?._id || student.courseId,
                allowedLanguageIds: student.allowedLanguageIds.map(l => l._id || l)
            });
        } else {
            setCurrentStudent(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentStudent(null);
        setFormData(initialFormState);
    };

    // Filter students
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(filterName.toLowerCase())
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

    const handleFilterNameChange = (e) => {
        setFilterName(e.target.value);
        setCurrentPage(1);
    };

    const openHistoryModal = async (student) => {
        setHistoryStudent(student);
        setHistoryData([]);
        setIsHistoryOpen(true);
        setHistoryLoading(true);
        try {
            const { data } = await api.get(`/submissions/student/${student._id}`);
            setHistoryData(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Batch Time', accessor: 'batchTime' },
        { header: 'Course', render: (row) => row.courseId?.name || '-' },
        {
            header: 'Allowed Languages',
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
        {
            header: 'History',
            render: (row) => (
                <button
                    onClick={(e) => { e.stopPropagation(); openHistoryModal(row); }}
                    title="View Submission History"
                    className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                >
                    <Eye className="w-4 h-4" />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Student Management</h1>
                    <p className="text-gray-500 mt-1">Manage student accounts and access.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Filter by Name..."
                            className="px-4 py-2.5 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            value={filterName}
                            onChange={handleFilterNameChange}
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Student
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={currentItems}
                onEdit={openModal}
                onDelete={handleDelete}
            />

            <Pagination
                totalItems={filteredStudents.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={currentStudent ? 'Edit Student' : 'Add Student'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password {currentStudent && <span className="text-gray-400 text-xs">(Leave blank to keep current)</span>}
                        </label>
                        <input
                            type="password"
                            name="password"
                            required={!currentStudent}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Batch Time</label>
                            <select
                                name="batchTime"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.batchTime}
                                onChange={handleChange}
                            >
                                <option value="">Select Batch Time</option>
                                <option value="8 to 10">8 to 10</option>
                                <option value="10 to 12">10 to 12</option>
                                <option value="12 to 2">12 to 2</option>
                                <option value="2 to 4">2 to 4</option>
                                <option value="4 to 6">4 to 6</option>
                                <option value="6 to 8">6 to 8</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contact</label>
                            <input
                                type="text"
                                name="contact"
                                pattern="\d{10}"
                                maxLength="10"
                                title="Please enter a valid 10-digit contact number."
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.contact}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Course</label>
                        <select
                            name="courseId"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.courseId}
                            onChange={handleChange}
                        >
                            <option value="">Select Course</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>{course.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Access Control: Checkboxes for Languages */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Languages</label>
                        <div className="grid grid-cols-2 gap-2 border p-3 rounded-md max-h-40 overflow-y-auto">
                            {languages
                                .filter(lang => {
                                    if (!formData.courseId) return false;
                                    const selectedCourse = courses.find(c => c._id === formData.courseId);
                                    return selectedCourse?.allowedLanguageIds?.some(al => (al._id || al) === lang._id);
                                })
                                .map(lang => (
                                    <label key={lang._id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={(formData.allowedLanguageIds || []).includes(lang._id)}
                                            onChange={() => handleLanguageToggle(lang._id)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">{lang.name}</span>
                                    </label>
                                ))}
                            {formData.courseId && languages.filter(lang =>
                                courses.find(c => c._id === formData.courseId)?.allowedLanguageIds?.some(al => (al._id || al) === lang._id)
                            ).length === 0 && (
                                    <p className="text-xs text-red-500 col-span-2">No languages linked to this course.</p>
                                )}
                            {!formData.courseId && (
                                <p className="text-xs text-gray-500 col-span-2">Select a course to see its languages.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
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

            {/* Submission History Modal — same format as Submissions page */}
            {isHistoryOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b flex justify-between items-start bg-indigo-50">
                            <div>
                                <h2 className="text-xl font-bold text-indigo-900">{historyStudent?.name}'s Submissions</h2>
                                <p className="text-indigo-600 text-sm mt-1">Complete submission history — latest first</p>
                                <div className="mt-3 flex items-center flex-wrap gap-2">
                                    <span className="text-sm font-semibold text-gray-700 bg-white px-2 py-1 rounded-md border shadow-sm">
                                        Languages Access ({historyStudent?.allowedLanguageIds?.length || 0}):
                                    </span>
                                    {historyStudent?.allowedLanguageIds?.map(lang => (
                                        <span key={lang._id} className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full border border-indigo-200">
                                            {lang.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsHistoryOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {historyLoading ? (
                                <div className="flex items-center justify-center py-16 text-gray-500">
                                    <svg className="animate-spin h-6 w-6 mr-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading history...
                                </div>
                            ) : historyData.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium text-lg">No submissions yet</p>
                                    <p className="text-sm mt-1">This student hasn't submitted any answers.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {historyData.map((sub, idx) => (
                                        <div key={sub._id} className="border border-gray-200 rounded-lg p-5 hover:border-indigo-200 transition-all bg-gray-50/50">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">Q{idx + 1}</span>
                                                    <h3 className="font-bold text-gray-900">{sub.questionId?.question || 'Unknown Question'}</h3>
                                                </div>
                                                <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded border whitespace-nowrap ml-3">
                                                    {new Date(sub.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Answer</h4>
                                                    <div className="bg-white p-3 rounded border text-sm text-gray-800 whitespace-pre-wrap">
                                                        {sub.answerText}
                                                    </div>
                                                </div>

                                                {sub.imageUrl && (
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Attachment</h4>
                                                        <a
                                                            href={sub.imageUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block group relative rounded-lg overflow-hidden border"
                                                        >
                                                            <img
                                                                src={sub.imageUrl}
                                                                alt="Submission"
                                                                className="w-full h-48 object-cover group-hover:opacity-90 transition"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition">
                                                                <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition transform scale-90 group-hover:scale-100">
                                                                    View Full Size
                                                                </span>
                                                            </div>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3 flex gap-4 text-xs text-gray-500 pt-3 border-t">
                                                <span><span className="font-semibold">Language:</span> {sub.languageId?.name || '-'}</span>
                                                <span><span className="font-semibold">Topic:</span> {sub.topicId?.name || '-'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                {historyData.length > 0 ? `${historyData.length} submission${historyData.length !== 1 ? 's' : ''} total` : ''}
                            </span>
                            <button
                                onClick={() => setIsHistoryOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;

