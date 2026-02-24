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

// Tutor Pages
import { TutorDashboard } from './pages/tutor/TutorDashboard';
import { TutorCourseManager } from './pages/tutor/TutorCourseManager';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';

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
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<CourseCatalog />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="lessons/:id" element={<LessonViewer />} />
            <Route path="quiz/:id" element={<QuizPage />} />
            <Route path="results" element={<ResultsPage />} />
            {/* Fallback for /student root */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Tutor Routes */}
          <Route
            path="/tutor"
            element={
              <ProtectedRoute allowedRoles={['tutor']}>
                <DashboardLayout>
                  <TutorDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TutorDashboard />} />
            <Route path="courses" element={<TutorCourseManager />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
