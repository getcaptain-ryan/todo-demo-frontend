# Kanban Backend Integration Plan

## Executive Summary

This document provides a comprehensive, production-ready plan for integrating the Kanban board with the backend API using the existing Axios instance and TanStack Query. The integration will enable real-time data synchronization, optimistic updates, and robust error handling while maintaining the current user experience.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend API Analysis](#backend-api-analysis)
3. [Type System Updates](#type-system-updates)
4. [API Service Layer](#api-service-layer)
5. [TanStack Query Hooks](#tanstack-query-hooks)
6. [Enhanced useKanban Hook](#enhanced-usekanban-hook)
7. [Component Updates](#component-updates)
8. [Error Handling Strategy](#error-handling-strategy)
9. [Loading States](#loading-states)
10. [Optimistic Updates](#optimistic-updates)
11. [Migration Strategy](#migration-strategy)
12. [Testing Strategy](#testing-strategy)
13. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

### Current State
- **Frontend**: React 19 + TypeScript + TanStack Query
- **State Management**: Local state with `useKanban` hook
- **Data**: Mock data hardcoded in components
- **API Client**: Axios instance configured in `src/lib/api.ts`

### Target State
- **Data Loading**: Fetch tasks and columns from backend on mount
- **Mutations**: All CRUD operations synced with backend
- **Optimistic Updates**: Immediate UI feedback with rollback on error
- **Caching**: TanStack Query manages cache invalidation
- **Error Handling**: User-friendly error messages with retry logic

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  (KanbanBoard, KanbanColumn, TaskCard)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Custom Hooks Layer                         │
│  useKanban → useTasks, useColumns, useMutations             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  TanStack Query Layer                        │
│  Query Client, Cache Management, Optimistic Updates         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Service Layer                          │
│  taskService, columnService (Axios wrappers)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                               │
│  FastAPI (http://localhost:8001/api)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend API Analysis

### Available Endpoints

Based on the OpenAPI specification at `http://localhost:8001/openapi.json`:

#### Column Endpoints
- `GET /columns/` - Get all columns (ordered by position)
- `POST /columns/` - Create a new column
- `GET /columns/{column_id}` - Get column by ID
- `PUT /columns/{column_id}` - Update column
- `DELETE /columns/{column_id}` - Delete column (cascades to tasks)
- `PATCH /columns/{column_id}/reorder` - Reorder column position

#### Task Endpoints
- `GET /tasks/` - Get all tasks
- `POST /tasks/` - Create a new task
- `GET /tasks/{task_id}` - Get task by ID
- `PUT /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task
- `PATCH /tasks/{task_id}/move` - Move task to different column
- `PATCH /tasks/{task_id}/reorder` - Reorder task within column
- `GET /tasks/columns/{column_id}/tasks` - Get tasks by column

### Backend Data Models

#### ColumnResponse
```typescript
{
  id: number
  title: string
  order: number
  created_at: string (ISO 8601)
}
```

#### TaskResponse
```typescript
{
  id: number
  title: string
  description: string | null
  column_id: number
  order: number
  created_at: string (ISO 8601)
}
```

### Key Differences from Frontend Types

| Frontend | Backend | Mapping Required |
|----------|---------|------------------|
| `id: string` | `id: number` | Convert number to string |
| `status: TaskStatus` | `column_id: number` | Map column_id to status |
| `priority: 'low'\|'medium'\|'high'` | Not in backend | Frontend-only field |
| `updatedAt: string` | Not in backend | Use `created_at` or local |

---

## Type System Updates

### File: `src/types/index.ts`

Add backend-specific types and update existing types to support API integration:

```typescript
// Backend API Response Types
export interface BackendColumn {
  id: number
  title: string
  order: number
  created_at: string
}

export interface BackendTask {
  id: number
  title: string
  description: string | null
  column_id: number
  order: number
  created_at: string
}

// API Request Types
export interface CreateTaskRequest {
  title: string
  description?: string | null
  column_id: number
  order: number
}

export interface UpdateTaskRequest {
  title?: string
  description?: string | null
  order?: number
}

export interface MoveTaskRequest {
  task_id: number
  target_column_id: number
  new_order: number
}

export interface CreateColumnRequest {
  title: string
  order: number
}

export interface UpdateColumnRequest {
  title?: string
  order?: number
}

// Column ID to Status Mapping
export const COLUMN_STATUS_MAP: Record<number, TaskStatus> = {
  1: 'todo',
  2: 'in-progress',
  3: 'done',
}

export const STATUS_COLUMN_MAP: Record<TaskStatus, number> = {
  'todo': 1,
  'in-progress': 2,
  'done': 3,
}

// Enhanced Task type with optional backend fields
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority?: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  // Backend-specific fields
  backendId?: number
  columnId?: number
  order?: number
}
```

---

## API Service Layer

### File: `src/services/kanban.service.ts` (NEW)

Create a dedicated service layer for Kanban API operations:

```typescript
import apiClient from '@/lib/api'
import type {
  BackendTask,
  BackendColumn,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  Task,
  TaskStatus,
  COLUMN_STATUS_MAP,
  STATUS_COLUMN_MAP,
} from '@/types'

// ============================================================================
// COLUMN OPERATIONS
// ============================================================================

export const columnService = {
  /**
   * Get all columns ordered by position
   */
  async getAll(): Promise<BackendColumn[]> {
    const response = await apiClient.get<BackendColumn[]>('/columns/')
    return response.data
  },

  /**
   * Get a single column by ID
   */
  async getById(columnId: number): Promise<BackendColumn> {
    const response = await apiClient.get<BackendColumn>(`/columns/${columnId}`)
    return response.data
  },

  /**
   * Create a new column
   */
  async create(data: CreateColumnRequest): Promise<BackendColumn> {
    const response = await apiClient.post<BackendColumn>('/columns/', data)
    return response.data
  },

  /**
   * Update a column
   */
  async update(columnId: number, data: UpdateColumnRequest): Promise<BackendColumn> {
    const response = await apiClient.put<BackendColumn>(`/columns/${columnId}`, data)
    return response.data
  },

  /**
   * Delete a column (cascades to tasks)
   */
  async delete(columnId: number): Promise<void> {
    await apiClient.delete(`/columns/${columnId}`)
  },

  /**
   * Reorder a column
   */
  async reorder(columnId: number, newOrder: number): Promise<BackendColumn> {
    const response = await apiClient.patch<BackendColumn>(
      `/columns/${columnId}/reorder`,
      { column_id: columnId, new_order: newOrder }
    )
    return response.data
  },
}

// ============================================================================
// TASK OPERATIONS
// ============================================================================

export const taskService = {
  /**
   * Get all tasks
   */
  async getAll(): Promise<BackendTask[]> {
    const response = await apiClient.get<BackendTask[]>('/tasks/')
    return response.data
  },

  /**
   * Get tasks by column ID
   */
  async getByColumn(columnId: number): Promise<BackendTask[]> {
    const response = await apiClient.get<BackendTask[]>(`/tasks/columns/${columnId}/tasks`)
    return response.data
  },

  /**
   * Get a single task by ID
   */
  async getById(taskId: number): Promise<BackendTask> {
    const response = await apiClient.get<BackendTask>(`/tasks/${taskId}`)
    return response.data
  },

  /**
   * Create a new task
   */
  async create(data: CreateTaskRequest): Promise<BackendTask> {
    const response = await apiClient.post<BackendTask>('/tasks/', data)
    return response.data
  },



  /**
   * Update a task
   */
  async update(taskId: number, data: UpdateTaskRequest): Promise<BackendTask> {
    const response = await apiClient.put<BackendTask>(`/tasks/${taskId}`, data)
    return response.data
  },

  /**
   * Delete a task
   */
  async delete(taskId: number): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`)
  },

  /**
   * Move task to a different column
   */
  async move(taskId: number, targetColumnId: number, newOrder: number): Promise<BackendTask> {
    const response = await apiClient.patch<BackendTask>(
      `/tasks/${taskId}/move`,
      {
        task_id: taskId,
        target_column_id: targetColumnId,
        new_order: newOrder,
      }
    )
    return response.data
  },

  /**
   * Reorder task within the same column
   */
  async reorder(taskId: number, newOrder: number): Promise<BackendTask> {
    const response = await apiClient.patch<BackendTask>(
      `/tasks/${taskId}/reorder`,
      {
        task_id: taskId,
        new_order: newOrder,
      }
    )
    return response.data
  },
}

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Convert backend task to frontend Task type
 */
export function transformBackendTask(backendTask: BackendTask): Task {
  const status = COLUMN_STATUS_MAP[backendTask.column_id] || 'todo'

  return {
    id: String(backendTask.id),
    title: backendTask.title,
    description: backendTask.description || undefined,
    status,
    createdAt: backendTask.created_at,
    updatedAt: backendTask.created_at, // Backend doesn't have updatedAt
    backendId: backendTask.id,
    columnId: backendTask.column_id,
    order: backendTask.order,
    // Priority is frontend-only, not stored in backend
    priority: undefined,
  }
}

/**
 * Convert frontend Task to backend CreateTaskRequest
 */
export function transformToCreateRequest(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  order: number
): CreateTaskRequest {
  const columnId = STATUS_COLUMN_MAP[task.status] || 1

  return {
    title: task.title,
    description: task.description || null,
    column_id: columnId,
    order,
  }
}

/**
 * Convert frontend Task updates to backend UpdateTaskRequest
 */
export function transformToUpdateRequest(
  updates: Partial<Task>
): UpdateTaskRequest {
  const request: UpdateTaskRequest = {}

  if (updates.title !== undefined) {
    request.title = updates.title
  }

  if (updates.description !== undefined) {
    request.description = updates.description || null
  }

  if (updates.order !== undefined) {
    request.order = updates.order
  }

  return request
}
```

---

## TanStack Query Hooks

### File: `src/hooks/useKanbanQueries.ts` (NEW)

Create dedicated TanStack Query hooks for all Kanban operations:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService, columnService, transformBackendTask } from '@/services/kanban.service'
import type { Task, BackendTask, CreateTaskRequest, UpdateTaskRequest } from '@/types'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const kanbanKeys = {
  all: ['kanban'] as const,
  columns: () => [...kanbanKeys.all, 'columns'] as const,
  column: (id: number) => [...kanbanKeys.columns(), id] as const,
  tasks: () => [...kanbanKeys.all, 'tasks'] as const,
  task: (id: number) => [...kanbanKeys.tasks(), id] as const,
  tasksByColumn: (columnId: number) => [...kanbanKeys.tasks(), 'column', columnId] as const,
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch all columns
 */
export function useColumns() {
  return useQuery({
    queryKey: kanbanKeys.columns(),
    queryFn: () => columnService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Fetch all tasks and transform to frontend format
 */
export function useTasks() {
  return useQuery({
    queryKey: kanbanKeys.tasks(),
    queryFn: async () => {
      const backendTasks = await taskService.getAll()
      return backendTasks.map(transformBackendTask)
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Fetch tasks by column ID
 */
export function useTasksByColumn(columnId: number) {
  return useQuery({
    queryKey: kanbanKeys.tasksByColumn(columnId),
    queryFn: async () => {
      const backendTasks = await taskService.getByColumn(columnId)
      return backendTasks.map(transformBackendTask)
    },
    staleTime: 1000 * 60 * 2,
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new task with optimistic update
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.create(data),

    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: kanbanKeys.tasks() })

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(kanbanKeys.tasks())

      // Optimistically update to the new value
      if (previousTasks) {
        const optimisticTask: Task = {
          id: `temp-${Date.now()}`,
          title: newTask.title,
          description: newTask.description || undefined,
          status: 'todo', // Will be determined by column_id
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          columnId: newTask.column_id,
          order: newTask.order,
        }

        queryClient.setQueryData<Task[]>(
          kanbanKeys.tasks(),
          [...previousTasks, optimisticTask]
        )
      }

      return { previousTasks }
    },

    onError: (err, newTask, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(kanbanKeys.tasks(), context.previousTasks)
      }
    },

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: kanbanKeys.tasks() })
    },
  })
}

/**
 * Update a task with optimistic update
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: UpdateTaskRequest }) =>
      taskService.update(taskId, data),

    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: kanbanKeys.tasks() })

      const previousTasks = queryClient.getQueryData<Task[]>(kanbanKeys.tasks())

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          kanbanKeys.tasks(),
          previousTasks.map((task) =>
            task.backendId === taskId
              ? { ...task, ...data, updatedAt: new Date().toISOString() }
              : task
          )
        )
      }

      return { previousTasks }
    },

    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(kanbanKeys.tasks(), context.previousTasks)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.tasks() })
    },
  })
}

/**
 * Delete a task with optimistic update
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: number) => taskService.delete(taskId),

    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: kanbanKeys.tasks() })

      const previousTasks = queryClient.getQueryData<Task[]>(kanbanKeys.tasks())

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          kanbanKeys.tasks(),
          previousTasks.filter((task) => task.backendId !== taskId)
        )
      }

      return { previousTasks }
    },

    onError: (err, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(kanbanKeys.tasks(), context.previousTasks)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.tasks() })
    },
  })
}

/**
 * Move task to a different column with optimistic update
 */
export function useMoveTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      targetColumnId,
      newOrder,
    }: {
      taskId: number
      targetColumnId: number
      newOrder: number
    }) => taskService.move(taskId, targetColumnId, newOrder),

    onMutate: async ({ taskId, targetColumnId, newOrder }) => {
      await queryClient.cancelQueries({ queryKey: kanbanKeys.tasks() })

      const previousTasks = queryClient.getQueryData<Task[]>(kanbanKeys.tasks())

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          kanbanKeys.tasks(),
          previousTasks.map((task) =>
            task.backendId === taskId
              ? {
                  ...task,
                  columnId: targetColumnId,
                  order: newOrder,
                  updatedAt: new Date().toISOString(),
                }
              : task
          )
        )
      }

      return { previousTasks }
    },

    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(kanbanKeys.tasks(), context.previousTasks)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanKeys.tasks() })
    },
  })
}
```

---

## Enhanced useKanban Hook

### File: `src/hooks/useKanban.ts` (UPDATED)

Update the existing hook to integrate with backend API:

```typescript
import { useCallback, useMemo } from 'react'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useMoveTask } from './useKanbanQueries'
import { transformToCreateRequest, transformToUpdateRequest } from '@/services/kanban.service'
import { getTasksByStatus } from '@/lib/kanban-utils'
import type { Task, TaskStatus } from '@/types'
import { STATUS_COLUMN_MAP } from '@/types'

export function useKanban() {
  // Fetch tasks from backend
  const { data: tasks = [], isLoading, error, refetch } = useTasks()

  // Mutation hooks
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const moveTaskMutation = useMoveTask()

  /**
   * Move a task to a new status/column
   */
  const moveTask = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task || !task.backendId) {
        console.error('Task not found or missing backend ID')
        return
      }

      const targetColumnId = STATUS_COLUMN_MAP[newStatus]
      const tasksInTargetColumn = tasks.filter((t) => t.status === newStatus)
      const newOrder = tasksInTargetColumn.length

      moveTaskMutation.mutate({
        taskId: task.backendId,
        targetColumnId,
        newOrder,
      })
    },
    [tasks, moveTaskMutation]
  )

  /**
   * Add a new task
   */
  const addTask = useCallback(
    (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      const tasksInColumn = tasks.filter((t) => t.status === task.status)
      const order = tasksInColumn.length

      const createRequest = transformToCreateRequest(task, order)
      createTaskMutation.mutate(createRequest)
    },
    [tasks, createTaskMutation]
  )

  /**
   * Delete a task
   */
  const deleteTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task || !task.backendId) {
        console.error('Task not found or missing backend ID')
        return
      }

      deleteTaskMutation.mutate(task.backendId)
    },
    [tasks, deleteTaskMutation]
  )

  /**
   * Update a task
   */
  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task || !task.backendId) {
        console.error('Task not found or missing backend ID')
        return
      }

      const updateRequest = transformToUpdateRequest(updates)
      updateTaskMutation.mutate({
        taskId: task.backendId,
        data: updateRequest,
      })
    },
    [tasks, updateTaskMutation]
  )

  /**
   * Get tasks by status (memoized)
   */
  const getTasksByStatusMemo = useCallback(
    (status: TaskStatus) => getTasksByStatus(tasks, status),
    [tasks]
  )

  return {
    tasks,
    isLoading,
    error,
    refetch,
    moveTask,
    addTask,
    deleteTask,
    updateTask,
    getTasksByStatus: getTasksByStatusMemo,
    // Expose mutation states for UI feedback
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isMoving: moveTaskMutation.isPending,
  }
}
```

---

## Component Updates

### File: `src/components/kanban/KanbanBoard.tsx` (UPDATED)

Update to use the enhanced hook and add loading/error states:

```typescript
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { useKanban } from '@/hooks/useKanban'
import type { Task, TaskStatus } from '@/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'

