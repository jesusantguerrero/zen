<template>
<div class="w-full">
    <label :for="id">{{ label }}</label>
    <component
        :is="tag"
        ref="input"
        :id="id"
        :placeholder="label"
        :value="value"
        class="block w-full px-2 py-1 bg-transparent border-b border-gray-200 focus:outline-none focus:border-emerald-400"
        @input="$emit('input', $event.target.value)"
    />
    <small class="block text-red-400" v-if="errorMessage">{{ prettyError }}</small>
</div>
</template>

<script>
import { randomUUID } from "crypto";

export default {
    name: "FormField",
    props: {
        value: {
            type: String,
            default: "",
        },
        field: {
            type: String,
            required: true,
        },
        errors: {
            type: Object,
            default: () => ({}),
        },
        tag: {
            type: String,
            default: "input",
        },
        label: {
            type: String,
            default: "",
        },
    },
    watch: {
        value(value) {
            if (!value) {
                this.$refs.input.value = "";
            }
        },
    },
    data() {
        return {
            id: randomUUID(),
        }
    },
    computed: {
        errorMessage() {
            return this.errors[this.field];
        },
        prettyError() {
            return this.errorMessage && this.errorMessage.replace(this.field, this.label);
        },
    }
}
</script>
