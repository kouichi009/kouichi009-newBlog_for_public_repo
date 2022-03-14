<template>
  <!-- <div> -->
  <div>
    <div style="text-align: center; padding-top: 3rem;">
      <v-avatar color="grey" size="120" class="mb-3">
        <v-img :src="user.profileImageUrl"></v-img>
      </v-avatar>
      <h1>{{ user.name }}</h1>
      <p class="mt-3 mb-5">{{ user.description }}</p>
      <v-btn
        v-if="currentUid && user.uid === currentUid"
        color="#2CB696"
        outlined
        :to="`/u/${user.username}/edit`"
        nuxt
        >Edit profile</v-btn
      >
    </div>
    <br />
    <v-divider></v-divider>
    <v-tabs v-if="user.username">
      <!-- <v-tab>Articles</v-tab>
      <v-tab>Likes</v-tab>-->
      <v-tab :to="`/u/${user.username}`">Articles</v-tab>
      <v-tab :to="`/u/${user.username}/liked`">Likes</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <br />
    <br />
  </div>

  <!-- </div> -->
</template>

<script>
export default {
  props: ["user", "currentUid"]
};
</script>

<style scoped>
p {
  white-space: pre-wrap;
  font-size: 18px;
}

.v-btn,
.v-tab {
  font-size: 1.6rem;
  text-transform: capitalize;
}
</style>
