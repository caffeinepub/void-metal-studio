# VOID-METAL Forge Studio

## Current State
- Four isolated views: Studio (canvas/generation), Forge Hub (Kanban), Design Canvas, Video Timeline
- AI Scribe sidebar can push content to the Kanban hub via `hubAIContent` prop
- Backend only stores user profiles and ban records; no project or content persistence
- No cross-section data flow -- each tool is stateless and disconnected

## Requested Changes (Diff)

### Add
- **Project entity** stored in backend: id, title, stage (Idea/Script/Visuals/Video/Published), createdAt, updatedAt, scriptContent, designNotes, videoNotes, aiHistory (array of messages)
- Backend methods: createProject, getProjects, getProject, updateProject, deleteProject, updateProjectStage
- **Active project context** shared across all four views via React context
- **Project selector** in header: shows current project name, click to switch or create new
- **Forge Hub** becomes the project list / pipeline overview; clicking a card opens that project in context
- **AI Scribe sidebar** saves chat history per project to backend; "Send to Hub" updates project scriptContent
- **Design Canvas** shows/saves design notes per active project
- **Video Timeline** shows/saves video notes per active project
- **Unified export flow**: from any view, user can trigger a full pipeline export (script + design + video notes) associated with the active project; stage auto-advances on export
- **Pipeline progress bar** in header showing current project's stage

### Modify
- App.tsx: add ProjectContext provider, project selector in header, pass activeProject to each view
- ProjectHub: fetch projects from backend, render Kanban with real data, clicking a card sets active project and navigates to relevant tool
- AISidebar: accept activeProjectId, persist messages to backend per project, load history on mount
- DesignCanvas: accept activeProjectId, show/save design notes
- VideoTimeline: accept activeProjectId, show/save video notes
- Backend main.mo: add project CRUD operations

### Remove
- Local `hubAIContent` state array (replaced by backend-persisted project content)
- Disconnected view state (replaced by unified project context)

## Implementation Plan
1. Generate new Motoko backend with project storage (CRUD + stage management + AI history per project)
2. Update frontend ProjectContext with active project state and backend integration hooks
3. Update App.tsx header with project selector and pipeline progress indicator
4. Wire Forge Hub to backend project list with create/delete/stage-change
5. Wire AI Scribe to save/load per-project AI chat history from backend
6. Wire Design Canvas and Video Timeline to read/write project notes
7. Add unified export button that bundles active project content and advances stage
