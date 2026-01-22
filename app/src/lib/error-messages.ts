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

