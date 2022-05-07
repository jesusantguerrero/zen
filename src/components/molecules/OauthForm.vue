<template>
    <form @submit.prevent="onSubmit">
        <h1>Oauth Form</h1>
        <template v-for="(formRow, rowName) in schema">
            <div v-if="formRow.section" class="flex">
                <FormField 
                    v-for="(rowField, rowFieldName) in formRow.section"
                    :label="rowField.label" 
                    :field="rowFieldName" 
                    :required="rowField.required"
                    v-model="formData[rowFieldName]" 
                />
                {{ rowField }}
            </div>
            <FormField 
                v-else
                :label="formRow.label" 
                :field="rowName" 
                :required="formRow.required"
                v-model="formData[rowName]" 
            />
        </template>
        <div class="flex justify-between mt-5">
            <AtButton type="secondary" rounded @click.prevent="$emit('cancel')" attr-type="button"> Back</AtButton>
            <AtButton type="success" @click="onSubmit()" rounded >Save Application</AtButton>
        </div>
    </form>
</template>

<script setup>
import FormField from './FormField.vue';
import { useForm, AtButton } from "atmosphere-ui"
const emit = defineEmits(['submit', 'cancel']);

const schema = {
    name: {
        label: "Name",
        required: true,
    },
    description: {
        label: "Description",
        required: true,
    },
    website: {
        label: "Website URL",
        required: true,
    },
    policy: {
        label: "Policy URL",
        required: true,
    },
    redirect: {
        label: "Redirect URLs",
        required: true,
    },
}
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

const isRow = (formRow) => {
    console.log(Array.isArray(formRow), formRow);
    return Array.isArray(formRow);
}
</script>
