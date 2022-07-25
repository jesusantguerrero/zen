<template>
  <div class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28">
    <div class="items-center justify-between mb-10 section-header md:flex">
      <h2 class="text-2xl font-bold text-left text-gray-400">Settings</h2>
    </div>
    <div class="flex space-x-5">
      <div class="w-9/12 bg-white border border-gray-200 rounded-md shadow-md">
        <article class="example-display__presenter">
          <header class="py-3 border-b">
            Application wants to Connect with Zen.
          </header>
          <section>
              <h4 class="mb-0">Tasks & Tracks
              
                <small>Private tasks and tracks</small>
              </h4>

              <section class="max-w-md mx-auto mt-4">
                <p>
                  This application will be able to read and write to Zen
                </p>
                <ul>
                  <li>Tasks</li>
                  <li>Tracks</li>
                  <li>Tags</li>
                </ul>
              </section>
          </section>
          <footer class="py-3 space-x-2">
            <AtButton class="text-white bg-gray-500 rounded-md" @click="cancel">Cancel</AtButton>
            <AtButton class="text-white bg-green-500 rounded-md" @click="accept">Accept</AtButton>
          </footer>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useCollection } from "../../utils/useCollection";
import { AtButton } from "atmosphere-ui";
import { v4 as uuid } from "uuid";
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

const cancel = async () => {
  const code = uuid();
  return (location.href = `${formData.value.redirect_uri}?code=${code}&state=${formData.value.state}`);
};
</script>
