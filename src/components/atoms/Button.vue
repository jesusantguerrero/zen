<template>
  <button class="at rounded-md relative focus:outline-none overflow-hidden" ref="Button">
    <div class="hover-effect w-full h-full py-2 px-2 flex items-center justify-center">
        <slot></slot>
    </div>
  </button>
</template>


<style lang="scss">
.at {
    .hover-effect {
        max-height: 37px;
    }
    &:hover {
       .hover-effect {
           background: rgba(0,0,0, .1);
       }
    }
}

</style>
