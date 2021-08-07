<template>
  <div
          class="overflow-hidden bg-white border divide-y-2 rounded-md shadow-md plan-selector"
        >
          <div
            class="px-4 py-5 bg-white cursor-pointer"
          >
            <i class="fas fa-check-circle"
            ></i>
            Recurring <span class="font-bold"> {{ selectedPlan.price }} USD</span> every
            <span class="font-bold"> {{ selectedPrice }} months </span>
          </div>
          <div
            class="flex flex-col px-10 py-16 space-y-3"
            ref="buttonsContainer"
          >
            <button
                class="inline-block px-5 py-2 text-white capitalize transition bg-red-500 rounded-md hover:bg-red-400"
                @click="onCancelSubscription"
            >
                Cancel
            </button>
          </div>
  </div>
  <div class="mt-10 mb-5">
    <BillingPayments :transactions="transactions" />
  </div>
</template>

<script>
import { reactive, toRefs, computed } from "vue";
import { firebaseInstance, firebaseState, functions } from "../../utils/useFirebase";
import { ElNotification } from 'element-plus';
import BillingPayments from "./BillingPayments.vue";

export default {
    components: {
      BillingPayments
    },
    props: {
        pricing: {
            type: Object,
            required: true
        }
    },
    name: "SettingsBilling",
  setup(props) {
    const state = reactive({
      selectedPrice: firebaseState.settings.selectedPrice ?? 1,
      selectedPlan: computed(() => {
          if (state.selectedPrice) {
              return props.pricing[state.selectedPrice]
          } 
          return null;
      }),
      selectedPlanId: computed(() => {
          if (state.selectedPrice) {
              return props.pricing[state.selectedPrice] && props.pricing[state.selectedPrice].plan_id
          } 
          return "";
      }),
      transactions: []
    });
    
    const Subscriptions = functions.httpsCallable('subscription');

    const onCancelSubscription = () => {
      Subscriptions({ type: 'cancel' }).then(() => {
        ElNotification({
          message: "Canceled",
          type: "success",
          title: "Success"
        })
        location.reload();
      }).catch(() =>
        console.log("error")
      )
    }

    const getPayments = async () => {
    
    const { data } = await Subscriptions({ type: 'transactions' });
      state.transactions = data;
    }

    getPayments()

    return {
      ...toRefs(state),
      onCancelSubscription
    };
  },
}
</script>