import * as dotenv from 'dotenv'
dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
})

import {
  type EnvironmentSetting,
  type EnvironmentConfig,
} from '../interfaces/environment.interface.js'

class Environment {
  private static configs: EnvironmentConfig = {
    development: {
      name: process.env.NODE_ENV,
      debug: true,
      port: Number(process.env.PORT),
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      resendApiKey: process.env.RESEND_API_KEY,
      hasuraEndpoint: process.env.HASURA_ENDPOINT,
      hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET,
    },
    production: {
      name: process.env.NODE_ENV,
      debug: false,
      port: Number(process.env.PORT),
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      resendApiKey: process.env.RESEND_API_KEY,
      hasuraEndpoint: process.env.HASURA_ENDPOINT,
      hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET,
    },
  }

  /**
   * Get environment settings
   */
  public static config(): EnvironmentSetting {
    if (!process.env.NODE_ENV) {
      throw new Error('NODE_ENV is not defined')
    }
    return this.configs[process.env.NODE_ENV.toLowerCase()]
  }
}

export default Environment
