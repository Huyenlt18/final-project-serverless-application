import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateCarRequest } from '../../requests/CreateCarRequest'
import { getUserId } from '../utils';
import { createCar } from '../../businesslogic/cars'
import { createLogger } from "../../utils/logger";
const logger = createLogger("create-car");
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const newCar: CreateCarRequest = JSON.parse(event.body)
      //  Implement creating a new Car item
      const userId = getUserId(event)
      const item = await createCar(userId, newCar)
      // verify create empty name of car
      if(item.name.trim()==""){
        return {
          statusCode: 400,
          body: "Please enter name of car"
        }
      }
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          item
        })
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
handler.use(
  cors({
    credentials: true
  })
)
