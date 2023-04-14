<template>
  <div 
    class="px-5 py-3 cursor-pointer hover:bg-gray-50"
    :class="{'bg-gray-200': !notification.read_at}"
    @click="runNotificationAction(notification)"
>
    <span class="font-bold" v-if="notification.data.title">{{ notification.data.title }}:</span> {{ notification.data.message }}
</div>
</template>

<script>
import { useRouter } from "vue-router"
import { useCollection } from '../../utils/firebase/useCollection';

export default {
    props: {
        notification: {
            type: Object,
            required: true
        }
    },
    setup(props) {
        const { push } = useRouter();
        const { update } = useCollection();
        
        const runNotificationAction = async () => {
            await update('notifications', {
                ...props.notification,
                read_at: new Date()
            });
            
            if (props.notification.data.action == 'stale') {
                push('/matrix?tab-matrix:stale')
            }else if (props.notification.data.action == 'overdue') {
                push('/matrix?tab=matrix:overdue')
            }
        }

        return {
            runNotificationAction
        }
    },
}
</script>

<style>

</style>