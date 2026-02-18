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
        <div>
            <h1 className="text-2xl font-bold mb-6">View Workbook</h1>

            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course to View</label>
                <select
                    className="w-full md:w-1/2 px-4 py-2 border rounded-lg"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                    <option value="">-- Select Course --</option>
                    {courses.map(course => (
                        <option key={course._id} value={course._id}>{course.name}</option>
                    ))}
                </select>
            </div>

            {!selectedCourseId && <p className="text-gray-500">Please select a course to view its workbook.</p>}

            {selectedCourseId && (!selectedCourse || !selectedCourse.allowedLanguageIds || selectedCourse.allowedLanguageIds.length === 0) && (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
                    No languages linked to this course. Please assign languages in the Course section first.
                </div>
            )}

            {selectedCourse && selectedCourse.allowedLanguageIds?.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Mapped Languages</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {selectedCourse.allowedLanguageIds.map(lang => {
                            const isSelected = selectedLanguageId === lang._id;
                            return (
                                <div
                                    key={lang._id}
                                    onClick={() => setSelectedLanguageId(lang._id)}
                                    className={`p-6 rounded-lg cursor-pointer transition-all border-2 ${isSelected
                                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                        : 'border-white bg-white hover:border-indigo-300 shadow'
                                        }`}
                                >
                                    <h3 className="text-lg font-bold flex items-center">
                                        <Book className="w-5 h-5 mr-2" />
                                        {lang.name}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>

                    {selectedLanguageId && (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b">
                                <h3 className="font-bold text-lg">Topics & Questions</h3>
                            </div>
                            <div>
                                {topics.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No topics found for this language.</div>
                                ) : (
                                    topics.map(topic => (
                                        <div key={topic._id} className="border-b last:border-0">
                                            <button
                                                onClick={() => toggleTopic(topic._id)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-medium text-left">{topic.name}</span>
                                                {expandedTopics[topic._id] ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                                            </button>

                                            {expandedTopics[topic._id] && (
                                                <div className="px-4 pb-4 bg-gray-50/50">
                                                    <div className="space-y-2 mt-2 pl-4 border-l-2 border-indigo-200">
                                                        {getQuestionsByTopic(topic._id).length === 0 ? (
                                                            <p className="text-sm text-gray-400 italic">No questions in this topic.</p>
                                                        ) : (
                                                            getQuestionsByTopic(topic._id).map((q, idx) => (
                                                                <div key={q._id} className="p-3 bg-white rounded border border-gray-100 text-sm">
                                                                    <span className="font-bold mr-2 text-indigo-600">Q{idx + 1}.</span>
                                                                    {q.question}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
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
