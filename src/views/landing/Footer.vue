<script setup>
import NormalWave from "./waves/normal-wave.vue";

const footerSections = {
    product: {
        label: "Product",
        links: {
            "Features": "/#features",
            "Use cases": "/#use-cases",
            "Compare": "/#compare",
            "FAQ": "/#faq",
            "Pricing": "/pricing"
        }
    },
    community: {
        label: "Community",
        links: {
            "GitHub": "https://github.com/jesusantguerrero/zen",
            "Report an issue": "https://github.com/jesusantguerrero/zen/issues",
            "Twitter": "https://twitter.com/zenboard_app",
            "Blog": "https://freesgen.hashnode.dev"
        }
    },
    more: {
        label: "From the maker",
        links: {
            "Atmosphere UI": "https://atmosphere-ui.netlify.app",
            "Lumiere": "https://github.com/jesusantguerrero/lumiere",
            "Sunday (team version)": "https://github.com/jesusantguerrero/sunday"
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

const getRouterComponent = (link) => {
    if (link.startsWith("http")) {
        return "a"
    } else if (link.startsWith("/#")) {
        return "a"
    } else {
        return "router-link"
    }
}

</script>

<template>
    <section className="text-gray-700 bg-gray-900 body-font relative px-10 md:px-0">
        <NormalWave />
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 py-8 pt-24">
            <div className="text-white" v-for="section in footerSections" :key="section.label">
                <h4 className="font-bold text-left text-sm tracking-wider uppercase text-gray-400"> {{ section.label }} </h4>
                <ul className="mt-4 space-y-2 text-left">
                    <li v-for="(link, linkName) in section.links" :key="linkName" class="text-white text-sm">
                        <component :href="link" :to="link" :is="getRouterComponent(link)" class="hover:text-green-400 transition-colors" :target="link.startsWith('http') ? '_blank' : null" :rel="link.startsWith('http') ? 'noopener' : null">
                            {{ linkName }}
                        </component>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>
