import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import courseClient from "../../api/courseClient";

export default function AdminCourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    courseClient
      .get("/courses")
      .then((res) => {
        const data = res.data?.data?.courses || res.data || [];
        setCourses(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load courses");
        setLoading(false);
      });
  }, []);

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      await courseClient.patch(`/courses/${courseId}/publish`);
      setCourses((prev) =>
        prev.map((c) =>
          c._id === courseId ? { ...c, is_published: !currentStatus } : c
        )
      );
    } catch {
      alert("Failed to update course status");
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await courseClient.delete(`/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch {
      alert("Failed to delete course");
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading courses...</div>;
  if (error)   return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Courses</h1>
          <p className="text-slate-500 text-sm mt-1">
            {courses.length} courses total
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-400">No courses found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* Thumbnail */}
              <div className="relative">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="w-full h-44 bg-indigo-50 flex items-center justify-center">
                    <span className="text-indigo-300 text-4xl">📚</span>
                  </div>
                )}
                {/* Category badge */}
                <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  {course.category}
                </span>
                {/* Status badge */}
                <span
                  className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded ${
                    course.is_published
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {course.is_published ? "Published" : "Draft"}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-800 text-base mb-1 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-slate-500 text-sm mb-1">
                  by {course.tutor_name}
                </p>
                <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                  <span>{course.level}</span>
                  <span className="font-semibold text-slate-800">
                    ${course.price}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                  <span>👥</span>
                  <span>{course.students_count || 0} students</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/admin/courses/${course._id}`)}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    View Details
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handlePublishToggle(course._id, course.is_published)
                      }
                      className="flex-1 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
                    >
                      {course.is_published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="flex-1 py-2 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}