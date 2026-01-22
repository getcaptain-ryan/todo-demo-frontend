import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService, columnService, transformBackendTask } from '@/services/kanban.service'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types'

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

        queryClient.setQueryData<Task[]>(kanbanKeys.tasks(), [...previousTasks, optimisticTask])
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

