import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  Lock,
  PlayCircle,
  Award
} from 'lucide-react';
import { getCourseById, getCourseLessons } from '../../api/courses';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ProgressBar } from '../../components/ui/ProgressBar';

export function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(undefined);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false); // Mock state

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const courseData = await getCourseById(id);
        const lessonsData = await getCourseLessons(id);
        setCourse(courseData);
        setLessons(lessonsData);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading)
    return <div className="p-8 text-center">Loading course details...</div>;
  if (!course) return <div className="p-8 text-center">Course not found</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="relative h-64 md:h-80">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
            <div className="p-8 text-white w-full">
              <Badge
                variant="info"
                className="mb-4 bg-indigo-500 text-white border-none"
              >
                {course.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                <div className="flex items-center">
                  <Avatar
                    name={course.tutor}
                    size="sm"
                    className="mr-2 border-2 border-white"
                  />
                  <span>{course.tutor}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-400 mr-1 fill-current" />
                  <span>{course.rating} (420 reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 opacity-80" />
                  <span>{course.enrolledCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 opacity-80" />
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex-1 w-full">
            {isEnrolled ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-700">Your Progress</span>
                  <span className="text-indigo-600">35%</span>
                </div>
                <ProgressBar value={35} />
              </div>
            ) : (
              <p className="text-slate-600">
                Join over {course.enrolledCount} students and master this skill
                today.
              </p>
            )}
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {isEnrolled ? (
              <Button
                size="lg"
                className="w-full md:w-auto"
                onClick={() => navigate(`/student/lessons/${lessons[0]?.id}`)}
              >
                Continue Learning
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full md:w-auto"
                onClick={() => setIsEnrolled(true)}
              >
                Enroll Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8">
              {['Overview', 'Lessons', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.toLowerCase() ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                  `}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    About this course
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    What you'll learn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">
                          Master core concepts and advanced techniques
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className={`
                      flex items-center p-4 rounded-lg border transition-colors
                      ${isEnrolled ? 'bg-white border-slate-200 hover:border-indigo-300 cursor-pointer' : 'bg-slate-50 border-slate-200 opacity-75'}
                    `}
                    onClick={() =>
                      isEnrolled && navigate(`/student/lessons/${lesson.id}`)
                    }
                  >
                    <div className="flex-shrink-0 mr-4">
                      {lesson.completed ? (
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      ) : isEnrolled ? (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <PlayCircle className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                          <Lock className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900">
                        {idx + 1}. {lesson.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lesson.duration}
                      </p>
                    </div>
                    {isEnrolled && (
                      <Button variant="ghost" size="sm">
                        Start
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12 text-slate-500">
                Reviews coming soon...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Course Features</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-sm text-slate-600">
                <BookOpen className="h-5 w-5 text-slate-400 mr-3" />
                {course.lessonsCount} Lessons
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <Clock className="h-5 w-5 text-slate-400 mr-3" />
                {course.duration} of content
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <Award className="h-5 w-5 text-slate-400 mr-3" />
                Certificate of completion
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
