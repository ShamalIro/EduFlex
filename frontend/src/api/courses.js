import courseClient from './courseClient';

const toSafeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeCourse = (course) => ({
  ...course,
  id: String(course?._id || course?.id || ''),
  tutor: course?.tutor || course?.tutor_name || 'Tutor',
  tutor_name: course?.tutor_name || course?.tutor || 'Tutor',
  enrolledCount: toSafeNumber(course?.enrolledCount ?? course?.students_count, 0),
  students_count: toSafeNumber(course?.students_count ?? course?.enrolledCount, 0),
  lessonsCount: toSafeNumber(course?.lessonsCount ?? course?.lessons_count, 0),
  lessons_count: toSafeNumber(course?.lessons_count ?? course?.lessonsCount, 0),
  rating: toSafeNumber(course?.rating, 0)
});

// Get all published courses (student browse page)
export const getCourses = async () => {
  const response = await courseClient.get('/courses');
  const courses = response.data?.data?.courses || [];
  return courses.map(normalizeCourse);
};

const extractEnrollmentList = (responseData) => {
  const scoped = responseData?.data?.enrollments;
  if (Array.isArray(scoped)) return scoped;
  if (Array.isArray(responseData?.enrollments)) return responseData.enrollments;
  return [];
};

const enrichCourseWithEnrollment = (course, enrollment) => ({
  ...normalizeCourse(course),
  id: String(course?._id || course?.id || enrollment?.course_id || ''),
  progress: Number(enrollment?.progress || 0),
  enrolledAt: enrollment?.createdAt || enrollment?.enrolledAt || null,
  enrollmentId: enrollment?._id || enrollment?.id || null,
  course_id: enrollment?.course_id || course?._id || course?.id
});

export const getEnrolledCourses = async () => {
  const enrollmentResponse = await courseClient.get('/enrollments/mine');
  const enrollments = extractEnrollmentList(enrollmentResponse.data);

  if (!enrollments.length) return [];

  const courses = await Promise.all(
    enrollments.map(async (enrollment) => {
      try {
        const response = await courseClient.get(`/courses/${enrollment.course_id}`);
        const course = response.data?.data?.course;
        if (!course) return null;
        return enrichCourseWithEnrollment(course, enrollment);
      } catch (error) {
        return null;
      }
    })
  );

  return courses.filter(Boolean);
};

export const enrollInCourse = async (courseId) => {
  const response = await courseClient.post('/enrollments', { courseId });
  return response.data?.data?.enrollment || null;
};

export const getEnrollmentStatus = async (courseId) => {
  const response = await courseClient.get(`/enrollments/course/${courseId}/status`);
  return response.data?.data || { isEnrolled: false, enrollment: null };
};

// Get single course by ID
export const getCourseById = async (id) => {
  const response = await courseClient.get(`/courses/${id}`);
  const course = response.data?.data?.course;
  return course ? normalizeCourse(course) : null;
};
// Get lessons for a course - will connect to CourseService later  
export const getCourseLessons = async (courseId) => {
  return [];
};
// Get tutor's own courses
export const getMyCourses = async () => {
  const response = await courseClient.get('/courses/tutor/my-courses');
  return response.data.data.courses;
};

// Create a new course (tutor)
export const createCourse = async (courseData) => {
  const response = await courseClient.post('/courses', courseData);
  return response.data.data.course;
};

// Update a course (tutor)
export const updateCourse = async (id, courseData) => {
  const response = await courseClient.put(`/courses/${id}`, courseData);
  return response.data.data.course;
};

// Delete a course (tutor)
export const deleteCourse = async (id) => {
  const response = await courseClient.delete(`/courses/${id}`);
  return response.data;
};

// Publish / Unpublish a course (tutor)
export const togglePublishCourse = async (id) => {
  const response = await courseClient.patch(`/courses/${id}/publish`);
  return response.data.data.course;
};

// Add a lesson to a course (tutor)
export const addLesson = (courseId, formData) =>
  courseClient.post(`/courses/${courseId}/lessons`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateLesson = async (courseId, lessonId, data) => {
  const response = await courseClient.put(`/courses/${courseId}/lessons/${lessonId}`, data);
  return response.data;
};

export const deleteLesson = async (courseId, lessonId) => {
  const response = await courseClient.delete(`/courses/${courseId}/lessons/${lessonId}`);
  return response.data;
};

// Get admin course statistics
export const getAdminCourseStats = async () => {
  const res = await courseClient.get('/courses/admin/stats');
  return res.data;
};