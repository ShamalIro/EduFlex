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
  const [pdfModal, setPdfModal] = useState(null);   // holds blob URL
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

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

  // ── Fetch PDF as blob to avoid cross-origin iframe block ──────
  const openPdf = async (pdfPath) => {
    setPdfLoading(true);
    setPdfError(null);
    setPdfModal(null);
    try {
      const response = await fetch(`http://localhost:4002${pdfPath}`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPdfModal(blobUrl);
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setPdfError('Could not load the PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const closePdf = () => {
    if (pdfModal) URL.revokeObjectURL(pdfModal); // free memory
    setPdfModal(null);
    setPdfError(null);
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
        style={{
          marginBottom: '1rem',
          padding: '0.6rem 1rem',
          border: '1px solid #ddd',
          borderRadius: 6,
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        ← Back to Courses
      </button>

      {/* Course Banner */}
      <div
        style={{
          width: '100%',
          height: '220px',
          backgroundImage: `url(${course.thumbnail || '/default-banner.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '12px',
          marginBottom: '24px',
        }}
      />

      <h1 style={{ margin: 0, fontSize: '2rem' }}>{course.title}</h1>
      <p style={{ color: '#6b7280', marginTop: '0.3rem' }}>{course.description}</p>

      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Lessons</h2>
        <input
          type="text"
          placeholder="Search lessons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            marginBottom: '1rem',
          }}
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
                  background: '#fff',
                }}
              >
                <h3 style={{ margin: 0 }}>
                  {lesson.lessonNumber || ''}
                  {lesson.lessonNumber ? ': ' : ''}
                  {lesson.lessonTitle || 'Untitled'}
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
                    <span
                      onClick={() => openPdf(lesson.pdfUrl)}
                      style={{
                        color: '#059669',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      📄 View PDF
                    </span>
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
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: 6,
                      border: '1px solid #d1d5db',
                      background: '#f8fafc',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/tutor/courses/${id}/lessons/${lesson._id}/edit`)}
                  >
                    ✏️ Update
                  </button>
                  <button
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: 6,
                      border: '1px solid #fca5a5',
                      background: '#fee2e2',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleDelete(lesson._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div
            style={{
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px dashed #cbd5e1',
            }}
          >
            No lessons have been added to this course yet.
          </div>
        )}

        {filteredLessons && filteredLessons.length === 0 && searchQuery && (
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>
            No lessons found for "{searchQuery}"
          </p>
        )}
      </div>

      {/* ── PDF Loading Overlay ── */}
      {pdfLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '32px 48px',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 600,
            color: '#374151',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
            Loading PDF...
          </div>
        </div>
      )}

      {/* ── PDF Error Overlay ── */}
      {pdfError && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '32px 48px',
            textAlign: 'center',
            maxWidth: 360,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 16 }}>{pdfError}</p>
            <button
              onClick={closePdf}
              style={{
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 24px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── PDF Viewer Modal ── */}
      {pdfModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              width: '88vw',
              height: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                borderBottom: '1px solid #e5e7eb',
                background: '#f9fafb',
                flexShrink: 0,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                📄 PDF Viewer
              </span>
              <button
                onClick={closePdf}
                style={{
                  background: '#fee2e2',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  color: '#dc2626',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* PDF iframe using blob URL — no CORS issues */}
            <iframe
              src={pdfModal}
              title="PDF Viewer"
              style={{ flex: 1, border: 'none', width: '100%' }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
