/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateCarRequest {
  name: string
  dueDate: string
  status: boolean
}