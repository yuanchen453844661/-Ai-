import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    define: {
      // 1. 将 API_KEY 精确注入
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
      // 2. 将 process.env 定义为空对象，防止第三方库访问 process.env 时报错 "process is not defined"
      'process.env': {},
    },
  };
});