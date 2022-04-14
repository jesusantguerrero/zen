import { reactive, onMounted, onUnmounted, toRefs } from "vue"
import { handleSnapshot } from "."


export const useSnapshot = (handler) => {
    const state = reactive({
        list: [],
        snapRef: null,
    })
    const fetchSnap = () => handler().then((snapRef) => {
        handleSnapshot(snapRef, (list) => {
            state.list = list
        })
    })

    onMounted(async () => {
        state.snapRef = await fetchSnap()
    })

    onUnmounted(() => {
        state.snapRef && state.snapRef.off()
    })

    return {
        ...toRefs(state)
    }
}