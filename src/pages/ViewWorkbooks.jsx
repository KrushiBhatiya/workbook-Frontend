import { useState, useEffect } from 'react';
import api from '../utils/api';
import { ChevronDown, ChevronRight, Book } from 'lucide-react';

const ViewWorkbooks = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [workbookData, setWorkbookData] = useState(null);
    const [topics, setTopics] = useState([]);
    const [questions, setQuestions] = useState([]);

    // Accordion state: { [langId]: { [topicId]: boolean } }
    const [expandedTopics, setExpandedTopics] = useState({});

    // Language selection state for the "Card view"
    const [selectedLanguageId, setSelectedLanguageId] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            const { data } = await api.get('/courses');
            setCourses(data);
        };
        fetchCourses();
    }, []);

    // Use selectedCourse derived from state
    const selectedCourse = courses.find(c => c._id === selectedCourseId);

    // Reset language when course changes
    useEffect(() => {
        setSelectedLanguageId(null);
    }, [selectedCourseId]);

    // When language is selected, fetch topics and questions
    useEffect(() => {
        if (!selectedLanguageId) return;

        const fetchData = async () => {
            try {
                const [topicsRes, questionsRes] = await Promise.all([
                    api.get(`/topics?languageId=${selectedLanguageId}`),
                    api.get(`/questions?languageId=${selectedLanguageId}`)
                ]);
                setTopics(topicsRes.data);
                setQuestions(questionsRes.data);
            } catch (error) {
                console.error('Error fetching topics/questions:', error);
            }
        };
        fetchData();
    }, [selectedLanguageId]);

    const toggleTopic = (topicId) => {
        setExpandedTopics(prev => ({
            ...prev,
            [topicId]: !prev[topicId]
        }));
    };

    const getQuestionsByTopic = (topicId) => {
        return questions.filter(q => (q.topicId?._id || q.topicId) === topicId);
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">View Workbook</h1>
                <p className="text-gray-500 mt-1">Explore course structures, language tracks, and question modules.</p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Course to View</label>
                <div className="relative w-full md:w-1/2">
                    <Book className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                    <select
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm appearance-none cursor-pointer"
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                    >
                        <option value="">-- Select Course --</option>
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>{course.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedCourseId && (
                <div className="text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
                    <p className="text-gray-500 font-medium">Please select a course to view its workbook structure.</p>
                </div>
            )}

            {selectedCourseId && (!selectedCourse || !selectedCourse.allowedLanguageIds || selectedCourse.allowedLanguageIds.length === 0) && (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 shadow-sm flex items-center">
                    <p className="font-medium text-sm">No languages linked to this course. Please assign languages in the Course section first.</p>
                </div>
            )}

            {selectedCourse && selectedCourse.allowedLanguageIds?.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                        Mapped Language Tracks
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {selectedCourse.allowedLanguageIds.map(lang => {
                            const isSelected = selectedLanguageId === lang._id;
                            return (
                                <div
                                    key={lang._id}
                                    onClick={() => setSelectedLanguageId(lang._id)}
                                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 flex items-center gap-3 ${isSelected
                                        ? 'border-indigo-600 bg-indigo-50/80 shadow-md shadow-indigo-100 transform -translate-y-1'
                                        : 'border-transparent bg-white shadow hover:border-indigo-200 hover:shadow-md'
                                        }`}
                                >
                                    <Book className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <h3 className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                                        {lang.name}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>

                    {selectedLanguageId && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                            <div className="p-5 bg-gray-50/80 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    Topics & Questions Outline
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {topics.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <p className="text-gray-400 font-medium">No topics found for this language track.</p>
                                    </div>
                                ) : (
                                    topics.map(topic => (
                                        <div key={topic._id} className="group">
                                            <button
                                                onClick={() => toggleTopic(topic._id)}
                                                className="w-full flex items-center justify-between p-5 hover:bg-indigo-50/50 transition-colors"
                                            >
                                                <span className="font-bold text-gray-800 text-left group-hover:text-indigo-700 transition-colors">{topic.name}</span>
                                                <div className={`p-1.5 rounded-full bg-gray-100 transition-transform duration-300 ${expandedTopics[topic._id] ? 'rotate-180 bg-indigo-100 text-indigo-600' : 'text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                                    <ChevronDown className="w-4 h-4" />
                                                </div>
                                            </button>

                                            <div className={`overflow-hidden transition-all duration-300 ${expandedTopics[topic._id] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="px-5 pb-5 pt-1 bg-gray-50/30">
                                                    <div className="space-y-3 pl-4 border-l-2 border-indigo-200">
                                                        {getQuestionsByTopic(topic._id).length === 0 ? (
                                                            <p className="text-sm text-gray-400 italic py-2">No questions in this topic.</p>
                                                        ) : (
                                                            getQuestionsByTopic(topic._id).map((q, idx) => (
                                                                <div key={q._id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-sm text-gray-700 flex items-start gap-3 hover:border-indigo-200 transition-colors">
                                                                    <span className="font-bold flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs shrink-0 mt-1">
                                                                        Q{idx + 1}
                                                                    </span>
                                                                    <div className="pt-1 leading-relaxed w-full">
                                                                        <div className="mb-2">
                                                                            {q.question || <span className="italic text-gray-400">Image attached Question</span>}
                                                                        </div>
                                                                        {q.imageUrl && (
                                                                            <div className="mt-2">
                                                                                <a href={q.imageUrl} target="_blank" rel="noopener noreferrer">
                                                                                    <img src={q.imageUrl} alt="Question" className="max-h-48 rounded-lg object-contain border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer shadow-sm" />
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewWorkbooks;
