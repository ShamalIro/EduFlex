import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { CourseCard } from '../../components/shared/CourseCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getCourses } from '../../api/courses';

export function PublicCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

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
    if (search) {
      result = result.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
    }
    setFilteredCourses(result);
  }, [search, selectedCategory, courses]);

  const categories = [
  'All',
  'Programming',
  'Design',
  'Business',
  'Data Science',
  'Marketing'];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Explore Our Course Catalog
          </h1>
          <p className="text-lg text-slate-600">
            Discover expert-led courses designed to help you master new skills
            and advance your career.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map((category) =>
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === category ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
                `}>

                {category}
              </button>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="w-full md:w-72">
              <Input
                placeholder="Search courses..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)} />

            </div>
            <Button variant="secondary" className="px-3">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) =>
          <div
            key={i}
            className="h-96 bg-slate-200 rounded-xl animate-pulse" />

          )}
          </div> :

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) =>
          <CourseCard
            key={course.id}
            course={course}
            onEnroll={() => navigate('/register')} />

          )}
          </div>
        }

        {!isLoading && filteredCourses.length === 0 &&
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No courses found
            </h3>
            <p className="text-slate-500 mb-6">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
            <Button
            variant="secondary"
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}>

              Clear Filters
            </Button>
          </div>
        }
      </div>

      <Footer />
    </div>);

}
