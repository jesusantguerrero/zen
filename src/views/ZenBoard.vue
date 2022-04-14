<template>
  <div>
    <component 
      :is="state.defaultDashboard" 
      @update="updateDashboard" 
    />
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import { firebaseState, updateSettings } from "../utils/useFirebase";
import Dashboard from "./dashboard/Dashboard.vue"
import OldDashboard from "./dashboard/OldDashboard.vue"

// state and ui
const state = reactive({
  isNewDashboard: false,
  defaultDashboard: computed(() => state.isNewDashboard ? Dashboard : OldDashboard)
});
    
state.isNewDashboard = state.isNewDashboard || !firebaseState.settings || firebaseState.settings.is_new_dashboard;
    
const updateDashboard = (isNew) => {
  debugger
  updateSettings({
    is_new_dashboard: isNew,
  }).then(() => {
    state.isNewDashboard = isNew;
  });
};
</script>

<style scoped>
  .zen__datails {
    min-height: 400px;
  }
</style>
