"use client";

import { useState, useEffect } from 'react';
import { Meeting } from '@/types/meeting';
import { api } from '@/lib/supabase';
import { Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import MeetingDrawer from '@/components/MeetingDrawer';

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setLoading(true);
    setError(null);
    const response = await api.meetings.getAll();
    if (response.success && response.data) {
      setMeetings(response.data);
    } else {
      setError(response.error || 'Failed to load meetings');
    }
    setLoading(false);
  };

  const handleRowClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsDrawerOpen(true);
  };

  const handleAddMeeting = () => {
    setSelectedMeeting(null);
    setIsDrawerOpen(true);
  };

  const handleMeetingSaved = (meeting: Meeting) => {
    if (selectedMeeting) {
      // Update existing meeting in list
      setMeetings(prev => prev.map(m => m.id === meeting.id ? meeting : m));
    } else {
      // Add new meeting to list
      setMeetings(prev => [meeting, ...prev]);
    }
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedMeeting(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Meeting Minutes Viewer & Editor</h1>
          <Button
            color="primary"
            startContent={<PlusIcon className="h-5 w-5" />}
            onPress={handleAddMeeting}
          >
            Add Meeting Minutes
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <strong>Error loading meetings:</strong> {error}
              </div>
              <Button
                size="sm"
                variant="light"
                onPress={loadMeetings}
                className="text-red-600 hover:text-red-800"
              >
                Retry
              </Button>
            </div>
            {error.includes('Database table not found') && (
              <div className="mt-2 text-sm">
                <p>Please run the database setup script in your Supabase SQL Editor:</p>
                <code className="bg-red-100 px-2 py-1 rounded text-xs">
                  src/lib/database-setup.sql
                </code>
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Table aria-label="Meeting minutes table">
            <TableHeader>
              <TableColumn>Meeting Title</TableColumn>
              <TableColumn>Meeting Time</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={loading}
              loadingContent={"Loading meetings..."}
              emptyContent={"No meetings found. Create your first meeting!"}
            >
              {meetings.map((meeting) => (
                <TableRow
                  key={meeting.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleRowClick(meeting)}
                >
                  <TableCell className="font-medium">{meeting.title}</TableCell>
                  <TableCell>{formatDate(meeting.time)}</TableCell>
                  <TableCell>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMeeting(meeting);
                        setIsDrawerOpen(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <MeetingDrawer
          meeting={selectedMeeting}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          onSave={handleMeetingSaved}
        />
      </div>
    </div>
  );
}