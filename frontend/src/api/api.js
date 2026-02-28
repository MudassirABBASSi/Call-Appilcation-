import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

// Admin API
export const adminAPI = {
  getTeachers: () => api.get('/admin/teachers'),
  addTeacher: (teacherData) => api.post('/admin/teachers', teacherData),
  updateTeacher: (id, teacherData) => api.put(`/admin/teachers/${id}`, teacherData),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  getStudents: () => api.get('/admin/students'),
  addStudent: (studentData) => api.post('/admin/students', studentData),
  updateStudent: (id, studentData) => api.put(`/admin/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getClasses: () => api.get('/admin/classes'),
  createClass: (classData) => api.post('/admin/classes', classData),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),
  getAttendanceReport: () => api.get('/admin/attendance-report')
};

// Teacher API
export const teacherAPI = {
  createClass: (classData) => api.post('/teacher/classes', classData),
  getMyClasses: () => api.get('/teacher/classes'),
  getAttendance: (classId) => api.get(`/teacher/attendance/${classId}`),
  getAttendanceReport: () => api.get('/teacher/attendance-report')
};

// Student API
export const studentAPI = {
  getClasses: () => api.get('/student/classes'),
  joinClass: (classId) => api.post(`/student/join/${classId}`)
};

// Attendance API
export const attendanceAPI = {
  markPresent: (classId, studentId) => api.post('/attendance/mark-present', { classId, studentId }),
  markAbsent: (classId, studentId) => api.post('/attendance/mark-absent', { classId, studentId }),
  recordLeaveTime: (classId, studentId) => api.post(`/attendance/record-leave/${classId}/${studentId}`),
  getClassAttendance: (classId) => api.get(`/attendance/class/${classId}`),
  getStudentAttendance: (studentId) => api.get(`/attendance/student/${studentId}`),
  getAttendanceRecord: (classId, studentId) => api.get(`/attendance/${classId}/${studentId}`),
  getAttendanceStats: (classId) => api.get(`/attendance/stats/class/${classId}`),
  getStudentAttendancePercentage: (studentId) => api.get(`/attendance/percentage/${studentId}`),
  updateAttendanceStatus: (classId, studentId, status) => api.put(`/attendance/${classId}/${studentId}`, { status }),
  deleteAttendance: (classId, studentId) => api.delete(`/attendance/${classId}/${studentId}`),
  getStudentClassHistory: (studentId) => api.get(`/attendance/history/${studentId}`)
};

export default api;
