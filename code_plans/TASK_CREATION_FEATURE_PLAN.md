# Task Creation Feature Implementation Plan

## Executive Summary

This document provides a comprehensive, production-ready plan for adding task creation functionality to the Kanban board. The feature will allow users to create new tasks directly from each column using a modal dialog with form validation, seamlessly integrating with the existing backend API and state management system.

## Table of Contents

1. [Overview and Goals](#overview-and-goals)
2. [Feature Requirements](#feature-requirements)
3. [Architecture Overview](#architecture-overview)
4. [File Structure](#file-structure)
5. [TypeScript Interfaces](#typescript-interfaces)
6. [Required Shadcn/ui Components](#required-shadcnui-components)
7. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
8. [Component Implementation Details](#component-implementation-details)
9. [Form Validation Schema](#form-validation-schema)
10. [Integration with useKanban Hook](#integration-with-usekanban-hook)
11. [User Feedback and Error Handling](#user-feedback-and-error-handling)
12. [Accessibility Requirements](#accessibility-requirements)
13. [Testing Considerations](#testing-considerations)
14. [Implementation Checklist](#implementation-checklist)

---

## Overview and Goals

### Primary Goals

1. **Seamless Task Creation**: Enable users to create tasks directly from any Kanban column
2. **Intuitive UX**: Provide a clean, modal-based form that's easy to use
3. **Robust Validation**: Ensure data integrity with Zod schema validation
4. **Backend Integration**: Automatically sync new tasks with the backend API
5. **Accessibility**: Full keyboard navigation and screen reader support
6. **User Feedback**: Clear success/error messages and loading states

### Success Criteria

- Users can create tasks from any column with a single click
- Form validates input before submission
- New tasks appear immediately in the correct column (optimistic updates)
- Errors are handled gracefully with user-friendly messages
- The feature is fully accessible via keyboard and screen readers

---

## Feature Requirements

### 1. Add Task Button

**Location**: Top of each Kanban column header (next to column title and task count)

**Behavior**:
- Displays a "+" icon button
- Opens task creation dialog when clicked
- Automatically sets the task's status based on the column
- Visually consistent with existing UI design

**Visual Design**:
- Small, circular button with "+" icon
- Uses Shadcn/ui Button component with `size="sm"` and `variant="ghost"`
- Positioned in the column header area

### 2. Task Creation Dialog

**Components Used**:
- Shadcn/ui Dialog (modal overlay)
- Shadcn/ui Form (with react-hook-form integration)
- Shadcn/ui Input (for title field)
- Shadcn/ui Textarea (for description field)
- Shadcn/ui Button (for submit and cancel actions)

**Form Fields**:

| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| Title | Text Input | Yes | Min 3 chars, Max 200 chars | Empty |
| Description | Textarea | No | No max limit (TEXT field) | Empty |
| Status | Hidden | Yes | Auto-set from column | Column status |

**Validation Rules**:
- **Title**: Required, minimum 3 characters, maximum 200 characters (matches DB limit)
- **Description**: Optional, no character limit (stored as TEXT in database)

**Note**: The database schema includes `completed`, `created_at`, and `updated_at` fields which are managed automatically:
- `completed`: Defaults to `false`, managed by task status
- `created_at`: Auto-set by database on creation
- `updated_at`: Auto-set by database on updates

### 3. Form Submission Flow

```
User clicks "+" button
  ↓
Dialog opens with empty form
  ↓
User fills in title (required) and optional fields
  ↓
User clicks "Create Task" button
  ↓
Form validates input (Zod schema)
  ↓
If valid:
  - Call useKanban.addTask()
  - Show loading state
  - Optimistic UI update (task appears immediately)
  - API call to backend
  - On success: Close dialog, show success message
  - On error: Rollback UI, show error message
If invalid:
  - Display validation errors inline
  - Keep dialog open
```

---

## Architecture Overview

### Component Hierarchy

```
KanbanColumn
├── Column Header
│   ├── Title & Task Count
│   └── AddTaskButton ← NEW
│       └── TaskCreateDialog ← NEW
│           └── TaskCreateForm ← NEW
└── Task Cards
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AddTaskButton                             │
│  (Triggers dialog open, passes column status)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  TaskCreateDialog                            │
│  (Manages dialog state, renders form)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  TaskCreateForm                              │
│  (React Hook Form + Zod validation)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   useKanban.addTask()                        │
│  (Calls useCreateTask mutation)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  useCreateTask (TanStack Query)              │
│  (Optimistic update + API call)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                               │
│  POST /tasks/ (taskService.create)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

### New Files to Create

```
app/src/
├── components/
│   ├── kanban/
│   │   ├── AddTaskButton.tsx          # NEW - Button to trigger dialog
│   │   ├── TaskCreateDialog.tsx       # NEW - Dialog wrapper component
│   │   └── TaskCreateForm.tsx         # NEW - Form with validation
│   └── ui/
│       ├── dialog.tsx                 # NEW - Shadcn/ui Dialog component
│       ├── textarea.tsx               # NEW - Shadcn/ui Textarea component
│       └── select.tsx                 # NEW - Shadcn/ui Select component
├── lib/
│   └── validations/
│       └── task-schema.ts             # NEW - Zod validation schemas
└── types/
    └── index.ts                       # UPDATE - Add form types
```

### Existing Files to Modify

```
app/src/
├── components/
│   └── kanban/
│       └── KanbanColumn.tsx           # UPDATE - Add AddTaskButton
└── hooks/
    └── useKanban.ts                   # Already has addTask function
```

---

## TypeScript Interfaces

### Form Data Types

Add to `src/types/index.ts`:

```typescript
// Task Creation Form Types
export interface TaskFormData {
  title: string
  description?: string
}

export interface TaskCreateFormData extends TaskFormData {
  status: TaskStatus // Auto-set from column
}

// Props for components
export interface AddTaskButtonProps {
  status: TaskStatus
}

export interface TaskCreateDialogProps {
  status: TaskStatus
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface TaskCreateFormProps {
  status: TaskStatus
  onSuccess: () => void
  onCancel: () => void
}
```

### Database Schema Reference

The actual database schema for tasks:

```typescript
// Backend database fields (for reference)
interface TaskDatabaseSchema {
  id: number                    // Primary key, auto-increment
  title: string                 // VARCHAR(200), required
  description: string | null    // TEXT, optional
  completed: boolean            // Default: false
  created_at: Date              // Auto-set on creation
  updated_at: Date              // Auto-set on updates
}
```

**Important Notes**:
- The `status` field maps to the `completed` boolean in the database
- The `column_id` and `order` fields mentioned in other plans do not exist in this schema
- This is a simpler todo-style schema, not a full Kanban schema

---

## Required Shadcn/ui Components

### Components to Install

The following Shadcn/ui components need to be installed:

```bash
# Navigate to app directory
cd app

# Install Dialog component
npx shadcn-ui@latest add dialog

# Install Textarea component
npx shadcn-ui@latest add textarea

# Install Select component
npx shadcn-ui@latest add select
```

**Note**: The following components are already installed:
- ✅ Button
- ✅ Form
- ✅ Input
- ✅ Label

### Component Dependencies

| Component | Dependencies | Purpose |
|-----------|-------------|---------|
| Dialog | @radix-ui/react-dialog | Modal overlay for task creation |
| Textarea | Native textarea | Multi-line description input |
| Form | react-hook-form, @hookform/resolvers | Form state management |
| Input | Native input | Title text input |
| Button | @radix-ui/react-slot | Submit and cancel buttons |

---

## Step-by-Step Implementation Guide

### Phase 1: Install Required Components (5 minutes)

**Step 1.1**: Install Shadcn/ui components

```bash
cd app
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
```

**Step 1.2**: Verify installations

Check that the following files were created:
- `src/components/ui/dialog.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/select.tsx`

### Phase 2: Create Type Definitions (5 minutes)

**Step 2.1**: Update `src/types/index.ts`

Add the form-related types shown in the [TypeScript Interfaces](#typescript-interfaces) section.

### Phase 3: Create Validation Schema (10 minutes)

**Step 3.1**: Create `src/lib/validations/task-schema.ts`

See [Form Validation Schema](#form-validation-schema) section for complete code.

### Phase 4: Create Form Component (20 minutes)

**Step 4.1**: Create `src/components/kanban/TaskCreateForm.tsx`

See [Component Implementation Details](#component-implementation-details) section for complete code.

### Phase 5: Create Dialog Component (15 minutes)

**Step 5.1**: Create `src/components/kanban/TaskCreateDialog.tsx`

See [Component Implementation Details](#component-implementation-details) section for complete code.

### Phase 6: Create Add Button Component (10 minutes)

**Step 6.1**: Create `src/components/kanban/AddTaskButton.tsx`

See [Component Implementation Details](#component-implementation-details) section for complete code.

### Phase 7: Integrate with KanbanColumn (5 minutes)

**Step 7.1**: Update `src/components/kanban/KanbanColumn.tsx`

Add the AddTaskButton to the column header.

### Phase 8: Testing and Refinement (15 minutes)

- Test task creation from each column
- Verify validation works correctly
- Test error handling
- Test keyboard navigation
- Test screen reader compatibility

**Total Estimated Time**: ~1.5 hours

---

## Component Implementation Details

### 1. Validation Schema (src/lib/validations/task-schema.ts)

```typescript
import { z } from 'zod'
import type { TaskStatus } from '@/types'

/**
 * Zod schema for task creation form validation
 */
export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters') // Updated to match DB VARCHAR(200)
    .trim(),

  description: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')), // No max limit - DB uses TEXT field

  status: z.enum(['todo', 'in-progress', 'done']),
})

export type TaskCreateFormValues = z.infer<typeof taskCreateSchema>

/**
 * Default form values
 */
export function getDefaultTaskFormValues(status: TaskStatus): TaskCreateFormValues {
  return {
    title: '',
    description: '',
    status,
  }
}
```

### 2. Task Create Form Component (src/components/kanban/TaskCreateForm.tsx)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useKanban } from '@/hooks/useKanban'
import { taskCreateSchema, getDefaultTaskFormValues } from '@/lib/validations/task-schema'
import type { TaskCreateFormValues } from '@/lib/validations/task-schema'
import type { TaskCreateFormProps } from '@/types'

export function TaskCreateForm({ status, onSuccess, onCancel }: TaskCreateFormProps) {
  const { addTask, isCreating } = useKanban()

  // Initialize form with react-hook-form and Zod validation
  const form = useForm<TaskCreateFormValues>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: getDefaultTaskFormValues(status),
  })

  // Handle form submission
  const onSubmit = async (data: TaskCreateFormValues) => {
    try {
      // Call addTask from useKanban hook
      addTask({
        title: data.title,
        description: data.description || undefined,
        status: data.status,
      })

      // Reset form and close dialog on success
      form.reset()
      onSuccess()
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error('Failed to create task:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter task title..."
                  {...field}
                  disabled={isCreating}
                  autoFocus
                />
              </FormControl>
              <FormDescription>
                A clear, concise title for your task (3-200 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add more details about this task..."
                  className="resize-none"
                  rows={4}
                  {...field}
                  disabled={isCreating}
                />
              </FormControl>
              <FormDescription>
                Optional details about the task
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCreating ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

### 3. Task Create Dialog Component (src/components/kanban/TaskCreateDialog.tsx)

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskCreateForm } from './TaskCreateForm'
import { getColumnTitle } from '@/lib/kanban-utils'
import type { TaskCreateDialogProps } from '@/types'

export function TaskCreateDialog({ status, open, onOpenChange }: TaskCreateDialogProps) {
  const columnTitle = getColumnTitle(status)

  const handleSuccess = () => {
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to the <strong>{columnTitle}</strong> column.
            Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <TaskCreateForm
          status={status}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}
```

### 4. Add Task Button Component (src/components/kanban/AddTaskButton.tsx)

```typescript
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCreateDialog } from './TaskCreateDialog'
import type { AddTaskButtonProps } from '@/types'

export function AddTaskButton({ status }: AddTaskButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setDialogOpen(true)}
        className="h-8 w-8 p-0"
        aria-label="Add new task"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <TaskCreateDialog
        status={status}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
```

### 5. Update KanbanColumn Component (src/components/kanban/KanbanColumn.tsx)

Update the column header to include the AddTaskButton:

```typescript
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { getColumnTitle, getColumnColor } from '@/lib/kanban-utils'
import { TaskCard } from './TaskCard'
import { AddTaskButton } from './AddTaskButton' // NEW IMPORT
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
      {/* Column Header - UPDATED */}
      <div className="mb-4 px-1 flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">
            {getColumnTitle(status)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        {/* Add Task Button - NEW */}
        <AddTaskButton status={status} />
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

---

## Form Validation Schema

The validation schema uses Zod for type-safe validation. See the complete implementation in the [Component Implementation Details](#component-implementation-details) section above.

### Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|---------------|
| Title | Required | "Title is required" |
| Title | Min 3 chars | "Title must be at least 3 characters" |
| Title | Max 200 chars | "Title must not exceed 200 characters" |
| Description | No max limit | N/A (TEXT field in database) |
| Status | Enum | Must be 'todo', 'in-progress', or 'done' |

---

## Integration with useKanban Hook

The `useKanban` hook already has an `addTask` function that handles task creation. The form component calls this function with the validated form data.

### Current addTask Implementation

From `src/hooks/useKanban.ts`:

```typescript
const addTask = useCallback(
  (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tasksInColumn = tasks.filter((t) => t.status === task.status)
    const order = tasksInColumn.length

    const createRequest = transformToCreateRequest(task, order)
    createTaskMutation.mutate(createRequest)
  },
  [tasks, createTaskMutation]
)
```

### How the Form Integrates

1. **Form Submission**: User fills out form and clicks "Create Task"
2. **Validation**: Zod schema validates the input
3. **Call addTask**: Form calls `addTask()` with validated data
4. **Optimistic Update**: `useCreateTask` mutation immediately updates UI
5. **API Call**: Backend API is called to persist the task
6. **Success/Error**: UI shows feedback based on result

### Exposed State from useKanban

The form uses the following state from `useKanban`:

```typescript
const { addTask, isCreating } = useKanban()
```

- `addTask`: Function to create a new task
- `isCreating`: Boolean indicating if a task is being created (for loading state)

---

## User Feedback and Error Handling

### Success Feedback

**Behavior**:
1. Dialog closes immediately after successful submission
2. New task appears in the column (optimistic update)
3. Optional: Show a toast notification (can be added later)

**Implementation**:
```typescript
const handleSuccess = () => {
  onOpenChange(false) // Close dialog
  // Optional: toast.success('Task created successfully')
}
```

### Error Handling

**Validation Errors**:
- Displayed inline below each field
- Form remains open
- User can correct errors and resubmit

**API Errors**:
- Handled by `useCreateTask` mutation
- Optimistic update is rolled back
- Error message can be displayed in dialog or as toast
- Form remains open for retry

**Loading State**:
- Submit button shows spinner and "Creating..." text
- All form fields are disabled
- Cancel button is disabled

### Error Display Example

```typescript
// In TaskCreateForm.tsx
const onSubmit = async (data: TaskCreateFormValues) => {
  try {
    addTask({
      title: data.title,
      description: data.description || undefined,
      status: data.status,
    })

    form.reset()
    onSuccess()
  } catch (error) {
    // Error is handled by mutation hook
    // Optionally show error in form
    form.setError('root', {
      message: 'Failed to create task. Please try again.',
    })
  }
}
```

---

## Accessibility Requirements

### Keyboard Navigation

**Dialog Interaction**:
- **Escape**: Close dialog
- **Tab**: Navigate between form fields
- **Shift + Tab**: Navigate backwards
- **Enter**: Submit form (when focus is on submit button)

**Form Fields**:
- **Tab**: Move to next field
- **Shift + Tab**: Move to previous field

**Button Interaction**:
- **Enter/Space**: Activate button (open dialog, submit form, cancel)

### ARIA Labels and Attributes

**AddTaskButton**:
```typescript
<Button
  aria-label="Add new task"
  aria-haspopup="dialog"
>
  <Plus className="h-4 w-4" />
</Button>
```

**Dialog**:
```typescript
<Dialog>
  <DialogContent
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <DialogTitle id="dialog-title">Create New Task</DialogTitle>
    <DialogDescription id="dialog-description">
      Add a new task to the {columnTitle} column.
    </DialogDescription>
  </DialogContent>
</Dialog>
```

**Form Fields**:
- All inputs have associated labels via `FormLabel`
- Error messages are linked via `aria-describedby`
- Required fields are marked with `aria-required="true"`
- Invalid fields are marked with `aria-invalid="true"`

### Focus Management

**Dialog Open**:
1. Focus moves to the first form field (title input)
2. `autoFocus` prop on title input ensures immediate focus

**Dialog Close**:
1. Focus returns to the "+" button that opened the dialog
2. Handled automatically by Radix UI Dialog

**Form Submission**:
1. On success: Dialog closes, focus returns to "+" button
2. On error: Focus remains in form, on first error field

### Screen Reader Support

**Announcements**:
- Dialog title and description are announced when dialog opens
- Form field labels and descriptions are announced when focused
- Validation errors are announced when they appear
- Loading state is announced ("Creating task...")

**Semantic HTML**:
- Proper heading hierarchy (`<h2>` for dialog title)
- Form uses `<form>` element
- Buttons use `<button>` element
- Labels use `<label>` element

### Color Contrast

**WCAG AA Compliance**:
- All text meets 4.5:1 contrast ratio
- Error messages use destructive color with sufficient contrast
- Disabled states have reduced opacity but remain readable
- Focus indicators are clearly visible

**Testing Tools**:
- Chrome DevTools Lighthouse
- axe DevTools browser extension
- WAVE Web Accessibility Evaluation Tool

---

## Testing Considerations

### Manual Testing Checklist

**Functional Testing**:
- [ ] Click "+" button opens dialog
- [ ] Dialog displays correct column name in description
- [ ] Title field is required and validates correctly
- [ ] Description field accepts optional text
- [ ] Form submits successfully with valid data
- [ ] New task appears in correct column
- [ ] Dialog closes after successful submission
- [ ] Cancel button closes dialog without creating task
- [ ] Escape key closes dialog

**Validation Testing**:
- [ ] Empty title shows error message
- [ ] Title with < 3 characters shows error
- [ ] Title with > 200 characters shows error
- [ ] Multiple validation errors display correctly

**Error Handling**:
- [ ] Network error shows appropriate message
- [ ] API error shows appropriate message
- [ ] Optimistic update rolls back on error
- [ ] Form remains open on error for retry

**Accessibility Testing**:
- [ ] Tab navigation works through all fields
- [ ] Escape closes dialog
- [ ] Enter submits form
- [ ] Focus moves to title field on dialog open
- [ ] Focus returns to "+" button on dialog close
- [ ] Screen reader announces all elements correctly
- [ ] ARIA labels are present and correct
- [ ] Color contrast meets WCAG AA standards

**Responsive Testing**:
- [ ] Dialog displays correctly on mobile (< 640px)
- [ ] Dialog displays correctly on tablet (640px - 1024px)
- [ ] Dialog displays correctly on desktop (> 1024px)
- [ ] Form fields are touch-friendly on mobile
- [ ] Dialog is scrollable if content exceeds viewport

**Integration Testing**:
- [ ] Task appears in correct column after creation
- [ ] Task count updates correctly
- [ ] Drag and drop still works after adding task
- [ ] Multiple tasks can be created in sequence
- [ ] Tasks created in different columns have correct status

### Unit Testing (Optional)

**Test Files to Create**:

```
app/src/
├── components/
│   └── kanban/
│       ├── __tests__/
│       │   ├── AddTaskButton.test.tsx
│       │   ├── TaskCreateDialog.test.tsx
│       │   └── TaskCreateForm.test.tsx
└── lib/
    └── validations/
        └── __tests__/
            └── task-schema.test.ts
```

**Example Test Cases**:

```typescript
// src/lib/validations/__tests__/task-schema.test.ts
import { describe, it, expect } from 'vitest'
import { taskCreateSchema } from '../task-schema'

describe('taskCreateSchema', () => {
  it('should validate valid task data', () => {
    const validData = {
      title: 'Valid Task Title',
      description: 'Valid description',
      status: 'todo' as const,
    }

    const result = taskCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject title with less than 3 characters', () => {
    const invalidData = {
      title: 'AB',
      status: 'todo' as const,
    }

    const result = taskCreateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject title with more than 100 characters', () => {
    const invalidData = {
      title: 'A'.repeat(101),
      status: 'todo' as const,
    }

    const result = taskCreateSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should accept optional description', () => {
    const validData = {
      title: 'Valid Task',
      status: 'todo' as const,
    }

    const result = taskCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
```

```typescript
// src/components/kanban/__tests__/TaskCreateForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCreateForm } from '../TaskCreateForm'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('TaskCreateForm', () => {
  it('renders all form fields', () => {
    const onSuccess = vi.fn()
    const onCancel = vi.fn()

    render(
      <TaskCreateForm
        status="todo"
        onSuccess={onSuccess}
        onCancel={onCancel}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onCancel = vi.fn()

    render(
      <TaskCreateForm
        status="todo"
        onSuccess={onSuccess}
        onCancel={onCancel}
      />,
      { wrapper: createWrapper() }
    )

    const submitButton = screen.getByRole('button', { name: /create task/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onCancel = vi.fn()

    render(
      <TaskCreateForm
        status="todo"
        onSuccess={onSuccess}
        onCancel={onCancel}
      />,
      { wrapper: createWrapper() }
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
```

---

## Implementation Checklist

### Prerequisites
- [ ] Backend API is running and accessible
- [ ] Existing Kanban board is functional
- [ ] All required dependencies are installed

### Step 1: Install Shadcn/ui Components
- [ ] Install Dialog component (`npx shadcn-ui@latest add dialog`)
- [ ] Install Textarea component (`npx shadcn-ui@latest add textarea`)
- [ ] Install Select component (`npx shadcn-ui@latest add select`)
- [ ] Verify all components are in `src/components/ui/`

### Step 2: Create Type Definitions
- [ ] Add `TaskFormData` interface to `src/types/index.ts`
- [ ] Add `TaskCreateFormData` interface
- [ ] Add `AddTaskButtonProps` interface
- [ ] Add `TaskCreateDialogProps` interface
- [ ] Add `TaskCreateFormProps` interface

### Step 3: Create Validation Schema
- [ ] Create `src/lib/validations/` directory
- [ ] Create `src/lib/validations/task-schema.ts`
- [ ] Implement `taskCreateSchema` with Zod
- [ ] Export `TaskCreateFormValues` type
- [ ] Implement `getDefaultTaskFormValues` function

### Step 4: Create Form Component
- [ ] Create `src/components/kanban/TaskCreateForm.tsx`
- [ ] Implement form with react-hook-form
- [ ] Add title field with validation
- [ ] Add description field with validation
- [ ] Add submit and cancel buttons
- [ ] Integrate with `useKanban.addTask()`
- [ ] Add loading state handling

### Step 5: Create Dialog Component
- [ ] Create `src/components/kanban/TaskCreateDialog.tsx`
- [ ] Implement Dialog wrapper
- [ ] Add dialog title and description
- [ ] Integrate TaskCreateForm
- [ ] Handle dialog open/close state

### Step 6: Create Add Button Component
- [ ] Create `src/components/kanban/AddTaskButton.tsx`
- [ ] Implement button with Plus icon
- [ ] Add dialog state management
- [ ] Connect button to dialog

### Step 7: Update KanbanColumn
- [ ] Import AddTaskButton in `src/components/kanban/KanbanColumn.tsx`
- [ ] Update column header layout
- [ ] Add AddTaskButton to header
- [ ] Test layout on different screen sizes

### Step 8: Testing
- [ ] Test task creation from Todo column
- [ ] Test task creation from In Progress column
- [ ] Test task creation from Done column
- [ ] Test form validation (all fields)
- [ ] Test error handling
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Test on mobile devices
- [ ] Test with network errors

### Step 9: Refinement
- [ ] Verify all accessibility requirements are met
- [ ] Check color contrast
- [ ] Verify focus management
- [ ] Test with different screen sizes
- [ ] Optimize performance if needed

### Step 10: Documentation
- [ ] Update README with new feature
- [ ] Add comments to complex code
- [ ] Document any edge cases

---

## Summary

This comprehensive plan provides everything needed to implement task creation functionality for the Kanban board:

✅ **Complete Component Architecture**
- AddTaskButton for triggering task creation
- TaskCreateDialog for modal overlay
- TaskCreateForm with full validation

✅ **Robust Validation**
- Zod schema for type-safe validation
- Inline error messages
- Client-side validation before API call

✅ **Seamless Integration**
- Works with existing useKanban hook
- Optimistic updates for instant feedback
- Backend API synchronization

✅ **Excellent UX**
- Clean, intuitive interface
- Clear loading states
- User-friendly error messages
- Responsive design

✅ **Full Accessibility**
- Keyboard navigation support
- Screen reader compatible
- ARIA labels and attributes
- Focus management

✅ **Production Ready**
- Error handling
- Loading states
- Form validation
- Testing strategy

### Estimated Implementation Time

- **Phase 1** (Install components): 5 minutes
- **Phase 2** (Type definitions): 5 minutes
- **Phase 3** (Validation schema): 10 minutes
- **Phase 4** (Form component): 20 minutes
- **Phase 5** (Dialog component): 15 minutes
- **Phase 6** (Button component): 10 minutes
- **Phase 7** (Integration): 5 minutes
- **Phase 8** (Testing): 15 minutes
- **Total**: ~1.5 hours

### Next Steps[TASK_CREATION_FEATURE_PLAN.md](TASK_CREATION_FEATURE_PLAN.md)

1. Install required Shadcn/ui components
2. Follow the step-by-step implementation guide
3. Test thoroughly on different devices and browsers
4. Consider adding toast notifications for better feedback (optional enhancement)

---

**Document Version**: 1.0
**Last Updated**: 2026-01-22
**Author**: Augment Agent
**Status**: Ready for Implementation

