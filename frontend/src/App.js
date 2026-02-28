import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudents from './pages/admin/ManageStudents';
import ManageClasses from './pages/admin/ManageClasses';
import Reports from './pages/admin/Reports';
import AdminAssignments from './pages/admin/Assignments';

// Teacher Pages
import TeacherDashboard from './pages/TeacherDashboard';
import CreateClass from './pages/teacher/CreateClass';
import MyClasses from './pages/teacher/MyClasses';
import Attendance from './pages/teacher/Attendance';
import TeacherProfile from './pages/teacher/TeacherProfile';
import StartClass from './pages/teacher/StartClass';
import TeacherAssignments from './pages/teacher/Assignments';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentClasses from './pages/student/StudentClasses';
import StudentProfile from './pages/student/StudentProfile';
import JoinClass from './pages/student/JoinClass';
import StudentAssignments from './pages/student/Assignments';

// Protected Route Component
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
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-teachers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-class"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assignments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAssignments />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/create-class"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CreateClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/my-classes"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <MyClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance/:classId"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/start-class/:classId"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <StartClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherAssignments />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/classes"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/join-class/:classId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <JoinClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentAssignments />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
