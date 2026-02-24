import React, { useState } from 'react';
import {
  Search,
  MoreHorizontal,
  Shield,
  User,
  GraduationCap } from
'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
  {
    id: 1,
    name: 'Alex Student',
    email: 'student@edu.com',
    role: 'student',
    status: 'active',
    joined: '2023-10-15'
  },
  {
    id: 2,
    name: 'Sarah Tutor',
    email: 'tutor@edu.com',
    role: 'tutor',
    status: 'active',
    joined: '2023-09-20'
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@edu.com',
    role: 'admin',
    status: 'active',
    joined: '2023-01-10'
  },
  {
    id: 4,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    status: 'inactive',
    joined: '2023-11-05'
  },
  {
    id: 5,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'student',
    status: 'active',
    joined: '2023-11-12'
  }];

  const filteredUsers = users.filter(
    (user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3 mr-1" />;
      case 'tutor':
        return <GraduationCap className="h-3 w-3 mr-1" />;
      default:
        return <User className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <Button>Add User</Button>
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
                <th className="px-6 py-4 font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900">
                  Joined
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) =>
              <tr
                key={user.id}
                className="hover:bg-slate-50 transition-colors">

                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Avatar name={user.name} size="sm" className="mr-3" />
                      <div>
                        <div className="font-medium text-slate-900">
                          {user.name}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                    variant="default"
                    className="capitalize flex items-center w-fit">

                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                    variant={user.status === 'active' ? 'success' : 'warning'}
                    className="capitalize">

                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(user.joined).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>);

}
