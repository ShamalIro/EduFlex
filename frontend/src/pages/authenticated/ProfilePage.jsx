import React, { useState } from 'react';
import { User, Mail, Lock, Save, Shield } from 'lucide-react';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    // In a real app, we'd update the user context here
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Account Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your profile information and security.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Profile Header */}
          <Card className="p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar
                name={user.name}
                src={user.avatar}
                size="lg"
                className="h-24 w-24 text-2xl" />

              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-slate-200 text-slate-600 hover:text-indigo-600">
                <User className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 mb-3">{user.email}</p>
              <Badge variant="info" className="capitalize px-3 py-1 text-sm">
                <Shield className="h-3 w-3 mr-1 inline" />
                {user.role} Account
              </Badge>
            </div>
          </Card>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Personal Information */}
            <Card className="p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-indigo-600" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value
                  })
                  }
                  icon={User} />

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value
                  })
                  }
                  icon={Mail} />

              </div>
            </Card>

            {/* Security */}
            <Card className="p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-indigo-600" />
                Security
              </h3>
              <div className="space-y-6 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.currentPassword}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentPassword: e.target.value
                  })
                  } />

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      newPassword: e.target.value
                    })
                    } />

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value
                    })
                    } />

                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>);

}
