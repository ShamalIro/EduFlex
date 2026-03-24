/**
 * Mock Data for EduFlex LMS
 * Contains courses, assignments, quizzes, and related data for development/presentation
 */

// ============= COURSES =============
export const MOCK_COURSES = [
  {
    id: '1',
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React.js, including components, state, props, and hooks. Build modern interactive UIs.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tutor: 'Sarah Tutor',
    tutorId: 'tutor-1',
    category: 'Programming',
    duration: '8 weeks',
    enrolledCount: 1250,
    lessonsCount: 24,
    rating: 4.8,
    status: 'published',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-10T14:30:00Z'
  },
  {
    id: '2',
    title: 'Python for Data Science',
    description: 'Master Python programming for data analysis, visualization, and machine learning applications.',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tutor: 'Dr. Alan Grant',
    tutorId: 'tutor-2',
    category: 'Data Science',
    duration: '12 weeks',
    enrolledCount: 850,
    lessonsCount: 36,
    rating: 4.9,
    status: 'published',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-03-15T16:00:00Z'
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    description: 'Understand the core principles of user interface and user experience design. Create beautiful, usable products.',
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tutor: 'Jessica Chen',
    tutorId: 'tutor-1',
    category: 'Design',
    duration: '6 weeks',
    enrolledCount: 2100,
    lessonsCount: 18,
    rating: 4.7,
    status: 'published',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-03-12T10:00:00Z'
  },
  {
    id: '4',
    title: 'Digital Marketing Strategy',
    description: 'Learn how to create effective digital marketing campaigns, SEO, content marketing, and social media strategies.',
    thumbnail: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tutor: 'Mark Wilson',
    tutorId: 'tutor-3',
    category: 'Marketing',
    duration: '5 weeks',
    enrolledCount: 1500,
    lessonsCount: 15,
    rating: 4.5,
    status: 'draft',
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-18T12:00:00Z'
  }
];

// ============= ASSIGNMENTS =============
export const MOCK_ASSIGNMENTS = [
  {
    id: 'asgn-1',
    courseId: '1',
    title: 'Build a Todo App with React',
    description: 'Create a fully functional todo application using React.js. The app should allow users to add, edit, delete, and mark tasks as complete. Use React hooks for state management.',
    instructions: 'Follow the requirements document attached below. Submit your source code as a ZIP file along with a README explaining your implementation approach.',
    instructionFile: {
      name: 'todo-app-requirements.pdf',
      size: 245000,
      type: 'application/pdf'
    },
    dueDate: '2026-04-15T23:59:59Z',
    totalMarks: 100,
    status: 'published',
    createdAt: '2024-03-01T10:00:00Z',
    submissions: 45
  },
  {
    id: 'asgn-2',
    courseId: '1',
    title: 'React Component Library',
    description: 'Design and develop a reusable component library with at least 5 components including Button, Card, Modal, Input, and Alert. Document your components with usage examples.',
    instructions: 'Create well-documented, reusable components with proper prop type validation.',
    instructionFile: null,
    dueDate: '2026-04-25T23:59:59Z',
    totalMarks: 150,
    status: 'published',
    createdAt: '2024-03-05T14:00:00Z',
    submissions: 28
  },
  {
    id: 'asgn-3',
    courseId: '1',
    title: 'State Management Deep Dive',
    description: 'Implement a shopping cart feature using useContext and useReducer hooks. This assignment tests your understanding of complex state management in React.',
    instructions: 'The shopping cart should persist data to localStorage.',
    instructionFile: {
      name: 'state-management-guide.pdf',
      size: 189000,
      type: 'application/pdf'
    },
    dueDate: '2026-03-20T23:59:59Z', // Past due date for testing
    totalMarks: 80,
    status: 'draft',
    createdAt: '2024-02-28T09:00:00Z',
    submissions: 0
  },
  {
    id: 'asgn-4',
    courseId: '2',
    title: 'Data Cleaning Project',
    description: 'Clean and preprocess the provided dataset using pandas. Handle missing values, outliers, and perform basic exploratory data analysis.',
    instructions: 'Submit a Jupyter notebook with documented code.',
    instructionFile: {
      name: 'dataset-cleaning-instructions.pdf',
      size: 312000,
      type: 'application/pdf'
    },
    dueDate: '2026-04-10T23:59:59Z',
    totalMarks: 100,
    status: 'published',
    createdAt: '2024-03-08T11:00:00Z',
    submissions: 62
  },
  {
    id: 'asgn-5',
    courseId: '3',
    title: 'Mobile App UI Design',
    description: 'Design a complete mobile app interface for a fitness tracking application. Include at least 5 screens: Home, Workouts, Progress, Profile, and Settings.',
    instructions: 'Use Figma for your designs. Export and submit as PDF.',
    instructionFile: null,
    dueDate: '2026-04-20T23:59:59Z',
    totalMarks: 120,
    status: 'published',
    createdAt: '2024-03-10T15:00:00Z',
    submissions: 38
  }
];

