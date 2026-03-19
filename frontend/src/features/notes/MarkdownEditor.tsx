// ─── MarkdownEditor ───────────────────────────────────────────────────────────
// Wraps @uiw/react-md-editor for split-pane markdown editing.
// The parent (EditorPanel) owns the `value` state — this is a controlled component.
//
// @uiw/react-md-editor docs: https://github.com/uiwjs/react-md-editor
//
// Key props:
//   value        — current markdown string
//   onChange     — called with new string on every keystroke
//   preview      — 'live' (split) | 'edit' | 'preview'
//   data-color-mode — 'dark' | 'light' — set as attribute on the wrapper div

import MDEditor from '@uiw/react-md-editor'

type Props = {
  value: string
  onChange: (value: string) => void
}

function MarkdownEditor({ value, onChange }: Props) {
  return (
    // data-color-mode is read by MDEditor to set dark/light theme
    <div className="h-full" data-color-mode="dark">
      <MDEditor
        value={value}
        // MDEditor passes `string | undefined` — guard against undefined
        onChange={(val) => onChange(val ?? '')}
        height="100%"
        preview="live"   // Split: editor left, rendered preview right
      />
    </div>
  )
}

export default MarkdownEditor
