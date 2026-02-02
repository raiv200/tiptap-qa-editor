'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle, FontFamily, FontSize, Color, BackgroundColor, LineHeight } from '@tiptap/extension-text-style';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions'
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Type,
  ChevronDown,
  Palette,
  Highlighter,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  IndentIncrease,
  IndentDecrease,
  ImagePlus,
  Minus,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Popular Google Fonts
const FONTS = [
  { name: 'Default', value: '' },
  { name: 'Playfair Display', value: '"Playfair Display"' },
  { name: 'Merriweather', value: 'Merriweather' },
  { name: 'Lora', value: 'Lora' },
  { name: 'Source Serif Pro', value: '"Source Serif Pro"' },
  { name: 'Crimson Text', value: '"Crimson Text"' },
  { name: 'Libre Baskerville', value: '"Libre Baskerville"' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Open Sans', value: '"Open Sans"' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Raleway', value: 'Raleway' },
  { name: 'Nunito', value: 'Nunito' },
  { name: 'Work Sans', value: '"Work Sans"' },
  { name: 'Josefin Sans', value: '"Josefin Sans"' },
  { name: 'Quicksand', value: 'Quicksand' },
  { name: 'Oswald', value: 'Oswald' },
  { name: 'Fira Sans', value: '"Fira Sans"' },
  { name: 'PT Sans', value: '"PT Sans"' },
  { name: 'Ubuntu', value: 'Ubuntu' },
  { name: 'Caveat', value: 'Caveat' },
  { name: 'Dancing Script', value: '"Dancing Script"' },
  { name: 'Pacifico', value: 'Pacifico' },
  { name: 'Satisfy', value: 'Satisfy' },
  { name: 'Great Vibes', value: '"Great Vibes"' },
  { name: 'Courier Prime', value: '"Courier Prime"' },
  { name: 'JetBrains Mono', value: '"JetBrains Mono"' },
  { name: 'Fira Code', value: '"Fira Code"' },
  { name: 'Source Code Pro', value: '"Source Code Pro"' },
];

