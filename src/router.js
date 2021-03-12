import ZenBoard from "./views/ZenBoard.vue";
import Overview from "./views/Overview.vue";
import Login from "./views/Login.vue";
import Matrix from "./views/Matrix.vue";
import MatrixShared from "./views/MatrixShared.vue";
import Standup from "./views/Standup.vue";
import About from "./views/About.vue";
import Settings from "./views/Settings.vue";
import PlanAhead from "./views/PlanAhead.vue";
import Metrics from "./views/Metrics.vue";
import Landing from "./views/landing/index.vue";
import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated } from "./utils/useFirebase";

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { 
    path: "/zenboard", 
    name: "zenboard",
    component: ZenBoard,

  },
  { 
    path: "/zenboard/overview", 
    name: "overview",
    component: Overview,

  },
  { path: "/matrix", 
    component: Matrix 
  },
  { path: "/shared", 
    component: MatrixShared 
  },
  { 
    path: "/standup", 
    component: Standup 
  },
  { 
    path: "/metrics", 
    component: Metrics 
  },
  { path: "/about", 
    component: About 
  },
  { path: "/settings", 
    name: 'settings',
    component: Settings
  },
  { 
    path: "/plan-ahead", 
    component: PlanAhead, 
    name: "planAhead" 
  },
  {
    path: "/login",
    component: Login,
    name: "login",
    props: {
      mode: 'login'
    },
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/register",
    component: Login,
    name: "register",
    props: {
      mode: 'register'
    },
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/",
    component: Landing,
    name: "home",
    meta: {
      requiresAuth: false,
    },
  },
];

const myRouter = createRouter({
  history: createWebHistory(),
  routes, // short for `routes: routes`
});

myRouter.beforeEach(async (to, from, next) => {
  const user = await isAuthenticated();
  if (to.meta.requiresAuth !== false && !user) {
    next({name: "login"})
  } else if (to.meta.requiresAuth == false && user) {
    next({name: "zenboard"})
  }else {
    next();
  }
});

export default myRouter;
