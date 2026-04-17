<template>
  <section class="relative py-24 bg-secondary">
    <div class="container relative px-6 mx-auto sm:px-10 md:px-16 lg:px-20 max-w-7xl">
      <div class="max-w-2xl mx-auto text-center">
        <span class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
          Community
        </span>
        <h2 class="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          Built by a developer, for developers
        </h2>
        <p class="mt-4 text-base text-gray-300">
          Zen is open source and still small on purpose. Star the repo, open an issue, or
          shape the roadmap.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3 mt-8">
          <a
            href="https://github.com/jesusantguerrero/zen"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center h-10 px-4 text-sm font-bold text-white transition-colors border-2 rounded-md border-white/20 hover:border-green-400 bg-gray-900"
          >
            <i class="mr-2 fa fa-github"></i>
            Star on GitHub
          </a>
          <a
            href="https://github.com/jesusantguerrero/zen"
            target="_blank"
            rel="noopener"
            class="inline-block align-middle"
          >
            <img
              src="https://img.shields.io/github/stars/jesusantguerrero/zen?style=for-the-badge&logo=github&color=10B981&labelColor=0F172A"
              alt="GitHub stars"
              class="h-10"
            />
          </a>
          <span
            class="inline-flex items-center h-10 px-4 text-sm font-bold text-green-400 border-2 rounded-md border-green-400/40 bg-green-400/5"
          >
            <i class="mr-2 fa fa-code-branch"></i>
            Open source - MIT
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 mt-16 md:grid-cols-3">
        <figure
          v-for="t in testimonials"
          :key="t.name"
          class="relative flex flex-col p-6 bg-gray-900 border-2 rounded-md border-white/10"
        >
          <svg
            class="absolute top-4 right-4 w-8 h-8 text-green-400/20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
          </svg>
          <blockquote class="text-sm leading-relaxed text-gray-200">
            "{{ t.quote }}"
          </blockquote>
          <figcaption class="flex items-center mt-6 space-x-3">
            <div
              class="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full"
              :class="t.avatarBg"
              aria-hidden="true"
            >
              {{ t.initials }}
            </div>
            <div>
              <p class="text-sm font-bold text-white">{{ t.name }}</p>
              <p class="text-xs text-gray-400">{{ t.role }}</p>
            </div>
          </figcaption>
        </figure>
      </div>

      <p class="mt-10 text-xs text-center text-gray-500">
        Testimonials reflect target personas for the product. Real user quotes will replace
        these as the community grows.
      </p>
    </div>
  </section>
</template>

<script setup>
const testimonials = [
  {
    quote:
      "I stopped juggling three timers. Zen logs my Pomodoros straight into Tempo and my Friday invoices basically write themselves now.",
    name: "Maya",
    role: "Freelance full-stack dev, 2-4 clients",
    initials: "M",
    avatarBg: "bg-pink-500",
  },
  {
    quote:
      "The auto-generated standup is the thing. I ship my update in Slack before standup even starts, and my lead finally sees the weekly metrics.",
    name: "Arun",
    role: "Senior engineer, distributed team",
    initials: "A",
    avatarBg: "bg-blue-500",
  },
  {
    quote:
      "I'm a one-person company. The matrix forces me to actually decide what matters today, and the streak keeps me honest on weekends.",
    name: "Sam",
    role: "Indie hacker / solo founder",
    initials: "S",
    avatarBg: "bg-yellow-500",
  },
];
</script>
