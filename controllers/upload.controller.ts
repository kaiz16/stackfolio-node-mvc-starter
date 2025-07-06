import { type Request, type Response } from 'express'
import axios from 'axios'
import httpStatus from 'http-status'
import { ApiResponse } from '../models/response.model.js'
import SupabaseService from '../services/supabase.service.js'
import { v4 as uuidv4 } from 'uuid'

export class UploadController {
  public static async uploadToSupabaseBucket(req: Request) {
    const supabaseService = new SupabaseService()
    const file = req.file

    let userID = req.query.userId as string
    if (!userID) {
      throw new Error('User ID is required')
    }

    let type = req.query.type as string
    if (!type) {
      throw new Error(
        'Type is required and must be either avatar, document or image.',
      )
    }

    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg']
    const documentTypes = ['application/pdf']

    if (type === 'avatar' && !imageTypes.includes(file.mimetype)) {
      throw new Error('Avatar: Invalid file type')
    }

    if (type === 'image' && !imageTypes.includes(file.mimetype)) {
      throw new Error('Image: Invalid file type')
    }

    if (type === 'document' && !documentTypes.includes(file.mimetype)) {
      throw new Error('Document: Invalid file type')
    }

    const typeMap: Record<string, string> = {
      avatar: 'avatars',
      image: 'images',
      document: 'documents',
    }

    const fileName = uuidv4()
    const folderName = typeMap[type] || ''
    if (!folderName) {
      throw new Error('Invalid type')
    }
    const fileExt = file.mimetype.split('/')[1]
    const filePath = `${userID}/${folderName}/${fileName}.${fileExt}`
    const content = file.buffer
    if (type === 'avatar') {
      // Checking if user has image stored in supabase storage
      const { data: existingAvatars } =
        await supabaseService.supabaseClient.storage
          .from('uploads')
          .list(`${userID}/avatars`, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
          })

      /* 
        If user has image in supabase storage, 
        delete existing image from supabase storage
        Then, upload new image to supabase storage.
      */
      if (existingAvatars?.length) {
        await supabaseService.supabaseClient.storage
          .from('uploads')
          .remove(
            existingAvatars.map((avatar) => `${userID}/avatars/${avatar.name}`),
          )
      }
    }

    const publicUrl = await supabaseService.writeToSupabaseBucket(
      'uploads',
      filePath,
      content,
      file.mimetype,
    )

    return new URL(publicUrl)
  }

  public async uploadFile(req: Request, res: Response) {
    try {
      const publicUrl = await UploadController.uploadToSupabaseBucket(req)

      const response = new ApiResponse({
        status: httpStatus.OK,
        message: 'OK',
        data: {
          url: publicUrl,
        },
        errors: null,
      })
      return res.status(httpStatus.OK).json(response)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const response = new ApiResponse({
          status: httpStatus.INTERNAL_SERVER_ERROR,
          message: 'INTERNAL_SERVER_ERROR',
          data: null,
          errors: err.response?.data,
        })
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(response)
      }
      const response = new ApiResponse({
        status: httpStatus.BAD_REQUEST,
        message: 'BAD_REQUEST',
        data: null,
        errors: {
          message: (err as Error).message,
        },
      })
      return res.status(httpStatus.OK).json(response)
    }
  }
}

export default new UploadController()