const FONT_SIZES = [
  { label: '8', value: '8px' },
  { label: '9', value: '9px' },
  { label: '10', value: '10px' },
  { label: '11', value: '11px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
  { label: '36', value: '36px' },
  { label: '42', value: '42px' },
  { label: '48', value: '48px' },
  { label: '56', value: '56px' },
  { label: '64', value: '64px' },
  { label: '72', value: '72px' },
];

const TEXT_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Dark Gray', value: '#374151' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Orange', value: '#EA580C' },
  { name: 'Amber', value: '#D97706' },
  { name: 'Yellow', value: '#CA8A04' },
  { name: 'Lime', value: '#65A30D' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Teal', value: '#0D9488' },
  { name: 'Cyan', value: '#0891B2' },
  { name: 'Sky', value: '#0284C7' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Violet', value: '#7C3AED' },
  { name: 'Purple', value: '#9333EA' },
  { name: 'Fuchsia', value: '#C026D3' },
  { name: 'Pink', value: '#DB2777' },
  { name: 'Rose', value: '#E11D48' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', value: '' },
  { name: 'Yellow', value: '#FEF08A' },
  { name: 'Green', value: '#BBF7D0' },
  { name: 'Blue', value: '#BFDBFE' },
  { name: 'Purple', value: '#DDD6FE' },
  { name: 'Pink', value: '#FBCFE8' },
  { name: 'Orange', value: '#FED7AA' },
  { name: 'Red', value: '#FECACA' },
  { name: 'Cyan', value: '#A5F3FC' },
  { name: 'Gray', value: '#E5E7EB' },
];

const LINE_HEIGHTS = [
  { label: 'Single', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: 'Double', value: '2' },
  { label: '2.5', value: '2.5' },
  { label: '3', value: '3' },
];

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Toolbar Button Component
const ToolbarButton = ({
  onClick,
  isActive = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-1.5 rounded transition-colors ${
      isActive
        ? 'bg-gray-200 text-gray-900'
        : 'hover:bg-gray-100 text-gray-600'
    }`}
    title={title}
  >
    {children}
  </button>
);

// Toolbar Divider Component
const ToolbarDivider = () => (
  <div className="w-px h-6 bg-gray-300 mx-1" />
);

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start typing your answer...',
}: TiptapEditorProps) {
  // Dropdown states
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [highlightDropdownOpen, setHighlightDropdownOpen] = useState(false);
  const [lineHeightDropdownOpen, setLineHeightDropdownOpen] = useState(false);
  
  // Current values
  const [currentFont, setCurrentFont] = useState('Default');
  const [currentSize, setCurrentSize] = useState('16');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentHighlight, setCurrentHighlight] = useState('');
  const [currentLineHeight, setCurrentLineHeight] = useState('1.5');
  
  // Refs for dropdowns
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const highlightDropdownRef = useRef<HTMLDivElement>(null);
  const lineHeightDropdownRef = useRef<HTMLDivElement>(null);

  const closeAllDropdowns = () => {
    setFontDropdownOpen(false);
    setSizeDropdownOpen(false);
    setColorDropdownOpen(false);
    setHighlightDropdownOpen(false);
    setLineHeightDropdownOpen(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      BackgroundColor,
      LineHeight,
      Superscript,
      Subscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(target)) {
        setFontDropdownOpen(false);
      }
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(target)) {
        setSizeDropdownOpen(false);
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(target)) {
        setColorDropdownOpen(false);
      }
      if (highlightDropdownRef.current && !highlightDropdownRef.current.contains(target)) {
        setHighlightDropdownOpen(false);
      }
      if (lineHeightDropdownRef.current && !lineHeightDropdownRef.current.contains(target)) {
        setLineHeightDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler functions
  const handleFontSelect = (fontValue: string, fontName: string) => {
    if (!editor) return;
    if (fontValue === '') {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(fontValue).run();
    }
    setCurrentFont(fontName);
    setFontDropdownOpen(false);
  };

  const handleSizeSelect = (sizeValue: string, sizeLabel: string) => {
    if (!editor) return;
    editor.chain().focus().setFontSize(sizeValue).run();
    setCurrentSize(sizeLabel);
    setSizeDropdownOpen(false);
  };

  const handleColorSelect = (colorValue: string) => {
    if (!editor) return;
    editor.chain().focus().setColor(colorValue).run();
    setCurrentColor(colorValue);
    setColorDropdownOpen(false);
  };

  const handleHighlightSelect = (colorValue: string) => {
    if (!editor) return;
    if (colorValue === '') {
      editor.chain().focus().unsetBackgroundColor().run();
    } else {
      editor.chain().focus().setBackgroundColor(colorValue).run();
    }
    setCurrentHighlight(colorValue);
    setHighlightDropdownOpen(false);
  };

  const handleLineHeightSelect = (value: string) => {
    if (!editor) return;
    editor.chain().focus().setLineHeight(value).run();
    setCurrentLineHeight(value);
    setLineHeightDropdownOpen(false);
  };

  const clearFormatting = () => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  const uploadImage = () => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const src = readerEvent.target?.result as string;
        if (src) {
          editor.chain().focus().setImage({ src }).run();
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm min-h-[280px] flex items-center justify-center">
        <div className="text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Toolbar Row 1 - Font, Size, Colors, Basic Formatting */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        
        {/* Font Family Dropdown */}
        <div className="relative" ref={fontDropdownRef}>
          <button
            type="button"
            onClick={() => {
              closeAllDropdowns();
              setFontDropdownOpen(!fontDropdownOpen);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 bg-white text-xs font-medium text-gray-700 min-w-[120px] justify-between hover:bg-gray-50"
          >
            <Type size={14} className="text-gray-500" />
            <span className="truncate flex-1 text-left">{currentFont}</span>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${fontDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {fontDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {FONTS.map((font) => (
                <button
                  key={font.name}
                  type="button"
                  onClick={() => handleFontSelect(font.value, font.name)}
                  style={{ fontFamily: font.value || 'inherit' }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                    currentFont === font.name ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  }`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div className="relative" ref={sizeDropdownRef}>
          <button
            type="button"
            onClick={() => {
              closeAllDropdowns();
              setSizeDropdownOpen(!sizeDropdownOpen);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 bg-white text-xs font-medium text-gray-700 min-w-[60px] justify-between hover:bg-gray-50"
          >
            <span>{currentSize}</span>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${sizeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {sizeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-16 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => handleSizeSelect(size.value, size.label)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                    currentSize === size.label ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Bold, Italic, Underline */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Minus size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text Color Dropdown */}
        <div className="relative" ref={colorDropdownRef}>
          <button
            type="button"
            onClick={() => {
              closeAllDropdowns();
              setColorDropdownOpen(!colorDropdownOpen);
            }}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 flex items-center gap-1"
            title="Text Color"
          >
            <Palette size={16} />
            <div className="w-3 h-3 rounded-sm border border-gray-300" style={{ backgroundColor: currentColor }} />
          </button>
          {colorDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48">
              <div className="text-xs text-gray-500 mb-2">Text Color</div>
              <div className="grid grid-cols-5 gap-1">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorSelect(color.value)}
                    className={`w-7 h-7 rounded border-2 transition-all ${
                      currentColor === color.value ? 'border-blue-500 scale-110' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color Dropdown */}
        <div className="relative" ref={highlightDropdownRef}>
          <button
            type="button"
            onClick={() => {
              closeAllDropdowns();
              setHighlightDropdownOpen(!highlightDropdownOpen);
            }}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 flex items-center gap-1"
            title="Highlight Color"
          >
            <Highlighter size={16} />
            <div 
              className="w-3 h-3 rounded-sm border border-gray-300" 
              style={{ backgroundColor: currentHighlight || 'transparent' }} 
            />
          </button>
          {highlightDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
              <div className="text-xs text-gray-500 mb-2">Highlight</div>
              <div className="grid grid-cols-5 gap-1">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value || 'none'}
                    type="button"
                    onClick={() => handleHighlightSelect(color.value)}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      currentHighlight === color.value ? 'border-blue-500 scale-110' : 'border-gray-200 hover:border-gray-400'
                    } ${color.value === '' ? 'bg-white relative' : ''}`}
                    style={{ backgroundColor: color.value || 'white' }}
                    title={color.name}
                  >
                    {color.value === '' && <span className="text-red-500 text-xs">✕</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Superscript & Subscript */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive('superscript')}
          title="Superscript"
        >
          <SuperscriptIcon size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive('subscript')}
          title="Subscript"
        >
          <SubscriptIcon size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Clear Formatting */}
        <ToolbarButton
          onClick={clearFormatting}
          title="Clear Formatting"
        >
          <RemoveFormatting size={16} />
        </ToolbarButton>
      </div>

      {/* Toolbar Row 2 - Alignment, Lists, Spacing, Image */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        
        {/* Text Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <AlignJustify size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Indentation */}
        <ToolbarButton
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          title="Increase Indent"
        >
          <IndentIncrease size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          title="Decrease Indent"
        >
          <IndentDecrease size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Line Height Dropdown */}
        <div className="relative" ref={lineHeightDropdownRef}>
          <button
            type="button"
            onClick={() => {
              closeAllDropdowns();
              setLineHeightDropdownOpen(!lineHeightDropdownOpen);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
            title="Line Spacing"
          >
            <span className="text-xs">↕</span>
            <span>{currentLineHeight}</span>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${lineHeightDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {lineHeightDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[100px]">
              <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">Line Spacing</div>
              {LINE_HEIGHTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleLineHeightSelect(item.value)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                    currentLineHeight === item.value ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Image Upload */}
        <ToolbarButton
          onClick={uploadImage}
          title="Insert Image"
        >
          <ImagePlus size={16} />
        </ToolbarButton>

        {/* Character Counter */}
        <div className="ml-auto text-xs text-gray-400 pr-2">
          {/* {editor.getText().length} characters */}
          {editor.getText().replace(/<[^>]*>/g, "").length} characters
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      {/* Editor Styles */}
      <style jsx global>{`
        .ProseMirror {
          min-height: 200px;
          padding: 1rem;
          outline: none;
        }
        
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9CA3AF;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
        }
        
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .ProseMirror ul {
          list-style-type: disc;
        }
        
        .ProseMirror ol {
          list-style-type: decimal;
        }
        
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .ProseMirror li > ul,
        .ProseMirror li > ol {
          margin: 0.25rem 0;
        }
        
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .ProseMirror blockquote {
          border-left: 3px solid #E5E7EB;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6B7280;
        }
        
        .ProseMirror code {
          background-color: #F3F4F6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
        
        .ProseMirror pre {
          background-color: #1F2937;
          color: #F9FAFB;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #E5E7EB;
          margin: 1.5rem 0;
        }
        
        .ProseMirror sup {
          font-size: 0.75em;
          vertical-align: super;
        }
        
        .ProseMirror sub {
          font-size: 0.75em;
          vertical-align: sub;
        }
      `}</style>
    </div>
  );
}
