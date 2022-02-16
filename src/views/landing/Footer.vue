<script setup>
import NormalWave from "./waves/normal-wave.vue";
    const footerSections = {
        general: {
            label: "General Resources",
            links: {
                "Docs": "/docs",
                "Blog": "/blog",
                "Use Cases": "/use-cases"
            }
        },
        more: {
            label: "More",
            links: {
                // "Atmosphere": "https://github.com/jesusantguerrero/atmosphere",
                "Atmosphere UI": "https://atmosphere-ui.netlify.app",
                "Lumiere": "https://github.com/jesusantguerrero/lumiere",
                "Insane Code Blog": "https://freesgen.hashnode.dev"
            }
        },
        about: {
            label: "Zen channels",
            links: {
                "Github" : "https://github.com/jesusantguerrero/zen",
                "Twitter": "https://twitter.com/zenboard_app"
            }
        },
        legal: {
            label: "Legal",
            links: {
                "Privacy Policy": "/privacy-policy",
                "Terms of service": "/terms"
            }
        }
    }


</script>

<template>
    <section className="text-gray-700 bg-gray-900 body-font relative px-10 md:px-0">
        <NormalWave />
        <div className="max-w-7xl mx-auto flex flex-col py-8 pt-24 sm:flex-row">
            <div className="text-white w-full mb-10 md:mb-0" v-for="section in footerSections" :key="section.label">
                <h4 className="font-bold text-left"> {{ section.label }} </h4>
                <ul className="mt-4 text-left">
                    <li v-for="(link, linkName) in section.links" class="text-white"> 
                        <a :href="link">
                            {{ linkName }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

