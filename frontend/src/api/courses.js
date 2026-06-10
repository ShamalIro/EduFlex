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

export const getCourses = async () => {
  const response = await courseClient.get('/courses');
  const courses = response.data?.data?.courses || [];
  return courses.map(normalizeCourse);
};

export const getEnrolledCourses = async () => {
  try {
    const enrollRes = await courseClient.get('/grades/mine');
    const enrollments = enrollRes.data.data.enrollments;

    if (!enrollments || enrollments.length === 0) return [];

    const coursePromises = enrollments.map(async (enrollment) => {
      try {
        const courseRes = await courseClient.get(`/courses/${enrollment.course_id}`);
        const course = courseRes.data.data.course;

        return {
          ...course,
          progress: enrollment.progress || 0,
          enrollment_id: enrollment._id
        };
      } catch {
        return null;
      }
    });

    const courses = await Promise.all(coursePromises);
    return courses.filter(Boolean);
  } catch (error) {
    console.error('getEnrolledCourses error:', error);
    return [];
  }
};

export const enrollFreeCourse = async (courseId) => {
  try {
    const res = await courseClient.post('/grades', {
      courseId: courseId
    });
    return res.data;
  } catch (error) {
    console.error('Enroll error:', error);
    throw error;
  }
};

export const getEnrollmentStatus = async (courseId) => {
  try {
    const cleanId = String(courseId).trim();
    const res = await courseClient.get(`/grades/course/${cleanId}/status`);
    return res.data.data;
  } catch (error) {
    return { isEnrolled: false };
  }
};

export const getCourseById = async (id) => {
  const response = await courseClient.get(`/courses/${id}`);
  const course = response.data?.data?.course;
  return course ? normalizeCourse(course) : null;
};

export const getCourseLessons = async (courseId) => {
  const response = await courseClient.get(`/courses/${courseId}`);
  const course = response.data?.data?.course;

  const lessons = course?.lessons || [];

  return lessons.map((lesson) => ({
    ...lesson,
    id: String(lesson._id || lesson.id || ''),
    title: lesson.lessonTitle || lesson.title || 'Untitled Lesson',
    duration: lesson.duration || 'Lesson content',
  }));
};

export const getMyCourses = async () => {
  const response = await courseClient.get('/courses/tutor/my-courses');
  return response.data.data.courses;
};

export const createCourse = async (courseData) => {
  const response = await courseClient.post('/courses', courseData);
  return response.data.data.course;
};

export const updateCourse = async (id, courseData) => {
  const response = await courseClient.put(`/courses/${id}`, courseData);
  return response.data.data.course;
};

export const deleteCourse = async (id) => {
  const response = await courseClient.delete(`/courses/${id}`);
  return response.data;
};

export const togglePublishCourse = async (id) => {
  const response = await courseClient.patch(`/courses/${id}/publish`);
  return response.data.data.course;
};

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

export const getAdminCourseStats = async () => {
  const res = await courseClient.get('/courses/admin/stats');
  return res.data;
};

export const getAIRecommendations = async (enrolledCourses, learningGoal = '') => {
  try {
    const res = await courseClient.post('/grades/recommendations', {
      enrolledCourses,
      learningGoal
    });
    return res.data.data.recommendations || [];
  } catch (error) {
    console.error('Recommendations error:', error);
    return [];
  }
};

export const getCourseReviews = async (courseId) => {
  const response = await courseClient.get(`/courses/${courseId}/reviews`);
  return response.data.data;
};

export const addCourseReview = async (courseId, reviewData) => {
  const response = await courseClient.post(`/courses/${courseId}/reviews`, reviewData);
  return response.data.data;
};

// Get students enrolled in a tutor's course
export const getCourseStudents = async (courseId) => {
  try {
    const res = await courseClient.get(
      `/grades/course/${courseId}/students/details`
    );
    return res.data.data.enrollments || [];
  } catch (error) {
    console.error('getCourseStudents error:', error);
    return [];
  }
};