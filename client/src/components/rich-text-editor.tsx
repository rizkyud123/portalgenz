import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import Quill to avoid SSR issues
    const initQuill = async () => {
      if (typeof window !== 'undefined' && editorRef.current && !quillRef.current) {
        // Load Quill CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
        document.head.appendChild(link);

        // Load Quill JS
        const Quill = await import('quill').then(mod => mod.default);

        const toolbarOptions = [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'align': [] }],
          ['link', 'image'],
          ['blockquote', 'code-block'],
          [{ 'color': [] }, { 'background': [] }],
          ['clean']
        ];

        quillRef.current = new Quill(editorRef.current, {
          theme: 'snow',
          placeholder: placeholder || 'Tulis konten di sini...',
          modules: {
            toolbar: toolbarOptions
          }
        });

        // Set initial content
        if (value) {
          quillRef.current.root.innerHTML = value;
        }

        // Listen for text changes
        quillRef.current.on('text-change', () => {
          const content = quillRef.current.root.innerHTML;
          onChange(content);
        });
      }
    };

    initQuill();

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="rich-text-editor">
      <div 
        ref={editorRef}
        className="min-h-[200px] bg-background border border-border rounded-md"
        data-testid="rich-text-editor"
      />
    </div>
  );
}
