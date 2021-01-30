import ZenBoard from "./views/ZenBoard.vue";
import Matrix from  "./views/Matrix.vue";
import Standup from  "./views/Standup.vue";
import About from  "./views/About.vue";
import PlanAhead from  "./views/PlanAhead.vue";
import { createRouter, createWebHistory } from "vue-router"

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: ZenBoard },
  { path: '/matrix', component: Matrix },
  { path: '/standup', component: Standup },
  { path: '/about', component: About },
  { path: '/plan-ahead', component: PlanAhead, name: 'planAhead' },
]

export default createRouter({
  history: createWebHistory(),
  routes, // short for `routes: routes`
})
