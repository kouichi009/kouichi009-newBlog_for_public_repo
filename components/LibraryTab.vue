  <template>
  <v-tabs class="container-fluid mx-auto my-2">
    <v-tab to="/notes/liked">Liked</v-tab>
    <v-tab to="/notes/purchased">Purchased</v-tab>
  </v-tabs>
</template>

<style scoped>
.container-fluid {
  max-width: 720px;
}

.v-tab {
  font-size: 1.6rem;
  text-transform: capitalize;
}
</style>