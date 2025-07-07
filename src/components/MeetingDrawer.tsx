"use client";

import { useState, useEffect } from 'react';
import { Meeting, CreateMeetingData, UpdateMeetingData } from '@/types/meeting';
import { api } from '@/lib/supabase';
import {
  Button,
  Input,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure
} from '@heroui/react';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import MDEditor from '@uiw/react-md-editor';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface MeetingDrawerProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Meeting) => void;
}

export default function MeetingDrawer({ meeting, isOpen, onClose, onSave }: MeetingDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState<Date>(new Date());
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when meeting changes
  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title);
      setTime(new Date(meeting.time));
      setContent(meeting.content);
      setIsEditing(false);
    } else {
      // New meeting
      setTitle('');
      setTime(new Date());
      setContent('');
      setIsEditing(true);
    }
    setError(null);
  }, [meeting]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (meeting) {
        // Update existing meeting
        const updateData: UpdateMeetingData = {
          title: title.trim(),
          time: time.toISOString(),
          content: content.trim()
        };
        
        const response = await api.meetings.update(meeting.id, updateData);
        
        if (response.success && response.data) {
          onSave(response.data);
          setIsEditing(false);
        } else {
          setError(response.error || 'Failed to update meeting');
        }
      } else {
        // Create new meeting
        const createData: CreateMeetingData = {
          title: title.trim(),
          time: time.toISOString(),
          content: content.trim()
        };
        
        const response = await api.meetings.create(createData);
        
        if (response.success && response.data) {
          onSave(response.data);
          onClose();
        } else {
          setError(response.error || 'Failed to create meeting');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (meeting) {
      // Restore original values
      setTitle(meeting.title);
      setTime(new Date(meeting.time));
      setContent(meeting.content);
      setIsEditing(false);
    } else {
      // Close drawer for new meeting
      onClose();
    }
    setError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size="lg"
      className="max-w-4xl"
    >
      <DrawerContent>
        <DrawerHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {meeting ? (isEditing ? 'Edit Meeting' : 'Meeting Details') : 'New Meeting'}
          </h2>
          <div className="flex items-center gap-2">
            {meeting && !isEditing && (
              <Button
                isIconOnly
                variant="light"
                onPress={handleEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <PencilIcon className="h-5 w-5" />
              </Button>
            )}
            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </DrawerHeader>

        <DrawerBody>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Meeting Title</label>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter meeting title"
                  className="w-full"
                />
              ) : (
                <p className="text-lg font-medium">{title}</p>
              )}
            </div>

            {/* Date/Time */}
            <div>
              <label className="block text-sm font-medium mb-2">Meeting Time</label>
              {isEditing ? (
                <DatePicker
                  selected={time}
                  onChange={(date) => setTime(date || new Date())}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-600">
                  {time.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Meeting Content</label>
              {isEditing ? (
                <MDEditor
                  value={content}
                  onChange={(value) => setContent(value || '')}
                  height={400}
                  preview="edit"
                  hideToolbar={false}
                />
              ) : (
                <div className="prose prose-gray max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </DrawerBody>

        <DrawerFooter>
          <div className="flex gap-2">
            <Button
              variant="light"
              onPress={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            {isEditing && (
              <Button
                color="primary"
                onPress={handleSave}
                isLoading={loading}
              >
                {meeting ? 'Update' : 'Create'}
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}