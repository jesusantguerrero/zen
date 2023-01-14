import { createApp } from 'vue'
import App from './App.vue'
import "vue-temporal-components/dist/style.css";
import "./assets/scss/main.scss";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueFinalModal from "vue-final-modal"
import router from "./router"
import { createPinia } from 'pinia'

createApp(App)
.use(createPinia())
.use(router)
.use(VueFinalModal())
.use(ElementPlus)
.mount('#app')
