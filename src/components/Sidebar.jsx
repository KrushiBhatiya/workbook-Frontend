import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Languages,
    FileQuestion,
    Book,
    Upload,
    User,
    LogOut,
    Shield,
    FileText,
    Library,
    Files
} from 'lucide-react';

const facultyLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/faculty-management', label: 'Faculty', icon: Shield },
    { path: '/courses', label: 'Courses', icon: BookOpen },
    { path: '/languages', label: 'Languages', icon: Languages },
    { path: '/topics', label: 'Topics', icon: Book },
    { path: '/questions', label: 'Questions', icon: FileQuestion },
    { path: '/students', label: 'Students', icon: Users },
    { path: '/workbooks', label: 'Workbooks', icon: Book },
    { path: '/materials', label: 'Materials', icon: FileText },
    { path: '/submissions', label: 'Submissions', icon: Upload },
];

const studentLinks = [
    { path: '/my-workbook', label: 'My Workbook', icon: BookOpen },
    { path: '/my-materials', label: 'Materials', icon: Files },
    { path: '/profile', label: 'My Profile', icon: User },
    // { path: '/submissions/my', label: 'My Submissions', icon: Upload },
];

const adminLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/faculty-management', label: 'Faculty Management', icon: Shield },
    { path: '/students', label: 'All Students', icon: Users }, // To assign faculty
    { path: '/submissions', label: 'Submissions', icon: Upload },
];

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);

    if (!user) return null;

    let links = [];
    if (user.role === 'admin') {
        links = adminLinks;
    } else if (user.role === 'faculty') {
        links = facultyLinks;
    } else {
        links = studentLinks;
    }

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
            <div className="p-4 text-2xl font-bold border-b border-gray-700">
                Workbook App
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5 mr-3" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm font-semibold">{user.username || user.email}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center p-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
