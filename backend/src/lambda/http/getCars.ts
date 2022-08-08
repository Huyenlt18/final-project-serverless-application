import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { listAllCars} from '../../businesslogic/cars'
import { getUserId } from '../utils';
import { createLogger } from "../../utils/logger";
const logger = createLogger("get-car");
//  Get all Car items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
   try{
     const userId = getUserId(event)
    const cars = await listAllCars(userId)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: cars
      })
    }
  }catch (e) {
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
