import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../api/courses';

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourseById(id);
        setCourse(courseData);
      } catch (err) {
        setError('Failed to load course');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading course...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        {error}
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Course not found
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/tutor/courses')}
          style={{
            padding: '0.5rem 1rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          ← Back to Courses
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {course.title}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          {course.category} • {course.level} • {course.duration}
        </p>
        <p style={{ marginBottom: '2rem' }}>{course.description}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Lessons</h2>
          <button
            onClick={() => navigate(`/tutor/courses/${id}/add-lesson`)}
            style={{
              padding: '0.5rem 1rem',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            + Add Lesson
          </button>
        </div>

        {course.lessons && course.lessons.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {course.lessons.map((lesson, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  background: 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    Lesson {lesson.lessonNumber}: {lesson.lessonTitle}
                  </h3>
                </div>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  {lesson.lessonDescription}
                </p>
                {lesson.videoUrl && (
                  <p style={{ fontSize: '0.875rem', color: '#4f46e5' }}>
                    📹 Video: {lesson.videoUrl}
                  </p>
                )}
                {lesson.videoFile && (
                  <p style={{ fontSize: '0.875rem', color: '#059669' }}>
                    🎥 Video File: {lesson.videoFile}
                  </p>
                )}
                {lesson.pdfFile && (
                  <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>
                    📄 PDF: {lesson.pdfFile}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No lessons added yet. Click "Add Lesson" to get started.
          </div>
        )}
      </div>
    </div>
  );
}