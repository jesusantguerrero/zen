<template>
<textarea 
    ref="descriptionInput"
    v-model="localValue"
    placeholder="Add a short description"
    class="overflow-hidden transition-all resize-none"
    @input="onInput()">
</textarea>
</template>

<script setup>
import { watch, ref, onMounted } from "vue";


const props = defineProps({
    modelValue: String
});
const emit = defineEmits({
    'update:modelValue': String
})
const localValue = ref('');

watch(() => props.modelValue, (value) => {
    localValue.value = value 
}, { immediate: true})


// Heigith
const descriptionInput = ref(null);
const setHeight = () => {
  setTimeout(() => {
    const description = descriptionInput.value || "";
    if (!description) {
      return
    }
    description.style.height = "";
    description.style.height = (description.scrollHeight) + "px"
  })
}


onMounted(() => {
  setHeight()
})

const onInput = () => {
    setHeight()
    emit('update:modelValue', localValue.value)
}

</script>

<style>

</style>