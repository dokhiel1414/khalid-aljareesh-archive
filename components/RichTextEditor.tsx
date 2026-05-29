"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Mark } from "@tiptap/core";
import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  Link2,
  Link2Off,
  Undo2,
  Redo2,
  Eraser,
  Type,
} from "lucide-react";

/**
 * Custom font-size mark backed by an inline style. Lets the toolbar set
 * arbitrary sizes ("16px", "20px"…) on selected text.
 */
const FontSize = Mark.create({
  name: "fontSize",
  addOptions() { return { types: ["textStyle"] as string[] }; },
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.fontSize || null,
            renderHTML: (attrs) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

const COLORS = [
  "#072C49", // ink
  "#0A3A5E",
  "#C17E5A", // brown
  "#DEA470", // gold
  "#10B981", // emerald
  "#DC2626", // red
  "#1D4ED8", // blue
  "#7C3AED", // violet
  "#000000",
  "#FFFFFF",
];

const FONT_SIZES = [
  { label: "صغير",      value: "14px" },
  { label: "عادي",      value: "16px" },
  { label: "متوسط",     value: "18px" },
  { label: "كبير",      value: "20px" },
  { label: "أكبر",      value: "24px" },
  { label: "أكبر بكثير", value: "30px" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "ابدأ بكتابة المقال هنا…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const lastValue = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener", target: "_blank" } }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        dir: "rtl",
        class:
          "prose max-w-none focus:outline-none min-h-[260px] p-4 md:p-6 bg-white dark:bg-dark-card",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastValue.current = html;
      onChange(html);
    },
  });

  // Sync external value changes (e.g. opening Edit modal for a different item)
  useEffect(() => {
    if (!editor) return;
    if (value !== lastValue.current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      lastValue.current = value;
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="rounded-xl border border-ink/15 dark:border-dark-border bg-white dark:bg-dark-card min-h-[300px] grid place-items-center text-muted text-sm">
        جاري تحميل المحرّر…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ink/15 dark:border-dark-border bg-sand-2 dark:bg-dark-surface overflow-hidden focus-within:ring-2 focus-within:ring-gold/50">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

/* ---------------- Toolbar ---------------- */

function ToolBtn({
  onClick,
  active,
  title,
  children,
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={
        "h-8 w-8 grid place-items-center rounded-md text-sm transition " +
        (active
          ? "bg-gold text-ink"
          : "text-ink/80 dark:text-sand/80 hover:bg-ink/10 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed")
      }
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-6 bg-ink/15 dark:bg-white/15 mx-0.5" />;
}

function Toolbar({ editor }: { editor: Editor }) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("أدخل الرابط:", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-ink/10 dark:border-dark-border bg-white dark:bg-dark-surface sticky top-0 z-10">
      <ToolBtn
        title="تراجع"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="إعادة"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <select
        value={
          editor.isActive("heading", { level: 1 }) ? "h1"
          : editor.isActive("heading", { level: 2 }) ? "h2"
          : editor.isActive("heading", { level: 3 }) ? "h3"
          : "p"
        }
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: Number(v.slice(1)) as 1 | 2 | 3 }).run();
        }}
        title="نوع الفقرة"
        className="h-8 px-2 rounded-md text-xs bg-white dark:bg-dark-card border border-ink/10 dark:border-dark-border text-ink dark:text-sand"
      >
        <option value="p">فقرة</option>
        <option value="h1">عنوان كبير</option>
        <option value="h2">عنوان</option>
        <option value="h3">عنوان فرعي</option>
      </select>

      <select
        defaultValue=""
        onChange={(e) => {
          const v = e.target.value;
          if (!v) editor.chain().focus().setMark("textStyle", { fontSize: null } as never).run();
          else editor.chain().focus().setMark("textStyle", { fontSize: v } as never).run();
          e.target.value = "";
        }}
        title="حجم الخط"
        className="h-8 px-2 rounded-md text-xs bg-white dark:bg-dark-card border border-ink/10 dark:border-dark-border text-ink dark:text-sand"
      >
        <option value="">حجم الخط</option>
        {FONT_SIZES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <Divider />

      <ToolBtn
        title="عريض"
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <Bold className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="مائل"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <Italic className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="تسطير"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="خط في الوسط"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolBtn>

      {/* Color picker */}
      <ColorPicker editor={editor} />

      <Divider />

      <ToolBtn
        title="عنوان ١"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
      >
        <Heading1 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="عنوان ٢"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="عنوان ٣"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="قائمة نقطية"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        <List className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="قائمة مرقّمة"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="اقتباس"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        <Quote className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="محاذاة لليمين"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
      >
        <AlignRight className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="توسيط"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="محاذاة لليسار"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="ضبط"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        active={editor.isActive({ textAlign: "justify" })}
      >
        <AlignJustify className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn title="إدراج رابط" onClick={setLink} active={editor.isActive("link")}>
        <Link2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn
        title="إزالة الرابط"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
      >
        <Link2Off className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="مسح التنسيق"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        <Eraser className="h-4 w-4" />
      </ToolBtn>
    </div>
  );
}

function ColorPicker({ editor }: { editor: Editor }) {
  return (
    <div className="relative inline-flex">
      <details className="relative">
        <summary
          className="h-8 px-2 rounded-md text-xs text-ink/80 dark:text-sand/80 hover:bg-ink/10 dark:hover:bg-white/10 inline-flex items-center gap-1 cursor-pointer list-none"
          title="لون الخط"
        >
          <Type className="h-4 w-4" />
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: (editor.getAttributes("textStyle").color as string) || "#072C49" }}
          />
        </summary>
        <div className="absolute z-20 mt-1 p-2 bg-white dark:bg-dark-card border border-ink/10 dark:border-dark-border rounded-xl shadow-card grid grid-cols-5 gap-1.5 w-[150px]">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => editor.chain().focus().setColor(c).run()}
              title={c}
              className="h-6 w-6 rounded-md border border-ink/15"
              style={{ background: c }}
            />
          ))}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetColor().run()}
            title="إزالة اللون"
            className="col-span-5 text-xs px-2 py-1 rounded-md hover:bg-ink/5 dark:hover:bg-white/5 text-ink dark:text-sand mt-1"
          >
            إزالة اللون
          </button>
        </div>
      </details>
    </div>
  );
}
