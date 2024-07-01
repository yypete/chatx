<template>
<chatGpt />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import chatGpt from './pages/chat-gpt.vue';

export default defineComponent({
  name:'App',
  components:{
    chatGpt 

  }
})


</script>
