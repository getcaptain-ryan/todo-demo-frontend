# Kanban Board Implementation Plan

## Overview
This document provides a comprehensive plan for implementing a kanban-style board layout with drag-and-drop functionality using Shadcn/ui components, Tailwind CSS, and the existing React 19 + Vite + TypeScript setup.

## Requirements Summary
- Three columns: "Todo", "In Progress", and "Done"
- Drag-and-drop task cards between columns
- Responsive design (desktop and mobile)
- Clean, modern styling with Shadcn/ui theme
- Accessibility support (keyboard navigation, screen readers)

---

## Technology Stack

### Core Technologies (Already Installed)
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components (Card, Button)
- **Vite** - Build tool

### New Dependencies Required
- **@dnd-kit/core** - Modern drag-and-drop toolkit for React
- **@dnd-kit/sortable** - Sortable preset for @dnd-kit
- **@dnd-kit/utilities** - Utility functions for @dnd-kit

### Why @dnd-kit?
- **Modern**: Built for React hooks and modern React patterns
- **Accessible**: Built-in keyboard navigation and screen reader support
- **Performant**: Uses CSS transforms for smooth animations
- **Flexible**: Highly customizable and extensible
- **TypeScript**: Full TypeScript support
- **Maintained**: Actively maintained by Shopify

---

## Component Architecture

### File Structure
```
app/src/
├── components/
│   ├── ui/                      # Existing Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   ├── kanban/                  # New kanban components
│   │   ├── KanbanBoard.tsx      # Main board container
│   │   ├── KanbanColumn.tsx     # Column component (drop zone)
│   │   ├── TaskCard.tsx         # Draggable task card
│   │   └── AddTaskButton.tsx    # Button to add new tasks
├── hooks/
│   ├── useTodos.ts              # Existing todo hooks
│   └── useKanban.ts             # New kanban state management hook
├── types/
│   └── index.ts                 # Updated with kanban types
└── lib/
    └── kanban-utils.ts          # Utility functions for kanban
```

### Component Hierarchy
```
KanbanBoard
├── KanbanColumn (Todo)
│   ├── TaskCard (draggable)
│   ├── TaskCard (draggable)
│   └── AddTaskButton
├── KanbanColumn (In Progress)
│   ├── TaskCard (draggable)
│   └── AddTaskButton
└── KanbanColumn (Done)
    ├── TaskCard (draggable)
    └── AddTaskButton
```

---

## TypeScript Interfaces

### Task Data Structure
```typescript
// Add to src/types/index.ts

export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority?: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

export interface KanbanColumn {
  id: TaskStatus
  title: string
  tasks: Task[]
}

export interface KanbanBoard {
  columns: KanbanColumn[]
}

// For drag and drop
export interface DragEndEvent {
  active: {
    id: string
  }
  over: {
    id: string
  } | null
}
```

---

## Step-by-Step Implementation Guide

### Phase 1: Install Dependencies

```bash
cd app

# Install @dnd-kit packages
yarn add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Phase 2: Update Type Definitions

Update `src/types/index.ts` to include the kanban-specific types shown above.

### Phase 3: Create Utility Functions

Create `src/lib/kanban-utils.ts` with helper functions:
- `getTasksByStatus()` - Filter tasks by status
- `moveTask()` - Move task between columns
- `getColumnTitle()` - Get display title for column
- `getColumnColor()` - Get color scheme for column

### Phase 4: Create Kanban Hook

Create `src/hooks/useKanban.ts` for state management:
- Manage tasks state
- Handle drag-and-drop logic
- Update task status
- Integrate with backend API (useTodos hook)

### Phase 5: Create Task Card Component

Create `src/components/kanban/TaskCard.tsx`:
- Use Shadcn/ui Card component
- Make it draggable with @dnd-kit
- Display task title, description, priority
- Add visual feedback for dragging state
- Include accessibility attributes

### Phase 6: Create Kanban Column Component

Create `src/components/kanban/KanbanColumn.tsx`:
- Use Tailwind flexbox for layout
- Make it a drop zone with @dnd-kit
- Display column header with task count
- Render TaskCard components
- Handle empty state
- Add visual feedback for drop target

### Phase 7: Create Add Task Button Component

Create `src/components/kanban/AddTaskButton.tsx`:
- Use Shadcn/ui Button component
- Trigger task creation dialog/form
- Position at bottom of each column

### Phase 8: Create Main Kanban Board Component

Create `src/components/kanban/KanbanBoard.tsx`:
- Set up DndContext from @dnd-kit
- Render three KanbanColumn components
- Handle drag-and-drop events
- Implement responsive grid layout
- Add loading and error states

### Phase 9: Integrate with App

Update `src/App.tsx` to use KanbanBoard component instead of HelloWorld.

### Phase 10: Testing & Refinement

- Test drag-and-drop functionality
- Test keyboard navigation
- Test screen reader compatibility
- Test responsive design on mobile
- Optimize performance

---

## Detailed Component Code Examples

### 1. Type Definitions (src/types/index.ts)

**Add these types to the existing file:**

```typescript
// Kanban-specific types
export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority?: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

