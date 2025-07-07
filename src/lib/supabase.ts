import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types
export interface Database {
  public: {
    Tables: {
      meeting_minutes: {
        Row: MeetingMinute;
        Insert: MeetingMinuteInsert;
        Update: MeetingMinuteUpdate;
      };
      attendees: {
        Row: Attendee;
        Insert: AttendeeInsert;
        Update: AttendeeUpdate;
      };
      meeting_attendees: {
        Row: MeetingAttendee;
        Insert: MeetingAttendeeInsert;
        Update: MeetingAttendeeUpdate;
      };
    };
  };
}

// Types for the Meeting Minutes schema
export interface MeetingMinute {
  id: string;
  title: string;
  content: string;
  meeting_date: string;
  location?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  created_by?: string;
  tags?: string[];
}

export interface MeetingMinuteInsert {
  title: string;
  content: string;
  meeting_date: string;
  location?: string;
  status?: 'draft' | 'published' | 'archived';
  created_by?: string;
  tags?: string[];
}

export interface MeetingMinuteUpdate {
  title?: string;
  content?: string;
  meeting_date?: string;
  location?: string;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendeeInsert {
  name: string;
  email: string;
  role?: string;
  department?: string;
}

export interface AttendeeUpdate {
  name?: string;
  email?: string;
  role?: string;
  department?: string;
}

export interface MeetingAttendee {
  id: string;
  meeting_id: string;
  attendee_id: string;
  attendance_status: 'invited' | 'attended' | 'absent';
  created_at: string;
}

export interface MeetingAttendeeInsert {
  meeting_id: string;
  attendee_id: string;
  attendance_status?: 'invited' | 'attended' | 'absent';
}

export interface MeetingAttendeeUpdate {
  attendance_status?: 'invited' | 'attended' | 'absent';
}

// Custom error types
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Environment validation
const validateEnvironment = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  
  return { supabaseUrl, supabaseKey };
};

// Initialize Supabase client with proper typing
let supabaseClient: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabaseClient) {
    const { supabaseUrl, supabaseKey } = validateEnvironment();
    supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseClient;
};

// Export the client for convenience
export const supabase = getSupabaseClient();

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Helper function to handle API responses
const handleApiResponse = <T>(data: T | null, error: any): ApiResponse<T> => {
  if (error) {
    console.error('Supabase API Error:', error);
    return {
      data: null,
      error: error.message || 'An unknown error occurred',
      success: false,
    };
  }
  
  return {
    data,
    error: null,
    success: true,
  };
};

