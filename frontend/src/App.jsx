import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { PublicCoursesPage } from './pages/public/PublicCoursesPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Authenticated Pages
import { AuthenticatedHome } from './pages/authenticated/AuthenticatedHome';
import { ProfilePage } from './pages/authenticated/ProfilePage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { CourseCatalog } from './pages/student/CourseCatalog';
import { CourseDetail } from './pages/student/CourseDetail';
import { LessonViewer } from './pages/student/LessonViewer';
import { QuizPage } from './pages/student/QuizPage';
import { ResultsPage } from './pages/student/ResultsPage';
import { MyCourses } from './pages/student/MyCourses';
import { AssignmentsPage } from './pages/student/AssignmentsPage';
import { QuizzesPage } from './pages/student/QuizzesPage';

// Tutor Pages
import { TutorDashboard } from './pages/tutor/TutorDashboard';
import { TutorCourseManager } from './pages/tutor/TutorCourseManager';
import { TutorAssessmentsManager } from './pages/tutor/TutorAssessmentsManager';
import { CreateCourse } from './pages/tutor/CreateCourse';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import AdminCourseManagement from './pages/admin/AdminCourseManagement';
import AdminCourseDetail from './pages/admin/AdminCourseDetail';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<PublicCoursesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Home - Accessible by all logged in users */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <AuthenticatedHome />
              </ProtectedRoute>
            }
          />

          {/* Profile Settings */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<CourseCatalog />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="lessons/:id" element={<LessonViewer />} />
            <Route path="quiz/:id" element={<QuizPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="quizzes" element={<QuizzesPage />} />
            {/* Fallback for /student root */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Tutor Routes */}
          <Route
            path="/tutor"
            element={
              <ProtectedRoute allowedRoles={['tutor']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TutorDashboard />} />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="courses" element={<TutorCourseManager />} />
            <Route 
              path="courses/:courseId/assessments" 
              element={<TutorAssessmentsManager />} 
            />
            <Route 
              path="students" 
              element={
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">My Students</h2>
                  <p className="text-slate-500">Student Management - Coming Soon</p>
                  <p className="text-slate-400 text-sm mt-2">This will be available when EnrollmentService is ready</p>
                </div>
              } 
            />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="courses" element={<AdminCourseManagement />} />
            <Route path="courses/:id" element={<AdminCourseDetail />} />
            <Route path="reports" element={<div className="p-8 text-center text-slate-500">Reports - Coming Soon</div>} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
