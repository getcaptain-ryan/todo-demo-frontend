import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { Todo, ApiResponse } from '@/types'

// Example hook for fetching todos
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Todo[]>>('/todos')
      return response.data.data
    },
  })
}

// Example hook for creating a todo
export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newTodo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiClient.post<ApiResponse<Todo>>('/todos', newTodo)
      return response.data.data
    },
    onSuccess: () => {
      // Invalidate and refetch todos
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
