import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import "./assets/css/tailwind.css" 
import "ant-design-vue/dist/reset.css";
import components from './components'

dayjs.locale('zh-cn')

const app = createApp(App)
app.config.globalProperties.$antLocale = zhCN
app.use(createPinia())
app.use(router)
app.use(components)
app.mount('#app')