export interface KanbanColumn {
  id: TaskStatus
  title: string
  tasks: Task[]
}

export interface KanbanBoard {
  columns: KanbanColumn[]
}
```

### 2. Kanban Utilities (src/lib/kanban-utils.ts)

```typescript
import type { Task, TaskStatus } from '@/types'

export function getTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status)
}

export function getColumnTitle(status: TaskStatus): string {
  const titles: Record<TaskStatus, string> = {
    'todo': 'Todo',
    'in-progress': 'In Progress',
    'done': 'Done',
  }
  return titles[status]
}

export function getColumnColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    'todo': 'bg-slate-100 dark:bg-slate-800',
    'in-progress': 'bg-blue-50 dark:bg-blue-950',
    'done': 'bg-green-50 dark:bg-green-950',
  }
  return colors[status]
}

export function getPriorityColor(priority?: 'low' | 'medium' | 'high'): string {
  if (!priority) return 'bg-gray-200 dark:bg-gray-700'

  const colors = {
    'low': 'bg-blue-200 dark:bg-blue-800',
    'medium': 'bg-yellow-200 dark:bg-yellow-800',
    'high': 'bg-red-200 dark:bg-red-800',
  }
  return colors[priority]
}
```

### 3. Kanban Hook (src/hooks/useKanban.ts)

```typescript
import { useState, useCallback } from 'react'
import type { Task, TaskStatus } from '@/types'
import { getTasksByStatus } from '@/lib/kanban-utils'

