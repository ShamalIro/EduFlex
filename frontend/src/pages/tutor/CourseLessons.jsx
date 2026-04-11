
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, updateLesson, deleteLesson } from '../../api/courses';

export default function CourseLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filteredLessons = course?.lessons?.filter((lesson) =>
    lesson.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.lessonNumber?.toString().includes(searchQuery)
  );

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const courseData = await getCourseById(id);
      setCourse(courseData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch course:', err);
      setError('Could not load course lessons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCourse();
  }, [id]);

  const handleEdit = async (lesson) => {
    // TODO: implement edit UI/modal/form
    console.log('Edit lesson', lesson);
    // Example update call (uncomment when ready):
    // await updateLesson(id, lesson._id, { ...lesson, lessonTitle: 'Updated title' });
    // setCourse(await getCourseById(id));
  };

  const handleDelete = async (lessonId) => {
    if (window.confirm('Delete this lesson?')) {
      try {
        await deleteLesson(id, lessonId);
        await fetchCourse();
      } catch (error) {
        console.error('Failed to delete lesson:', error);
        setError('Failed to delete lesson.');
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading lessons...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  if (!course) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Course not found.</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <button
        onClick={() => navigate('/tutor/courses')}
        style={{ marginBottom: '1rem', padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: 6, background: '#fff' }}
      >
        ← Back to Courses
      </button>

      <div style={{
        width: '100%',
        height: '220px',
        backgroundImage: `url(${course.thumbnail || '/default-banner.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '12px',
        marginBottom: '24px'
      }} />

      <h1 style={{ margin: 0, fontSize: '2rem' }}>{course.title}</h1>
      <p style={{ color: '#6b7280', marginTop: '0.3rem' }}>{course.description}</p>

      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Lessons</h2>
        <input
          type="text"
          placeholder="Search lessons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #d1d5db', marginBottom: '1rem' }}
        />

        {filteredLessons && filteredLessons.length > 0 ? (
          filteredLessons
            .slice()
            .sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0))
            .map((lesson, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #e5e7eb',
                  padding: '1rem',
                  borderRadius: 10,
                  marginBottom: '1rem',
                  background: '#fff'
                }}
              >
                <h3 style={{ margin: 0 }}>
                  {lesson.lessonNumber || ''}{lesson.lessonNumber ? ': ' : ''}{lesson.lessonTitle || 'Untitled'}
                </h3>
                <p style={{ margin: '0.5rem 0', color: '#4b5563' }}>{lesson.lessonDescription}</p>

                {lesson.videoUrl && (
                  <p style={{ margin: '0.25rem 0' }}>
                    <a
                      href={lesson.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'underline' }}
                    >
                      🎥 Watch Video
                    </a>
                  </p>
                )}

                {lesson.pdfUrl ? (
                  <p style={{ margin: '0.25rem 0' }}>
                    <a 
                      href={`http://localhost:4002${lesson.pdfUrl}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: '#059669', textDecoration: 'underline' }}
                    >
                      📄 View PDF
                    </a>
                  </p>
                ) : (
                  <p style={{ margin: '0.25rem 0', color: '#9ca3af' }}>
                    📄 No PDF uploaded
                  </p>
                )}

                <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>
                  Created: {lesson.createdAt ? new Date(lesson.createdAt).toLocaleString() : 'N/A'}
                </p>

                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    style={{ padding: '0.4rem 0.8rem', borderRadius: 6, border: '1px solid #d1d5db', background: '#f8fafc', cursor: 'pointer' }}
                    onClick={() => navigate(`/tutor/courses/${id}/lessons/${lesson._id}/edit`)}
                  >
                    ✏️ Update
                  </button>
                  <button
                    style={{ padding: '0.4rem 0.8rem', borderRadius: 6, border: '1px solid #fca5a5', background: '#fee2e2', cursor: 'pointer' }}
                    onClick={() => handleDelete(lesson._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
            No lessons have been added to this course yet.
          </div>
        )}

        {filteredLessons && filteredLessons.length === 0 && (
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>
            No lessons found for "{searchQuery}"
          </p>
        )}
      </div>
    </div>
  );
}