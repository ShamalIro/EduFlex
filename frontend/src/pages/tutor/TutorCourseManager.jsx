import React from 'react';
import { Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function TutorCourseManager() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Course Management
          </h1>
          <p className="text-slate-500">
            Manage your courses, lessons, and assessments
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-48 h-32 md:h-auto bg-slate-200 relative">
              <img
                src={`https://images.unsplash.com/photo-${
                  1633356122544 + i
                }-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80`}
                className="w-full h-full object-cover"
                alt="Course"
              />
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="success">Published</Badge>
                    <span className="text-xs text-slate-500">
                      Last updated 2 days ago
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Introduction to React Development
                  </h3>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
                <span>24 Lessons</span>
                <span>3 Quizzes</span>
                <span>1,250 Students</span>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="secondary" size="sm">
                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                  Edit Content
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
