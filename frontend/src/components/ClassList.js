import React from 'react';
import '../styles/dashboard.css';

const ClassList = ({
  classes = [],
  loading = false,
  onEnroll = null,
  onUnenroll = null,
  onStartClass = null,
  onViewAttendance = null,
  enrolledClassIds = new Set(),
  type = 'view' // 'view', 'enroll', 'teacher'
}) => {
  const formatDateTime = (date, time) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    const timeStr = time ? time : '00:00';
    return `${dateObj.toLocaleDateString()} ${timeStr}`;
  };

  const isUpcoming = (classDate) => {
    return new Date(classDate) >= new Date();
  };

  if (loading) {
    return <div className="loading">Loading classes...</div>;
  }

  if (classes.length === 0) {
    return <div className="no-data">No classes available</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Class Title</th>
            <th>Teacher</th>
            <th>Date & Time</th>
            <th>Students</th>
            <th>Status</th>
            {(type === 'enroll' || type === 'teacher') && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {classes.map(cls => {
            const isEnrolled = enrolledClassIds.has(cls.id);
            const upcoming = isUpcoming(cls.date);

            return (
              <tr key={cls.id} className={!upcoming ? 'past-class' : ''}>
                <td>
                  <strong>{cls.title}</strong>
                  {cls.description && <p className="text-muted">{cls.description}</p>}
                </td>
                <td>{cls.teacher_name || 'N/A'}</td>
                <td>
                  <div>
                    <div>{new Date(cls.date).toLocaleDateString()}</div>
                    {cls.start_time && (
                      <small style={{ color: '#666' }}>
                        {cls.start_time} - {cls.end_time}
                      </small>
                    )}
                  </div>
                </td>
                <td>
                  <span className="badge badge-primary">
                    {cls.enrolled_count || 0}
                  </span>
                </td>
                <td>
                  <span className={`badge ${upcoming ? 'badge-success' : 'badge-info'}`}>
                    {upcoming ? 'Upcoming' : 'Completed'}
                  </span>
                </td>
                {(type === 'enroll' || type === 'teacher') && (
                  <td>
                    <div className="action-buttons">
                      {type === 'enroll' && (
                        <>
                          {isEnrolled ? (
                            <>
                              <button
                                className="btn-small btn-success"
                                title="Already enrolled"
                                disabled
                              >
                                ✓ Enrolled
                              </button>
                              <button
                                className="btn-small btn-danger"
                                onClick={() => onUnenroll?.(cls.id)}
                                title="Unenroll"
                              >
                                ✕ Unenroll
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn-small btn-primary"
                              onClick={() => onEnroll?.(cls.id)}
                              title="Enroll in this class"
                            >
                              🎯 Enroll
                            </button>
                          )}
                        </>
                      )}

                      {type === 'teacher' && upcoming && (
                        <>
                          <button
                            className="btn-small btn-primary"
                            onClick={() => onStartClass?.(cls.id)}
                            title="Start class"
                          >
                            ▶️ Start
                          </button>
                          <button
                            className="btn-small btn-secondary"
                            onClick={() => onViewAttendance?.(cls.id)}
                            title="View attendance"
                          >
                            👥 Attend.
                          </button>
                        </>
                      )}

                      {type === 'teacher' && !upcoming && (
                        <button
                          className="btn-small btn-secondary"
                          onClick={() => onViewAttendance?.(cls.id)}
                          title="View attendance"
                        >
                          👥 Attend.
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ClassList;
