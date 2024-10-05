<template>
  <div>
    <main class="container-fluid">
      <nuxt-loading-indicator/>
      <NuxtPage :keepalive="{include: 'SteamView,ChannelsView,JobView'}"/>
    </main>
  </div>
</template>
