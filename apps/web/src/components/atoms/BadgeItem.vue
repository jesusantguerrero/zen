<template>
  <div class="prize" ref="prize">
    <div class="prize-badge ring ring-yellow-400 ring-offset-2" :style="prizeBadgeStyle">
        <slot>
            <i class="fa prize__icon" :class="badge.iconClass"></i>
        </slot>
        <div class="prize__body" v-if="badge.level">Level {{ badge.level }}</div>
    </div>
    <div class="prize__description" v-if="badge.name">
      <span :style="prizeNameStyle" class="font-bold"> {{ badge.name }}</span>
    </div>
  </div>
</template>

<script>
import { computed, reactive, toRefs } from 'vue';

export default {
    props: {
        badge:{
            type: Object,
            required: true
        },
        themeColor: {
          type: String,
          default: 'rgb(245, 158, 11)'
        }
    },
    setup(props) {
      const state = reactive({
        prizeBadgeStyle: computed(() => {
          return {
            backgroundColor: props.themeColor
          }
        }),
        prizeNameStyle: computed(() => {
          return {
            color: props.themeColor
          }
        })
      })

      return {
        ...toRefs(state)
      }
    }
};
</script>

<style lang="scss">
  :root {
    --color: rgb(245, 158, 11);
    --offset-with: 2px
  }

  .prize {
    display: flex;

    &__icon {
       font-size: 1.875rem/* 30px */;
        line-height: 2.25rem/* 36px */;
    }

    &__body {
      font-size: 0.75rem/* 12px */;
      line-height: 1rem/* 16px */;
    }

    &__description {
      margin-left: 1rem;
      color: var(--color);
    }
  }

  .prize-badge {
    position: relative;
    color: white;
    height: 4rem;
    width: 3.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.375rem;
    flex-direction: column;
    --tw-ring-offset-shadow: 2 0 0 0 var(--offset-width) var(--color);
    --tw-ring-shadow: 2 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--color);

    &::after {
      position: absolute;
      content: '';
      background: white;
      top: 0;
      left: 0;
      width: 50%;
      height: 100%;
      opacity: .3;
    }
  }
</style>
