import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { getCourseById } from '../../api/courses';

export function LessonViewer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [pdfModal, setPdfModal] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await getCourseById(courseId);
        setCourse(data);
      } catch (err) {
        console.error('Failed to load course:', err);
        setError('Could not load lessons. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  const lessons = course?.lessons
    ? [...course.lessons].sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0))
    : [];

  const currentIndex = lessons.findIndex((l) => l._id === lessonId);
  const currentLesson = currentIndex >= 0 ? lessons[currentIndex] : lessons[0];

  const openPdf = async (pdfPath) => {
    setPdfLoading(true);
    setPdfError(null);
    setPdfModal(null);
    try {
      const pdfUrl = pdfPath.startsWith('http')
        ? pdfPath
        : `http://localhost:4002${pdfPath}`;

      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error(`Server error ${response.status}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(
        new Blob([blob], { type: 'application/pdf' })
      );
      setPdfModal(blobUrl);
    } catch (err) {
      console.error('PDF load failed:', err);
      setPdfError('Could not load the PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const closePdf = () => {
    if (pdfModal) URL.revokeObjectURL(pdfModal);
    setPdfModal(null);
    setPdfError(null);
  };

  const goToLesson = (lesson) => {
    navigate(`/student/courses/${courseId}/lessons/${lesson._id}`);
  };

  const getYouTubeId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname === 'youtu.be') return u.pathname.slice(1);
      return u.searchParams.get('v') || '';
    } catch {
      return '';
    }
  };

  const isYouTube = (url) =>
    url?.includes('youtube.com') || url?.includes('youtu.be');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontSize: 16, color: '#6b7280' }}>
        ⏳ Loading lessons...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#dc2626', fontSize: 16 }}>
        ⚠️ {error}
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#6b7280', fontSize: 16 }}>
        No lessons available for this course yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 4rem)', overflow: 'hidden', background: '#f9fafb' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#fff' }}>
        <div
          style={{
            height: 64,
            borderBottom: '1px solid #e5e7eb',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#374151', fontWeight: 500 }}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <span style={{ fontWeight: 600, color: '#111827', fontSize: 15 }}>
              {course?.title}
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}
          >
            <Menu size={18} color="#6b7280" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '36px 48px', maxWidth: 860, margin: '0 auto', width: '100%' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: '#eef2ff',
              borderRadius: 10,
              padding: '6px 16px',
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5' }}>
              Lesson {currentLesson.lessonNumber || currentIndex + 1}
            </span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6, marginTop: 0 }}>
            {currentLesson.lessonTitle || 'Untitled Lesson'}
          </h1>

          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28 }}>
            {course?.title}
          </p>

          {currentLesson.lessonDescription && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                📋 Description
              </h2>
              <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '18px 22px', fontSize: 15, color: '#4b5563', lineHeight: 1.75 }}>
                {currentLesson.lessonDescription}
              </div>
            </div>
          )}

          {currentLesson.pdfUrl ? (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                📄 Lesson Notes / PDF
              </h2>
              <button
                onClick={() => openPdf(currentLesson.pdfUrl)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ecfdf5', border: '1.5px solid #6ee7b7', borderRadius: 10, padding: '14px 22px', color: '#059669', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                📄 View PDF Notes
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
                📄 Lesson Notes / PDF
              </h2>
              <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 10, padding: '16px 20px', color: '#9ca3af', fontSize: 14 }}>
                No PDF uploaded for this lesson.
              </div>
            </div>
          )}

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎬 Lesson Video
            </h2>

            {currentLesson.videoUrl ? (
              isYouTube(currentLesson.videoUrl) ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(currentLesson.videoUrl)}`}
                    title="Lesson Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              ) : (
                <a
                  href={currentLesson.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#eef2ff', border: '1.5px solid #c7d2fe', borderRadius: 10, padding: '14px 22px', color: '#4f46e5', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
                >
                  🎥 Watch Video
                </a>
              )
            ) : (
              <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 10, padding: '16px 20px', color: '#9ca3af', fontSize: 14 }}>
                No video uploaded for this lesson.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 24, borderTop: '1px solid #f3f4f6' }}>
            <button
              disabled={currentIndex <= 0}
              onClick={() => goToLesson(lessons[currentIndex - 1])}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: currentIndex <= 0 ? '#f9fafb' : '#fff', color: currentIndex <= 0 ? '#9ca3af' : '#374151', fontWeight: 600, fontSize: 14, cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} /> Previous Lesson
            </button>

            <button
              disabled={currentIndex >= lessons.length - 1}
              onClick={() => goToLesson(lessons[currentIndex + 1])}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 10, border: 'none', background: currentIndex >= lessons.length - 1 ? '#c7d2fe' : '#4f46e5', color: '#fff', fontWeight: 600, fontSize: 14, cursor: currentIndex >= lessons.length - 1 ? 'not-allowed' : 'pointer' }}
            >
              Next Lesson <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div style={{ width: 290, background: '#f8fafc', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>
              📚 Course Lessons
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
              {lessons.length} Lesson{lessons.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
            {lessons.map((lesson, idx) => {
              const isActive = lesson._id === currentLesson._id;

              return (
                <button
                  key={lesson._id}
                  onClick={() => goToLesson(lesson)}
                  style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 12px', borderRadius: 10, border: isActive ? '1.5px solid #c7d2fe' : '1.5px solid transparent', background: isActive ? '#eef2ff' : 'transparent', cursor: 'pointer', marginBottom: 4, textAlign: 'left' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? '#4f46e5' : '#e5e7eb', color: isActive ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 700 }}>
                    {lesson.lessonNumber || idx + 1}
                  </div>

                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? '#4f46e5' : '#374151', lineHeight: 1.4 }}>
                    {lesson.lessonTitle || 'Untitled'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {pdfLoading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '32px 48px', textAlign: 'center', fontWeight: 600, fontSize: 16, color: '#374151' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
            Loading PDF...
          </div>
        </div>
      )}

      {pdfError && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '32px 48px', textAlign: 'center', maxWidth: 360 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 16 }}>{pdfError}</p>
            <button onClick={closePdf} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', cursor: 'pointer', fontWeight: 600 }}>
              Close
            </button>
          </div>
        </div>
      )}

      {pdfModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 12, background: '#fff', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={closePdf}
              style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 600 }}
            >
              Close
            </button>
          </div>

          <iframe
            src={`${pdfModal}#toolbar=1&navpanes=1`}
            title="PDF Viewer"
            style={{ flex: 1, border: 'none', width: '100%' }}
            type="application/pdf"
          />
        </div>
      )}
    </div>
  );
}