export interface EnvironmentSetting {
  name: string | null
  debug: boolean
  port: number
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceRoleKey: string
  resendApiKey: string
  hasuraEndpoint: string
  hasuraAdminSecret: string
}

export interface EnvironmentConfig {
  [key: string]: EnvironmentSetting
}
