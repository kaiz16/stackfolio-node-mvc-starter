import { BaseRoute } from './base.route.js'
import controller from '../controllers/upload.controller.js'
import multer from 'multer'
import path from 'path'
import httpStatus from 'http-status'
import { ApiResponse } from '../models/response.model.js'
import { type Request, type Response, type NextFunction } from 'express'

const MAX_FILE_SIZE = 1024 * 1024 * 2 // Max File Size set to 2MB

// Set Upload Configurations
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, fieldNameSize: 300, files: 1 }, // Limit file size
  fileFilter: (req, file, callback) => {
    // Limit file type to PDF, PNG and JPG/JPEG files
    if (
      file.mimetype !== 'image/png' &&
      file.mimetype !== 'image/jpg' &&
      file.mimetype !== 'image/jpeg' &&
      file.mimetype !== 'application/pdf'
    ) {
      return callback(
        new Error(
          'Filetype not supported. Only PNG, JPG/JPEG and PDF files are allowed.',
        ),
      )
    }
    callback(null, true)
  },
})

// Handle Upload Errors
const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Handle Multer Errors
  if (err instanceof multer.MulterError) {
    const response = new ApiResponse({
      status: httpStatus.BAD_REQUEST,
      message: 'BAD_REQUEST',
      data: null,
      errors: {
        message:
          err.message || 'A Multer error occurred while uploading the file.',
      },
    })
    return res.status(httpStatus.BAD_REQUEST).json(response)
  }

  // Handle Other Errors
  else if (err instanceof Error) {
    const response = new ApiResponse({
      status: httpStatus.BAD_REQUEST,
      message: 'BAD_REQUEST',
      data: null,
      errors: {
        message: err.message || 'An error occurred while uploading the file.',
      },
    })
    return res.status(httpStatus.BAD_REQUEST).json(response)
  }

  // Handle Unidentified Errors
  const response = new ApiResponse({
    status: httpStatus.BAD_REQUEST,
    message: 'BAD_REQUEST',
    data: null,
    errors: {
      message:
        String(err) ||
        'An unidenidentified error occurred while uploading the file.',
    },
  })
  return res.status(httpStatus.BAD_REQUEST).json(response)
}

export class UploadRoute extends BaseRoute {
  constructor() {
    super()
  }

  protected initRoutes(): void {
    this.router
      .route('/')
      .post(upload.single('file'), errorHandler, controller.uploadFile)
  }
}

export default new UploadRoute().getRouter()
