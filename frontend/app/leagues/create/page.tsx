'use client';

import React, { useState } from 'react';
import { Layout } from '../../../components/Layout';
import { Card, CardContent } from '../../../components/Card';
import { Button } from '../../../components/Button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Trophy } from 'lucide-react';

export default function CreateLeaguePage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 10,
    startDate: '',
    endDate: '',
    prize: '',
    isPrivate: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Creating league:', formData);
    // Redirect to leagues page or show success message
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link 
              href="/leagues" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leagues
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Create New League</h1>
            <p className="mt-2 text-gray-600">
              Set up your fantasy options trading league and invite friends to compete
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    League Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter league name"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your league's goals and rules"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="h-4 w-4 inline mr-1" />
                      Max Members
                    </label>
                    <select
                      id="maxMembers"
                      name="maxMembers"
                      value={formData.maxMembers}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5 members</option>
                      <option value={10}>10 members</option>
                      <option value={15}>15 members</option>
                      <option value={20}>20 members</option>
                      <option value={25}>25 members</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="prize" className="block text-sm font-medium text-gray-700 mb-2">
                      <Trophy className="h-4 w-4 inline mr-1" />
                      Prize Pool
                    </label>
                    <input
                      type="text"
                      id="prize"
                      name="prize"
                      value={formData.prize}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., $500, Trophy, Bragging Rights"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      required
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      required
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                    Make this league private (invite only)
                  </label>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" className="flex-1">
                    Create League
                  </Button>
                  <Link href="/leagues" className="flex-1">
                    <Button type="button" variant="secondary" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
