import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courseClient from "../../api/courseClient";

export default function AdminCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    courseClient
      .get(`/courses/${id}`)
      .then((res) => {
        const data = res.data?.data?.course || res.data;
        setCourse(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load course details");
        setLoading(false);
      });
  }, [id]);

  const handlePublishToggle = async () => {
    try {
      await courseClient.patch(`/courses/${id}/publish`);
      setCourse((prev) => ({ ...prev, is_published: !prev.is_published }));
    } catch {
      alert("Failed to update course status");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await courseClient.delete(`/courses/${id}`);
      navigate("/admin/courses");
    } catch {
      alert("Failed to delete course");
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (error)   return <div className="p-6 text-red-400">{error}</div>;
  if (!course) return <div className="p-6 text-gray-400">Course not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Back button */}
      <button
        onClick={() => navigate("/admin/courses")}
        className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition"
      >
        ← Back to All Courses
      </button>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

        {/* Thumbnail */}
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-indigo-50 flex items-center justify-center">
            <span className="text-indigo-300 text-6xl">📚</span>
          </div>
        )}

        <div className="p-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  {course.category}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    course.is_published
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {course.is_published ? "Published" : "Draft"}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
              <p className="text-slate-500 mt-1">by {course.tutor_name}</p>
            </div>
            <div className="text-2xl font-bold text-indigo-600">${course.price}</div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 mb-6">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{course.level}</p>
              <p className="text-xs text-slate-500">Level</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">
                {course.students_count || 0}
              </p>
              <p className="text-xs text-slate-500">Students</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">
                {course.duration || "N/A"}
              </p>
              <p className="text-xs text-slate-500">Duration</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Description
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {course.description || "No description provided."}
            </p>
          </div>

          {/* Meta info */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-sm text-slate-600 space-y-2">
            <div className="flex justify-between">
              <span>Course ID</span>
              <span className="font-mono text-xs text-slate-400">{course._id}</span>
            </div>
            <div className="flex justify-between">
              <span>Created</span>
              <span>{new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span>{new Date(course.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Rating</span>
              <span>⭐ {course.rating || 0}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePublishToggle}
              className="flex-1 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
            >
              {course.is_published ? "Unpublish Course" : "Publish Course"}
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
            >
              Delete Course
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}