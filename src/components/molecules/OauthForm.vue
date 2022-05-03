<template>
    <form @submit.prevent="onSubmit">
        <h1>Oauth Form</h1>
        <FormField label="Name" field="name" v-model="formData.name" />
        <FormField label="Description" field="description" v-model="formData.description" />
        <FormField label="Website URL" field="website" v-model="formData.website" />
        <FormField label="Policy URL" field="policy" v-model="formData.policy" />
        <FormField label="Redirect URLs" field="redirects" v-model="formData.redirect" />
        <div class="flex justify-between">
            <AtButton type="button" @click="$emit('cancel')"> Back</AtButton>
            <button type="submit" @click="onSubmit()">Save Application</button>
        </div>
    </form>
</template>

<script setup>
import FormField from './FormField.vue';
import { useForm, AtButton } from "atmosphere-ui"
const emit = defineEmits(['submit', 'back']);

const formData = useForm({
    name: "",
    description: "",
    website: "",
    policy: "",
    redirect: "",
}, {
    emit,
})

const onSubmit = (e) => {
    formData.submit('submit');
}
</script>
