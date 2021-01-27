import ZenBoard from "./views/ZenBoard.vue";
import Matrix from  "./views/Matrix.vue";
import Standup from  "./views/Standup.vue";
import { createRouter, createWebHistory } from "vue-router"

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: ZenBoard },
  { path: '/matrix', component: Matrix },
  { path: '/standup', component: Standup },
]

export default createRouter({
  history: createWebHistory(),
  routes, // short for `routes: routes`
})
