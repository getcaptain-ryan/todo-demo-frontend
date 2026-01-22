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
}

export interface KanbanColumn {
  id: TaskStatus
  title: string
  tasks: Task[]
}

export interface KanbanBoard {
  columns: KanbanColumn[]
}
