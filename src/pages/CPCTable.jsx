import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, differenceInDays, parseISO } from 'date-fns';
import api from '../utils/api';
import { ArrowLeft, User, Book, Calendar, Clock } from 'lucide-react';

const CPCTable = () => {
    const { languageId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allReports, setAllReports] = useState([]);
    const [languageReports, setLanguageReports] = useState([]);
    const [studentData, setStudentData] = useState(null);
    const [language, setLanguage] = useState(null);
    const [languageTopics, setLanguageTopics] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, reportsRes] = await Promise.all([
                    api.get('/students/me'),
                    api.get('/reports/student')
                ]);

                setStudentData(profileRes.data);
                const allReps = reportsRes.data.data || [];
                setAllReports(allReps);

                // Find current language
                const lang = profileRes.data.allowedLanguageIds?.find(l => l._id === languageId);
                setLanguage(lang);

                // Filter reports for this language
                const langReps = allReps.filter(r =>
                    (r.languageId?._id || r.languageId) === languageId
                );
                setLanguageReports(langReps);
                // Fetch all topics for this language
                const topicsRes = await api.get(`/topics?languageId=${languageId}`);
                setLanguageTopics(topicsRes.data || []);
            } catch (error) {
                console.error('Error fetching CPC data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [languageId]);

    const calculateDays = (start, end) => {
        if (!start) return 0;
        const startDate = parseISO(start);
        const endDate = end ? parseISO(end) : new Date();
        return differenceInDays(endDate, startDate) + 1;
    };

    const processReports = () => {
        // Global latest date across ALL languages
        const sortedAll = [...allReports].sort((a, b) => new Date(b.date) - new Date(a.date));
        const globalLatestDate = sortedAll.length > 0 ? sortedAll[0].date : null;

        // Sort current language reports by date ascending
        const sortedLang = [...languageReports].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Base list comes from all topics in the curriculum
        const topicRows = languageTopics.map(topic => {
            const topicId = topic._id;
            const reportsForTopic = languageReports.filter(r => {
                const ids = Array.isArray(r.topicIds)
                    ? r.topicIds.map(t => t?._id || t)
                    : [];
                return ids.some(id => String(id) === String(topicId));
            });
            
            if (reportsForTopic.length === 0) {
                return {
                    topicId: topicId,
                    topicName: topic.name,
                    order: topic.order ?? 999,
                    startDate: null,
                    endDate: null,
                    totalDays: 0,
                    isStarted: false
                };
            }

            const sortedGroupReps = [...reportsForTopic].sort((a,b) => new Date(a.date) - new Date(b.date));
            const startDate = sortedGroupReps[0].date;
            const langLatestDate = sortedGroupReps[sortedGroupReps.length - 1].date;
            
            let endDate = null;
            let totalDays = 0;

            if (globalLatestDate && new Date(langLatestDate) < new Date(globalLatestDate)) {
                endDate = langLatestDate;
                totalDays = calculateDays(startDate, endDate);
            } else {
                totalDays = calculateDays(startDate, langLatestDate);
            }

            return {
                topicId: topicId,
                topicName: topic.name,
                order: topic.order ?? 999,
                startDate,
                endDate,
                totalDays,
                isStarted: true
            };
        });

        // Sort by Topic Order (syllabus order)
        const sortedRows = [...topicRows].sort((a, b) => a.order - b.order);

        // Assign 'No.' based on syllabus order
        return sortedRows.map((row, idx) => ({ ...row, no: idx + 1 }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const cpcData = processReports();
    const totalSum = cpcData.reduce((acc, row) => acc + row.totalDays, 0);
    const sortedLang = [...languageReports].sort((a, b) => new Date(a.date) - new Date(b.date));
    const overallStartDate = sortedLang.length > 0 ? sortedLang[0].date : null;
    const overallEndDate = sortedLang.length > 0 ? sortedLang[sortedLang.length - 1].date : null;

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/cpc')}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-5 transition-colors font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Selection
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-7 mt-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Student Name</p>
                                <p className="text-base font-bold text-gray-800 truncate">{studentData?.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                <Book className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Language</p>
                                <p className="text-base font-bold text-gray-800 truncate">{language?.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Start Date (Overall)</p>
                                <p className="text-base font-bold text-gray-800">
                                    {overallStartDate ? format(parseISO(overallStartDate), 'dd MMM yyyy') : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">End Date (Overall)</p>
                                <p className="text-base font-bold text-gray-800">
                                    {overallEndDate ? format(parseISO(overallEndDate), 'dd MMM yyyy') : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-4 py-3 text-[13px] font-bold text-gray-500 uppercase tracking-wider w-16">No.</th>
                                    <th className="px-4 py-3 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Topic Name</th>
                                    <th className="px-4 py-3 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th className="px-4 py-3 text-[13px] font-bold text-gray-500 uppercase tracking-wider">End Date</th>
                                    <th className="px-4 py-3 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-center">Days ({totalSum})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {cpcData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500 italic text-sm">
                                            No topics or report data found for this language.
                                        </td>
                                    </tr>
                                ) : (
                                    cpcData.map((row) => (
                                        <tr key={row.no} className="hover:bg-indigo-50/20 transition-colors group">
                                            <td className="px-4 py-3">
                                                <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    {row.no}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-800 text-sm">{row.topicName}</td>
                                            <td className="px-4 py-3 text-gray-600 text-sm">
                                                {row.startDate ? format(parseISO(row.startDate), 'dd MMM yyyy') : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 text-sm">
                                                {row.endDate ? format(parseISO(row.endDate), 'dd MMM yyyy') : (
                                                    row.isStarted ? (
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Ongoing</span>
                                                    ) : '-'
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
                                                    {row.totalDays} {row.totalDays === 1 ? 'Day' : 'Days'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CPCTable;
