import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateCar } from '../../businesslogic/cars'
import { UpdateCarRequest } from '../../requests/UpdateCarRequest'
import { getUserId } from '../utils'
import { createLogger } from "../../utils/logger";
const logger = createLogger("update-car");
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const carId = event.pathParameters.carId
    try {
      const updatedCar: UpdateCarRequest = JSON.parse(event.body)
      const userId = getUserId(event)
      const resultItem = await updateCar(userId, carId, updatedCar)
      if(resultItem.name.trim()==""){
        return {
          statusCode: 400,
          body: "Please enter name of car"
        }
      }else{
        return {
          statusCode: 201,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            resultItem
          })
        }
      }
    } catch (e) {
      logger.error(e.message)
      return {
        statusCode: 500,
        body: e.message
      }
    }
  }
)
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
