<template>
  <div class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28">
    <div class="items-center justify-between mb-10 section-header md:flex">
      <h2 class="text-2xl font-bold text-left text-gray-400">Settings</h2>
    </div>
    <div class="flex space-x-5">
      <div class="w-9/12 bg-white border border-gray-200 rounded-md shadow-md">
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
import { firebaseInstance } from "../../utils/useFirebase"
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";

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
  save("connections", {...formData.value, code })
    .then(() => {
      return (location.href = `${formData.value.redirect_uri}?code=${code}&state=${formData.value.state}`);
    })
    .catch(() => {
      ElNotification({
        message: "Something went wrong",
        type: "error",
      });
    });
};
</script>