// ============= QUIZZES =============
export const MOCK_QUIZZES = [
  {
    id: 'quiz-1',
    courseId: '1',
    title: 'React Fundamentals Quiz',
    description: 'Test your understanding of React basics including components, props, state, and lifecycle methods.',
    timerDuration: 15, // minutes
    totalPoints: 50,
    status: 'published',
    createdAt: '2024-03-02T10:00:00Z',
    attempts: 89,
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        text: 'What is the virtual DOM?',
        points: 10,
        options: [
          'A direct copy of the real DOM',
          'A lightweight JavaScript representation of the DOM',
          'A browser plugin for debugging',
          'A database for storing HTML'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        type: 'mcq',
        text: 'Which hook is used for side effects in React?',
        points: 10,
        options: ['useState', 'useContext', 'useEffect', 'useReducer'],
        correctAnswer: 2
      },
      {
        id: 'q3',
        type: 'truefalse',
        text: 'Props in React are read-only and cannot be modified by the child component.',
        points: 10,
        correctAnswer: true
      },
      {
        id: 'q4',
        type: 'mcq',
        text: 'What is JSX?',
        points: 10,
        options: [
          'A JavaScript library',
          'A syntax extension for JavaScript that looks like HTML',
          'A CSS framework',
          'A database query language'
        ],
        correctAnswer: 1
      },
      {
        id: 'q5',
        type: 'shortanswer',
        text: 'What is the name of the hook used to manage local component state?',
        points: 10,
        expectedAnswer: 'useState'
      }
    ]
  },
  {
    id: 'quiz-2',
    courseId: '1',
    title: 'React Hooks Mastery',
    description: 'Advanced quiz on React hooks including custom hooks, useCallback, useMemo, and useRef.',
    timerDuration: 20,
    totalPoints: 60,
    status: 'published',
    createdAt: '2024-03-08T14:00:00Z',
    attempts: 52,
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        text: 'When should you use useMemo?',
        points: 15,
        options: [
          'To memoize expensive calculations',
          'To create a new state',
          'To handle form submissions',
          'To navigate between pages'
        ],
        correctAnswer: 0
      },
      {
        id: 'q2',
        type: 'truefalse',
        text: 'useCallback returns a memoized callback function.',
        points: 15,
        correctAnswer: true
      },
      {
        id: 'q3',
        type: 'mcq',
        text: 'What does useRef return?',
        points: 15,
        options: [
          'A state value',
          'A mutable ref object',
          'A callback function',
          'A context provider'
        ],
        correctAnswer: 1
      },
      {
        id: 'q4',
        type: 'shortanswer',
        text: 'What hook combines useState and useReducer patterns for complex state logic?',
        points: 15,
        expectedAnswer: 'useReducer'
      }
    ]
  },
  {
    id: 'quiz-3',
    courseId: '2',
    title: 'Python Basics Assessment',
    description: 'Evaluate your Python fundamentals including data types, control flow, and functions.',
    timerDuration: 25,
    totalPoints: 80,
    status: 'published',
    createdAt: '2024-03-05T09:00:00Z',
    attempts: 124,
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        text: 'Which of the following is NOT a Python data type?',
        points: 20,
        options: ['list', 'tuple', 'array', 'dictionary'],
        correctAnswer: 2
      },
      {
        id: 'q2',
        type: 'truefalse',
        text: 'Python lists are immutable.',
        points: 20,
        correctAnswer: false
      },
      {
        id: 'q3',
        type: 'shortanswer',
        text: 'What keyword is used to define a function in Python?',
        points: 20,
        expectedAnswer: 'def'
      },
      {
        id: 'q4',
        type: 'mcq',
        text: 'How do you create a comment in Python?',
        points: 20,
        options: ['// comment', '/* comment */', '# comment', '<!-- comment -->'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'quiz-4',
    courseId: '3',
    title: 'UI Design Principles',
    description: 'Test your knowledge of fundamental UI/UX design principles and best practices.',
    timerDuration: 15,
    totalPoints: 40,
    status: 'draft',
    createdAt: '2024-03-12T11:00:00Z',
    attempts: 0,
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        text: 'What does "above the fold" mean in web design?',
        points: 10,
        options: [
          'Content visible without scrolling',
          'The header section',
          'The navigation menu',
          'The footer area'
        ],
        correctAnswer: 0
      },
      {
        id: 'q2',
        type: 'truefalse',
        text: 'White space (negative space) is a waste of screen real estate.',
        points: 10,
        correctAnswer: false
      },
      {
        id: 'q3',
        type: 'mcq',
        text: 'Which principle states that related elements should be visually grouped together?',
        points: 10,
        options: ['Contrast', 'Proximity', 'Alignment', 'Repetition'],
        correctAnswer: 1
      },
      {
        id: 'q4',
        type: 'shortanswer',
        text: 'What is the term for the visual path a user\'s eye follows on a page?',
        points: 10,
        expectedAnswer: 'visual hierarchy'
      }
    ]
  }
];

// ============= STUDENT SUBMISSIONS =============
export const MOCK_SUBMISSIONS = [
  {
    id: 'sub-1',
    assignmentId: 'asgn-1',
    studentId: 'student-1',
    studentName: 'John Doe',
    studentEmail: 'john.doe@email.com',
    submittedAt: '2024-03-14T22:45:00Z',
    file: {
      name: 'todo-app-john.zip',
      size: 1250000,
      type: 'application/zip'
    },
    status: 'graded',
    marks: 85,
    feedback: 'Good implementation! Consider adding error handling for edge cases.'
  },
  {
    id: 'sub-2',
    assignmentId: 'asgn-1',
    studentId: 'student-2',
    studentName: 'Jane Smith',
    studentEmail: 'jane.smith@email.com',
    submittedAt: '2024-03-15T10:30:00Z',
    file: {
      name: 'todo-app-jane.zip',
      size: 980000,
      type: 'application/zip'
    },
    status: 'submitted',
    marks: null,
    feedback: null
  },
  {
    id: 'sub-3',
    assignmentId: 'asgn-1',
    studentId: 'student-3',
    studentName: 'Bob Wilson',
    studentEmail: 'bob.wilson@email.com',
    submittedAt: '2024-03-13T18:20:00Z',
    file: {
      name: 'todo-bob.zip',
      size: 1100000,
      type: 'application/zip'
    },
    status: 'graded',
    marks: 92,
    feedback: 'Excellent work! Clean code structure and great use of hooks.'
  }
];

// ============= QUIZ RESULTS =============
export const MOCK_QUIZ_RESULTS = [
  {
    id: 'result-1',
    quizId: 'quiz-1',
    studentId: 'student-1',
    studentName: 'John Doe',
    score: 40,
    totalPoints: 50,
    percentage: 80,
    completedAt: '2024-03-10T15:30:00Z',
    timeSpent: 12, // minutes
    answers: [1, 2, true, 1, 'useState']
  },
  {
    id: 'result-2',
    quizId: 'quiz-1',
    studentId: 'student-2',
    studentName: 'Jane Smith',
    score: 50,
    totalPoints: 50,
    percentage: 100,
    completedAt: '2024-03-11T10:15:00Z',
    timeSpent: 8,
    answers: [1, 2, true, 1, 'useState']
  }
];

// ============= ENROLLED COURSES (for students) =============
export const MOCK_ENROLLMENTS = [
  {
    studentId: 'student-1',
    courseId: '1',
    enrolledAt: '2024-02-15T09:00:00Z',
    progress: 35
  },
  {
    studentId: 'student-1',
    courseId: '3',
    enrolledAt: '2024-02-20T14:00:00Z',
    progress: 60
  }
];

// ============= HELPER FUNCTIONS =============

/**
 * Get courses for a specific tutor
 */
export const getCoursesByTutor = (tutorId) => {
  return MOCK_COURSES.filter(c => c.tutorId === tutorId);
};

/**
 * Get assignments for a specific course
 */
export const getAssignmentsByCourse = (courseId) => {
  return MOCK_ASSIGNMENTS.filter(a => a.courseId === courseId);
};

/**
 * Get quizzes for a specific course
 */
export const getQuizzesByCourse = (courseId) => {
  return MOCK_QUIZZES.filter(q => q.courseId === courseId);
};

/**
 * Get submissions for a specific assignment
 */
export const getSubmissionsByAssignment = (assignmentId) => {
  return MOCK_SUBMISSIONS.filter(s => s.assignmentId === assignmentId);
};

/**
 * Get enrolled courses for a student
 */
export const getEnrolledCourses = (studentId) => {
  const enrollments = MOCK_ENROLLMENTS.filter(e => e.studentId === studentId);
  return enrollments.map(e => ({
    ...MOCK_COURSES.find(c => c.id === e.courseId),
    progress: e.progress
  }));
};

/**
 * Get quiz results for a student
 */
export const getQuizResultsByStudent = (studentId) => {
  return MOCK_QUIZ_RESULTS.filter(r => r.studentId === studentId);
};

/**
 * Calculate time remaining until due date
 */
export const getTimeRemaining = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;

  if (diff <= 0) {
    return { expired: true, text: 'Past due' };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { expired: false, days, hours, minutes, text: `${days}d ${hours}h remaining` };
  } else if (hours > 0) {
    return { expired: false, days: 0, hours, minutes, text: `${hours}h ${minutes}m remaining` };
  } else {
    return { expired: false, days: 0, hours: 0, minutes, text: `${minutes}m remaining`, urgent: true };
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default {
  MOCK_COURSES,
  MOCK_ASSIGNMENTS,
  MOCK_QUIZZES,
  MOCK_SUBMISSIONS,
  MOCK_QUIZ_RESULTS,
  MOCK_ENROLLMENTS
};
