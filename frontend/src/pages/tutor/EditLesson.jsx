import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseById, updateLesson } from '../../api/courses';

const initialForm = {
  lessonNumber: "",
  lessonTitle: "",
  lessonDescription: "",
  videoUrl: "",
  videoFile: null,
  pdfFile: null,
};

const initialErrors = {};

export default function EditLesson() {
  const navigate = useNavigate();
  const { id, lessonId } = useParams();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [videoMode, setVideoMode] = useState("url"); // "url" | "file"
  const [pdfName, setPdfName] = useState("");
  const [videoFileName, setVideoFileName] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [loading, setLoading] = useState(true);

  const pdfInputRef = useRef();
  const videoFileInputRef = useRef();

  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const course = await getCourseById(id);
        const lesson = course.lessons.find(l => l._id === lessonId);
        if (lesson) {
          setForm({
            lessonNumber: lesson.lessonNumber || "",
            lessonTitle: lesson.lessonTitle || "",
            lessonDescription: lesson.lessonDescription || "",
            videoUrl: lesson.videoUrl || "",
            videoFile: null,
            pdfFile: null,
          });
          setVideoMode(lesson.videoUrl ? "url" : "file");
          // Note: For simplicity, we're not handling existing files here
          // In a real app, you might need to fetch file names or URLs
        }
      } catch (error) {
        console.error('Failed to fetch lesson:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id, lessonId]);

  // ─── Validation ───────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.lessonNumber || isNaN(form.lessonNumber) || Number(form.lessonNumber) < 1) {
      e.lessonNumber = "Lesson number must be a positive number.";
    }

    if (!form.lessonTitle.trim()) {
      e.lessonTitle = "Lesson title is required.";
    } else if (form.lessonTitle.trim().length < 3) {
      e.lessonTitle = "Title must be at least 3 characters.";
    }

    if (!form.lessonDescription.trim()) {
      e.lessonDescription = "Lesson description is required.";
    } else if (form.lessonDescription.trim().length < 20) {
      e.lessonDescription = "Description must be at least 20 characters.";
    }

    if (videoMode === "url") {
      if (!form.videoUrl.trim()) {
        e.videoUrl = "Video URL is required.";
      } else {
        try {
          new URL(form.videoUrl);
        } catch {
          e.videoUrl = "Please enter a valid URL.";
        }
      }
    } else {
      if (!form.videoFile) {
        e.videoFile = "Please upload a video file.";
      }
    }

    if (!form.pdfFile) {
      e.pdfFile = "Please upload a PDF file.";
    }

    return e;
  };

  // ─── Handlers ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handlePdfFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErrors((p) => ({ ...p, pdfFile: "Only PDF files are allowed." }));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrors((p) => ({ ...p, pdfFile: "PDF must be under 20MB." }));
      return;
    }
    setForm((p) => ({ ...p, pdfFile: file }));
    setPdfName(file.name);
    setErrors((p) => ({ ...p, pdfFile: undefined }));
  };

  const handleVideoFile = (file) => {
    if (!file) return;
    const allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (!allowed.includes(file.type)) {
      setErrors((p) => ({ ...p, videoFile: "Only MP4, WebM, OGG, MOV allowed." }));
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setErrors((p) => ({ ...p, videoFile: "Video must be under 500MB." }));
      return;
    }
    setForm((p) => ({ ...p, videoFile: file }));
    setVideoFileName(file.name);
    setErrors((p) => ({ ...p, videoFile: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      return;
    }
    
    try {
      await updateLesson(id, lessonId, form);
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate(`/tutor/courses/${id}/lessons`);
      }, 1500);
    } catch (error) {
      console.error('Failed to update lesson:', error);
      // You could set an error state here if needed
    }
  };

  const handleReset = () => {
    // Reset to initial form or refetch?
    setForm(initialForm);
    setErrors({});
    setPdfName("");
    setVideoFileName("");
    setSubmitSuccess(false);
  };

  // ─── Styles (matching EduFlex dark theme) ─────────────────────
  const s = {
    page: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#f3f4f8",
    },
    sidebar: {
      width: 260,
      background: "#0f1623",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      flexShrink: 0,
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 24px 28px",
      fontSize: 20,
      fontWeight: 700,
      color: "#fff",
    },
    navItem: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 24px",
      cursor: "pointer",
      background: active ? "#4f46e5" : "transparent",
      color: active ? "#fff" : "#94a3b8",
      borderRadius: active ? "0 8px 8px 0" : 0,
      marginRight: active ? 12 : 0,
      fontWeight: active ? 600 : 400,
      fontSize: 15,
      transition: "all 0.2s",
    }),
    userBox: {
      marginTop: "auto",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      borderTop: "1px solid #1e2a3a",
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: "#4f46e5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: 14,
      flexShrink: 0,
    },
    main: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },
    topbar: {
      background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      padding: "0 32px",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    breadcrumb: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 14,
      color: "#6b7280",
    },
    content: {
      padding: "32px",
      flex: 1,
    },
    pageHeader: {
      marginBottom: 28,
    },
    pageTitle: {
      fontSize: 26,
      fontWeight: 700,
      color: "#111827",
      margin: 0,
    },
    pageSubtitle: {
      fontSize: 14,
      color: "#6b7280",
      margin: "4px 0 0",
    },
    card: {
      background: "#fff",
      borderRadius: 16,
      padding: "32px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      maxWidth: 820,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 700,
      color: "#4f46e5",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      marginBottom: 20,
      paddingBottom: 8,
      borderBottom: "2px solid #eef2ff",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20,
      marginBottom: 20,
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    fieldFull: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      marginBottom: 20,
    },
    label: {
      fontSize: 13,
      fontWeight: 600,
      color: "#374151",
    },
    required: {
      color: "#ef4444",
      marginLeft: 2,
    },
    input: (hasError) => ({
      padding: "10px 14px",
      borderRadius: 8,
      border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
      fontSize: 14,
      color: "#111827",
      outline: "none",
      transition: "border 0.2s",
      background: "#fafafa",
    }),
    textarea: (hasError) => ({
      padding: "10px 14px",
      borderRadius: 8,
      border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
      fontSize: 14,
      color: "#111827",
      outline: "none",
      resize: "vertical",
      minHeight: 110,
      fontFamily: "inherit",
      background: "#fafafa",
    }),
    errorMsg: {
      fontSize: 12,
      color: "#ef4444",
      marginTop: 2,
    },
    charCount: (warn) => ({
      fontSize: 11,
      color: warn ? "#ef4444" : "#9ca3af",
      textAlign: "right",
      marginTop: 2,
    }),
    tabRow: {
      display: "flex",
      gap: 8,
      marginBottom: 14,
    },
    tab: (active) => ({
      padding: "7px 18px",
      borderRadius: 8,
      border: `1.5px solid ${active ? "#4f46e5" : "#e5e7eb"}`,
      background: active ? "#4f46e5" : "#fff",
      color: active ? "#fff" : "#6b7280",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
    }),
    dropzone: (dragging, hasError) => ({
      border: `2px dashed ${hasError ? "#ef4444" : dragging ? "#4f46e5" : "#d1d5db"}`,
      borderRadius: 10,
      padding: "28px 20px",
      textAlign: "center",
      background: dragging ? "#eef2ff" : "#fafafa",
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    dropIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    dropText: {
      fontSize: 14,
      color: "#6b7280",
    },
    dropHint: {
      fontSize: 12,
      color: "#9ca3af",
      marginTop: 4,
    },
    fileChip: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "#eef2ff",
      border: "1px solid #c7d2fe",
      borderRadius: 8,
      padding: "6px 12px",
      fontSize: 13,
      color: "#4f46e5",
      marginTop: 10,
      fontWeight: 500,
    },
    divider: {
      height: 1,
      background: "#f3f4f6",
      margin: "28px 0",
    },
    btnRow: {
      display: "flex",
      gap: 12,
      justifyContent: "flex-end",
    },
    btnPrimary: {
      padding: "11px 28px",
      background: "#4f46e5",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    btnSecondary: {
      padding: "11px 24px",
      background: "#fff",
      color: "#374151",
      border: "1.5px solid #e5e7eb",
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
    },
    successBanner: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "#f0fdf4",
      border: "1px solid #86efac",
      borderRadius: 10,
      padding: "12px 16px",
      marginBottom: 24,
      fontSize: 14,
      color: "#15803d",
      fontWeight: 500,
    },
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading lesson...</div>;
  }

  return (
    <div style={s.content}>
          <div style={s.pageHeader}>
            <h1 style={s.pageTitle}>Edit Lesson</h1>
            <p style={s.pageSubtitle}>Update the lesson details below</p>
          </div>

          {submitSuccess && (
            <div style={s.successBanner}>
              ✅ Lesson updated successfully!
            </div>
          )}

          <div style={s.card}>
            <form onSubmit={handleSubmit} noValidate>

              {/* ── Section 1: Basic Info ── */}
              <div style={s.sectionTitle}>📋 Lesson Information</div>

              <div style={s.row}>
                {/* Lesson Number */}
                <div style={s.field}>
                  <label style={s.label}>
                    Lesson Number <span style={s.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="lessonNumber"
                    min="1"
                    placeholder="e.g. 1"
                    value={form.lessonNumber}
                    onChange={handleChange}
                    style={s.input(!!errors.lessonNumber)}
                  />
                  {errors.lessonNumber && <span style={s.errorMsg}>⚠ {errors.lessonNumber}</span>}
                </div>

                {/* Lesson Title */}
                <div style={s.field}>
                  <label style={s.label}>
                    Lesson Title <span style={s.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="lessonTitle"
                    placeholder="e.g. Introduction to JSX"
                    value={form.lessonTitle}
                    onChange={handleChange}
                    style={s.input(!!errors.lessonTitle)}
                    maxLength={80}
                  />
                  <span style={s.charCount(form.lessonTitle.length > 70)}>
                    {form.lessonTitle.length}/80
                  </span>
                  {errors.lessonTitle && <span style={s.errorMsg}>⚠ {errors.lessonTitle}</span>}
                </div>
              </div>

              {/* Description */}
              <div style={s.fieldFull}>
                <label style={s.label}>
                  Lesson Description <span style={s.required}>*</span>
                </label>
                <textarea
                  name="lessonDescription"
                  placeholder="Describe what students will learn in this lesson..."
                  value={form.lessonDescription}
                  onChange={handleChange}
                  style={s.textarea(!!errors.lessonDescription)}
                  maxLength={500}
                />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {errors.lessonDescription
                    ? <span style={s.errorMsg}>⚠ {errors.lessonDescription}</span>
                    : <span />}
                  <span style={s.charCount(form.lessonDescription.length > 450)}>
                    {form.lessonDescription.length}/500
                  </span>
                </div>
              </div>

              <div style={s.divider} />

              {/* ── Section 2: Video ── */}
              <div style={s.sectionTitle}>🎬 Lesson Video</div>

              <div style={{ marginBottom: 16 }}>
                <div style={s.tabRow}>
                  <div
                    style={s.tab(videoMode === "url")}
                    onClick={() => setVideoMode("url")}
                  >
                    Video URL
                  </div>
                  <div
                    style={s.tab(videoMode === "file")}
                    onClick={() => setVideoMode("file")}
                  >
                    Upload Video
                  </div>
                </div>

                {videoMode === "url" ? (
                  <div style={s.field}>
                    <label style={s.label}>
                      Video URL <span style={s.required}>*</span>
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      placeholder="https://example.com/video.mp4"
                      value={form.videoUrl}
                      onChange={handleChange}
                      style={s.input(!!errors.videoUrl)}
                    />
                    {errors.videoUrl && <span style={s.errorMsg}>⚠ {errors.videoUrl}</span>}
                  </div>
                ) : (
                  <div style={s.field}>
                    <label style={s.label}>
                      Video File <span style={s.required}>*</span>
                    </label>
                    <div
                      style={s.dropzone(isDraggingVideo, !!errors.videoFile)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingVideo(true);
                      }}
                      onDragLeave={() => setIsDraggingVideo(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingVideo(false);
                        const file = e.dataTransfer.files[0];
                        handleVideoFile(file);
                      }}
                      onClick={() => videoFileInputRef.current?.click()}
                    >
                      <div style={s.dropIcon}>🎥</div>
                      <div style={s.dropText}>
                        {videoFileName ? `Selected: ${videoFileName}` : "Drop your video file here or click to browse"}
                      </div>
                      <div style={s.dropHint}>MP4, WebM, OGG, MOV up to 500MB</div>
                    </div>
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoFile(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                    {errors.videoFile && <span style={s.errorMsg}>⚠ {errors.videoFile}</span>}
                  </div>
                )}
              </div>

              <div style={s.divider} />

              {/* ── Section 3: PDF ── */}
              <div style={s.sectionTitle}>📄 Lesson PDF</div>

              <div style={s.field}>
                <label style={s.label}>
                  PDF File <span style={s.required}>*</span>
                </label>
                <div
                  style={s.dropzone(isDraggingPdf, !!errors.pdfFile)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingPdf(true);
                  }}
                  onDragLeave={() => setIsDraggingPdf(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingPdf(false);
                    const file = e.dataTransfer.files[0];
                    handlePdfFile(file);
                  }}
                  onClick={() => pdfInputRef.current?.click()}
                >
                  <div style={s.dropIcon}>📄</div>
                  <div style={s.dropText}>
                    {pdfName ? `Selected: ${pdfName}` : "Drop your PDF file here or click to browse"}
                  </div>
                  <div style={s.dropHint}>PDF up to 20MB</div>
                </div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handlePdfFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
                {errors.pdfFile && <span style={s.errorMsg}>⚠ {errors.pdfFile}</span>}
              </div>

              <div style={s.divider} />

              {/* ── Actions ── */}
              <div style={s.btnRow}>
                <button type="button" style={s.btnSecondary} onClick={handleReset}>
                  Reset
                </button>
                <button type="submit" style={s.btnPrimary}>
                  💾 Update Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
  );
}