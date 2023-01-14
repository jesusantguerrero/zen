import { createApp } from 'vue'
import App from './App.vue'
import "vue-temporal-components/dist/style.css";
import "./assets/scss/main.scss";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueFinalModal from "vue-final-modal"
import router from "./router"
import { createPinia } from 'pinia'
import mitt from "mitt";

const eventBus = mitt()
window.EventBus = eventBus


createApp(App)
.use(createPinia())
.use(router)
.use(VueFinalModal())
.use(ElementPlus)
.mount('#app')