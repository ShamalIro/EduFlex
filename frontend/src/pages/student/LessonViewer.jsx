import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Menu } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';

// Mock data for the lesson viewer since we don't have a full backend
const LESSON_CONTENT = `
  <h1 class="text-3xl font-bold text-slate-900 mb-6">Introduction to React Components</h1>
  <p class="text-lg text-slate-700 mb-6 leading-relaxed">
    Components are the building blocks of any React application. They let you split the UI into independent, reusable pieces, and think about each piece in isolation.
  </p>

  <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Function Components</h2>
  <p class="text-slate-700 mb-4 leading-relaxed">
    The simplest way to define a component is to write a JavaScript function:
  </p>

  <div class="bg-slate-900 text-slate-50 p-6 rounded-lg font-mono text-sm mb-8 overflow-x-auto">
    <span class="text-purple-400">function</span> <span class="text-blue-400">Welcome</span>(props) {
    <br/>&nbsp;&nbsp;<span class="text-purple-400">return</span> &lt;<span class="text-red-400">h1</span>&gt;Hello, {props.name}&lt;/<span class="text-red-400">h1</span>&gt;;
    <br/>}
  </div>

  <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Key Takeaways</h2>
  <ul class="list-disc pl-6 space-y-2 text-slate-700 mb-8">
    <li>Components allow you to reuse code</li>
    <li>They accept inputs called "props"</li>
    <li>They return React elements</li>
    <li>Always capitalize component names</li>
  </ul>
`;

export function LessonViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Mock lessons list
  const lessons = [
    {
      id: '101',
      title: 'Introduction to React Components',
      completed: true
    },
    {
      id: '102',
      title: 'JSX Syntax and Rules',
      completed: false
    },
    {
      id: '103',
      title: 'Props and State',
      completed: false
    },
    {
      id: '104',
      title: 'Handling Events',
      completed: false
    }
  ];

  const currentLessonIndex = lessons.findIndex((l) => l.id === id) || 0;
  const currentLesson = lessons[currentLessonIndex];

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 lg:-m-8">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Toolbar */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h2 className="font-semibold text-slate-900 truncate hidden md:block">
              {currentLesson?.title}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-4xl mx-auto w-full">
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{
              __html: LESSON_CONTENT
            }}
          />

          <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
            <Button
              variant="secondary"
              disabled={currentLessonIndex === 0}
              onClick={() =>
                navigate(
                  `/student/lessons/${lessons[currentLessonIndex - 1].id}`
                )
              }
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                if (currentLessonIndex < lessons.length - 1) {
                  navigate(
                    `/student/lessons/${lessons[currentLessonIndex + 1].id}`
                  );
                } else {
                  navigate('/student/quiz/q1');
                }
              }}
            >
              {currentLessonIndex === lessons.length - 1
                ? 'Take Quiz'
                : 'Next Lesson'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Lesson List */}
      <div
        className={`
        w-80 bg-slate-50 border-l border-slate-200 flex flex-col transition-all duration-300 absolute inset-y-0 right-0 z-20 lg:static
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-80'}
      `}
      >
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 mb-2">Course Content</h3>
          <ProgressBar value={25} size="sm" showLabel />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {lessons.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => navigate(`/student/lessons/${lesson.id}`)}
              className={`
                w-full flex items-center p-3 rounded-lg text-left text-sm transition-colors
                ${lesson.id === id ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'hover:bg-slate-100 text-slate-700'}
              `}
            >
              <div
                className={`
                flex-shrink-0 h-6 w-6 rounded-full border flex items-center justify-center mr-3
                ${lesson.completed ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : lesson.id === id ? 'border-indigo-600 text-indigo-600' : 'border-slate-300 text-slate-400'}
              `}
              >
                {lesson.completed ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-xs font-medium">{idx + 1}</span>
                )}
              </div>
              <span className="truncate font-medium">{lesson.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
