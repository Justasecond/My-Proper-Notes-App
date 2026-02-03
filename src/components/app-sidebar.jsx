import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  IconDatabase,
  IconArchive,
  IconTrash,
} from "@tabler/icons-react"
import { Notebook, Search } from "lucide-react"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
export function AppSidebar({ onSelectView, search, setSearch }) {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="flex flex-col items-center justify-center gap-2 px-5 pt-6 text-2xl font-bold text-center">
        <Notebook size={26} />
        <span>
          <span className="text-purple-300 leading-relaxed">'MARK-US'</span> NOTES WEB APP :)
        </span>
      </SidebarHeader>


      <SidebarContent className="px-3 pt-5 space-y-2">
        <SidebarItem
          icon={<IconDatabase size={18} />}
          label="All Notes"
          onClick={() => onSelectView("all")}
        />
        <SidebarItem
          icon={<IconArchive size={18} />}
          label="Archived Notes"
          onClick={() => onSelectView("archived")}
        />
        <SidebarItem
          icon={<IconTrash size={18} />}
          label="Deleted Notes"
          onClick={() => onSelectView("deleted")}
        />

        {/* SEARCH */}
        <div className="px-2 pt-4">
          <div className="flex items-center gap-2 border rounded px-2 py-1">
            <Search size={16} />
            <input
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
            />
        <AnimatedThemeToggler />
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="px-9 py-3 text-sm text-muted-foreground">
        Stupid Fricking Notes©
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarItem({ icon, label, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-muted transition"
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}
