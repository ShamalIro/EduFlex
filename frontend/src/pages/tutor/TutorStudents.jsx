import React, { useEffect, useState } from 'react';
import { Users, Download, BookOpen } from 'lucide-react';
import { getMyCourses } from '../../api/courses';
import { useAuth } from '../../hooks/useAuth';
import * as XLSX from 'xlsx';

export function TutorStudents() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch tutor's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getMyCourses();
        setCourses(data || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch students when course selected
  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    setLoadingStudents(true);
    setStudents([]);
    try {
      // Get enrollments for this course
      const { default: courseClient } = await import('../../api/courseClient');
      const res = await courseClient.get(
        `/grades/course/${course._id}/students/details`
      );
      const enrollments = res.data.data.enrollments || [];

      // Get student details from UserService
      const studentDetails = await Promise.all(
        enrollments.map(async (enrollment) => {
          try {
            const { default: client } = await import('../../api/client');
            const userRes = await client.get(
              `/users/find/${enrollment.student_id}`
            );
            const u = userRes.data.data.user;
            return {
              id: enrollment.student_id,
              name: u ? `${u.first_name} ${u.last_name}` : 'Unknown',
              email: u?.email || 'N/A',
              enrolledAt: enrollment.createdAt,
              progress: enrollment.progress || 0,
              status: enrollment.status
            };
          } catch {
            return {
              id: enrollment.student_id,
              name: 'Unknown Student',
              email: 'N/A',
              enrolledAt: enrollment.createdAt,
              progress: enrollment.progress || 0,
              status: enrollment.status
            };
          }
        })
      );

      setStudents(studentDetails);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Download Excel report
  const handleDownloadExcel = () => {
    if (!students.length) return;
    
    const data = students.map((s, i) => ({
      '#': i + 1,
      'Student Name': s.name,
      'Email': s.email,
      'Enrolled Date': new Date(s.enrolledAt).toLocaleDateString(),
      'Progress': `${s.progress}%`,
      'Status': s.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(
      workbook, 
      `${selectedCourse.title}_students_report.xlsx`
    );
  };

  // Download PDF report
  const handleDownloadPDF = () => {
    if (!students.length) return;

    const printContent = `
      <html>
      <head>
        <title>${selectedCourse.title} - Students Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #4f46e5; font-size: 22px; }
          h3 { color: #6b7280; font-size: 14px; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #4f46e5; color: white; padding: 10px; text-align: left; font-size: 13px; }
          td { padding: 9px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
          tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 24px; color: #9ca3af; font-size: 11px; }
          .badge { background: #ecfdf5; color: #059669; padding: 2px 8px; 
                   border-radius: 12px; font-size: 11px; }
        </style>
      </head>
      <body>
        <h1>📚 ${selectedCourse.title}</h1>
        <h3>Tutor: ${user?.first_name} ${user?.last_name} | 
            Total Students: ${students.length} | 
            Report Date: ${new Date().toLocaleDateString()}</h3>
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Enrolled Date</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${s.name}</strong></td>
                <td>${s.email}</td>
                <td>${new Date(s.enrolledAt).toLocaleDateString()}</td>
                <td>${s.progress}%</td>
                <td><span class="badge">${s.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Generated by EduFlex LMS | ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
        <p className="text-slate-500 mt-1">
          View and download student reports for each course
        </p>
      </div>

      {/* Course Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Select a Course
        </h2>
        {loadingCourses ? (
          <div className="text-slate-400 text-sm">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-slate-400 text-sm">
            No courses found. Create a course first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map(course => (
              <button
                key={course._id}
                onClick={() => handleCourseSelect(course)}
                className={`text-left p-4 rounded-xl border-2 transition-all
                  ${selectedCourse?._id === course._id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-300 bg-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg 
                      flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold truncate
                      ${selectedCourse?._id === course._id
                        ? 'text-indigo-700' : 'text-slate-800'
                      }`}>
                      {course.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {course.students_count || 0} students
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Students Table */}
      {selectedCourse && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {/* Table Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedCourse.title}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {loadingStudents ? 'Loading...' : 
                  `${students.length} student${students.length !== 1 ? 's' : ''} enrolled`}
              </p>
            </div>

            {/* Download Buttons */}
            {students.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-2 px-4 py-2 
                    bg-emerald-600 text-white text-sm font-semibold 
                    rounded-lg hover:bg-emerald-700 transition"
                >
                  <Download className="h-4 w-4" />
                  Excel
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 
                    bg-indigo-600 text-white text-sm font-semibold 
                    rounded-lg hover:bg-indigo-700 transition"
                >
                  <Download className="h-4 w-4" />
                  PDF Report
                </button>
              </div>
            )}
          </div>

          {/* Loading */}
          {loadingStudents ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-indigo-600 
                  border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No students enrolled yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Students will appear here once they enroll
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 text-slate-500 
                        font-medium">#</th>
                    <th className="text-left py-3 px-2 text-slate-500 
                        font-medium">Student Name</th>
                    <th className="text-left py-3 px-2 text-slate-500 
                        font-medium">Email</th>
                    <th className="text-left py-3 px-2 text-slate-500 
                        font-medium">Enrolled Date</th>
                    <th className="text-left py-3 px-2 text-slate-500 
                        font-medium">Progress</th>
                    <th className="text-left py-3 px-2 text-slate-500 
                        font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => (
                    <tr key={student.id}
                      className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-2 text-slate-500">{i + 1}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100
                              flex items-center justify-center text-indigo-700
                              font-bold text-xs flex-shrink-0">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {student.email}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full">
                            <div
                              className="h-2 bg-indigo-500 rounded-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {student.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs 
                          font-medium capitalize
                          ${student.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : student.status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}