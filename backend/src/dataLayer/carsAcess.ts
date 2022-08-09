import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { CarItem } from '../models/CarItem'
import { CarUpdate } from '../models/CarUpdate';
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('Car-Access')
// TODO: Implement the dataLayer logic

export class CarsAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly carsTable = process.env.CARS_TABLE,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly s3 = new XAWS.S3({
            signatureVersion: 'v4'
        }),
    ) {
    }

    async listAllCars(userId: string): Promise<CarItem[]> {
        const result = await this.docClient.query({
            TableName: this.carsTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise()
        const items = result.Items
        return items as CarItem[]
    }

    async createCar(newItem: CarItem): Promise<CarItem> {
        await this.docClient.put({
            TableName: this.carsTable,
            Item: newItem
        }).promise()
        return newItem
    }

    async updateCar(userId: string, carId: string, carUpdate: CarUpdate): Promise<CarUpdate> {
        const updateExpression = 'set #name = :name, dueDate = :dueDate, #status = :status'
        await this.docClient.update({
            TableName: this.carsTable,
            Key: {
                userId: userId,
                carId: carId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#status': 'status', 
            },
            ExpressionAttributeValues: {
                ':name': carUpdate.name,
                ':dueDate': carUpdate.dueDate,
                ':status': carUpdate.status,
            },
        }).promise()
        return carUpdate
    }

    async updateAttachmentUrl(userId: string, carId: string, uploadUrl: string): Promise<string> {
        await this.docClient.update({
            TableName: this.carsTable,
            Key: {
                userId: userId,
                carId: carId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': uploadUrl.split("?")[0]
            }
        }).promise()
        return uploadUrl
    }

    async deleteCar(userId: string, carId: string) {
        this.docClient.delete({
            TableName: this.carsTable,
            Key: {
                carId: carId,
                userId: userId
            },
            ConditionExpression: 'carId = :carId',
            ExpressionAttributeValues: {
                ':carId': carId
            }
        }).promise()
         const params = {
            Bucket: this.bucketName,
            Key: carId
        }
        logger.info("carId deleted : " +carId);
        await this.s3.deleteObject(params, function (err, data) {
            if (err) logger.error('error deleting', err.stack)
            else logger.info(data)
        }).promise()
    }
}

function createDynamoDBClient(): DocumentClient {
    const service = new AWS.DynamoDB()
    const client = new AWS.DynamoDB.DocumentClient({
      service: service
    })
    AWSXRay.captureAWSClient(service)
    return client
  }