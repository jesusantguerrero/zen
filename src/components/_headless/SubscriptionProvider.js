import { differenceInCalendarDays } from "date-fns";
import { defineComponent, provide, ref, toRefs, watch } from "vue";

export const SubscriptionProvider = defineComponent({
    name: "SubscriptionProvider",
    props: {
        state: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    setup(props, { slots }) {
        const getDaysLeft = (date) => {
            return differenceInCalendarDays(date, new Date());
        }

        const isSubscribed = ref(false);
        const subscription = ref(false);
        const trialEndsAt = ref(getDaysLeft(new Date()));
        const canUseProFeatures = ref(false);
        const { state } = toRefs(props);

        
        watch(() => state.value, () => {
            trialEndsAt.value = state.value && state.value.settings ? getDaysLeft(state.value.settings.trials_ends_at) : 0 
            subscription.value = state.value && state.value.settings ? state.value.settings.subscription : false;
            isSubscribed.value = Boolean(subscription.value);
            canUseProFeatures.value = isSubscribed || trialEndsAt.value > 0;
        }, { deep: true , immediate: true });

        provide('isSubscribed', isSubscribed);
        provide('trialEndsAt', trialEndsAt);
        provide('subscription', subscription);
        provide('canProFeatures', canUseProFeatures);

        return () => slots.default({
            subscribed: isSubscribed,
            trialEndsAt: trialEndsAt,
            subscription: subscription,
            canProFeatures: canUseProFeatures
        });
    },

})