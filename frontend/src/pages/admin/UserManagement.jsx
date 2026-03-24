import React, { useState, useEffect } from 'react';
import { Search, Shield, User, GraduationCap, Trash2, ToggleLeft, ToggleRight, UserCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { getAllUsers, updateUserStatus, deleteUser, updateUserRole } from '../../api/admin';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleMenuOpen, setRoleMenuOpen] = useState(null); // stores userId

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await updateUserStatus(userId, currentStatus ? 0 : 1);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Change role to "${newRole}"?`)) return;
    try {
      await updateUserRole(userId, newRole);
      setRoleMenuOpen(null);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="h-3 w-3 mr-1" />;
      case 'tutor': return <GraduationCap className="h-3 w-3 mr-1" />;
      default: return <User className="h-3 w-3 mr-1" />;
    }
  };

  if (loading) return <div className="text-center py-10">Loading users...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <span className="text-slate-500 text-sm">{users.length} total users</span>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search users..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900">User</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Role</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Joined</th>
                <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Avatar name={`${user.first_name} ${user.last_name}`} size="sm" className="mr-3" />
                      <div>
                        <div className="font-medium text-slate-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-slate-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="default" className="capitalize flex items-center w-fit">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.is_active ? 'success' : 'warning'} className="capitalize">
                      {user.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className="text-slate-400 hover:text-indigo-600 p-1 rounded"
                        title={user.is_active ? 'Deactivate' : 'Activate'}>
                        {user.is_active
                          ? <ToggleRight className="h-5 w-5 text-green-500" />
                          : <ToggleLeft className="h-5 w-5 text-slate-400" />}
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setRoleMenuOpen(roleMenuOpen === user.id ? null : user.id)}
                          className="text-slate-400 hover:text-indigo-600 p-1 rounded"
                          title="Change role">
                          <UserCheck className="h-5 w-5 text-indigo-400" />
                        </button>

                        {roleMenuOpen === user.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                            {['student', 'tutor', 'admin'].map((role) => (
                              <button
                                key={role}
                                onClick={() => handleChangeRole(user.id, role)}
                                className={`w-full text-left px-4 py-2 text-sm capitalize hover:bg-slate-50 
                                  ${user.role === role ? 'text-indigo-600 font-medium' : 'text-slate-700'}`}>
                                {role === user.role ? `✓ ${role}` : role}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        title="Delete user">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}