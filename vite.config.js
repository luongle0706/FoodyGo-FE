import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'admin.foodygo.theanh0804.id.vn', // Chạy server trên domain này
    strictPort: true, // Đảm bảo chạy trên một cổng cố định
    cors: true, // Cho phép CORS nếu cần
    origin: 'https://admin.foodygo.theanh0804.id.vn', // Xác định nguồn gốc truy cập
  },
})
