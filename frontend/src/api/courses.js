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
  try {
    // Get enrollment records from EnrollmentService
    const enrollRes = await courseClient.get('/grades/mine');
    const enrollments = enrollRes.data.data.enrollments;

    if (!enrollments || enrollments.length === 0) return [];

    // For each enrollment, fetch full course from CourseService
    const coursePromises = enrollments.map(async (enrollment) => {
      try {
        const courseRes = await courseClient.get(`/courses/${enrollment.course_id}`);
        const course = courseRes.data.data.course;
        return {
          ...course,
          progress: enrollment.progress || 0,  // attach progress
          enrollment_id: enrollment._id
        };
      } catch {
        return null;
      }
    });

    const courses = await Promise.all(coursePromises);
    return courses.filter(Boolean); // remove nulls

  } catch (error) {
    console.error('getEnrolledCourses error:', error);
    return [];
  }
};

export const enrollFreeCourse = async (courseId) => {
  try {
    const res = await courseClient.post('/grades', { 
      courseId: courseId  // ← matches EnrollmentService body
    });
    return res.data;
  } catch (error) {
    console.error('Enroll error:', error);
    throw error;
  }
};

export const getEnrollmentStatus = async (courseId) => {
  try {
    const cleanId = String(courseId).trim(); // remove any whitespace
    const res = await courseClient.get(`/grades/course/${cleanId}/status`);
    return res.data.data;
  } catch (error) {
    return { isEnrolled: false };
  }
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
