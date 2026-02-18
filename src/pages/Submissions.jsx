import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { Eye, Search, Calendar, X } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Submissions = () => {
    const [stats, setStats] = useState({ submitted: [], notSubmitted: [] });
    const [loading, setLoading] = useState(false);

    // Filters
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');

    const { user } = useContext(AuthContext);

    // Modal
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Faculty Filter
    const [faculties, setFaculties] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const { data } = await api.get('/faculty');
                setFaculties(data);
            } catch (error) {
                console.error('Error fetching faculties:', error);
            }
        };
        fetchFaculties();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/submissions?date=${date}&studentName=${searchQuery}&facultyId=${selectedFaculty}`);
            setStats(data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchSubmissions();
        }, 500);
        return () => clearTimeout(timer);
    }, [date, searchQuery, selectedFaculty]);

    const handleViewDetails = (studentData) => {
        setSelectedStudent(studentData);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Daily Submissions</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <div className="w-full md:w-auto flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-64"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                        <select
                            value={selectedFaculty}
                            onChange={(e) => setSelectedFaculty(e.target.value)}
                            className="pl-4 pr-10 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white h-[42px]"
                        >
                            <option value="">{user?.username || 'Select Faculty'}</option>
                            {faculties
                                .filter(f => f._id !== user?._id)
                                .map((faculty) => (
                                    <option key={faculty._id} value={faculty._id}>
                                        {faculty.username}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 gap-6">

                {/* Submitted Section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-green-800">Submitted Work ({stats.submitted.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">Student</th>
                                    <th className="px-6 py-3 text-left">Batch</th>
                                    <th className="px-6 py-3 text-center">Submissions</th>
                                    <th className="px-6 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
                                ) : stats.submitted.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-8 text-gray-500">No submissions found for this date.</td></tr>
                                ) : (
                                    stats.submitted.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{item.student.name}</div>
                                                <div className="text-sm text-gray-500">{item.student.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{item.student.batchTime}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                                    {item.count} Questions
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleViewDetails(item)}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-full hover:bg-indigo-100 transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Not Submitted Section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-red-800">Not Submitted ({stats.notSubmitted.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">Student</th>
                                    <th className="px-6 py-3 text-left">Batch</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan="2" className="text-center py-8">Loading...</td></tr>
                                ) : stats.notSubmitted.length === 0 ? (
                                    <tr><td colSpan="2" className="text-center py-8 text-gray-500">Everyone has submitted!</td></tr>
                                ) : (
                                    stats.notSubmitted.map((student) => (
                                        <tr key={student._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{student.name}</div>
                                                <div className="text-sm text-gray-500">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{student.batchTime}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b flex justify-between items-start bg-indigo-50">
                            <div>
                                <h2 className="text-xl font-bold text-indigo-900">{selectedStudent.student.name}'s Submissions</h2>
                                <p className="text-indigo-600 text-sm mt-1">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-6">
                                {selectedStudent.submissions.map((sub, idx) => (
                                    <div key={sub._id} className="border border-gray-200 rounded-lg p-5 hover:border-indigo-200 transition-all bg-gray-50/50">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">Q{idx + 1}</span>
                                                <h3 className="font-bold text-gray-900">{sub.questionId?.question || 'Unknown Question'}</h3>
                                            </div>
                                            <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                                                {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">My Answer</h4>
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
                                            <span><span className="font-semibold">Language:</span> {sub.languageId?.name}</span>
                                            <span><span className="font-semibold">Topic:</span> {sub.topicId?.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 text-right">
                            <button
                                onClick={() => setSelectedStudent(null)}
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

export default Submissions;
