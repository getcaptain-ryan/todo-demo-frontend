import { useCallback } from 'react'
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

