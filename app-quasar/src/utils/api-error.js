/**
 * Custom error class that preserves the backend's validationErrors map
 * alongside the main error message.
 */
export class ApiError extends Error {
  constructor(message, validationErrors = null) {
    super(message)
    this.name = 'ApiError'
    this.validationErrors = validationErrors
  }
}

/**
 * Extracts the error from an Axios response and throws an ApiError,
 * preserving both `message` and `validationErrors` from the backend response.
 *
 * @param {Error} err - The error caught in a catch block
 * @param {string} fallbackMessage - Message to use if no response is available
 */
export function throwApiError(err, fallbackMessage) {
  if (err.response?.data) {
    throw new ApiError(err.response.data.message, err.response.data.validationErrors ?? null)
  }
  throw new ApiError(fallbackMessage)
}
