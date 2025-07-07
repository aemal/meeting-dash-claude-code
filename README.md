# Meeting Minutes Viewer & Editor

A modern web application for viewing, creating, and editing meeting minutes with a clean, intuitive interface. Built with Next.js 15, React 19, TypeScript, and HeroUI.

## Features

- **Meeting Minutes Table View**: Browse all meeting minutes in a clean table format
- **Drawer-Based Interface**: View and edit meeting details in a slide-out drawer
- **Markdown Support**: Full markdown editing with live preview using react-markdown
- **WYSIWYG Editor**: Rich text editing with @uiw/react-md-editor
- **Real-time Updates**: Instant synchronization with Supabase backend
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Beautiful interface powered by HeroUI and Tailwind CSS

## Technology Stack

### Frontend
- **Next.js 15.3.5** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and better development experience
- **HeroUI** - Modern React UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **react-markdown** - Markdown rendering
- **@uiw/react-md-editor** - WYSIWYG markdown editor
- **react-datepicker** - Date/time picker component

### Backend
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase JS** - Database client and authentication

## Database Schema

The application uses a simple `meetings` table with the following structure:

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  time TIMESTAMPTZ NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (recommended)
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create a policy for public access (adjust as needed)
CREATE POLICY "Enable all operations for meetings" ON meetings
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase project set up
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meeting-minutes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   
   In your Supabase dashboard, run the SQL commands from the Database Schema section above.

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and custom CSS
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Main page with meeting table
├── components/
│   ├── MeetingDrawer.tsx   # Drawer component for viewing/editing
│   └── providers.tsx       # Client-side providers wrapper
├── lib/
│   └── supabase.ts         # Supabase client and API functions
└── types/
    └── meeting.ts          # TypeScript interfaces
```

## Usage

### Creating a Meeting
1. Click the "Add Meeting Minutes" button in the top-right corner
2. Fill in the meeting title and select the date/time
3. Write your meeting content using the markdown editor
4. Click "Create" to save the meeting

### Viewing a Meeting
1. Click on any row in the meeting table
2. The drawer will open showing the meeting details
3. Markdown content is rendered with proper formatting

### Editing a Meeting
1. Open a meeting by clicking on a table row
2. Click the edit icon (pencil) in the drawer header
3. Modify the title, date, or content as needed
4. Click "Update" to save changes or "Cancel" to discard

## Customization

### Styling
- Modify `src/app/globals.css` for global styles
- Adjust HeroUI theme in `tailwind.config.ts`
- Customize component styling using Tailwind classes

### Database
- Extend the `Meeting` interface in `src/types/meeting.ts`
- Add new API methods in `src/lib/supabase.ts`
- Update the database schema as needed

### Features
- Add new components in `src/components/`
- Implement additional pages in `src/app/`
- Extend functionality with new hooks and utilities

## Building for Production

```bash
npm run build
npm run start
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean
- AWS
- Google Cloud

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the GitHub issues
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce