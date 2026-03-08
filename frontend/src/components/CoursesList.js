import React, { useEffect, useState } from 'react';
import { coursesAPI } from '../api/api';
import { toast } from 'react-toastify';
import CreateCourseModal from './CreateCourseModal';
import '../styles/courses.css';

const CoursesList = ({ userRole }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [userRole]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAllCourses();
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = () => {
    fetchCourses();
    setShowCreateModal(false);
    toast.success('Course created successfully');
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h2>Courses</h2>
        {userRole === 'teacher' && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Course
          </button>
        )}
      </div>

      {showCreateModal && userRole === 'teacher' && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onCourseCreated={handleCourseCreated}
        />
      )}

      {courses.length === 0 ? (
        <div className="no-data">
          {userRole === 'teacher'
            ? 'You have not created any courses yet'
            : 'You are not enrolled in any courses yet'}
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.name}</h3>
              <p className="course-description">{course.description}</p>
              {course.teacher_name && (
                <p className="course-teacher">Teacher: {course.teacher_name}</p>
              )}
              {course.enrolled_students !== undefined && (
                <p className="course-students">
                  Students: {course.enrolled_students}
                </p>
              )}
              <button
                className="btn btn-secondary"
                onClick={() =>
                  window.location.href = `/assignments?courseId=${course.id}`
                }
              >
                View Assignments
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesList;
