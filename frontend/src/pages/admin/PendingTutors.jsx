import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { getPendingTutors, approveTutor, rejectTutor } from '../../api/admin';

export function PendingTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingTutors();
  }, []);

  const fetchPendingTutors = async () => {
    try {
      setLoading(true);
      const data = await getPendingTutors();
      setTutors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve this tutor?')) return;
    try {
      await approveTutor(userId);
      fetchPendingTutors();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Reject this tutor?')) return;
    try {
      await rejectTutor(userId);
      fetchPendingTutors();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Pending Tutor Approvals</h1>
        <span className="text-slate-500 text-sm">{tutors.length} pending</span>
      </div>

      {tutors.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">
            No pending approvals!
          </h3>
          <p className="text-slate-500 mt-2">
            All tutor applications have been reviewed.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar
                    name={`${tutor.first_name} ${tutor.last_name}`}
                    size="md"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {tutor.first_name} {tutor.last_name}
                    </h3>
                    <p className="text-sm text-slate-500">{tutor.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-400">
                        Applied {new Date(tutor.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(tutor.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(tutor.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium">
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
