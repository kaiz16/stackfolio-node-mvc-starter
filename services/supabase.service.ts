import Environment from '../config/environment.js'
import Supabase from '@supabase/supabase-js'

class SupabaseService {
  supabaseClient: Supabase.SupabaseClient

  constructor() {
    this.supabaseClient = Supabase.createClient(
      Environment.config().supabaseUrl,
      Environment.config().supabaseServiceRoleKey,
    )
  }

  writeToSupabaseBucket = async (
    bucketName: string,
    filePath: string,
    file: any,
    contentType: string,
  ) => {
    if (contentType === 'application/json') {
      await this.supabaseClient.storage
        .from(bucketName)
        .upload(filePath, JSON.stringify(file), { contentType })
    } else {
      await this.supabaseClient.storage
        .from(bucketName)
        .upload(filePath, file, { contentType })
    }

    const {
      data: { publicUrl },
    } = this.supabaseClient.storage.from(bucketName).getPublicUrl(filePath)

    return publicUrl
  }
}

export default SupabaseService
