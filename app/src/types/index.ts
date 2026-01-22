// Example type definitions for your application

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}

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
  // Backend-specific fields
  backendId?: number
  columnId?: number
  order?: number
}

export interface KanbanColumn {
  id: TaskStatus
  title: string
  tasks: Task[]
}

export interface KanbanBoard {
  columns: KanbanColumn[]
}

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
