import Index from "./pages/index.vue"
import Cycles from "./pages/Cycles.vue"

export default [
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