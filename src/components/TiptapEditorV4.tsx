"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { createPortal } from "react-dom";

import {
  TextStyle,
  FontFamily,
  FontSize,
  Color,
  BackgroundColor,
  LineHeight,
} from "@tiptap/extension-text-style";

import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder, CharacterCount, Gapcursor } from "@tiptap/extensions";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { BubbleMenu } from "@tiptap/react/menus";
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
  Undo,
  Redo,
  Copy,
  Check,
  Table,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  MoreHorizontal,
  PanelTop,
  PanelLeft,
  EllipsisIcon,
  EllipsisVerticalIcon,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

// Constants
const FONTS = [
  { name: "Default", value: "" },
  { name: "Playfair Display", value: '"Playfair Display"' },
  { name: "Merriweather", value: "Merriweather" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Open Sans", value: '"Open Sans"' },
  { name: "Roboto", value: "Roboto" },
  { name: "Lato", value: "Lato" },
  { name: "Poppins", value: "Poppins" },
  { name: "Ubuntu", value: "Ubuntu" },
  { name: "Fira Code", value: '"Fira Code"' },
];

const FONT_SIZES = [
  { label: "10", value: "10px" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "32", value: "32px" },
];

const TEXT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#DC2626" },
  { name: "Orange", value: "#EA580C" },
  { name: "Green", value: "#16A34A" },
  { name: "Blue", value: "#2563EB" },
  { name: "Purple", value: "#9333EA" },
  { name: "Pink", value: "#DB2777" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", value: "" },
  { name: "Yellow", value: "#FEF08A" },
  { name: "Green", value: "#BBF7D0" },
  { name: "Blue", value: "#BFDBFE" },
  { name: "Purple", value: "#DDD6FE" },
  { name: "Pink", value: "#FBCFE8" },
];

const LINE_HEIGHTS = [
  { label: "Single", value: "1" },
  { label: "1.5", value: "1.5" },
  { label: "Double", value: "2" },
];

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Toolbar Button
const ToolbarButton = ({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded transition-colors ${
      isActive
        ? "bg-gray-200 text-gray-900"
        : disabled
          ? "text-gray-300 cursor-not-allowed"
          : "hover:bg-gray-100 text-gray-600"
    }`}
    title={title}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

// Table Insert Grid
const TableInsertGrid = ({
  onInsert,
}: {
  onInsert: (rows: number, cols: number) => void;
}) => {
  const [hoveredRow, setHoveredRow] = useState(0);
  const [hoveredCol, setHoveredCol] = useState(0);

  return (
    <div className="p-3">
      {/* <div className="text-xs text-gray-500 mb-2 text-center">
        {hoveredRow > 0 && hoveredCol > 0 ? `${hoveredRow} × ${hoveredCol}` : "Select size"}
      </div> */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
      >
        {Array.from({ length: 32 }).map((_, index) => {
          const row = Math.floor(index / 8) + 1;
          const col = (index % 8) + 1;
          const isHighlighted = row <= hoveredRow && col <= hoveredCol;
          return (
            <button
              key={index}
              type="button"
              className={`w-5 h-5 border rounded-sm ${
                isHighlighted
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white border-gray-300"
              }`}
              onMouseEnter={() => {
                setHoveredRow(row);
                setHoveredCol(col);
              }}
              onMouseLeave={() => {
                setHoveredRow(0);
                setHoveredCol(0);
              }}
              onClick={() => onInsert(row, col)}
            />
          );
        })}
      </div>
    </div>
  );
};



// Row Context Menu - Position aware (opens up if no space below)
const RowContextMenu = ({
  editor,
  position,
  onClose,
}: {
  editor: any;
  position: { x: number; y: number };
  onClose: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let newX = position.x;
    let newY = position.y;

    // Check if menu goes below viewport
    if (position.y + menuRect.height > viewportHeight - 10) {
      // Open upward instead
      newY = position.y - menuRect.height;
    }

    // Check if menu goes beyond right edge
    if (position.x + menuRect.width > viewportWidth - 10) {
      newX = position.x - menuRect.width;
    }

    // Make sure it doesn't go above viewport
    if (newY < 10) {
      newY = 10;
    }

    // Make sure it doesn't go beyond left edge
    if (newX < 10) {
      newX = 10;
    }

    setAdjustedPosition({ x: newX, y: newY });
  }, [position]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px]"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => handleAction(() => editor.chain().focus().toggleHeaderRow().run())}
      >
        <PanelTop size={16} /> Header Row
      </button>
      <div className="h-px bg-gray-200 my-1" />
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => handleAction(() => editor.chain().focus().addRowBefore().run())}
      >
        <ArrowUp size={16} /> Insert Above
      </button>
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => handleAction(() => editor.chain().focus().addRowAfter().run())}
      >
        <ArrowDown size={16} /> Insert Below
      </button>
      <div className="h-px bg-gray-200 my-1" />
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => handleAction(() => editor.chain().focus().addRowAfter().run())}
      >
        <Copy size={16} /> Duplicate
      </button>
      <div className="h-px bg-gray-200 my-1" />
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        onClick={() => handleAction(() => editor.chain().focus().deleteRow().run())}
      >
        <Trash2 size={16} /> Delete Row
      </button>
    </div>
  );
};

// Column Context Menu - Position aware (opens left if no space on right)
const ColumnContextMenu = ({
  editor,
  position,
  onClose,
}: {
  editor: any;
  position: { x: number; y: number };
  onClose: () => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let newX = position.x;
    let newY = position.y;

    // Check if menu goes below viewport
    if (position.y + menuRect.height > viewportHeight - 10) {
      newY = position.y - menuRect.height;
    }

    // Check if menu goes beyond right edge
    if (position.x + menuRect.width > viewportWidth - 10) {
      newX = position.x - menuRect.width;
    }

    // Make sure it doesn't go above viewport
    if (newY < 10) {
      newY = 10;
    }

    // Make sure it doesn't go beyond left edge
    if (newX < 10) {
      newX = 10;
    }

    setAdjustedPosition({ x: newX, y: newY });
  }, [position]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px]"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => handleAction(() => editor.chain().focus().toggleHeaderColumn().run())}
      >
        <PanelLeft size={16} /> Header Column
      </button>
      <div className="h-px bg-gray-200 my-1" />
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => handleAction(() => editor.chain().focus().addColumnBefore().run())}
      >
        <ArrowLeft size={16} /> Insert Left
      </button>
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => handleAction(() => editor.chain().focus().addColumnAfter().run())}
      >
        <ArrowRight size={16} /> Insert Right
      </button>
      <div className="h-px bg-gray-200 my-1" />
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => handleAction(() => editor.chain().focus().addColumnAfter().run())}
      >
        <Copy size={16} /> Duplicate
      </button>
      <div className="h-px bg-gray-200 my-1" />
      <button
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        onClick={() => handleAction(() => editor.chain().focus().deleteColumn().run())}
      >
        <Trash2 size={16} /> Delete Column
      </button>
    </div>
  );
};

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Start typing your answer...",
}: TiptapEditorProps) {
  // Dropdown states
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [highlightDropdownOpen, setHighlightDropdownOpen] = useState(false);
  const [lineHeightDropdownOpen, setLineHeightDropdownOpen] = useState(false);
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false);

  // Current values
  const [currentFont, setCurrentFont] = useState("Default");
  const [currentSize, setCurrentSize] = useState("16");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentHighlight, setCurrentHighlight] = useState("");
  const [currentLineHeight, setCurrentLineHeight] = useState("1.5");
  const [copied, setCopied] = useState(false);

  // Table menus
  const [rowMenu, setRowMenu] = useState<{ x: number; y: number } | null>(null);
  const [colMenu, setColMenu] = useState<{ x: number; y: number } | null>(null);

  // Refs
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const highlightDropdownRef = useRef<HTMLDivElement>(null);
  const lineHeightDropdownRef = useRef<HTMLDivElement>(null);
  const tableDropdownRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const closeAllDropdowns = () => {
    setFontDropdownOpen(false);
    setSizeDropdownOpen(false);
    setColorDropdownOpen(false);
    setHighlightDropdownOpen(false);
    setLineHeightDropdownOpen(false);
    setTableDropdownOpen(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
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
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: false, allowBase64: true }),
      CharacterCount.configure({ limit: null }),
      Gapcursor,
      TableKit.configure({
        table: {
          resizable: true,
        },
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
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px]",
        spellcheck: "true",
      },
      handleKeyDown: (view, event) => {
        // Handle Backspace to delete empty table
        if (event.key === "Backspace") {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;

          // Check if in a table
          let tableNode = null;
          let tablePos = -1;
          for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === "table") {
              tableNode = node;
              tablePos = $from.before(d);
              break;
            }
          }

          if (tableNode && tablePos >= 0) {
            // Check if table is empty (all cells empty)
            let isEmpty = true;
            tableNode.descendants((node) => {
              if (
                node.isText ||
                (node.type.name === "paragraph" && node.content.size > 0)
              ) {
                isEmpty = false;
                return false;
              }
            });

            // Also check if cursor is at the very beginning
            const isAtStart = $from.parentOffset === 0;

            if (isEmpty || isAtStart) {
              // Check if current cell is empty
              const cellNode = $from.parent;
              const cellIsEmpty =
                cellNode.content.size === 0 ||
                (cellNode.content.size === 2 &&
                  cellNode.firstChild?.type.name === "paragraph" &&
                  cellNode.firstChild.content.size === 0);

              if (cellIsEmpty && isAtStart) {
                // Delete the entire table
                const tr = state.tr.delete(
                  tablePos,
                  tablePos + tableNode.nodeSize,
                );
                view.dispatch(tr);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
  });

  // Update content on prop change
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(target))
        setFontDropdownOpen(false);
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(target))
        setSizeDropdownOpen(false);
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(target)
      )
        setColorDropdownOpen(false);
      if (
        highlightDropdownRef.current &&
        !highlightDropdownRef.current.contains(target)
      )
        setHighlightDropdownOpen(false);
      if (
        lineHeightDropdownRef.current &&
        !lineHeightDropdownRef.current.contains(target)
      )
        setLineHeightDropdownOpen(false);
      if (
        tableDropdownRef.current &&
        !tableDropdownRef.current.contains(target)
      )
        setTableDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Inject column handles into table headers
  useEffect(() => {
    if (!editor || !editorContainerRef.current) return;

    const injectColumnHandles = () => {
      const container = editorContainerRef.current;
      if (!container) return;

      // Remove existing handles
      container
        .querySelectorAll(".col-handle-injected")
        .forEach((el) => el.remove());

      const table = container.querySelector("table");
      if (!table) return;

      const headerCells = table.querySelectorAll("th");
      if (headerCells.length === 0) {
        // If no header cells, use first row cells
        const firstRowCells = table.querySelectorAll("tr:first-child td");
        firstRowCells.forEach((cell, index) => {
          injectHandleIntoCell(cell as HTMLElement, index);
        });
      } else {
        headerCells.forEach((cell, index) => {
          injectHandleIntoCell(cell as HTMLElement, index);
        });
      }
    };

    const injectHandleIntoCell = (cell: HTMLElement, index: number) => {
      // Check if already has handle
      if (cell.querySelector(".col-handle-injected")) return;

      const handle = document.createElement("button");
      handle.className = "col-handle-injected";
      handle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`;
      handle.style.cssText = `
        position: absolute;
        top: 2px;
        left: 50%;
        transform: translateX(-50%);
        padding: 2px;
        border-radius: 4px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: #9ca3af;
        opacity: 0;
        transition: opacity 0.15s, background 0.15s;
        z-index: 10;
      `;

      handle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Focus the cell first
        cell.click();
        setColMenu({ x: e.clientX, y: e.clientY });
      });

      // Make cell position relative
      cell.style.position = "relative";
      cell.appendChild(handle);

      // Show on cell hover
      cell.addEventListener("mouseenter", () => {
        handle.style.opacity = "1";
      });
      cell.addEventListener("mouseleave", () => {
        handle.style.opacity = "0";
      });
    };

    // Initial inject
    setTimeout(injectColumnHandles, 100);

    // Re-inject on editor update
    editor.on("update", () => setTimeout(injectColumnHandles, 50));
    editor.on("selectionUpdate", () => setTimeout(injectColumnHandles, 50));

    return () => {
      editor.off("update", injectColumnHandles);
      editor.off("selectionUpdate", injectColumnHandles);
    };
  }, [editor]);

  // Handlers
  const handleFontSelect = (fontValue: string, fontName: string) => {
    if (!editor) return;
    fontValue === ""
      ? editor.chain().focus().unsetFontFamily().run()
      : editor.chain().focus().setFontFamily(fontValue).run();
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
    colorValue === ""
      ? editor.chain().focus().unsetBackgroundColor().run()
      : editor.chain().focus().setBackgroundColor(colorValue).run();
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
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const src = readerEvent.target?.result as string;
        if (src) editor.chain().focus().setImage({ src }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const insertTable = (rows: number, cols: number) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    closeAllDropdowns();
  };

  const handleCopy = async () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getStats = () => {
    if (!editor) return { characters: 0, words: 0 };
    return {
      characters: editor.storage.characterCount.characters(),
      words: editor.storage.characterCount.words(),
    };
  };

  const stats = getStats();

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm min-h-[280px] flex items-center justify-center">
        <div className="text-gray-400">Loading editor...</div>
      </div>
    );
  }

  const isInTable = editor.isActive("table");

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Toolbar Row 1 */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Font Dropdown */}
        <div className="relative" ref={fontDropdownRef}>
          <button
            type="button"
            onClick={() => {
              closeAllDropdowns();
              setFontDropdownOpen(!fontDropdownOpen);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 bg-white text-xs font-medium text-gray-700 min-w-[100px] justify-between hover:bg-gray-50"
          >
            <Type size={14} className="text-gray-500" />
            <span className="truncate flex-1 text-left">{currentFont}</span>
            <ChevronDown
              size={12}
              className={`text-gray-400 ${fontDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {fontDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-44 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {FONTS.map((font) => (
                <button
                  key={font.name}
                  type="button"
                  onClick={() => handleFontSelect(font.value, font.name)}
                  style={{ fontFamily: font.value || "inherit" }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${currentFont === font.name ? "bg-gray-100" : ""}`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Size Dropdown */}
        <div className="relative" ref={sizeDropdownRef}>
          <button
            type="button"
            onClick={() => {
              closeAllDropdowns();
              setSizeDropdownOpen(!sizeDropdownOpen);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 bg-white text-xs font-medium text-gray-700 min-w-[50px] justify-between hover:bg-gray-50"
          >
            <span>{currentSize}</span>
            <ChevronDown
              size={12}
              className={`text-gray-400 ${sizeDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {sizeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-16 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => handleSizeSelect(size.value, size.label)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${currentSize === size.label ? "bg-gray-100" : ""}`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Minus size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text Color */}
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
            <div
              className="w-3 h-3 rounded-sm border border-gray-300"
              style={{ backgroundColor: currentColor }}
            />
          </button>
          {colorDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-36">
              <div className="grid grid-cols-4 gap-1">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorSelect(color.value)}
                    className={`w-7 h-7 rounded border-2 ${currentColor === color.value ? "border-blue-500" : "border-gray-200"}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative" ref={highlightDropdownRef}>
          <button
            type="button"
            onClick={() => {
              closeAllDropdowns();
              setHighlightDropdownOpen(!highlightDropdownOpen);
            }}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 flex items-center gap-1"
            title="Highlight"
          >
            <Highlighter size={16} />
            <div
              className="w-3 h-3 rounded-sm border border-gray-300"
              style={{ backgroundColor: currentHighlight || "transparent" }}
            />
          </button>
          {highlightDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-32">
              <div className="grid grid-cols-3 gap-1">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value || "none"}
                    type="button"
                    onClick={() => handleHighlightSelect(color.value)}
                    className={`w-6 h-6 rounded border-2 ${currentHighlight === color.value ? "border-blue-500" : "border-gray-200"}`}
                    style={{ backgroundColor: color.value || "white" }}
                    title={color.name}
                  >
                    {color.value === "" && (
                      <span className="text-red-500 text-xs">✕</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive("superscript")}
          title="Superscript"
        >
          <SuperscriptIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive("subscript")}
          title="Subscript"
        >
          <SubscriptIcon size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={clearFormatting} title="Clear Formatting">
          <RemoveFormatting size={16} />
        </ToolbarButton>
      </div>

      {/* Toolbar Row 2 */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        >
          <AlignJustify size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
          title="Increase Indent"
        >
          <IndentIncrease size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().liftListItem("listItem").run()}
          title="Decrease Indent"
        >
          <IndentDecrease size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Line Height */}
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
            <ChevronDown
              size={12}
              className={`text-gray-400 ${lineHeightDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {lineHeightDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[80px]">
              {LINE_HEIGHTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleLineHeightSelect(item.value)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${currentLineHeight === item.value ? "bg-gray-100" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        <ToolbarButton onClick={uploadImage} title="Insert Image">
          <ImagePlus size={16} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Table Insert */}
        <div className="relative" ref={tableDropdownRef}>
          <button
            type="button"
            onClick={() => {
              closeAllDropdowns();
              setTableDropdownOpen(!tableDropdownOpen);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            title="Insert Table"
          >
            <Table size={16} />
            <ChevronDown
              size={12}
              className={`text-gray-400 ${tableDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {tableDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100 font-medium">
                Insert Table
              </div>
              <TableInsertGrid onInsert={insertTable} />
              <div className="border-t border-gray-100 p-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => insertTable(3, 3)}
                  className="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  3×3
                </button>
                <button
                  type="button"
                  onClick={() => insertTable(4, 4)}
                  className="flex-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  4×4
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto text-xs text-gray-500 pr-2 flex items-center gap-3">
          <span>{stats.words} words</span>
          <span>{stats.characters} chars</span>
        </div>
      </div>

      {/* Editor Content with Table Wrapper */}
      <div className="relative" ref={editorContainerRef}>
        {editor && (
          <BubbleMenu
            editor={editor}
            options={{ placement: "top", offset: 8, flip: true }}
            className="flex items-center gap-1 bg-gray-900 text-white rounded-lg shadow-lg px-2 py-1.5"
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded ${editor.isActive("bold") ? "bg-gray-700" : "hover:bg-gray-700"}`}
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded ${editor.isActive("italic") ? "bg-gray-700" : "hover:bg-gray-700"}`}
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded ${editor.isActive("underline") ? "bg-gray-700" : "hover:bg-gray-700"}`}
            >
              <UnderlineIcon size={16} />
            </button>
            <div className="w-px h-5 bg-gray-600 mx-1" />
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-gray-700 flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>
          </BubbleMenu>
        )}

        <EditorContent editor={editor} className="table-editor-content" />

        {/* Table Options Menu - Three dots with Copy/Delete */}
        {isInTable && (
          <TableOptionsMenu editor={editor} containerRef={editorContainerRef} />
        )}

        {/* Row Handles - positioned based on table rows */}
        {isInTable && (
          <TableRowHandles
            editor={editor}
            containerRef={editorContainerRef}
            onOpenMenu={(pos) => setRowMenu(pos)}
          />
        )}

        {isInTable && (
          <TableColumnHandles
            editor={editor}
            containerRef={editorContainerRef}
            onOpenMenu={(pos) => setColMenu(pos)}
          />
        )}

        {/* Add Column Button - Full height on right */}
        {/* {isInTable && (
          <AddColumnButton editor={editor} containerRef={editorContainerRef} />
        )} */}

        {/* Add Row Button - Full width on bottom */}
        {/* {isInTable && (
          <AddRowButton editor={editor} containerRef={editorContainerRef} />
        )} */}

        {/* Context Menus */}
        {rowMenu && (
          <RowContextMenu
            editor={editor}
            position={rowMenu}
            onClose={() => setRowMenu(null)}
          />
        )}
        {colMenu && (
          <ColumnContextMenu
            editor={editor}
            position={colMenu}
            onClose={() => setColMenu(null)}
          />
        )}
      </div>
    </div>
  );
}

// Table Options Menu Component - Three dots on table header, shows Copy/Delete on click
function TableOptionsMenu({
  editor,
  containerRef,
}: {
  editor: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const update = () => {
      const table = container.querySelector("table");
      if (!table) {
        setPos(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();

      // Position at top-left corner of table
      setPos({
        top: tableRect.top - containerRect.top + 4,
        left: tableRect.left - containerRect.left - 28,
      });
    };

    // Table hover detection
    const handleMouseMove = (e: MouseEvent) => {
      const table = container.querySelector("table");
      if (!table) {
        if (!menuOpen) setIsVisible(false);
        return;
      }
      const tableRect = table.getBoundingClientRect();
      // Check if mouse is over table or near the left edge (for the menu)
      const isOver =
        e.clientX >= tableRect.left - 40 &&
        e.clientX <= tableRect.right &&
        e.clientY >= tableRect.top &&
        e.clientY <= tableRect.bottom;

      if (!menuOpen) {
        setIsVisible(isOver);
      }
    };

    update();
    editor.on("update", update);
    editor.on("selectionUpdate", update);
    container.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", update);

    return () => {
      editor.off("update", update);
      editor.off("selectionUpdate", update);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", update);
    };
  }, [editor, containerRef, menuOpen]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = async () => {
    if (!containerRef.current) return;
    const table = containerRef.current.querySelector("table");
    if (!table) return;

    try {
      await navigator.clipboard.writeText(table.outerHTML);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setMenuOpen(false);
      }, 1000);
    } catch (err) {
      console.error("Failed to copy table:", err);
    }
  };

  const handleDelete = () => {
    editor.chain().focus().deleteTable().run();
    setMenuOpen(false);
  };

  if (!pos) return null;

  return (
    <div
      ref={menuRef}
      className={`absolute z-50 transition-opacity duration-150 ${isVisible || menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Three dots button */}
      <button
        type="button"
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
        title="Table options"
      >
        <EllipsisVerticalIcon size={16} />
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute top-0 left-7 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-500" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

// // Table Column Handles Component - Three dots on top of each column
// function TableColumnHandles({
//   editor,
//   containerRef,
//   onOpenMenu,
// }: {
//   editor: any;
//   containerRef: React.RefObject<HTMLDivElement | null>;
//   onOpenMenu: (pos: { x: number; y: number }) => void;
// }) {
//   const [columns, setColumns] = useState<{ left: number; width: number }[]>([]);
//   const [tableTop, setTableTop] = useState(0);

//   useEffect(() => {
//     const update = () => {
//       if (!containerRef.current) return;
//       const container = containerRef.current;
//       const table = container.querySelector("table");
//       if (!table) {
//         setColumns([]);
//         return;
//       }

//       const containerRect = container.getBoundingClientRect();
//       const tableRect = table.getBoundingClientRect();
//       setTableTop(tableRect.top - containerRect.top);

//       // Get columns from first row (header row)
//       const firstRow = table.querySelector("tr");
//       if (!firstRow) {
//         setColumns([]);
//         return;
//       }

//       const cells = firstRow.querySelectorAll("td, th");
//       const colData: { left: number; width: number }[] = [];
//       cells.forEach((cell) => {
//         const rect = cell.getBoundingClientRect();
//         colData.push({
//           left: rect.left - containerRect.left,
//           width: rect.width,
//         });
//       });
//       setColumns(colData);
//     };

//     update();
//     editor.on("update", update);
//     editor.on("selectionUpdate", update);
//     window.addEventListener("resize", update);

//     return () => {
//       editor.off("update", update);
//       editor.off("selectionUpdate", update);
//       window.removeEventListener("resize", update);
//     };
//   }, [editor, containerRef]);

//   if (columns.length === 0) return null;

//   return (
//     <>
//       {columns.map((col, idx) => (
//         <button
//           key={idx}
//           type="button"
//           className="absolute flex items-center justify-center h-[5px] rounded bg-gray-400 hover:bg-gray-200 text-gray-100 hover:text-gray-700 transition-colors"
//           style={{
//             left: col.left + col.width / 2 - 10,
//             top: tableTop - 1,
//             width: 25,
//           }}
//           onClick={(e) => {
//             const table = containerRef.current?.querySelector("table");
//             const firstRow = table?.querySelector("tr");
//             const cells = firstRow?.querySelectorAll("td, th");
//             const targetCell = cells?.[idx];
//             if (targetCell) (targetCell as HTMLElement).click();
//             onOpenMenu({ x: e.clientX, y: e.clientY });
//           }}
//           title="Column options"
//         >
//           {/* <EllipsisIcon size={14} /> */}
//         </button>
//       ))}
//     </>
//   );
// }

// // Table Row Handles Component
// function TableRowHandles({
//   editor,
//   containerRef,
//   onOpenMenu,
// }: {
//   editor: any;
//   containerRef: React.RefObject<HTMLDivElement | null>;
//   onOpenMenu: (pos: { x: number; y: number }) => void;
// }) {
//   const [rows, setRows] = useState<{ top: number; height: number }[]>([]);
//   const [tableLeft, setTableLeft] = useState(0);

//   useEffect(() => {
//     const update = () => {
//       if (!containerRef.current) return;
//       const container = containerRef.current;
//       const table = container.querySelector("table");
//       if (!table) {
//         setRows([]);
//         return;
//       }

//       const containerRect = container.getBoundingClientRect();
//       const tableRect = table.getBoundingClientRect();
//       setTableLeft(tableRect.left - containerRect.left);

//       const rowEls = table.querySelectorAll("tr");
//       const rowData: { top: number; height: number }[] = [];
//       rowEls.forEach((row) => {
//         const rect = row.getBoundingClientRect();
//         rowData.push({
//           top: rect.top - containerRect.top,
//           height: rect.height,
//         });
//       });
//       setRows(rowData);
//     };

//     update();
//     editor.on("update", update);
//     editor.on("selectionUpdate", update);
//     window.addEventListener("resize", update);

//     return () => {
//       editor.off("update", update);
//       editor.off("selectionUpdate", update);
//       window.removeEventListener("resize", update);
//     };
//   }, [editor, containerRef]);

//   if (rows.length === 0) return null;

//   return (
//     <>
//       {rows.map((row, idx) => (
//         <button
//           key={idx}
//           type="button"
//           className="absolute flex items-center justify-center w-[6px]  rounded bg-gray-400 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
//           style={{
//             left: tableLeft - 3,
//             top: row.top + 14,
//             height: 24,
//           }}
//           onClick={(e) => {
//             const table = containerRef.current?.querySelector("table");
//             const targetRow = table?.querySelectorAll("tr")[idx];
//             const firstCell = targetRow?.querySelector("td, th");
//             if (firstCell) (firstCell as HTMLElement).click();
//             onOpenMenu({ x: e.clientX, y: e.clientY });
//           }}
//           title="Row options"
//         >
//           {/* <EllipsisVerticalIcon size={14} /> */}
//         </button>
//       ))}
//     </>
//   );
// }

// Table Column Handles Component - Shows only for hovered/active column
function TableColumnHandles({
  editor,
  containerRef,
  onOpenMenu,
}: {
  editor: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onOpenMenu: (pos: { x: number; y: number }) => void;
}) {
  const [columns, setColumns] = useState<{ left: number; width: number }[]>([]);
  const [tableTop, setTableTop] = useState(0);
  const [activeColIndex, setActiveColIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const update = () => {
      const table = container.querySelector("table");
      if (!table) {
        setColumns([]);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      setTableTop(tableRect.top - containerRect.top);

      const firstRow = table.querySelector("tr");
      if (!firstRow) {
        setColumns([]);
        return;
      }

      const cells = firstRow.querySelectorAll("td, th");
      const colData: { left: number; width: number }[] = [];
      cells.forEach((cell) => {
        const rect = cell.getBoundingClientRect();
        colData.push({
          left: rect.left - containerRect.left,
          width: rect.width,
        });
      });
      setColumns(colData);
    };

    // Detect which column is being hovered
    const handleMouseMove = (e: MouseEvent) => {
      const table = container.querySelector("table");
      if (!table) {
        setActiveColIndex(null);
        return;
      }

      const tableRect = table.getBoundingClientRect();
      
      // Check if mouse is over the table
      if (
        e.clientX < tableRect.left ||
        e.clientX > tableRect.right ||
        e.clientY < tableRect.top ||
        e.clientY > tableRect.bottom
      ) {
        setActiveColIndex(null);
        return;
      }

      // Find which column the mouse is over
      const firstRow = table.querySelector("tr");
      if (!firstRow) return;

      const cells = firstRow.querySelectorAll("td, th");
      let foundIndex: number | null = null;

      cells.forEach((cell, idx) => {
        const cellRect = cell.getBoundingClientRect();
        if (e.clientX >= cellRect.left && e.clientX <= cellRect.right) {
          foundIndex = idx;
        }
      });

      setActiveColIndex(foundIndex);
    };

    update();
    editor.on("update", update);
    editor.on("selectionUpdate", update);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", () => setActiveColIndex(null));
    window.addEventListener("resize", update);

    return () => {
      editor.off("update", update);
      editor.off("selectionUpdate", update);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", update);
    };
  }, [editor, containerRef]);

  if (columns.length === 0 || activeColIndex === null) return null;

  const col = columns[activeColIndex];
  if (!col) return null;

  return (
    <button
      type="button"
      className="absolute flex  cursor-pointer items-center justify-center h-[4px] rounded bg-gray-400 hover:bg-blue-500 transition-colors"
      style={{
        left: col.left + col.width / 2 - 12,
        top: tableTop - 0,
        width: 25,
      }}
      onClick={(e) => {
        const table = containerRef.current?.querySelector("table");
        const firstRow = table?.querySelector("tr");
        const cells = firstRow?.querySelectorAll("td, th");
        const targetCell = cells?.[activeColIndex];
        if (targetCell) (targetCell as HTMLElement).click();
        onOpenMenu({ x: e.clientX, y: e.clientY });
      }}
      title="Column options"
    />
  );
}

// Table Row Handles Component - Shows only for hovered/active row
function TableRowHandles({
  editor,
  containerRef,
  onOpenMenu,
}: {
  editor: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onOpenMenu: (pos: { x: number; y: number }) => void;
}) {
  const [rows, setRows] = useState<{ top: number; height: number }[]>([]);
  const [tableLeft, setTableLeft] = useState(0);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const update = () => {
      const table = container.querySelector("table");
      if (!table) {
        setRows([]);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      setTableLeft(tableRect.left - containerRect.left);

      const rowEls = table.querySelectorAll("tr");
      const rowData: { top: number; height: number }[] = [];
      rowEls.forEach((row) => {
        const rect = row.getBoundingClientRect();
        rowData.push({
          top: rect.top - containerRect.top,
          height: rect.height,
        });
      });
      setRows(rowData);
    };

    // Detect which row is being hovered
    const handleMouseMove = (e: MouseEvent) => {
      const table = container.querySelector("table");
      if (!table) {
        setActiveRowIndex(null);
        return;
      }

      const tableRect = table.getBoundingClientRect();

      // Check if mouse is over the table
      if (
        e.clientX < tableRect.left ||
        e.clientX > tableRect.right ||
        e.clientY < tableRect.top ||
        e.clientY > tableRect.bottom
      ) {
        setActiveRowIndex(null);
        return;
      }

      // Find which row the mouse is over
      const rowEls = table.querySelectorAll("tr");
      let foundIndex: number | null = null;

      rowEls.forEach((row, idx) => {
        const rowRect = row.getBoundingClientRect();
        if (e.clientY >= rowRect.top && e.clientY <= rowRect.bottom) {
          foundIndex = idx;
        }
      });

      setActiveRowIndex(foundIndex);
    };

    update();
    editor.on("update", update);
    editor.on("selectionUpdate", update);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", () => setActiveRowIndex(null));
    window.addEventListener("resize", update);

    return () => {
      editor.off("update", update);
      editor.off("selectionUpdate", update);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", update);
    };
  }, [editor, containerRef]);

  if (rows.length === 0 || activeRowIndex === null) return null;

  const row = rows[activeRowIndex];
  if (!row) return null;

  return (
    <button
      type="button"
      className="absolute cursor-pointer flex items-center justify-center w-[4px] rounded bg-gray-400 hover:bg-blue-500 transition-colors"
      style={{
        left: tableLeft - 0,
        top: row.top + row.height / 2 - 12,
        height: 24,
      }}
      onClick={(e) => {
        const table = containerRef.current?.querySelector("table");
        const targetRow = table?.querySelectorAll("tr")[activeRowIndex];
        const firstCell = targetRow?.querySelector("td, th");
        if (firstCell) (firstCell as HTMLElement).click();
        onOpenMenu({ x: e.clientX, y: e.clientY });
      }}
      title="Row options"
    />
  );
}

// Add Column Button Component - Full height vertical bar on right
// function AddColumnButton({
//   editor,
//   containerRef,
// }: {
//   editor: any;
//   containerRef: React.RefObject<HTMLDivElement | null>;
// }) {
//   const [pos, setPos] = useState<{
//     right: number;
//     top: number;
//     height: number;
//   } | null>(null);
//   const [isHovered, setIsHovered] = useState(false);

//   useEffect(() => {
//     const update = () => {
//       if (!containerRef.current) return;
//       const container = containerRef.current;
//       const table = container.querySelector("table");
//       if (!table) {
//         setPos(null);
//         return;
//       }

//       const containerRect = container.getBoundingClientRect();
//       const tableRect = table.getBoundingClientRect();

//       setPos({
//         right: tableRect.right - containerRect.left,
//         top: tableRect.top - containerRect.top,
//         height: tableRect.height,
//       });
//     };

//     update();
//     editor.on("update", update);
//     editor.on("selectionUpdate", update);
//     window.addEventListener("resize", update);

//     return () => {
//       editor.off("update", update);
//       editor.off("selectionUpdate", update);
//       window.removeEventListener("resize", update);
//     };
//   }, [editor, containerRef]);

//   if (!pos) return null;

//   return (
//     <div
//       className="absolute flex items-center transition-opacity"
//       style={{
//         left: pos.right + 4,
//         top: pos.top,
//         height: pos.height,
//       }}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {/* Vertical line */}
//       <div
//        onClick={() => editor.chain().focus().addColumnAfter().run()}
//         className={`w-[16px] cursor-pointer flex items-center justify-center h-full rounded-sm transition-colors ${isHovered ? "bg-gray-200" : "bg-gray-300"}`}
//       >
//         <button
//           className="cursor-pointer"
         
//           title="Add column"
//         >
//           <Plus size={14} />
//         </button>
//       </div>
//     </div>
//   );
// }

// // Add Row Button Component - Full width horizontal bar on bottom
// function AddRowButton({
//   editor,
//   containerRef,
// }: {
//   editor: any;
//   containerRef: React.RefObject<HTMLDivElement | null>;
// }) {
//   const [pos, setPos] = useState<{
//     left: number;
//     bottom: number;
//     width: number;
//   } | null>(null);
//   const [isHovered, setIsHovered] = useState(false);

//   useEffect(() => {
//     const update = () => {
//       if (!containerRef.current) return;
//       const container = containerRef.current;
//       const table = container.querySelector("table");
//       if (!table) {
//         setPos(null);
//         return;
//       }

//       const containerRect = container.getBoundingClientRect();
//       const tableRect = table.getBoundingClientRect();

//       setPos({
//         left: tableRect.left - containerRect.left,
//         bottom: tableRect.bottom - containerRect.top,
//         width: tableRect.width,
//       });
//     };

//     update();
//     editor.on("update", update);
//     editor.on("selectionUpdate", update);
//     window.addEventListener("resize", update);

//     return () => {
//       editor.off("update", update);
//       editor.off("selectionUpdate", update);
//       window.removeEventListener("resize", update);
//     };
//   }, [editor, containerRef]);

//   if (!pos) return null;

//   return (
//     <div
//       className="absolute flex flex-col items-center transition-opacity"
//       style={{
//         left: pos.left,
//         top: pos.bottom + 4,
//         width: pos.width,
//       }}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {/* Horizontal line */}
//       <div
//       onClick={() => editor.chain().focus().addRowAfter().run()}
//         className={`h-[16px] cursor-pointer flex items-center justify-center w-full rounded-sm transition-colors ${isHovered ? "bg-gray-200" : "bg-gray-300"}`}
//       >
//         <button
//           className="cursor-pointer"
          
//           title="Add row"
//         >
//           <Plus size={14} />
//         </button>
//       </div>
//     </div>
//   );
// }