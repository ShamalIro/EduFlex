import courseClient from './courseClient';

// Get all published courses (student browse page)
export const getCourses = async () => {
  const response = await courseClient.get('/courses');
  return response.data.data.courses;
};
// Enrolled courses - will connect to EnrollmentService later
export const getEnrolledCourses = async () => {
  return [];
};
// Get single course by ID
export const getCourseById = async (id) => {
  const response = await courseClient.get(`/courses/${id}`);
  return response.data.data.course;
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

// Get admin course statistics
export const getAdminCourseStats = async () => {
  const res = await courseClient.get('/courses/admin/stats');
  return res.data;
};