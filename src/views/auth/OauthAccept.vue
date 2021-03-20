<template>
  <div class="pt-24 md:pt-28 pb-20 mx-5 md:mx-28">
    <div class="section-header md:flex justify-between items-center mb-10">
      <h2 class="text-2xl font-bold text-gray-400 text-left">Settings</h2>
    </div>
    <div class="flex space-x-5">
      <div class="bg-white rounded-md border border-gray-200 shadow-md w-9/12">
        <div class="example-display__presenter">
          <button class="" @click="accept">Accept</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useCollection } from "../../utils/useCollection";
import { v4 as uuid } from "uuid";
import { onMounted, reactive, ref } from "vue";

const route = useRoute();
const formData = ref({});
onMounted(() => {
  if (route && route.query) {
    formData.value = {
      client_id: route.query.client_id,
      state: route.query.state,
      redirect_uri: route.query.redirect_uri,
      response_type: route.query.response_type,
    };
  }
});

const accept = async () => {
  const { save } = useCollection();

  const code = uuid();

  await save("onetimecode", {
    code: code,
  });

  save("connections", formData.value)
    .then(() => {
      return (location.href = `${formData.value.redirect_uri}?code=${code}&state=${formData.value.state}`);
    })
    .catch(() => console.log("error"));
};
</script>
