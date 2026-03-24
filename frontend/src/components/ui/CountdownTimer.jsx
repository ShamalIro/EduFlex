import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

/**
 * CountdownTimer Component
 * Displays a countdown to a specific date/time or counts down from a duration
 *
 * @param {Object} props
 * @param {string} props.targetDate - ISO date string to count down to
 * @param {number} props.durationMinutes - Alternative: countdown from minutes
 * @param {function} props.onExpire - Callback when timer reaches zero
 * @param {boolean} props.showIcon - Whether to show the clock icon
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.variant - 'default' | 'compact' | 'detailed'
 */
export function CountdownTimer({
  targetDate,
  durationMinutes,
  onExpire,
  showIcon = true,
  size = 'md',
  variant = 'default',
  className = ''
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    let targetTime;

    if (targetDate) {
      targetTime = new Date(targetDate).getTime();
    } else if (durationMinutes) {
      targetTime = Date.now() + durationMinutes * 60 * 1000;
    } else {
      return;
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onExpire) onExpire();
        return false;
      }

      // Check if less than 5 minutes remaining
      setIsUrgent(difference < 5 * 60 * 1000);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      return true;
    };

    // Initial calculation
    const shouldContinue = calculateTimeLeft();

    if (shouldContinue) {
      const interval = setInterval(() => {
        const continueTimer = calculateTimeLeft();
        if (!continueTimer) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [targetDate, durationMinutes, onExpire]);

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Status-based styling
  const getStatusStyles = () => {
    if (isExpired) {
      return 'bg-rose-100 text-rose-700 border-rose-200';
    }
    if (isUrgent) {
      return 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse';
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  // Format time display based on variant
  const formatTime = () => {
    if (isExpired) {
      return 'Time expired';
    }

    const { days, hours, minutes, seconds } = timeLeft;

    switch (variant) {
      case 'compact':
        if (days > 0) {
          return `${days}d ${hours}h`;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      case 'detailed':
        const parts = [];
        if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
        if (parts.length === 0) parts.push(`${seconds} sec`);
        return parts.join(', ');

      default: // 'default'
        if (days > 0) {
          return `${days}d ${hours}h ${minutes}m`;
        }
        if (hours > 0) {
          return `${hours}h ${minutes}m ${seconds}s`;
        }
        return `${minutes}m ${seconds}s`;
    }
  };

  return (
    <div
      className={`
        inline-flex items-center rounded-lg border font-medium
        ${sizeClasses[size]}
        ${getStatusStyles()}
        ${className}
      `}
    >
      {showIcon && (
        isExpired || isUrgent ? (
          <AlertTriangle className={`${iconSizes[size]} mr-1.5`} />
        ) : (
          <Clock className={`${iconSizes[size]} mr-1.5`} />
        )
      )}
      <span className="font-mono">{formatTime()}</span>
    </div>
  );
}

/**
 * QuizTimer - Specialized timer for quiz attempts
 * Shows remaining time and auto-submits when expired
 */
export function QuizTimer({
  durationMinutes,
  onTimeUp,
  className = ''
}) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    // Warning when less than 1 minute
    setIsWarning(secondsLeft < 60);

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div
      className={`
        inline-flex items-center px-4 py-2 rounded-lg font-mono font-medium text-lg
        ${isWarning
          ? 'bg-rose-100 text-rose-700 animate-pulse'
          : secondsLeft < 300
            ? 'bg-amber-100 text-amber-700'
            : 'bg-indigo-50 text-indigo-700'
        }
        ${className}
      `}
    >
      <Clock className={`h-5 w-5 mr-2 ${isWarning ? 'animate-bounce' : ''}`} />
      <span>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}

export default CountdownTimer;
