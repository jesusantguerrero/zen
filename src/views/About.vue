<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="mb-20 md:flex">
      <div class="max-w-8xl mx-auto sm:px-6 lg:px-8 flex">
          <div class="about-screen">
              <p class="close-bar">
                  <span class="close-about icon icon-left-open"> </span>
              </p>
              <div class="block-container">
                  <h3 class="logo cursor-pointer zen">
                      <span class="">Zen</span><span class="movable">.</span>
                  </h3>
              </div>
              <div class="block-container">
                  <p class="app-version"><span>{{ state.appVersion }}</span></p>
              </div>
              <p class="about-nav">
                  <button
                      v-for="(section, sectionName) in state.sections"
                      :key="sectionName"
                      class="focus:outline-none"
                      :class="{selected: sectionName == state.selectedSection}"
                      @click="state.selectedSection=sectionName"
                  >
                      {{ section }}
                  </button>
              </p>

              <div class="information-container">
                <about-form v-if="state.selectedSection=='info'" hide-button="true"></about-form>
                <help-view v-if="state.selectedSection=='tutorial'" hide-button="true"></help-view>
                <div v-if="state.selectedSection=='license'" class="text-center font-bold mt-10">
                    <h2 class="text-xl"> MIT </h2>
                </div>
              </div>

              <div class="logos"></div>
              <div class="block-container">
                  <p class="app-version">
                      Developed by
                      <span class="author">Jesus Guerrero</span>
                  </p>
              </div>
              <div class=""></div>
          </div>
      </div>
  </div>
</div>

</template>

<script setup>
import WelcomeForm from "../components/molecules/WelcomeForm.vue"
import AboutForm from "../components/molecules/AboutForm.vue"
import HelpView from "../components/molecules/HelpView.vue"
import { reactive } from "vue";

const state = reactive({
   appVersion: "1.10.0-beta",
    selectedSection: 'info',
    sections: {
        info: "Information",
        tutorial: "Tutorial",
        license: "License",
    },
})

</script>

<style lang="scss" scoped>
.about-screen {
  width: 100%;
  text-align: center;
  overflow-y: auto;

    .block-container {
        display: flex;
        justify-content: center;
        width: 100%;
    }

   .logo {
       @apply text-gray-600;
        transition: all ease 1s;
        padding: 0;
        margin: 0;
        width: fit-content;
        font-size: 90px;
        overflow: hidden;
        font-weight: bolder;

        &:hover {
            @apply text-gray-800;
            .movable {
                -webkit-transform: rotate(35deg);
                transform: rotate(35deg); }
            }
    }

}

  .about-screen .app-version {
    font-size: 24px;
    font-weight: bolder;
    color: #ccc; }
    .about-screen .app-version:hover {
      color: #999; }
    .about-screen .about-nav button {
        margin: 0 0 0 0;
        margin-top: 15px;
        padding: 10px;
        background: #ddd;
        border: 2px solid #ddd;
    }

.about-nav {
    button:first-child {
        border-radius: 4px 0 0 4px;
    }
    button:last-child {
        border-radius: 0 4px 4px 0;
    }
    button:hover {
        border: 2px solid #999;
    }
    button.selected {
        @apply bg-gray-500;
        @apply border-gray-500;
        @apply text-gray-100;
    }
}

.about-screen .information-container {
    text-align: left;
    width: 100%;
}

.about-screen .logos {
    margin-top: 70px;
}

.about-screen .logos img {
    width: 120px;
}
</style>
