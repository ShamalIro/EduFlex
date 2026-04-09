import React, { useEffect, useState } from 'react';
import { getCourses } from '../../api/courses';
import { CourseCard } from '../../components/shared/CourseCard';
import { Button } from '../../components/ui/Button';
import { useNavigate, useOutletContext } from 'react-router-dom';

export function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const { cart = [], addToCart } = useOutletContext() || {};

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await getCourses();
      setCourses(data);
      setFilteredCourses(data);
      setIsLoading(false);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    let result = courses;
    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
    }
    setFilteredCourses(result);
  }, [selectedCategory, courses]);

  const categories = [
    'All',
    'Programming',
    'Design',
    'Business',
    'Data Science',
    'Marketing'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Courses</h1>
          <p className="text-slate-500 mt-1">
            Discover new skills and advance your career
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="relative">
              <CourseCard
                course={course}
                onEnroll={() => navigate(`/student/courses/${course._id}`)}
              />
              {/* ✅ Add to Cart button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart && addToCart(course);
                }}
                disabled={!!cart.find(c => c._id === course._id)}
                className={`absolute top-2 right-2 text-xs px-2.5 py-1 rounded-full font-medium transition ${
                  cart.find(c => c._id === course._id)
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-black/50 text-white backdrop-blur-sm hover:bg-blue-600'
                }`}
              >
                {cart.find(c => c._id === course._id) ? '✓ Added' : '+ Cart'}
              </button>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">
            No courses found matching your criteria.
          </p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => setSelectedCategory('All')}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