const COLUMNS: TaskStatus[] = ['todo', 'in-progress', 'done']

export function KanbanBoard() {
  const {
    tasks,
    isLoading,
    error,
    refetch,
    moveTask,
    getTasksByStatus,
    isMoving,
  } = useKanban()

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

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load tasks. Please try again.
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Task Board</h1>
        <p className="text-muted-foreground">
          Drag and drop tasks between columns to update their status
        </p>
      </div>

      {/* Moving indicator */}
      {isMoving && (
        <Alert className="mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Updating task...</AlertDescription>
        </Alert>
      )}

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

## Error Handling Strategy

### Global Error Handling

Update `src/lib/api.ts` to add better error handling:

```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const message = error.response.data?.message || error.message

      switch (status) {
        case 401:
          localStorage.removeItem('authToken')
          // Optionally redirect to login
          break
        case 404:
          console.error('Resource not found:', message)
          break
        case 422:
          console.error('Validation error:', error.response.data)
          break
        case 500:
          console.error('Server error:', message)
          break
        default:
          console.error('API error:', message)
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response from server')
    } else {
      // Error in request setup
      console.error('Request error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient
```

### User-Friendly Error Messages

Create `src/lib/error-messages.ts`:

```typescript
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any

    if (err.response?.data?.message) {
      return err.response.data.message
    }

    if (err.response?.status === 404) {
      return 'Resource not found'
    }

    if (err.response?.status === 422) {
      return 'Invalid data provided'
    }

    if (err.response?.status === 500) {
      return 'Server error. Please try again later.'
    }

    if (err.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your connection.'
    }

    if (err.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.'
    }
  }

  return 'An unexpected error occurred'
}
```

---

## Loading States

### Loading Indicators

Use existing Shadcn/ui components for loading states:

1. **Skeleton Loaders** - For initial load
2. **Spinner** - For mutations
3. **Progress Indicators** - For bulk operations

Example skeleton for KanbanColumn:

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export function KanbanColumnSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}
```


---

## Optimistic Updates

### How Optimistic Updates Work

1. **User Action**: User drags a task to a new column
2. **Immediate UI Update**: UI updates instantly (optimistic)
3. **API Call**: Request sent to backend
4. **Success**: Cache invalidated and refetched
5. **Error**: UI rolled back to previous state

### Implementation Pattern

All mutations follow this pattern:

```typescript
useMutation({
  mutationFn: async (data) => {
    // API call
    return await apiService.mutate(data)
  },

  onMutate: async (data) => {
    // 1. Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['tasks'] })

    // 2. Snapshot current state
    const previousData = queryClient.getQueryData(['tasks'])

    // 3. Optimistically update cache
    queryClient.setQueryData(['tasks'], (old) => {
      // Update logic here
      return newData
    })

    // 4. Return context for rollback
    return { previousData }
  },

  onError: (err, data, context) => {
    // Rollback on error
    if (context?.previousData) {
      queryClient.setQueryData(['tasks'], context.previousData)
    }

    // Show error toast
    toast.error('Failed to update task')
  },

  onSuccess: () => {
    // Invalidate and refetch to sync with server
    queryClient.invalidateQueries({ queryKey: ['tasks'] })

    // Show success toast
    toast.success('Task updated successfully')
  },
})
```

---

## Migration Strategy

### Phase 1: Preparation (No Breaking Changes)

**Goal**: Set up infrastructure without breaking existing functionality

1. **Create new files** (don't modify existing):
   - `src/types/index.ts` - Add new types (keep existing)
   - `src/services/kanban.service.ts` - New service layer
   - `src/hooks/useKanbanQueries.ts` - New query hooks
   - `src/lib/error-messages.ts` - Error utilities

2. **Update API client**:
   - Enhance error handling in `src/lib/api.ts`
   - Add request/response logging (dev only)

3. **Test backend connectivity**:
   ```bash
   curl http://localhost:8001/api/tasks/
   curl http://localhost:8001/api/columns/
   ```

### Phase 2: Backend Integration (Feature Flag)

**Goal**: Integrate backend while keeping mock data as fallback

1. **Add feature flag**:
   ```typescript
   // src/config/features.ts
   export const FEATURES = {
     USE_BACKEND_API: import.meta.env.VITE_USE_BACKEND === 'true',
   }
   ```

2. **Update useKanban hook**:
   ```typescript
   import { FEATURES } from '@/config/features'

   export function useKanban(initialTasks: Task[] = []) {
     if (FEATURES.USE_BACKEND_API) {
       // Use new backend-integrated version
       return useKanbanWithBackend()
     } else {
       // Use existing mock version
       return useKanbanWithMock(initialTasks)
     }
   }
   ```

3. **Test with backend**:
   ```bash
   # Enable backend
   VITE_USE_BACKEND=true yarn dev

   # Disable backend (fallback to mock)
   VITE_USE_BACKEND=false yarn dev
   ```

### Phase 3: Data Seeding

**Goal**: Populate backend with initial data

1. **Create seed script** (optional):
   ```typescript
   // scripts/seed-kanban.ts
   import { taskService, columnService } from '@/services/kanban.service'

   async function seedKanban() {
     // Create columns
     await columnService.create({ title: 'Todo', order: 0 })
     await columnService.create({ title: 'In Progress', order: 1 })
     await columnService.create({ title: 'Done', order: 2 })

     // Create sample tasks
     await taskService.create({
       title: 'Sample Task 1',
       description: 'This is a sample task',
       column_id: 1,
       order: 0,
     })
   }
   ```

2. **Or use backend seeding** (if available)

### Phase 4: Full Migration

**Goal**: Remove mock data and feature flags

1. **Remove mock data** from components
2. **Remove feature flags**
3. **Update useKanban** to only use backend version
4. **Remove old mock-based implementation**

### Phase 5: Testing & Validation

**Goal**: Ensure everything works correctly

1. **Manual testing**:
   - Create tasks
   - Update tasks
   - Delete tasks
   - Move tasks between columns
   - Test error scenarios (disconnect network)

2. **Automated testing** (if applicable):
   - Unit tests for services
   - Integration tests for hooks
   - E2E tests for user flows

---

## Testing Strategy

### Unit Tests

Test individual services and utilities:

```typescript
// src/services/__tests__/kanban.service.test.ts
import { describe, it, expect, vi } from 'vitest'
import { taskService, transformBackendTask } from '../kanban.service'
import apiClient from '@/lib/api'

