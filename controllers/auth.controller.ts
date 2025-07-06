import { type NextFunction, type Request, type Response } from 'express'
import axios from 'axios'
import httpStatus from 'http-status'
import { ApiResponse } from '../models/response.model.js'
import SupabaseService from './../services/supabase.service.js'
import GraphQLService from '../services/graphql.service.js'
import {
  isPossiblePhoneNumber,
  parsePhoneNumberWithError,
} from 'libphonenumber-js/min'

export class AuthController {
  public async register(req: Request, res: Response) {
    let { firstName, lastName, email, phone, password, role } = req.body

    try {
      if (!firstName) {
        throw new Error('field firstName is required')
      }

      if (!lastName) {
        throw new Error('field lastName is required')
      }

      if (!email) {
        throw new Error('field email is required')
      }

      if (!phone) {
        throw new Error('field phone is required')
      }

      if (!password) {
        throw new Error('field password is required')
      }

      if (!role) {
        throw new Error('field role is required')
      }

      const isValid = isPossiblePhoneNumber(phone, 'AU')
      if (!isValid) {
        throw new Error('Invalid phone number')
      }

      const phoneNumber = parsePhoneNumberWithError(phone, 'AU')
      const e164 = phoneNumber.format('E.164')

      const supabaseService = new SupabaseService()

      const { data, error } = await supabaseService.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            email,
            phone: e164,
            role,
          },
        },
      })

      const exceptionErrors = ['User already registered']
      if (error && !exceptionErrors.includes(error.code)) {
        throw new Error(error.message)
      }

      const response = new ApiResponse({
        status: httpStatus.OK,
        message: 'OK',
        data: {
          message: 'Please check your email for the verification code',
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

  public async login(req: Request, res: Response) {
    let { email, password } = req.body

    try {
      if (!email) {
        throw new Error('Email is required')
      }

      if (!password) {
        throw new Error('Password is required')
      }

      const supabaseService = new SupabaseService()

      const { data, error } =
        await supabaseService.supabaseClient.auth.signInWithPassword({
          email,
          password,
        })

      if (error) {
        throw new Error(error.message)
      }

      const response = new ApiResponse({
        status: httpStatus.OK,
        message: 'OK',
        data: {
          ...data.session,
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

  public async verifyOTPEmail(req: Request, res: Response) {
    let { type, email, code } = req.body

    try {
      type = type || 'email'
      if (!email) {
        throw new Error('Email is required')
      }

      if (!code) {
        throw new Error('Code is required')
      }

      const supabaseService = new SupabaseService()

      const { data, error } =
        await supabaseService.supabaseClient.auth.verifyOtp({
          email,
          token: code,
          type,
        })

      if (error) {
        throw new Error(error.message)
      }

      const userMetadata = data.user.user_metadata
      const graphQLService = new GraphQLService()
      await graphQLService.createUser({
        id: data.user.id,
        firstName: userMetadata.firstName,
        lastName: userMetadata.lastName,
        email: data.user.email,
        phone: userMetadata.phone,
        role: userMetadata.role,
      })

      const response = new ApiResponse({
        status: httpStatus.OK,
        message: 'OK',
        data: {
          ...data.session,
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

  public async resendOTPEmail(req: Request, res: Response) {
    let { type, email } = req.body

    try {
      if (!email) {
        throw new Error('Email is required')
      }

      type = type || 'signup'

      const supabaseService = new SupabaseService()

      const { error } = await supabaseService.supabaseClient.auth.resend({
        type,
        email,
      })

      if (error) {
        throw new Error(error.message)
      }

      const response = new ApiResponse({
        status: httpStatus.OK,
        message: 'OK',
        data: {
          message: 'Please check your email for the verification code',
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

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) {
        throw new Error('refreshToken is required')
      }
      const supabaseService = new SupabaseService()

      const { data, error } =
        await supabaseService.supabaseClient.auth.refreshSession({
          refresh_token: refreshToken,
        })

      if (error) {
        throw new Error(error.message)
      }

      const response = new ApiResponse({
        status: httpStatus.OK,
        message: 'OK',
        data: {
          ...data.session,
        },
        errors: null,
      })
      return res.status(httpStatus.OK).json(response)
    } catch (err) {
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

  public async changeEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken, newEmail } = req.body
      if (!accessToken) {
        throw new Error('accessToken is required')
      }

      if (!refreshToken) {
        throw new Error('refreshToken is required')
      }

      if (!newEmail) {
        throw new Error('newEmail is required')
      }

      const supabaseService = new SupabaseService()
      await supabaseService.supabaseClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      const { error } = await supabaseService.supabaseClient.auth.updateUser({
        email: newEmail,
      })

      if (error) {
        throw new Error(error.message)
      }

      const response = new ApiResponse({
        status: httpStatus.OK,
        message: 'OK',
        data: {
          message: 'Please check your email for the verification code',
        },
        errors: null,
      })
      return res.status(httpStatus.OK).json(response)
    } catch (err) {
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

  public async changePhone(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken, phone } = req.body
      if (!accessToken) {
        throw new Error('accessToken is required')
      }

      if (!refreshToken) {
        throw new Error('refreshToken is required')
      }

      if (!phone) {
        throw new Error('phone is required')
      }

      const isValid = isPossiblePhoneNumber(phone, 'AU')
      if (!isValid) {
        throw new Error('Invalid phone number')
      }

      const phoneNumber = parsePhoneNumberWithError(phone, 'AU')
      const e164 = phoneNumber.format('E.164')

      const supabaseService = new SupabaseService()
      await supabaseService.supabaseClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      const {
        data: { user },
        error: userError,
      } = await supabaseService.supabaseClient.auth.getUser()
      if (userError) {
        throw new Error(userError.message)
      }

      const { error } = await supabaseService.supabaseClient.auth.updateUser({
        data: {
          ...user.user_metadata,
          phone: e164,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      const userMetadata = user.user_metadata
      const graphQLService = new GraphQLService()
      await graphQLService.createUser({
        id: user.id,
        firstName: userMetadata.firstName,
        lastName: userMetadata.lastName,
        email: user.email,
        phone: e164,
        role: userMetadata.role,
      })

      const response = new ApiResponse({
        status: httpStatus.OK,
        message: 'OK',
        data: {
          message: 'Phone number updated successfully',
        },
        errors: null,
      })
      return res.status(httpStatus.OK).json(response)
    } catch (err) {
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

  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, oldPassword, newPassword } = req.body
      if (!email) {
        throw new Error('email is required')
      }

      if (!oldPassword) {
        throw new Error('oldPassword is required')
      }

      if (!newPassword) {
        throw new Error('newPassword is required')
      }

      const supabaseService = new SupabaseService()

      const validatePassword = async (password: string) => {
        const { data, error } =
          await supabaseService.supabaseClient.auth.signInWithPassword({
            email,
            password,
          })

        if (error) {
          throw new Error(error.message)
        }

        return data
      }

      // Validate old password
      const { session: oldSession } = await validatePassword(oldPassword)

      await supabaseService.supabaseClient.auth.setSession({
        access_token: oldSession?.access_token,
        refresh_token: oldSession?.refresh_token,
      })

      const { error } = await supabaseService.supabaseClient.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Validate new password
      const { session } = await validatePassword(newPassword)

      const response = new ApiResponse({
        status: httpStatus.OK,
        message: 'OK',
        data: {
          ...session,
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

export default new AuthController()
