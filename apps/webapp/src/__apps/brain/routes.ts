import Index from "./pages/index.vue"
import Cycles from "./pages/Cycles.vue"

export const BrainRoutes = [
    {
        path: '/',
        component: Cycles
    },
    {
        path: '/cycles',
        component: Cycles
    }
]

export const BrainView = Index; 