import { CarsAccess } from '../dataLayer/carsAcess'
import { CarItem } from '../models/CarItem'
import { CarUpdate } from '../models/CarUpdate'
import { CreateCarRequest } from '../requests/CreateCarRequest'
import { UpdateCarRequest } from '../requests/UpdateCarRequest'
import * as uuid from 'uuid'
// TODO: Implement businessLogic
const carsAccess = new CarsAccess()
export async function listAllCars(userId: string): Promise<CarItem[]> {
    return carsAccess.listAllCars(userId)
}
export async function createCar(userId: string, newCar: CreateCarRequest): Promise<CarItem> {
  const createdAt = new Date().toISOString()  
  const carId = uuid.v4()
  let newItem: CarItem = {
    userId,
    carId,
    createdAt,
    status: false,
    ...newCar,
    attachmentUrl: ''
  }
  return await carsAccess.createCar(newItem)
}
  
export async function updateCar(userId: string, carId: string, updatedCar: UpdateCarRequest): Promise<CarUpdate> {
  let carUpdate: CarUpdate = {
    ...updatedCar
  }
  return carsAccess.updateCar(userId, carId, carUpdate)
}

export async function updateAttachmentUrl(userId: string, carId: string, attachmentUrl: string): Promise<string> {
  return carsAccess.updateAttachmentUrl(userId, carId, attachmentUrl)
}

export async function deleteCar(userId: string, carId: string) {
  return carsAccess.deleteCar(userId, carId)
    
}