import React from 'react';
import { Star, Clock, Users, PlayCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

export function CourseCard({
  course,
  isEnrolled = false,
  progress = 0,
  onEnroll,
  onContinue
}) {
  return (
    <Card hoverable className="flex flex-col h-full">
      <div className="relative h-48 bg-slate-200">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover" />

        <div className="absolute top-3 left-3">
          <Badge
            variant="info"
            className="bg-white/90 backdrop-blur-sm shadow-sm">

            {course.category}
          </Badge>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-amber-500 text-sm font-medium">
            <Star className="h-4 w-4 fill-current mr-1" />
            {course.rating}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {course.duration}
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-slate-500 mb-4">by {course.tutor}</p>

        <div className="mt-auto space-y-4">
          {!isEnrolled ?
          <>
              <div className="flex items-center text-sm text-slate-500">
                <Users className="h-4 w-4 mr-1.5" />
                {course.enrolledCount.toLocaleString()} students
              </div>
              <Button onClick={onEnroll} className="w-full">
                Enroll Now
              </Button>
            </> :

          <>
              <ProgressBar value={progress} size="sm" showLabel />
              <Button onClick={onContinue} variant="primary" className="w-full">
                <PlayCircle className="h-4 w-4 mr-2" />
                Continue Learning
              </Button>
            </>
          }
        </div>
      </div>
    </Card>);

}
