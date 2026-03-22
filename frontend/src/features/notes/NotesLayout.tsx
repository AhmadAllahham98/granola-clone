// ─── NotesLayout ──────────────────────────────────────────────────────────────
// The main 2-panel layout: sidebar (note list) + editor panel.
// Renders for all /notes/* routes.
//
// The <Routes> inside here handle the sub-routes:
//   /notes        → EditorPanel in empty state
//   /notes/:id    → EditorPanel with a note loaded

import { Routes, Route } from 'react-router-dom'
import { motion } from 'motion/react'
import Sidebar from './Sidebar.tsx'
import EditorPanel from './EditorPanel.tsx'

function NotesLayout() {
  return (
    // Two-column grid: fixed 260px sidebar + remaining space for editor
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="grid h-screen overflow-hidden" 
      style={{ gridTemplateColumns: '260px 1fr' }}
    >
      <Sidebar />
      <main className="flex flex-col overflow-hidden">
        <Routes>
          <Route index element={<EditorPanel />} />
          <Route path=":id" element={<EditorPanel />} />
        </Routes>
      </main>
    </motion.div>
  )
}

export default NotesLayout
