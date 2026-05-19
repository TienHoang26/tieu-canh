import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,        // ← đổi thành tên biến URL trong .env của bạn
  process.env.SUPABASE_SERVICE_ROLE_KEY// ← đổi thành tên biến KEY trong .env của bạn
)

const BUCKET = 'product-images'
const LOCAL_FOLDER = './public/images' // ← đường dẫn thư mục ảnh

async function uploadFolder(localFolder, bucketFolder = '') {
  const items = fs.readdirSync(localFolder, { withFileTypes: true })

  for (const item of items) {
    const localPath = path.join(localFolder, item.name)
    const remotePath = bucketFolder ? `${bucketFolder}/${item.name}` : item.name

    if (item.isDirectory()) {
      await uploadFolder(localPath, remotePath)
    } else {
      const buffer = fs.readFileSync(localPath)
      const ext = path.extname(item.name).toLowerCase()
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
      }
      const contentType = mimeTypes[ext] || 'application/octet-stream'

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(remotePath, buffer, { contentType, upsert: true })

      if (error) {
        console.error(`❌ Lỗi: ${item.name} —`, error.message)
      } else {
        console.log(`✅ Uploaded: ${item.name}`)
      }
    }
  }
}

console.log('🚀 Bắt đầu upload ảnh...')
uploadFolder(LOCAL_FOLDER)
  .then(() => console.log('🎉 Upload hoàn tất!'))
  .catch(console.error)
