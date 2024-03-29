// marketing
import Landing from "./views/landing/index.vue";
import Privacy from "./views/Privacy.vue"
import Terms from "./views/Terms.vue"

// auth
import Login from "./views/auth/Login.vue";
import OauthAccept from "./views/auth/OauthAccept.vue";
import OauthConnect from "./views/auth/OauthConnect.vue";

// Zen
import ZenBoard from "./views/Zenboard/Zen.vue";
import Home from "./views/Zenboard/Overview.vue";

import Matrix from "./views/Matrix/MatrixBase.vue";
import MatrixShared from "./views/Matrix/MatrixShared.vue";
import PlanAhead from "./views/Matrix/PlanAhead.vue";

import Standup from "./views/Standup/Overview.vue";
import Metrics from "./views/Metrics/Overview.vue";

import Collect from "./views/collect/index.vue";
// App
import Settings from "./views/Settings.vue";
import About from "./views/About.vue";
import Notifications from "./views/Notifications/Notifications.vue";

import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated, registerEvent, setScreen } from "./plugins/useFirebase";


// import { BrainRoutes, BrainView } from "@__apps/brain/routes";
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
    name: 'matrix',
    component: Matrix 
  },
  { path: "/matrix/shared", 
    name: 'matrixShared',
    component: MatrixShared 
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
    name: "planAhead",
    redirect: { name: "matrix" },
  },
  { 
    path: "/collect", 
    component: Collect, 
    name: "collect" 
  },
  { 
    path: "/notifications", 
    component: Notifications, 
    name: "notifications" 
  },
  {
    path: "/timer",
    name: "timer",
    component: () => import("./views/Timer/Timer.vue"),
    meta: {
      requiresAuth: true,
    }},
    {
        path: '/timer-unfinished',
        name: 'DateTimerUnfinished',
        component: () => import("./views/Timer/TimerUnfinished.vue"),
        meta: {
          requiresAuth: true,
        }
    },
  // {
  //   path: "/brain",
  //   name: "brain",
  //   component: BrainView,
  //   meta: {
  //     requiresAuth: true,
  //   },
  //   children: BrainRoutes
  // },
  // {
  //   path: "/shapeup",
  //   name: "shapeup",
  //   component: BrainView,
  //   meta: {
  //     requiresAuth: true,
  //   },
  //   children: BrainRoutes
  // },
  {
    path: "/pricing",
    component: () => import("./views/Pricing.vue"),
    name: "pricing",
    meta: {
      requiresAuth: false,
    },
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

myRouter.afterEach((to,) => {
  setScreen(to.name);
  registerEvent('page_view', {
      page_location: to.fullPath,
      page_path: to.path,
      page_title: to.name
  })
})

export default myRouter;
