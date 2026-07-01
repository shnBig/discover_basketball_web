import {
  defineConfig,loadEnv 
} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import tailwind from 'tailwindcss';
// 1. 导入自动导入插件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
// 2. 导入 Ant Design Vue 解析器
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 手动加载当前模式下的环境变量
  const env = loadEnv(mode, path.resolve(__dirname), '')
  //加载速度优化: 🚀
  return {
    server: {
    // 开启模块预加载
    prefetch: true,
    proxy: {
      // 这里的 '/api' 是一个匹配前缀
      '/api': {
        target: env.VITE_API_BASE_URL, // 真正的后端域名
        changeOrigin: true              // 允许跨域
      }
    }
  },
  optimizeDeps: {
    // 预构建常用依赖
    include: ['vue', 'vue-router', 'pinia', 'axios']
  },
  plugins: [
    vue(),
    // 🌟 配置 1：自动导入 Vue/VueRouter API（可选）
    AutoImport({
      imports: ['vue', 'vue-router'], // 自动导入这些库的API
      dts: 'src/auto-imports.d.ts', // 生成类型声明文件（TS项目必加，JS项目可选）
      eslintrc: {
        enabled: false // 若用ESLint，可开启自动生成规则
      }
    }),
    // 🌟 配置 2：自动导入 Ant Design Vue 组件（核心）
    Components({
      dirs: ['src/components'], // 可选：自动导入自定义组件（如src/components下的组件）
      dts: 'src/components.d.ts', // 生成组件声明文件（可选）
      resolvers: [
        // 解析 Ant Design Vue 组件
        AntDesignVueResolver({
          importStyle: false, // 关键：禁用插件自动导入样式（避免路径错误）
          resolveIcons: true // 可选：自动导入图标组件（如<a-icon>）
        })
      ]
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@views': path.resolve(__dirname, 'src/views')
    }
  },
  // 构建优化（可选）
  build: {
    chunkSizeWarningLimit: 1000, // 增大体积警告阈值
    minify: 'terser', // 更彻底的压缩
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true // 移除 debugger
      }
    }
  }
  }
})