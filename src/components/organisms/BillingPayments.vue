<template>
    <div class="subscriptions__container">
        <h4 class="mx-2 mb-2 text-lg font-bold text-gray-400">Payment history</h4>
        <table class="w-full border-2 border-gray-300 rounded-md table-auto" v-if="transactions">
            <thead class="bg-gray-200">
                <tr class="font-bold text-left border-b-2 border-gray-300">
                <th class="px-5 py-2"> Date </th>
                <th class="py-2"> Description </th>
                <th class="py-2"> Amount </th>
                <th class="px-5 py-2"> </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="transaction in transactions" :key="transaction.id" class="font-bold text-gray-500 bg-gray-50">
                <td class="px-5 py-2"> {{ dateFormat(transaction.time) }}</td>
                <td class="py-4"> <a  href="#" class="font-bold text-green-400 underline"> Invoice {{ getInvoiceName(transaction.time) }} </a> </td>
                <td class="py-4"> {{ transaction.amount_with_breakdown.gross_amount.currency_code }} {{ transaction.amount_with_breakdown.gross_amount.value }}</td>
                <td class="px-5 py-4"> Download: <a href="#" class="font-bold text-green-400 underline">PDF</a> - <a href="#" class="font-bold text-green-400 underline"> CSV</a></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { format } from 'date-fns';

export default {
    props: ["sessions", "transactions"],
    methods: {
        sendSubscriptionAction(subscription, actionName) {
            const url = `/v2/subscriptions/${subscription.id}/agreement/${subscription.agreement_id}/${actionName}`;
            axios.post(url).then(() => {
                this.$inertia.reload();
            });
        },

        dateFormat(date) {
            return format(new Date(date), "MMM dd, yyyy");
        },

        getInvoiceName(date) {
            return format(new Date(date), "MMMM yyyy");
        }
    }
};
</script>
