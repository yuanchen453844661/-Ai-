import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    define: {
      // 将 Vercel 环境变量中的 API_KEY 注入到前端代码的 process.env.API_KEY 中
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    },
  };
});