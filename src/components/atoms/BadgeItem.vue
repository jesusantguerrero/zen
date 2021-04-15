<template>
  <div class="flex">
    <div class="prize-badge text-white bg-yellow-500 w-14 h-16 ring ring-yellow-400 ring-offset-2 rounded-md flex flex-col justify-center items-center">
        <slot>
            <i class="fa text-3xl" :class="badge.iconClass"></i>
        </slot>
        <div class="text-xs">Level {{ badge.level }}</div>
    </div>
    <div class="ml-3">
      <span class="text-yellow-500"> {{ badge.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
    props: {
        badge:{
            type: Object,
            required: true
        }
    }
};
</script>

<style lang="scss">
  .prize-badge {
    position: relative;
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
