import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  // 第三个参数传 '' 表示加载所有变量，而不仅仅是 VITE_ 开头的
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    define: {
      // 将 process.env 定义为一个包含 API_KEY 的对象
      // 这样既防止了 "process is not defined" 错误，又确保了 process.env.API_KEY 有值
      'process.env': {
        API_KEY: env.API_KEY
      },
    },
  };
});