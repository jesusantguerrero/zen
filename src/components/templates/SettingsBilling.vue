<template>
  <div class="px-16 py-5 text-left">
    <h1 class="pb-16 text-2xl font-bold text-center">Get Premium</h1>
    <div class="w-full px-5 text-left md:flex">
      <div class="w-full md:w-9/12">
        <h4 class="text-xl font-bold">
          Subscribers receive these usefull benefits!
        </h4>
        <ul class="space-y-4">
          <li v-for="feat in proFeatures" :key="feat" >
            {{ feat }}
          </li>
        </ul>
      </div>

      <div class="w-full">
        <billing-plan-selector 
            :pricing="pricing"
            v-if="!selectedPrice" 
        />
         <billing-plan
            v-else
            :pricing="pricing"
        />
        
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs} from "vue";
import { firebaseState } from "../../utils/useFirebase";
import BillingPlanSelector from '../organisms/BillingPlanSelector.vue';
import BillingPlan from '../organisms/BillingPlan.vue';
export default {
  components: { BillingPlanSelector, BillingPlan },
  name: "SettingsBilling",
  setup() {
    const state = reactive({
      proFeatures: [
        // "Unlimited Zen/Spaces",
        // "Projects",
        // "Weekly View Planner/ Weekly Standup View",
        "Shared Lists",
        "Tasks reminders",
        "Recurrent tasks",
        "Pictures support in tasks",
        "Voice support in tasks"
      ],
      pricing: {
        1: {
          plan_id: "P-8T562619CX248525SMAFOZUY",
          price: 4.95,
        },
        3: {
          plan_id: "",
          price: 12,
        },
        6: {
          plan_id: "P-8T562619CX248525SMAFOZUY",
          price: 25,
        },
        12: {
          plan_id: "P-8T562619CX248525SMAFOZUY",
          price: 40,
        },
      },
      selectedPrice: firebaseState.settings.selectedPrice
    });

    return {
      ...toRefs(state)
    };
  },
};
</script>
