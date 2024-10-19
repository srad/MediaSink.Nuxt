<template>
  <textarea disabled class="form-control vh-100 w-100" v-model="log"></textarea>
</template>

<script setup lang="ts">
//import socket from "@/socket";
//import event from "@/services/event";

import { ref } from 'vue';

const log = ref('');

//socket.on("log", (text) => {
//  this.log += text + "\n";
//});
</script>

<style scoped></style>
