<template>
  <div class="pt-24 mx-5 md:pt-28 md:mx-28">
    <div class="mb-20 md:flex" v-if="false">
      <div class="max-w-8xl mx-auto sm:px-6 lg:px-8 flex">
        <a
          href="https://slack.com/oauth/v2/authorize?scope=commands,users.profile:write&client_id=461198650023.1793899340544"
          ><img alt="Add to Slack" height="40" width="139"
          src="https://platform.slack-edge.com/img/add_to_slack.png"
          srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x,
          https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a
        >
      </div>
    </div>

    <div v-if="false">
       <h2 class="text-3xl font-extrabold pb-10">Billing</h2>
       <div class="flex w-full px-52">
         <div class="w-full text-left">
          <h4 class="font-bold text-xl">Subscription Features</h4> 
          <ul>
            <li v-for="feat in premiumFeatures" :key="feat" class="text-left">
              {{ feat }}
            </li>
          </ul>
         </div>
         
         <div class="w-full">
          <div class="border-2 rounded-md py-4 bg-white w-full">
            <h4 class="font-bold">
                Premium
            </h4>
              <div class="text-sm">
                Recurring every month
              </div>
              <button class="bg-gray-600 text-white px-2 py-2 rounded-md mt-5 focus:outline-none" > Subscribe </button>
          </div>

         </div>
        </div>  
    </div>
  </div>
</template>


<script setup>


const premiumFeatures = ['Dark Theme', 'Month Metrics', 'Year Metrics', 'Share Lists', 'Allow Pictures', 'Custom Labels'];
const goldFeatures = ['Routines', 'Comparison Metrics', 'Voice', 'OKR\'s', 'Customize App', 'Focus Mode', 'Weekly Planner'];
</script>
