'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle, FontFamily, FontSize } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extensions'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Type,
  ChevronDown,
  ImagePlus,
  AlignLeft,
  AlignCenter,
  AlignRight,
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

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({
  content,
  onChange,
}: TiptapEditorProps) {
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [currentFont, setCurrentFont] = useState('Default');
  const [currentSize, setCurrentSize] = useState('16');
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [imageAlignment, setImageAlignment] = useState<'left' | 'center' | 'right'>('left');
  
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        // Use a placeholder:
        placeholder: 'Start typing your answer...'
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
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] max-w-none p-4',
      },
    },
    
  });

  // Update editor content when content prop changes (when switching questions)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setFontDropdownOpen(false);
      }
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target as Node)) {
        setSizeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Image resize functionality
  useEffect(() => {
    if (!editor || !editorRef.current) return;

    let isResizing = false;
    let currentImg: HTMLImageElement | null = null;
    let startX = 0;
    let startWidth = 0;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicking on image
      if (target.tagName === 'IMG' && target.closest('.ProseMirror')) {
        currentImg = target as HTMLImageElement;
        setSelectedImage(currentImg);
        
        // Read current alignment
        const align = currentImg.getAttribute('data-align') as 'left' | 'center' | 'right' || 'left';
        setImageAlignment(align);
        
        // Apply alignment styles immediately
        if (align === 'left') {
          currentImg.style.marginLeft = '0';
          currentImg.style.marginRight = 'auto';
        } else if (align === 'center') {
          currentImg.style.marginLeft = 'auto';
          currentImg.style.marginRight = 'auto';
        } else if (align === 'right') {
          currentImg.style.marginLeft = 'auto';
          currentImg.style.marginRight = '0';
        }
        currentImg.style.display = 'block';
        
        // Add selected class
        currentImg.classList.add('image-selected');
        
        // Check if clicking on resize handle area (bottom-right 30px)
        const rect = currentImg.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        // If clicking near bottom-right corner (within 30px), start resize
        if (offsetX > rect.width - 30 && offsetY > rect.height - 30) {
          e.preventDefault();
          isResizing = true;
          startX = e.clientX;
          startWidth = currentImg.offsetWidth;
          
          document.body.style.cursor = 'nwse-resize';
          document.body.style.userSelect = 'none';
          e.stopPropagation();
        }
      } else {
        // Clicked outside image, deselect
        if (selectedImage) {
          selectedImage.classList.remove('image-selected');
          setSelectedImage(null);
          setImageAlignment('left');
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Change cursor when hovering over resize area
      if (!isResizing) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG' && target.closest('.ProseMirror')) {
          const img = target as HTMLImageElement;
          const rect = img.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;
          
          // Show resize cursor when near bottom-right corner
          if (offsetX > rect.width - 30 && offsetY > rect.height - 30) {
            img.style.cursor = 'nwse-resize';
          } else {
            img.style.cursor = 'pointer';
          }
        }
      }
      
      if (!isResizing || !currentImg) return;
      
      e.preventDefault();
      
      const diff = e.clientX - startX;
      let newWidth = startWidth + diff;
      
      // Constrain width
      newWidth = Math.max(100, Math.min(newWidth, 800));
      
      // Set new width (height will adjust automatically with aspect ratio)
      currentImg.style.width = `${newWidth}px`;
      currentImg.style.height = 'auto';
    };

    const handleMouseUp = () => {
      if (isResizing && currentImg) {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        
        // Update the image attributes in the editor
        const width = currentImg.offsetWidth;
        currentImg.setAttribute('width', width.toString());
        
        // Trigger editor update
        if (editor) {
          editor.commands.focus();
        }
        
        currentImg = null;
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [editor, selectedImage]);

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
          // Insert image at current cursor position
          editor.chain().focus().setImage({ src }).run();
        }
      };
      reader.readAsDataURL(file);
    };
    
    input.click();
  };

  const setImageAlign = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedImage) return;
    
    // Remove all alignment classes
    selectedImage.classList.remove('img-left', 'img-center', 'img-right');
    
    // Add new alignment class
    selectedImage.classList.add(`img-${alignment}`);
    
    // Update state
    setImageAlignment(alignment);
    
    // Update data attribute for persistence
    selectedImage.setAttribute('data-align', alignment);
    
    // Force a style update based on alignment
    if (alignment === 'left') {
      selectedImage.style.marginLeft = '0';
      selectedImage.style.marginRight = 'auto';
      selectedImage.style.display = 'block';
    } else if (alignment === 'center') {
      selectedImage.style.marginLeft = 'auto';
      selectedImage.style.marginRight = 'auto';
      selectedImage.style.display = 'block';
    } else if (alignment === 'right') {
      selectedImage.style.marginLeft = 'auto';
      selectedImage.style.marginRight = '0';
      selectedImage.style.display = 'block';
    }
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
      {/* Toolbar - ONLY UI CHANGED */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-white border-b border-gray-200">
        
        {/* Font Family Dropdown */}
        <div className="relative" ref={fontDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setFontDropdownOpen(!fontDropdownOpen);
              setSizeDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-gray-200 bg-white text-sm font-medium text-gray-700 min-w-[160px] justify-between transition-colors hover:bg-gray-50"
          >
            <Type size={16} className="text-gray-500 flex-shrink-0" />
            <span className="truncate flex-1 text-left">{currentFont}</span>
            <ChevronDown 
              size={14} 
              className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${fontDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {fontDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {FONTS.map((font) => (
                <button
                  key={font.name}
                  type="button"
                  onClick={() => handleFontSelect(font.value, font.name)}
                  style={{ fontFamily: font.value || 'inherit' }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors ${
                    currentFont === font.name ? 'bg-gray-50 text-gray-900' : ''
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
              setSizeDropdownOpen(!sizeDropdownOpen);
              setFontDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-gray-200 bg-white text-sm font-medium text-gray-700 min-w-[80px] justify-between transition-colors hover:bg-gray-50"
          >
            <span>{currentSize}</span>
            <ChevronDown 
              size={14} 
              className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${sizeDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {sizeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-20 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => handleSizeSelect(size.value, size.label)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors ${
                    currentSize === size.label ? 'bg-gray-50 text-gray-900' : ''
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Bold Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('bold')
              ? 'bg-gray-100 text-gray-900'
              : 'hover:bg-gray-50 text-gray-600'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>

        {/* Italic Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('italic')
              ? 'bg-gray-100 text-gray-900'
              : 'hover:bg-gray-50 text-gray-600'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </button>

        {/* Underline Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('underline')
              ? 'bg-gray-100 text-gray-900'
              : 'hover:bg-gray-50 text-gray-600'
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Image Button */}
        <button
          type="button"
          onClick={uploadImage}
          className="p-2 rounded transition-colors hover:bg-gray-50 text-gray-600"
          title="Add Image"
        >
          <ImagePlus size={18} />
        </button>

        {/* Image Alignment Controls - Show only when image is selected */}
        {selectedImage && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <button
              type="button"
              onClick={() => setImageAlign('left')}
              className={`p-2 rounded transition-colors ${
                imageAlignment === 'left'
                  ? 'bg-gray-100 text-gray-900'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
              title="Align Left"
            >
              <AlignLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => setImageAlign('center')}
              className={`p-2 rounded transition-colors ${
                imageAlignment === 'center'
                  ? 'bg-gray-100 text-gray-900'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
              title="Align Center"
            >
              <AlignCenter size={18} />
            </button>

            <button
              type="button"
              onClick={() => setImageAlign('right')}
              className={`p-2 rounded transition-colors ${
                imageAlignment === 'right'
                  ? 'bg-gray-100 text-gray-900'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
              title="Align Right"
            >
              <AlignRight size={18} />
            </button>
          </>
        )}

        {/* Character counter */}
        <div className="ml-auto text-xs text-gray-400">
          0 / 3000 characters
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative" ref={editorRef}>
        <EditorContent editor={editor} />
        {/* {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none text-sm italic">
            {placeholder}
          </div>
        )} */}
      </div>
      
      <style jsx global>{`
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: box-shadow 0.2s;
          display: block;
        }
        
        /* Image alignment classes with higher specificity */
        .ProseMirror img.img-left {
          margin-left: 0 !important;
          margin-right: auto !important;
          display: block !important;
        }
        
        .ProseMirror img.img-center {
          margin-left: auto !important;
          margin-right: auto !important;
          display: block !important;
        }
        
        .ProseMirror img.img-right {
          margin-left: auto !important;
          margin-right: 0 !important;
          display: block !important;
        }
        
        .ProseMirror img:hover {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        .ProseMirror img.image-selected {
          outline: 3px solid #3b82f6;
          outline-offset: 2px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        
        /* Resize handle indicator */
        .ProseMirror img.image-selected::after {
          content: '';
          position: absolute;
          bottom: -8px;
          right: -8px;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          cursor: nwse-resize;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          pointer-events: none;
        }
        
        /* When resizing, disable pointer events on other elements */
        body.resizing * {
          user-select: none !important;
        }
      `}</style>
    </div>
  );
}