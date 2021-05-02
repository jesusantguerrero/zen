<template>
  <div class="circle-container p-1 flex justify-center items-center" ref="container">
        <svg
            :height="containerSize"
            :width="containerSize"
        >
            <circle 
                class="circle-progress__ring"
                fill="transparent" 
                ref="CircleRing"
                :cx="size" 
                :cy="size" 
                :r="radius" 
                :stroke="color" 
                :stroke-width="strokeWidth"
            />
        </svg>
  </div>
</template>

<script>
import { computed, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import { toRefs } from '@vueuse/core';
export default {
    props: {
        modelValue: {
            type: Number,
            default: 0
        },
        strokeWidth: {
            type: Number,
            default: 3
        },
        color: {
            type: String,
            default: 'blue'
        },
    },
    setup(props) {
        const container = ref(null);
        const CircleRing = ref(null);
        const { modelValue } = toRefs(props);
        const state = reactive({
            mounted: false,
            containerSize: computed(()=> {
                return state.mounted && container.value ? container.value.clientWidth: document.querySelector('.circle-container') && document.querySelector('.circle-container').clientWidth;
            }),
            size: computed(()=> {
                return (state.containerSize / 2);
            }),
            circuference: computed(() => {
                return state.radius * 2 * Math.PI
            }),
            radius: computed(() => {
                const r = (state.containerSize / 2) - (props.strokeWidth * 2);
                return r < 0 ? 1 : r;
            }),
            offset: computed(() => {
                return state.circuference - props.modelValue / 100 * state.circuference;
            })
        })

        watch(modelValue, () => {
            if (CircleRing.value) {
                CircleRing.value.style.strokeDashoffset = state.offset;
            }
        });

        onMounted(() => {
            state.mounted = true;
            CircleRing.value.style.strokeDasharray = `${state.circuference} ${state.circuference}`;
            CircleRing.value.style.strokeDashoffset = state.offset;
        })

        return {
            container,
            CircleRing,
            ...toRefs(state)
        }
    }
}
</script>

<style lang="scss" scoped>
    .circle-progress__ring {
        transition: stroke-dashoffset .35s;
        transform: rotate(-90deg);
        transform-origin: center;
    }
</style>>