export function useKanban(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      )
    )
  }, [])

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks((prevTasks) => [...prevTasks, newTask])
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
  }, [])

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    )
  }, [])

  return {
    tasks,
    moveTask,
    addTask,
    deleteTask,
    updateTask,
    getTasksByStatus: (status: TaskStatus) => getTasksByStatus(tasks, status),
  }
}
```


### 4. Task Card Component (src/components/kanban/TaskCard.tsx)

```typescript
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getPriorityColor } from '@/lib/kanban-utils'
import type { Task } from '@/types'
import { GripVertical } from 'lucide-react'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50'
      )}
    >
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium leading-tight flex-1">
              {task.title}
            </CardTitle>
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-accent rounded"
              aria-label="Drag to move task"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </CardHeader>
        {(task.description || task.priority) && (
          <CardContent className="pt-0">
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
            {task.priority && (
              <span
                className={cn(
                  'inline-block px-2 py-1 rounded-full text-xs font-medium',
                  getPriorityColor(task.priority)
                )}
              >
                {task.priority}
              </span>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
```

### 5. Kanban Column Component (src/components/kanban/KanbanColumn.tsx)

```typescript
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { getColumnTitle, getColumnColor } from '@/lib/kanban-utils'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from '@/types'

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const taskIds = tasks.map((task) => task.id)

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="mb-4 px-1">
        <h2 className="text-lg font-semibold text-foreground">
          {getColumnTitle(status)}
        </h2>
        <p className="text-sm text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-lg p-4 transition-colors min-h-[500px]',
          getColumnColor(status),
          isOver && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                No tasks yet
              </div>
            ) : (
              tasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
```

### 6. Main Kanban Board Component (src/components/kanban/KanbanBoard.tsx)

```typescript
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { useKanban } from '@/hooks/useKanban'
import type { Task, TaskStatus } from '@/types'

// Mock data for demonstration
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create wireframes and mockups for the new landing page',
    status: 'todo',
    priority: 'high',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Implement authentication',
    description: 'Add JWT-based authentication to the API',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-21T09:15:00Z',
  },
  {
    id: '3',
    title: 'Write unit tests',
    description: 'Add test coverage for user service',
    status: 'todo',
    priority: 'medium',
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: '4',
    title: 'Deploy to production',
    description: 'Deploy version 1.0 to production environment',
    status: 'done',
    priority: 'high',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T16:45:00Z',
  },
]

const COLUMNS: TaskStatus[] = ['todo', 'in-progress', 'done']

export function KanbanBoard() {
  const { tasks, moveTask, getTasksByStatus } = useKanban(MOCK_TASKS)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    // Check if the drop target is a valid column
    if (COLUMNS.includes(newStatus)) {
      moveTask(taskId, newStatus)
    }

    setActiveTask(null)
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Task Board</h1>
        <p className="text-muted-foreground">
          Drag and drop tasks between columns to update their status
        </p>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={getTasksByStatus(status)}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
```

---

## Styling Approach with Tailwind CSS

### Layout Strategy

**Desktop Layout (md and above):**
- Use CSS Grid with 3 equal columns: `grid grid-cols-1 md:grid-cols-3 gap-6`
- Each column takes equal width with gap spacing
- Minimum height for drop zones to ensure adequate drop area

**Mobile Layout (below md):**
- Stack columns vertically: `grid-cols-1`
- Full width columns for better touch interaction
- Adequate spacing between columns

### Color Scheme

**Column Background Colors:**
- **Todo**: Light slate (`bg-slate-100 dark:bg-slate-800`)
- **In Progress**: Light blue (`bg-blue-50 dark:bg-blue-950`)
- **Done**: Light green (`bg-green-50 dark:bg-green-950`)

**Priority Badge Colors:**
- **Low**: Blue (`bg-blue-200 dark:bg-blue-800`)
- **Medium**: Yellow (`bg-yellow-200 dark:bg-yellow-800`)
- **High**: Red (`bg-red-200 dark:bg-red-800`)

**Interactive States:**
- Hover: `hover:shadow-md` on cards
- Dragging: `opacity-50` on active card
- Drop target: `ring-2 ring-primary ring-offset-2`

### Responsive Breakpoints

```css
/* Mobile: < 768px */
- Single column layout
- Larger touch targets (min 44x44px)
- Simplified card design

/* Tablet: 768px - 1024px */
- Two column layout (optional)
- Medium spacing

/* Desktop: > 1024px */
- Three column layout
- Optimal spacing and sizing
```

### Tailwind Utility Classes Reference

**Container:**
- `container mx-auto p-4 md:p-8` - Responsive container with padding

**Grid Layout:**
- `grid grid-cols-1 md:grid-cols-3 gap-6` - Responsive 3-column grid

**Flexbox:**
- `flex flex-col h-full` - Vertical flex container
- `flex items-center justify-between` - Horizontal alignment

**Spacing:**
- `space-y-3` - Vertical spacing between cards
- `mb-4`, `p-4` - Margin and padding utilities

**Typography:**
- `text-3xl font-bold` - Large headings
- `text-sm text-muted-foreground` - Secondary text
- `line-clamp-2` - Truncate text to 2 lines

**Transitions:**
- `transition-shadow` - Smooth shadow transitions
- `transition-colors` - Smooth color transitions

---

## Accessibility Features

### Keyboard Navigation

**@dnd-kit Built-in Support:**
- **Tab**: Navigate between draggable items
- **Space/Enter**: Activate drag mode
- **Arrow Keys**: Move item between positions
- **Escape**: Cancel drag operation

**Implementation:**
```typescript
// Already handled by @dnd-kit/core
// No additional code needed for basic keyboard support
```

### Screen Reader Support

**ARIA Attributes:**

```typescript
// On TaskCard drag handle
<button
  {...attributes}
  {...listeners}
  aria-label="Drag to move task"
  aria-describedby={`task-${task.id}-description`}
>
  <GripVertical />
</button>

// On KanbanColumn
<div
  role="region"
  aria-label={`${getColumnTitle(status)} column with ${tasks.length} tasks`}
>
  {/* Column content */}
</div>

// On TaskCard
<Card
  role="article"
  aria-label={task.title}
>
  {/* Card content */}
</Card>
```

### Focus Management

**Visual Focus Indicators:**
- Use Tailwind's `focus:ring-2 focus:ring-primary` for visible focus states
- Ensure focus is visible on all interactive elements
- Maintain focus order that matches visual layout

**Focus Restoration:**
```typescript
// After drag operation, restore focus to the moved item
const handleDragEnd = (event: DragEndEvent) => {
  // ... move task logic

  // Focus the moved task
  const movedElement = document.getElementById(`task-${event.active.id}`)
  movedElement?.focus()
}
```

### Color Contrast

**WCAG AA Compliance:**
- Ensure text has minimum 4.5:1 contrast ratio
- Use Shadcn/ui's built-in color variables (already compliant)
- Test with both light and dark modes

**Tools for Testing:**
- Chrome DevTools Lighthouse
- axe DevTools browser extension
- WAVE Web Accessibility Evaluation Tool

---

## Integration with Existing App

### Step 1: Update App.tsx

```typescript
// src/App.tsx
import { KanbanBoard } from './components/kanban/KanbanBoard'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <KanbanBoard />
    </div>
  )
}

export default App
```

### Step 2: Connect to Backend API (Future Enhancement)

```typescript
// src/hooks/useKanban.ts - Enhanced version with API integration

import { useState, useCallback, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTodos } from './useTodos'
import apiClient from '@/lib/api'
import type { Task, TaskStatus, ApiResponse } from '@/types'

export function useKanban() {
  // Fetch tasks from API
  const { data: apiTasks, isLoading, error } = useTodos()
  const [tasks, setTasks] = useState<Task[]>([])
  const queryClient = useQueryClient()

  // Sync API data with local state
  useEffect(() => {
    if (apiTasks) {
      setTasks(apiTasks)
    }
  }, [apiTasks])

  // Mutation for updating task status
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const response = await apiClient.patch<ApiResponse<Task>>(
        `/todos/${taskId}`,
        { status }
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      )
    )

    // Update on server
    updateTaskMutation.mutate({ taskId, status: newStatus })
  }, [updateTaskMutation])

  return {
    tasks,
    isLoading,
    error,
    moveTask,
    getTasksByStatus: (status: TaskStatus) =>
      tasks.filter((task) => task.status === status),
  }
}
```

---

## Testing Strategy

### Unit Tests

**Test TaskCard Component:**
```typescript
// src/components/kanban/TaskCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskCard } from './TaskCard'
import { DndContext } from '@dnd-kit/core'

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo' as const,
    priority: 'high' as const,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  }

  it('renders task title', () => {
    render(
      <DndContext>
        <TaskCard task={mockTask} />
      </DndContext>
    )
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('renders task description', () => {
    render(
      <DndContext>
        <TaskCard task={mockTask} />
      </DndContext>
    )
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders priority badge', () => {
    render(
      <DndContext>
        <TaskCard task={mockTask} />
      </DndContext>
    )
    expect(screen.getByText('high')).toBeInTheDocument()
  })
})
```


### Integration Tests

**Test Drag and Drop:**
```typescript
// src/components/kanban/KanbanBoard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KanbanBoard } from './KanbanBoard'

