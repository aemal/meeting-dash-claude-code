"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import DatePicker from "react-datepicker";
import { createClient } from "@supabase/supabase-js";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import "react-datepicker/dist/react-datepicker.css";

export default function TestPage() {
  const [markdown, setMarkdown] = useState("# Test Markdown\n\nThis is a **test** for all packages.");
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Test Supabase client creation
  const supabase = createClient("https://example.supabase.co", "example-key");

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">Package Compatibility Test</h1>
      
      {/* HeroUI Test */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">HeroUI Components Test</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Button color="primary" variant="solid">
              HeroUI Button Works!
            </Button>
            <Button color="secondary" variant="bordered">
              Another Button
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* React Markdown Test */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">React Markdown Test</h2>
        </CardHeader>
        <CardBody>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
          >
            {markdown}
          </ReactMarkdown>
        </CardBody>
      </Card>

      {/* Markdown Editor Test */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Markdown Editor Test</h2>
        </CardHeader>
        <CardBody>
          <MDEditor
            value={markdown}
            onChange={(value) => setMarkdown(value || "")}
            preview="edit"
            height={200}
          />
        </CardBody>
      </Card>

      {/* Date Picker Test */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Date Picker Test</h2>
        </CardHeader>
        <CardBody>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date || new Date())}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="p-2 border rounded"
          />
        </CardBody>
      </Card>

      {/* Supabase Test */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Supabase Client Test</h2>
        </CardHeader>
        <CardBody>
          <p>Supabase client initialized successfully!</p>
          <p>Client instance: {supabase ? "✓ Created" : "✗ Failed"}</p>
        </CardBody>
      </Card>
    </div>
  );
}