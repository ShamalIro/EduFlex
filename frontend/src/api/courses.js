const MOCK_COURSES = [
  {
    id: '1',
    title: 'Introduction to React',
    description:
      'Learn the fundamentals of React.js, including components, state, props, and hooks. Build modern interactive UIs.',
    thumbnail:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tutor: 'Sarah Tutor',
    category: 'Programming',
    duration: '8 weeks',
    enrolledCount: 1250,
    lessonsCount: 24,
    rating: 4.8
  },
  {
    id: '2',
    title: 'Python for Data Science',
    description:
      'Master Python programming for data analysis, visualization, and machine learning applications.',
    thumbnail:
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tutor: 'Dr. Alan Grant',
    category: 'Data Science',
    duration: '12 weeks',
    enrolledCount: 850,
    lessonsCount: 36,
    rating: 4.9
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    description:
      'Understand the core principles of user interface and user experience design. Create beautiful, usable products.',
    thumbnail:
      'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tutor: 'Jessica Chen',
    category: 'Design',
    duration: '6 weeks',
    enrolledCount: 2100,
    lessonsCount: 18,
    rating: 4.7
  },
  {
    id: '4',
    title: 'Digital Marketing Strategy',
    description:
      'Learn how to create effective digital marketing campaigns, SEO, content marketing, and social media strategies.',
    thumbnail:
      'https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tutor: 'Mark Wilson',
    category: 'Marketing',
    duration: '5 weeks',
    enrolledCount: 1500,
    lessonsCount: 15,
    rating: 4.5
  },
  {
    id: '5',
    title: 'Machine Learning Basics',
    description:
      'An introduction to machine learning concepts, algorithms, and practical applications using Python.',
    thumbnail:
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tutor: 'Dr. Alan Grant',
    category: 'Data Science',
    duration: '10 weeks',
    enrolledCount: 950,
    lessonsCount: 28,
    rating: 4.8
  },
  {
    id: '6',
    title: 'Cloud Computing with AWS',
    description:
      'Get started with Amazon Web Services. Learn about EC2, S3, RDS, and how to deploy scalable applications.',
    thumbnail:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tutor: 'David Miller',
    category: 'Programming',
    duration: '8 weeks',
    enrolledCount: 1800,
    lessonsCount: 30,
    rating: 4.6
  }
];

const MOCK_LESSONS = [
  {
    id: '101',
    courseId: '1',
    title: 'Introduction to React Components',
    content: `
      <h2>What are Components?</h2>
      <p>Components are the building blocks of any React application. They let you split the UI into independent, reusable pieces, and think about each piece in isolation.</p>
      <p>Conceptually, components are like JavaScript functions. They accept arbitrary inputs (called "props") and return React elements describing what should appear on the screen.</p>

      <h3>Function Components</h3>
      <p>The simplest way to define a component is to write a JavaScript function:</p>
      <pre><code>function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}</code></pre>

      <h3>Class Components</h3>
      <p>You can also use an ES6 class to define a component:</p>
      <pre><code>class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}</code></pre>
    `,
    duration: '15 min',
    order: 1,
    completed: true
  },
  {
    id: '102',
    courseId: '1',
    title: 'JSX Syntax and Rules',
    content: 'JSX is a syntax extension for JavaScript...',
    duration: '20 min',
    order: 2,
    completed: false
  },
  {
    id: '103',
    courseId: '1',
    title: 'Props and State',
    content: 'Props are read-only, State is mutable...',
    duration: '25 min',
    order: 3,
    completed: false
  }
];

/**
 * @returns {Promise<import('../types').Course[]>}
 */
export const getCourses = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return MOCK_COURSES;
};

/**
 * @param {string} id
 * @returns {Promise<import('../types').Course | undefined>}
 */
export const getCourseById = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_COURSES.find((c) => c.id === id);
};

/**
 * @param {string} courseId
 * @returns {Promise<import('../types').Lesson[]>}
 */
export const getCourseLessons = async (courseId) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_LESSONS.filter((l) => l.courseId === courseId); // In real app, would filter correctly
};

/**
 * @returns {Promise<import('../types').Course[]>}
 */
export const getEnrolledCourses = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [MOCK_COURSES[0], MOCK_COURSES[2]]; // Return first and third as enrolled
};