vi.mock('@/lib/api')

describe('taskService', () => {
  it('should fetch all tasks', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', column_id: 1, order: 0, created_at: '2024-01-01' },
    ]

    vi.mocked(apiClient.get).mockResolvedValue({ data: mockTasks })

    const tasks = await taskService.getAll()

    expect(tasks).toEqual(mockTasks)
    expect(apiClient.get).toHaveBeenCalledWith('/tasks/')
  })

  it('should transform backend task correctly', () => {
    const backendTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      column_id: 1,
      order: 0,
      created_at: '2024-01-01T00:00:00Z',
    }

    const frontendTask = transformBackendTask(backendTask)

    expect(frontendTask).toMatchObject({
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
      backendId: 1,
      columnId: 1,
    })
  })
})
```

### Integration Tests

Test hooks with TanStack Query:

```typescript
// src/hooks/__tests__/useKanban.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useKanban } from '../useKanban'

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

describe('useKanban', () => {
  it('should load tasks on mount', async () => {
    const { result } = renderHook(() => useKanban(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tasks).toBeDefined()
  })
})
```

### Manual Testing Checklist

- [ ] Backend API is running on `http://localhost:8001`
- [ ] Frontend can fetch tasks from backend
- [ ] Frontend can fetch columns from backend
- [ ] Can create a new task
- [ ] Can update an existing task
- [ ] Can delete a task
- [ ] Can drag and drop task between columns
- [ ] Optimistic updates work (immediate UI feedback)
- [ ] Error handling works (disconnect network and try operations)
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Cache invalidation works (data stays in sync)

---

## Implementation Checklist

### Prerequisites
- [ ] Backend API is running and accessible
- [ ] API documentation reviewed at `http://localhost:8001/docs`
- [ ] Existing codebase is backed up or committed

### Step 1: Type System
- [ ] Update `src/types/index.ts` with backend types
- [ ] Add `BackendTask` and `BackendColumn` interfaces
- [ ] Add request/response types
- [ ] Add column/status mapping constants
- [ ] Update existing `Task` type with optional backend fields

### Step 2: API Service Layer
- [ ] Create `src/services/` directory
- [ ] Create `src/services/kanban.service.ts`
- [ ] Implement `columnService` with all CRUD operations
- [ ] Implement `taskService` with all CRUD operations
- [ ] Implement data transformation utilities
- [ ] Test service functions with Postman or curl

### Step 3: TanStack Query Hooks
- [ ] Create `src/hooks/useKanbanQueries.ts`
- [ ] Define query keys structure
- [ ] Implement `useColumns()` query hook
- [ ] Implement `useTasks()` query hook
- [ ] Implement `useCreateTask()` mutation hook
- [ ] Implement `useUpdateTask()` mutation hook
- [ ] Implement `useDeleteTask()` mutation hook
- [ ] Implement `useMoveTask()` mutation hook
- [ ] Add optimistic updates to all mutations
- [ ] Add error handling to all mutations

### Step 4: Enhanced useKanban Hook
- [ ] Update `src/hooks/useKanban.ts`
- [ ] Replace local state with TanStack Query
- [ ] Update `moveTask` to call backend
- [ ] Update `addTask` to call backend
- [ ] Update `deleteTask` to call backend
- [ ] Update `updateTask` to call backend
- [ ] Expose loading/error states
- [ ] Expose mutation states (isCreating, isUpdating, etc.)

### Step 5: Component Updates
- [ ] Update `src/components/kanban/KanbanBoard.tsx`
- [ ] Remove mock data from component
- [ ] Add loading state UI
- [ ] Add error state UI
- [ ] Add mutation feedback (toasts or alerts)
- [ ] Test drag-and-drop with backend integration

### Step 6: Error Handling
- [ ] Update `src/lib/api.ts` with enhanced error handling
- [ ] Create `src/lib/error-messages.ts`
- [ ] Add error boundaries (optional)
- [ ] Add toast notifications for errors (optional)
- [ ] Test error scenarios

### Step 7: Loading States
- [ ] Add skeleton loaders for initial load
- [ ] Add spinners for mutations
- [ ] Add progress indicators where needed
- [ ] Test loading states

### Step 8: Testing
- [ ] Manual testing of all CRUD operations
- [ ] Test optimistic updates
- [ ] Test error handling (disconnect network)
- [ ] Test loading states
- [ ] Write unit tests (optional)
- [ ] Write integration tests (optional)

### Step 9: Documentation
- [ ] Update README with backend integration notes
- [ ] Document environment variables
- [ ] Document API endpoints used
- [ ] Add troubleshooting guide

### Step 10: Deployment
- [ ] Update environment variables for production
- [ ] Test with production backend
- [ ] Monitor for errors
- [ ] Gather user feedback

---

## Quick Reference

### Environment Variables

```bash
# .env
VITE_API_BASE_URL=http://localhost:8001/api
VITE_USE_BACKEND=true  # Feature flag (optional)
```

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/columns/` | GET | Fetch all columns |
| `/tasks/` | GET | Fetch all tasks |
| `/tasks/` | POST | Create new task |
| `/tasks/{id}` | PUT | Update task |
| `/tasks/{id}` | DELETE | Delete task |
| `/tasks/{id}/move` | PATCH | Move task to different column |

### Query Keys Structure

```typescript
kanbanKeys = {
  all: ['kanban'],
  columns: ['kanban', 'columns'],
  tasks: ['kanban', 'tasks'],
  task: (id) => ['kanban', 'tasks', id],
  tasksByColumn: (columnId) => ['kanban', 'tasks', 'column', columnId],
}
```

### File Structure

```
app/src/
├── components/
│   └── kanban/
│       ├── KanbanBoard.tsx (UPDATED)
│       ├── KanbanColumn.tsx
│       └── TaskCard.tsx
├── hooks/
│   ├── useKanban.ts (UPDATED)
│   └── useKanbanQueries.ts (NEW)
├── services/
│   └── kanban.service.ts (NEW)
├── lib/
│   ├── api.ts (UPDATED)
│   ├── error-messages.ts (NEW)
│   └── kanban-utils.ts
└── types/
    └── index.ts (UPDATED)
```

---

## Summary

This comprehensive plan provides a production-ready approach to integrating the Kanban board with the backend API. Key highlights:

1. **Layered Architecture**: Clear separation between components, hooks, services, and API
2. **Type Safety**: Full TypeScript support with proper type transformations
3. **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors
4. **Error Handling**: Comprehensive error handling at all layers
5. **Loading States**: User-friendly loading indicators
6. **Migration Strategy**: Phased approach with feature flags for safe rollout
7. **Testing**: Unit and integration testing strategies
8. **Documentation**: Complete implementation checklist and quick reference

The integration maintains the existing user experience while adding robust backend synchronization, making it production-ready and maintainable.

