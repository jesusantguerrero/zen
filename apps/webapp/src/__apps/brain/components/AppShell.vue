<script  lang="ts" setup>
import { useAuthState } from 'lumiere-utils/useAuth'
import AppHeader from '~/components/organisms/AppHeader.vue'
import AppSide from '~/components/organisms/AppSide.vue'
import config from '~/config'

const { user, provider: { logout } } = useAuthState()
const goToHome = () => {
  location.reload()
}

const signOut = () => {
  logout(goToHome)
}
</script>

<template>
  <main class="relative h-screen min-h-screen app-shell">
    <AppHeader :title="config.appName" :user="user" class="fixed top-0 z-50 w-full bg-white" @logout="signOut" />
    <div class="app-shell__content">
      <aside class="app-shell__side">
        <AppSide :title="config.appName" />
      </aside>
      <div class="border-l app-shell__inner ic-scroller">
        <slot />
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.app-shell {
    &__content {
        display: grid;
        grid-template-columns: 200px minmax(0, 1fr);
        position: relative;
        height: 100vh;
    }

    &__side {
        padding-right: 0 !important;
        position: fixed;
        display: grid;
        width: 200px;
        height: 100%;
        z-index: 1001;
    }

    &__inner {
        width: 100%;
        grid-column-start: 2;
        padding: 65px 0;
        padding-bottom: 0;
        position: relative;
        max-height: 100%;
        transition: all ease 0.3s;

    &.header-replacer-mode {
      padding-top: 0;

      .header-replacer {
        height: 73px;
        margin: 0;
        position: fixed;
        left: 0;
        top: 0;
        display: flex;
        width: 100%;
        z-index: 1000;
        background: white;
        align-items: center;
        padding: 0 10px;
      }

      .section-body {
        padding-top: 140px;
      }
    }
  }
}

.ic-scroller {
    &::-webkit-scrollbar-thumb {
        background-color: transparentize($color: #000000, $amount: 0.7);
        border-radius: 4px;

        &:hover {
            background-color: transparentize($color: #000000, $amount: 0.7);
        }
    }

    &::-webkit-scrollbar {
        background-color: transparent;
        width: 8px;
        height: 10px;
    }

    &-slim {
        transition: all ease .3s;
        &::-webkit-scrollbar {
            height: 0;
        }

        &:hover {
            &::-webkit-scrollbar {
                height: 3px;
            }
        }
    }
}
</style>
