import { createApp } from 'vue'
import App from './App.vue'
import router from './renderer/router'
import './renderer/assets/css/style.css'

createApp(App)
.use(router)
.mount('#app')
