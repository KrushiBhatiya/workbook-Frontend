import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Users, BookOpen, Languages, ListTree, HelpCircle, FileText } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalCourses: 0,
        totalLanguages: 0,
        totalTopics: 0,
        totalQuestions: 0,
        totalWorkbooks: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
        { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'bg-green-500' },
        { label: 'Total Languages', value: stats.totalLanguages, icon: Languages, color: 'bg-yellow-500' },
        { label: 'Total Topics', value: stats.totalTopics, icon: ListTree, color: 'bg-purple-500' },
        { label: 'Total Questions', value: stats.totalQuestions, icon: HelpCircle, color: 'bg-red-500' },
        { label: 'Total Workbooks', value: stats.totalWorkbooks, icon: FileText, color: 'bg-indigo-500' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 flex items-center">
                        <div className={`p-4 rounded-full ${card.color} text-white mr-4`}>
                            <card.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-500">{card.label}</p>
                            <p className="text-2xl font-bold">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
