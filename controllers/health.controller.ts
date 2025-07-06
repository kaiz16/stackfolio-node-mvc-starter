import { type NextFunction, type Request, type Response } from 'express'
import httpStatus from 'http-status'
import { ApiResponse } from '../models/response.model.js'
import Environment from '../config/environment.js'

export class HealthController {
  public async healthCheck(req: Request, res: Response, next: NextFunction) {
    const response = new ApiResponse({
      status: httpStatus.OK,
      message: 'OK: ' + Environment.config().name,
      data: null,
      errors: null,
    })
    return res.status(httpStatus.OK).json(response)
  }
}

export default new HealthController()
