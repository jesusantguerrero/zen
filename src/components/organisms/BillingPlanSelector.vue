<template>
   <div
          class="overflow-hidden bg-white border divide-y-2 rounded-md shadow-md plan-selector"
        >
          <div
            class="px-4 py-5 bg-white cursor-pointer"
            v-for="(price, months) in pricing"
            :key="months"
            :class="{ 'text-blue-500': months == selectedPrice }"
            @click="selectedPrice = months"
          >
            <i
              :class="
                selectedPrice == months
                  ? 'fas fa-check-circle'
                  : 'far fa-circle'
              "
            ></i>
            Recurring <span class="font-bold"> {{ price.price }} USD</span> every
            <span class="font-bold"> {{ months }} months </span>
          </div>
          <div
            class="flex flex-col px-10 py-16 space-y-3"
            ref="buttonsContainer"
          ></div>
        </div>
</template>

<script>
import { onMounted, reactive, toRefs, ref, computed } from "vue";
import { firebaseState, updateSettings } from "../../utils/useFirebase";
export default {
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
                return props.pricing[state.selectedPrice] && props.pricing[state.selectedPrice].plan_id
            } 
            return "";
        })
      });
      const buttonsContainer = ref(null);
      onMounted(() => {
        paypal
          .Buttons({
            style: {
              shape: "rect",
              color: "black",
              layout: "horizontal",
              label: "subscribe",
            },

            createSubscription(data, actions) {
              return actions.subscription.create({
                plan_id: state.selectedPlan,
              });
            },

            onApprove(data) {
              data.plan_id = state.selectedPlan;
              updateSettings({
                subscription: data,
                selectedPrice: state.selectedPrice
              });
            },
          })
          .render(buttonsContainer.value);
      });

      return {
        ...toRefs(state),
        buttonsContainer,
      };
    },
}
</script>