describe('KanbanBoard', () => {
  it('renders all three columns', () => {
    render(<KanbanBoard />)
    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('displays task count for each column', () => {
    render(<KanbanBoard />)
    // Check for task count text (e.g., "2 tasks")
    expect(screen.getAllByText(/task/i).length).toBeGreaterThan(0)
  })
})
```

### Manual Testing Checklist

- [ ] Drag task from Todo to In Progress
- [ ] Drag task from In Progress to Done
- [ ] Drag task back to previous column
- [ ] Test keyboard navigation (Tab, Space, Arrow keys)
- [ ] Test on mobile device (touch drag)
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Test in different browsers (Chrome, Firefox, Safari)
- [ ] Test dark mode
- [ ] Test with many tasks (performance)
- [ ] Test with empty columns

---

## Performance Optimization

### Memoization

**Optimize Re-renders:**
```typescript
import { memo, useMemo } from 'react'

// Memoize TaskCard to prevent unnecessary re-renders
export const TaskCard = memo(({ task }: TaskCardProps) => {
  // ... component code
})

// Memoize column tasks
const todoTasks = useMemo(
  () => getTasksByStatus('todo'),
  [tasks]
)
```

### Virtual Scrolling (For Large Lists)

**If you have 100+ tasks per column:**
```bash
yarn add @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

// In KanbanColumn component
const parentRef = useRef<HTMLDivElement>(null)

const virtualizer = useVirtualizer({
  count: tasks.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100, // Estimated task card height
})
```

### Debounce API Calls

**Prevent excessive API calls during rapid drag operations:**
```typescript
import { debounce } from 'lodash-es'

const debouncedUpdateTask = useMemo(
  () => debounce((taskId: string, status: TaskStatus) => {
    updateTaskMutation.mutate({ taskId, status })
  }, 500),
  [updateTaskMutation]
)
```

---

## Troubleshooting

### Common Issues

**Issue 1: Drag not working**
- **Cause**: Missing DndContext wrapper
- **Solution**: Ensure KanbanBoard wraps columns in `<DndContext>`

**Issue 2: Tasks not updating after drag**
- **Cause**: Missing `onDragEnd` handler or incorrect status mapping
- **Solution**: Verify `handleDragEnd` function and status type matching

**Issue 3: TypeScript errors with @dnd-kit**
- **Cause**: Missing type definitions
- **Solution**: Ensure `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` are installed

**Issue 4: Cards overlapping on mobile**
- **Cause**: Incorrect responsive classes
- **Solution**: Use `grid-cols-1` for mobile, `md:grid-cols-3` for desktop

**Issue 5: Dark mode colors not working**
- **Cause**: Missing dark mode variants
- **Solution**: Add `dark:` prefix to all color classes

### Debugging Tips

**Enable @dnd-kit debugging:**
```typescript
import { DndContext, DragEndEvent } from '@dnd-kit/core'

<DndContext
  onDragStart={(event) => {
    console.log('Drag started:', event)
  }}
  onDragEnd={(event) => {
    console.log('Drag ended:', event)
  }}
>
  {/* ... */}
</DndContext>
```

**Check task state:**
```typescript
useEffect(() => {
  console.log('Current tasks:', tasks)
}, [tasks])
```

---

## Future Enhancements

### Phase 1 Enhancements (After Basic Implementation)

1. **Add Task Dialog**
   - Create a dialog component for adding new tasks
   - Use Shadcn/ui Dialog component
   - Include form validation with Zod

2. **Edit Task Functionality**
   - Click on task card to edit
   - Inline editing or modal dialog
   - Update task title, description, priority

3. **Delete Task**
   - Add delete button to task cards
   - Confirmation dialog before deletion
   - Undo functionality

### Phase 2 Enhancements (Advanced Features)

1. **Task Filtering**
   - Filter by priority
   - Filter by date range
   - Search by title/description

2. **Task Sorting**
   - Sort by priority
   - Sort by creation date
   - Sort by update date
   - Manual reordering within columns

3. **Animations**
   - Smooth transitions when moving tasks
   - Fade in/out for add/delete
   - Skeleton loading states

4. **Persistence**
   - Save to localStorage for offline support
   - Sync with backend API
   - Optimistic updates with rollback

5. **Collaboration Features**
   - Real-time updates with WebSockets
   - Task assignments
   - Comments and activity log

6. **Advanced UI**
   - Task labels/tags
   - Due dates with calendar picker
   - Attachments
   - Subtasks/checklists

---

## Quick Reference Commands

### Installation
```bash
cd app
yarn add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Development
```bash
# Start dev server
yarn dev

# Run tests
yarn test

# Run linting
yarn lint

# Format code
yarn format
```

### File Creation Order
1. `src/types/index.ts` - Add kanban types
2. `src/lib/kanban-utils.ts` - Utility functions
3. `src/hooks/useKanban.ts` - State management hook
4. `src/components/kanban/TaskCard.tsx` - Task card component
5. `src/components/kanban/KanbanColumn.tsx` - Column component
6. `src/components/kanban/KanbanBoard.tsx` - Main board component
7. `src/App.tsx` - Update to use KanbanBoard

---

## Summary

This implementation plan provides a complete, production-ready kanban board with:

✅ **Modern Tech Stack**
- React 19 with TypeScript
- @dnd-kit for drag-and-drop
- Shadcn/ui components
- Tailwind CSS styling

✅ **Core Features**
- Three-column layout (Todo, In Progress, Done)
- Drag-and-drop between columns
- Responsive design (mobile & desktop)
- Task cards with title, description, priority

✅ **Accessibility**
- Keyboard navigation support
- Screen reader compatible
- WCAG AA compliant colors
- Focus management

✅ **Developer Experience**
- Full TypeScript support
- Reusable components
- Clean architecture
- Easy to extend

✅ **Performance**
- Optimized re-renders
- Smooth animations
- Efficient state management

### Estimated Implementation Time

- **Phase 1** (Dependencies & Types): 15 minutes
- **Phase 2** (Utilities & Hook): 30 minutes
- **Phase 3** (Components): 1-2 hours
- **Phase 4** (Integration & Testing): 30 minutes
- **Total**: ~3 hours for basic implementation

### Next Steps

1. Install @dnd-kit dependencies
2. Follow the step-by-step implementation guide
3. Test thoroughly on different devices
4. Consider future enhancements based on user feedback

---

## Additional Resources

- **@dnd-kit Documentation**: https://docs.dndkit.com/
- **Shadcn/ui Components**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React 19 Docs**: https://react.dev/
- **Accessibility Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

**Document Version**: 1.0
**Last Updated**: 2026-01-22
**Author**: Augment Agent
**Status**: Ready for Implementation


