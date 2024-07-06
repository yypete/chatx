<template>
  <ChatGpt />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ChatGpt from "./pages/chat-gpt.vue";

export default defineComponent({
  name: "App",
  components: {
    ChatGpt,
  },
});
</script>
