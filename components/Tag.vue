<template>
  <span>
    <nuxt-link style="text-decoration: none;" :to="`/tag/${tag}`">
      <v-chip label @click="clickTag(tag)">{{ tag }}</v-chip>
    </nuxt-link>
  </span>
</template>

<script>
export default {
  props: ["tag"],
  data() {
    return {};
  },
  mounted() {},
  methods: {
    clickTag(tag) {}
  },
  computed: {}
};
</script>

<style scoped>
.v-chip {
  text-decoration: none;
  font-size: 1.6rem;
}
</style>
