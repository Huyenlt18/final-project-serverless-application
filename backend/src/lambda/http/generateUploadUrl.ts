import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { AttachmentUtils } from '../../fileStorage/attachmentUtils'
import { updateAttachmentUrl} from '../../businesslogic/cars'
import { getUserId } from '../utils'
import { createLogger } from "../../utils/logger";
import { v4 as uuidv4 } from 'uuid';
const logger = createLogger("generateUpload-car");
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const carId = event.pathParameters.carId
    const attachmentUtils = new AttachmentUtils()
    const userId = getUserId(event)
    try {
      const attachmentId = uuidv4()
      let uploadUrl = await attachmentUtils.createAttachmentPresignedUrl(attachmentId);
      const attachmentUrl = await attachmentUtils.getAttachmentUrl(attachmentId)
      await updateAttachmentUrl(userId, carId, attachmentUrl)
       return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          uploadUrl: uploadUrl
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
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
