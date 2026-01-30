import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import {TextStyle} from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Underline from "@tiptap/extension-underline"

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Palette,
} from "lucide-react"

export default function RichEditor({
  content,
  onChange,
  editorKey,
  dark = false,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // IMPORTANT: disable default
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextStyle,
      Color,
      Underline,
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  }, [editorKey])

  if (!editor) return null

  const iconColor = dark ? "text-white" : "text-black"

  return (
    <div className="space-y-3">
      {/* TOOLBAR */}
      <div
        className={`flex flex-wrap gap-2 items-center border rounded-lg p-2 ${iconColor}`}
        style={{
          background: dark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.8)",
        }}
      >
        <Btn on={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </Btn>

        <Btn on={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </Btn>

        <Btn on={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </Btn>

        <Btn on={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={16} />
        </Btn>

        <Divider />

        {/* HEADINGS */}
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={16} />
        </Btn>

        <Btn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </Btn>

        <Btn on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={16} />
        </Btn>

        <Btn on={() => editor.chain().focus().setParagraph().run()}>
          <Type size={16} />
        </Btn>

        <Divider />

        <Btn on={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </Btn>

        {/* TEXT COLOR */}
        <label className="flex items-center gap-1 cursor-pointer">
          <Palette size={16} />
          <input
            type="color"
            className="w-6 h-6 cursor-pointer bg-transparent"
            onChange={e =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
        </label>
      </div>

      {/* EDITOR */}
      <EditorContent
        editor={editor}
        className={`prose max-w-none min-h-[350px] rounded-lg p-4 outline-none
          ${dark ? "prose-invert text-white" : "text-black"}
        `}
      />
    </div>
  )
}

/* ------------------ HELPERS ------------------ */

function Btn({ children, on }) {
  return (
    <button
      type="button"
      onClick={on}
      className="p-2 rounded hover:bg-black/10 dark:hover:bg-white/10 transition"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-black/20 dark:bg-white/20 mx-1" />
}
