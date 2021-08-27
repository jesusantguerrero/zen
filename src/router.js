import Landing from "./views/landing/index.vue";
import Login from "./views/Login.vue";
import Home from "./views/Home.vue";
import ZenBoard from "./views/ZenBoard.vue";
import Matrix from "./views/Matrix.vue";
import Standup from "./views/Standup.vue";
import Metrics from "./views/Metrics.vue";
import PlanAhead from "./views/PlanAhead.vue";
import About from "./views/About.vue";
import OauthAccept from "./views/auth/OauthAccept.vue";
import OauthConnect from "./views/auth/OauthConnect.vue";
import Settings from "./views/Settings.vue";
import Privacy from "./views/Privacy.vue"
import Terms from "./views/Terms.vue"
import Notifications from "./views/Notifications.vue";
import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated } from "./utils/useFirebase";

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
export const routes = [
  { 
    path: "/home",
    name: "home",
    component: Home,
  },
  { 
    path: "/zenboard", 
    name: "zenboard",
    component: ZenBoard,

  },
  { path: "/matrix", 
    component: Matrix 
  },
  { 
    path: "/metrics", 
    component: Metrics 
  },
  { 
    path: "/standup", 
    component: Standup 
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
    path: "/notifications", 
    component: Notifications, 
    name: "notifications" 
  },
  {
    path: "/terms",
    component: Terms,
    name: "terms",
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/privacy-policy",
    component: Privacy,
    name: "privacy",
    meta: {
      title: 'Privacy policy - Zen',
      requiresAuth: false,
    },
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
    path: "/oauth2/authorize",
    component: Login,
    name: "oauthLogin",
    props: {
      mode: 'oauth'
    },
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/oauth2/accept",
    component: OauthAccept,
    name: "oauthAccept",
    props: {
      mode: 'oauth'
    }
  },
  {
    path: "/oauth2/connect/:service",
    component: OauthConnect,
    name: "oauthConnect",
    props: {
      mode: 'oauth'
    }
  },
  {
    path: "/",
    component: Landing,
    name: "landing",
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
    if (['oauthLogin'].includes(to.name, from.name)) {
      return next({ name: "oauthAccept", query: to.query })
    }
    next({name: "zenboard"})
  } else {
    next();
  }
});

export default myRouter;