// Database operations for Meeting Minutes
export const meetingMinutesAPI = {
  // Get all meeting minutes with optional filtering
  async getAll(
    filters: {
      status?: 'draft' | 'published' | 'archived';
      limit?: number;
      offset?: number;
      search?: string;
    } = {}
  ): Promise<ApiResponse<MeetingMinute[]>> {
    try {
      let query = supabase
        .from('meeting_minutes')
        .select('*')
        .order('meeting_date', { ascending: false });
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Get a single meeting minute by ID with attendees
  async getById(id: string): Promise<ApiResponse<MeetingMinute & { attendees?: Attendee[] }>> {
    try {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select(`
          *,
          meeting_attendees(
            attendance_status,
            attendees(*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        return handleApiResponse(null, error);
      }
      
      // Transform the nested data structure
      const attendees = data.meeting_attendees?.map((ma: any) => ({
        ...ma.attendees,
        attendance_status: ma.attendance_status
      })) || [];
      
      const result = {
        ...data,
        attendees,
        meeting_attendees: undefined
      };
      
      return handleApiResponse(result, null);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Create a new meeting minute
  async create(meetingMinute: MeetingMinuteInsert): Promise<ApiResponse<MeetingMinute>> {
    try {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .insert([meetingMinute])
        .select()
        .single();
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Update an existing meeting minute
  async update(id: string, updates: MeetingMinuteUpdate): Promise<ApiResponse<MeetingMinute>> {
    try {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Delete a meeting minute
  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('meeting_minutes')
        .delete()
        .eq('id', id);
      
      return handleApiResponse(null, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Duplicate a meeting minute
  async duplicate(id: string): Promise<ApiResponse<MeetingMinute>> {
    try {
      const { data: original, error: fetchError } = await supabase
        .from('meeting_minutes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        return handleApiResponse(null, fetchError);
      }
      
      const duplicate = {
        ...original,
        id: undefined,
        title: `${original.title} (Copy)`,
        status: 'draft' as const,
        created_at: undefined,
        updated_at: undefined,
      };
      
      const { data, error } = await supabase
        .from('meeting_minutes')
        .insert([duplicate])
        .select()
        .single();
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Get meeting statistics
  async getStats(): Promise<ApiResponse<{
    total: number;
    published: number;
    draft: number;
    archived: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('status');
      
      if (error) {
        return handleApiResponse(null, error);
      }
      
      const stats = {
        total: data.length,
        published: data.filter(m => m.status === 'published').length,
        draft: data.filter(m => m.status === 'draft').length,
        archived: data.filter(m => m.status === 'archived').length,
      };
      
      return handleApiResponse(stats, null);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  }
};

// Database operations for Attendees
export const attendeesAPI = {
  // Get all attendees
  async getAll(): Promise<ApiResponse<Attendee[]>> {
    try {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .order('name', { ascending: true });
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Get attendee by ID
  async getById(id: string): Promise<ApiResponse<Attendee>> {
    try {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .eq('id', id)
        .single();
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Create a new attendee
  async create(attendee: AttendeeInsert): Promise<ApiResponse<Attendee>> {
    try {
      const { data, error } = await supabase
        .from('attendees')
        .insert([attendee])
        .select()
        .single();
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Update an existing attendee
  async update(id: string, updates: AttendeeUpdate): Promise<ApiResponse<Attendee>> {
    try {
      const { data, error } = await supabase
        .from('attendees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Delete an attendee
  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('attendees')
        .delete()
        .eq('id', id);
      
      return handleApiResponse(null, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Search attendees by name or email
  async search(query: string): Promise<ApiResponse<Attendee[]>> {
    try {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('name', { ascending: true });
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  }
};

// Database operations for Meeting Attendees
export const meetingAttendeesAPI = {
  // Add attendee to meeting
  async addToMeeting(meetingId: string, attendeeId: string, status: 'invited' | 'attended' | 'absent' = 'invited'): Promise<ApiResponse<MeetingAttendee>> {
    try {
      const { data, error } = await supabase
        .from('meeting_attendees')
        .insert([{ meeting_id: meetingId, attendee_id: attendeeId, attendance_status: status }])
        .select()
        .single();
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Remove attendee from meeting
  async removeFromMeeting(meetingId: string, attendeeId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('meeting_attendees')
        .delete()
        .eq('meeting_id', meetingId)
        .eq('attendee_id', attendeeId);
      
      return handleApiResponse(null, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Update attendance status
  async updateAttendanceStatus(meetingId: string, attendeeId: string, status: 'invited' | 'attended' | 'absent'): Promise<ApiResponse<MeetingAttendee>> {
    try {
      const { data, error } = await supabase
        .from('meeting_attendees')
        .update({ attendance_status: status })
        .eq('meeting_id', meetingId)
        .eq('attendee_id', attendeeId)
        .select()
        .single();
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Get attendees for a meeting
  async getByMeetingId(meetingId: string): Promise<ApiResponse<(MeetingAttendee & { attendee: Attendee })[]>> {
    try {
      const { data, error } = await supabase
        .from('meeting_attendees')
        .select(`
          *,
          attendees(*)
        `)
        .eq('meeting_id', meetingId);
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  }
};

// Configuration for development mode
export const isDevelopment = process.env.NODE_ENV === 'development';
export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Export all APIs
export const api = {
  meetingMinutes: meetingMinutesAPI,
  attendees: attendeesAPI,
  meetingAttendees: meetingAttendeesAPI,
};

// Health check function
export const healthCheck = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('meeting_minutes')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};