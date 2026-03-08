import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/theme.css';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudents from './pages/admin/ManageStudents';
import ManageClasses from './pages/admin/ManageClasses';
import Reports from './pages/admin/Reports';
import AdminAssignments from './pages/admin/Assignments';
import MessageMonitor from './pages/admin/MessageMonitor';

// Teacher Pages
import TeacherDashboard from './pages/TeacherDashboard';
import CreateClass from './pages/teacher/CreateClass';
import MyClasses from './pages/teacher/MyClasses';
import Attendance from './pages/teacher/Attendance';
import TeacherProfile from './pages/teacher/TeacherProfile';
import StartClass from './pages/teacher/StartClass';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherSubmissions from './pages/teacher/Submissions';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentClasses from './pages/student/StudentClasses';
import StudentProfile from './pages/student/StudentProfile';
import JoinClass from './pages/student/JoinClass';
import StudentAssignments from './pages/student/Assignments';

// Messages Pages
import ChatLayout from './pages/messages/ChatLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  // Fetch CSRF token on app initialization
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf-token', {
          method: 'GET',
          credentials: 'include' // Include cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            localStorage.setItem('csrf-token', data.token);
            console.log('✅ CSRF token fetched and stored');
          }
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };
    
    fetchCsrfToken();
  }, []); // Run once on app mount

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="teachers" element={<ManageTeachers />} />
            <Route path="manage-teachers" element={<ManageTeachers />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="manage-students" element={<ManageStudents />} />
            <Route path="classes" element={<ManageClasses />} />
            <Route path="manage-classes" element={<ManageClasses />} />
            <Route path="create-class" element={<CreateClass />} />
            <Route path="reports" element={<Reports />} />
            <Route path="assignments" element={<AdminAssignments />} />
            <Route path="messages" element={<MessageMonitor />} />
            <Route path="message-monitor" element={<MessageMonitor />} />
          </Route>

          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="create-class" element={<CreateClass />} />
            <Route path="my-classes" element={<MyClasses />} />
            <Route path="attendance/:classId" element={<Attendance />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="start-class/:classId" element={<StartClass />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="submissions/:assignmentId" element={<TeacherSubmissions />} />
            <Route path="messages" element={<ChatLayout />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="classes" element={<StudentClasses />} />
            <Route path="join-class/:classId" element={<JoinClass />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="messages" element={<ChatLayout />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </ThemeProvider>
  );
}

export default App;
