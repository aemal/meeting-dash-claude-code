export interface Meeting {
  id: string;
  title: string;
  time: string;
  content: string; // markdown
  created_at: string;
  updated_at: string;
}

export interface CreateMeetingData {
  title: string;
  time: string;
  content: string;
}

export interface UpdateMeetingData {
  title?: string;
  time?: string;
  content?: string;
}