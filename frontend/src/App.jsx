import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import PaymentPage from './pages/student/PaymentPage';
import FinancialAidPage from './pages/student/FinancialAidPage';

// Tutor Pages
import { TutorDashboard } from './pages/tutor/TutorDashboard';
import { TutorCourseManager } from './pages/tutor/TutorCourseManager';
import { TutorAssessmentsManager } from './pages/tutor/TutorAssessmentsManager';
import { CreateCourse } from './pages/tutor/CreateCourse';
import AddLesson from './pages/tutor/AddLesson';
import CourseLessons from './pages/tutor/CourseLessons';
import EditLesson from './pages/tutor/EditLesson';
import { TutorStudents } from './pages/tutor/TutorStudents';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { PendingTutors } from './pages/admin/PendingTutors';
import AdminCourseManagement from './pages/admin/AdminCourseManagement';
import AdminCourseDetail from './pages/admin/AdminCourseDetail';
import { AdminReports } from './pages/admin/AdminReports';

export function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

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

            {/* Authenticated Home */}
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

              {/* Fixed Lesson Viewer Route */}
              <Route
                path="courses/:courseId/lessons/:lessonId"
                element={<LessonViewer />}
              />

              {/* Old route kept only for backward compatibility */}
              <Route path="lessons/:id" element={<LessonViewer />} />

              <Route path="quiz/:id" element={<QuizPage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="quizzes" element={<QuizzesPage />} />
              <Route path="payment/:courseId" element={<PaymentPage />} />
              <Route path="financial-aid/:id" element={<FinancialAidPage />} />
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
              <Route path="courses/:id/add-lesson" element={<AddLesson />} />
              <Route path="courses/:id/lessons" element={<CourseLessons />} />
              <Route path="courses/:id/lessons/:lessonId/edit" element={<EditLesson />} />
              <Route path="students" element={<TutorStudents />} />
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
              <Route path="pending-tutors" element={<PendingTutors />} />
              <Route path="courses" element={<AdminCourseManagement />} />
              <Route path="courses/:id" element={<AdminCourseDetail />} />
              <Route path="reports" element={<AdminReports />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}