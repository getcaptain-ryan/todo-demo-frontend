import apiClient from '@/lib/api'
import type {
  BackendTask,
  BackendColumn,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  Task,
} from '@/types'
import {
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
export function transformToUpdateRequest(updates: Partial<Task>): UpdateTaskRequest {
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
