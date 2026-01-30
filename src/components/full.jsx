import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import {
  Trash2,
  Archive,
  RotateCcw,
  ArrowLeft,
  CheckSquare,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import RichEditor from "@/components/rich-editor"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"


const VIEW_LABELS = {
  all: "All Notes",
  archived: "Archived Notes",
  deleted: "Deleted Notes",
}

const SORTS = {
  newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
  az: (a, b) => a.title.localeCompare(b.title),
  za: (a, b) => b.title.localeCompare(a.title),
}

export default function Full() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState("all")
  const [notes, setNotes] = useState([])
  const [activeNote, setActiveNote] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [content, setContent] = useState("")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [sort, setSort] = useState("newest")
  const [selected, setSelected] = useState([])
  const [previousView, setPreviousView] = useState("all")
  const [title, setTitle] = useState("")



  useEffect(() => {
    loadNotes("active")
  }, [sort])

  async function loadNotes(status) {
    const { data } = await supabase
      .from("notes_v2")
      .select("*")
      .eq("status", status)

    setNotes((data || []).sort(SORTS[sort]))
    setActiveNote(null)
    setSelected([])
  }

  function changeView(v) {
    setView(v)
    loadNotes(v === "all" ? "active" : v)
  }

  function selectAll() {
    setSelected(notes.map(n => n.id))
  }

  async function createNote() {
    const { data } = await supabase
      .from("notes_v2")
      .insert({
        title: "Untitled",
        content: "<h1>Untitled</h1>",
        status: "active",
        bg_color: "#ffffff",
      })
      .select()
      .single()

    setActiveNote(data)
    setContent(data.content)
    setBgColor(data.bg_color)
  }

  function openNote(note) {
    setPreviousView(view)
    setActiveNote(note)
    setTitle(note.title)
    setContent(note.content)
    setBgColor(note.bg_color)
  }

  async function saveNote() {
    await supabase
      .from("notes_v2")
      .update({
        title,
        content,
        bg_color: bgColor,
      })
      .eq("id", activeNote.id)

    changeView("all")
  }

  async function setStatus(note, status) {
    if (status === "permanent") {
      if (!confirm("Delete permanently?")) return
      await supabase.from("notes_v2").delete().eq("id", note.id)
    } else {
      await supabase.from("notes_v2").update({ status }).eq("id", note.id)
    }
    changeView(view)
  }

  function toggleSelect(id) {
    setSelected(s =>
      s.includes(id) ? s.filter(x => x !== id) : [...s, id]
    )
  }

  async function bulkAction(status) {
    if (!selected.length) return

    if (view === "deleted" && status === "deleted") {
      setShowConfirm(true)
      return
    }

    await supabase
      .from("notes_v2")
      .update({ status })
      .in("id", selected)

    changeView(view)
  }

  return (
    <SidebarProvider>
      <AppSidebar
        onSelectView={changeView}
        search={search}
        setSearch={setSearch}
      />
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[320px] space-y-4">
            <h3 className="font-semibold text-lg">
              Delete notes permanently?
            </h3>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await supabase
                    .from("notes_v2")
                    .delete()
                    .in("id", selected)

                  setShowConfirm(false)
                  changeView("deleted")
                }}
              >
                Delete forever
              </Button>
            </div>
          </div>
        </div>
      )}

      <SidebarInset>
        <header className="flex items-center gap-4 border-b px-4 h-16">
          <SidebarTrigger />
          <h1 className="font-semibold">{VIEW_LABELS[view]}</h1>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="ml-auto border rounded px-2 py-1"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A–Z</option>
            <option value="za">Z–A</option>
          </select>

          <Button onClick={createNote}>New Note</Button>
        </header>

        <div className="p-6">
          {!activeNote ? (
            <>
              {selected.length > 0 && (
                <div className="mb-4 flex gap-2">
                  <Button variant="outline" onClick={selectAll}>
                    Select all
                  </Button>

                  <Button onClick={() => bulkAction("archived")}>
                    Archive Selected
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => bulkAction("deleted")}
                  >
                    Delete Selected
                  </Button>
                </div>
              )}

              {/* BIG SQUARE GRID */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {notes
                  .filter(n =>
                    n.title.toLowerCase().includes(search.toLowerCase())
                  )
                  .map(note => (
                    <div
                      key={note.id}
                      onClick={() => openNote(note)}
                      className="group relative rounded-2xl pt-8 pl-8 min-h-[160px] cursor-pointer shadow hover:shadow-lg transition"
                      style={{ background: note.bg_color }}
                    >
                      <CheckSquare
                        size={18}
                        className={`absolute top-3 left-3 cursor-pointer ${selected.includes(note.id)
                          ? "text-blue-600"
                          : "opacity-30"
                          }`}
                        onClick={e => {
                          e.stopPropagation()
                          toggleSelect(note.id)
                        }}
                      />

                      <h3 className="font-semibold text-lg line-clamp-2">
                        {note.title}
                      </h3>

                      <p
                        className="mt-2 text-sm text-muted-foreground line-clamp-4"
                        dangerouslySetInnerHTML={{
                          __html: note.content.replace(/<[^>]+>/g, "")
                        }}
                      />


                      <div className="absolute bottom-3 right-3 hidden group-hover:flex gap-2">
                        {view === "all" && (
                          <Archive
                            size={16}
                            onClick={e => {
                              e.stopPropagation()
                              setStatus(note, "archived")
                            }}
                          />
                        )}
                        {view !== "deleted" && (
                          <Trash2
                            size={16}
                            onClick={e => {
                              e.stopPropagation()
                              setStatus(note, "deleted")
                            }}
                          />
                        )}
                        {view === "deleted" && (
                          <Archive
                            size={16}
                            onClick={e => {
                              e.stopPropagation()
                              setStatus(note, "archived")
                            }}
                          />
                        )}
                        {view === "deleted" && (
                          <Trash2
                            size={16}
                            className="text-destructive hover:opacity-80"
                            onClick={e => {
                              e.stopPropagation()
                              setStatus(note, "permanent")
                            }}
                          />
                        )}

                        {view !== "all" && (
                          <RotateCcw
                            size={16}
                            onClick={e => {
                              e.stopPropagation()
                              setStatus(note, "active")
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div
              className="rounded-xl border p-6 space-y-4"
              style={{ background: bgColor }}
            >

              <Button
                variant="ghost"
                className="flex gap-2"
                onClick={() => changeView(previousView)}
              >
                <ArrowLeft size={16} /> Back
              </Button>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full text-2xl font-bold bg-transparent outline-none border-b pb-2"
                style={{
                  color: bgColor === "#000000" ? "white" : "black",
                }}
              />
              <input
                type="color"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="w-10 h-10 cursor-pointer"
              />

              <RichEditor
                editorKey={activeNote.id}
                content={content}
                onChange={setContent}
              />

              <Button onClick={saveNote}>Save</Button>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
