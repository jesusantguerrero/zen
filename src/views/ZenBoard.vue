<template>
  <component :is="defaultDashboard" @update="updateDashboard"></component>
</template>

<script>
import { reactive, computed } from "vue";
import { firebaseState, updateSettings } from "../utils/useFirebase";
import { toRefs } from '@vueuse/core';
import Dashboard from "./Dashboard.vue"
import OldDashboard from "./OldDashboard.vue"

export default {
  components: {
    OldDashboard,
    Dashboard
  },
  setup() {
    // state and ui
    const state = reactive({
      isNewDashboard: false,
      defaultDashboard: computed(() => state.isNewDashboard ? 'Dashboard' : 'OldDashboard')
    
    });
    
    state.isNewDashboard = state.isNewDashboard || !firebaseState.settings || firebaseState.settings.is_new_dashboard;
    
    const updateDashboard = (isNew) => {
      updateSettings({
        is_new_dashboard: isNew,
      }).then(() => {
        state.isNewDashboard = isNew;
      });
    };
    
    return {
      updateDashboard,
      ...toRefs(state)
    }
  }

}

</script>

<style scoped>
  .zen__datails {
    min-height: 400px;
  }
</style>
