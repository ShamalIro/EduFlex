/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'student'|'tutor'|'admin'} role
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} thumbnail
 * @property {string} tutor
 * @property {string} category
 * @property {string} duration
 * @property {number} enrolledCount
 * @property {number} lessonsCount
 * @property {number} rating
 */

/**
 * @typedef {Object} Lesson
 * @property {string} id
 * @property {string} courseId
 * @property {string} title
 * @property {string} content
 * @property {string} duration
 * @property {number} order
 * @property {boolean} [completed]
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} text
 * @property {string[]} options
 * @property {number} correctAnswer
 */

/**
 * @typedef {Object} Quiz
 * @property {string} id
 * @property {string} courseId
 * @property {string} title
 * @property {Question[]} questions
 * @property {number} timeLimit
 * @property {number} totalPoints
 */

/**
 * @typedef {Object} QuizResult
 * @property {string} id
 * @property {string} quizId
 * @property {string} studentId
 * @property {number} score
 * @property {number} totalPoints
 * @property {string} completedAt
 * @property {number[]} answers
 */

/**
 * @typedef {Object} Enrollment
 * @property {string} id
 * @property {string} courseId
 * @property {string} studentId
 * @property {number} progress
 * @property {string} enrolledAt
 */

/**
 * @typedef {Object} DashboardStats
 * @property {string} label
 * @property {string|number} value
 * @property {string} [change]
 * @property {'up'|'down'} [trend]
 * @property {*} [icon] - Lucide icon component
 */

export {};
