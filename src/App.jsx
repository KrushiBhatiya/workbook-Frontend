import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Students from './pages/Students';
import Languages from './pages/Languages';
import Topics from './pages/Topics';
import Questions from './pages/Questions';
import CreateWorkbook from './pages/CreateWorkbook';
import ViewWorkbooks from './pages/ViewWorkbooks';
import MyWorkbook from './pages/MyWorkbook';
import Profile from './pages/Profile';
import Submissions from './pages/Submissions'; // Faculty view
import FacultyManagement from './pages/FacultyManagement';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute allowedRoles={['faculty', 'student', 'admin']} />}>
            <Route element={<Layout />}>
              {/* Faculty & Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['faculty', 'admin']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/students" element={<Students />} /> {/* Admin needs this to assign faculty */}
                <Route path="/languages" element={<Languages />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/workbooks/create" element={<CreateWorkbook />} />
                <Route path="/workbooks" element={<ViewWorkbooks />} />
                <Route path="/submissions" element={<Submissions />} />
                <Route path="/faculty-management" element={<FacultyManagement />} />
              </Route>

              {/* Admin Only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              </Route>

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/my-workbook" element={<MyWorkbook />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
