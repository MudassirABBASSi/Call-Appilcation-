import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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
    
    // Add CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
    const csrfToken = localStorage.getItem('csrf-token');
    if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      config.headers['x-csrf-token'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralize auth/session failure behavior to avoid scattered handling.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  verifyResetToken: (token) => api.get(`/auth/verify-reset-token/${token}`)
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

// Classes API
export const classesAPI = {
  getAllClasses: () => api.get('/classes/list'),
  getActiveClasses: () => api.get('/classes/active'),
  getClassDetails: (classId) => api.get(`/classes/${classId}`),
  getClassStudents: (classId) => api.get(`/classes/${classId}/students`),
  getTeacherStudents: (teacherId) => api.get(`/classes/teacher/${teacherId}/students`),
  createClass: (classData) => api.post('/classes', classData),
  updateClass: (classId, classData) => api.put(`/classes/${classId}`, classData),
  deleteClass: (classId) => api.delete(`/classes/${classId}`),
  enrollStudent: (classId) => api.post(`/classes/${classId}/enroll`),
  getStudentClasses: () => api.get('/classes/student/my-classes'),
  unenrollStudent: (classId) => api.delete(`/classes/${classId}/unenroll`)
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  getUnreadNotifications: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/count'),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`)
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

// Courses API
export const coursesAPI = {
  createCourse: (courseData) => api.post('/courses', courseData),
  getAllCourses: () => api.get('/courses'),
  getCourseById: (id) => api.get(`/courses/${id}`),
  getCoursesByTeacher: (teacherId) => api.get(`/courses/teacher/${teacherId}`),
  getEnrolledStudents: (courseId) => api.get(`/courses/${courseId}/students`),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollStudent: (courseId, studentId) => api.post('/courses/enroll', { courseId, studentId }),
  unenrollStudent: (courseId, studentId) => api.post('/courses/unenroll', { courseId, studentId }),
  checkEnrollment: (courseId) => api.get(`/courses/${courseId}/check-enrollment`)
};

// Assignments API
export const assignmentsAPI = {
  createAssignment: (assignmentData) => api.post('/assignments', assignmentData),
  getAllAssignments: () => api.get('/assignments'),
  getAssignmentById: (id) => api.get(`/assignments/${id}`),
  getAssignmentsByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  getAssignmentsByTeacher: (teacherId) => api.get(`/assignments/teacher/${teacherId}`),
  getMyAssignments: () => api.get('/assignments/student/my-assignments'),
  getAssignmentSubmissions: (assignmentId) => api.get(`/assignments/${assignmentId}/submissions`),
  updateAssignment: (id, assignmentData) => api.put(`/assignments/${id}`, assignmentData),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`)
};

// Submissions API
export const submissionsAPI = {
  submitAssignment: (submissionData) => api.post('/submissions', submissionData),
  getSubmissionById: (id) => api.get(`/submissions/${id}`),
  getSubmissionsByAssignment: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
  getMySubmissions: () => api.get('/submissions/my-submissions'),
  getStudentSubmission: (assignmentId, studentId) => api.get(`/submissions/assignment/${assignmentId}/student/${studentId}`),
  gradeSubmission: (id, gradesData) => api.put(`/submissions/${id}/grade`, gradesData),
  deleteSubmission: (id) => api.delete(`/submissions/${id}`),
  checkSubmissionExists: (assignmentId) => api.get(`/submissions/check/${assignmentId}`)
};

// Messages API
export const messagesAPI = {
  sendMessage: (messageData) => api.post('/messages/send', messageData),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
  getContacts: () => api.get('/messages/contacts'),
  getAllMessages: (params) => api.get('/admin/messages', { params }) // Admin only
};

// Conversations API (Admin monitoring)
export const conversationsAPI = {
  getAllConversations: (params) => api.get('/conversations', { params }),
  getConversationMessages: (conversationId, params) => api.get(`/conversations/${conversationId}/messages`, { params }),
  getTeacherConversations: (teacherId, params) => api.get(`/conversations/teacher/${teacherId}`, { params }),
  getStudentConversations: (studentId, params) => api.get(`/conversations/student/${studentId}`, { params })
};

// CSRF API
export const csrfAPI = {
  getToken: () => api.get('/csrf-token')
};

// Update response interceptor to handle CSRF errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle CSRF token validation failures
    if (error?.response?.status === 403 && error?.response?.data?.error === 'INVALID_CSRF_TOKEN') {
      // Clear invalid CSRF token and fetch new one
      localStorage.removeItem('csrf-token');
      console.warn('CSRF token invalid. Please refresh the page.');
      // Optionally trigger a page refresh or token refresh
      return Promise.reject({
        ...error,
        message: 'Security token expired. Please refresh the page.'
      });
    }
    
    // Handle authentication failures
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export default api;
