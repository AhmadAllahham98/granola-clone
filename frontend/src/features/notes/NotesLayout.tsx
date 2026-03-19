// ─── NotesLayout ──────────────────────────────────────────────────────────────
// The main 2-panel layout: sidebar (note list) + editor panel.
// Renders for all /notes/* routes.
//
// The <Routes> inside here handle the sub-routes:
//   /notes        → EditorPanel in empty state
//   /notes/:id    → EditorPanel with a note loaded

import { Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar.tsx'
import EditorPanel from './EditorPanel.tsx'

function NotesLayout() {
  return (
    // Two-column grid: fixed 260px sidebar + remaining space for editor
    <div className="grid h-screen overflow-hidden" style={{ gridTemplateColumns: '260px 1fr' }}>
      <Sidebar />
      <main className="flex flex-col overflow-hidden">
        <Routes>
          <Route index element={<EditorPanel />} />
          <Route path=":id" element={<EditorPanel />} />
        </Routes>
      </main>
    </div>
  )
}

export default NotesLayout
