<template>
  <v-dialog v-model="dialog" :persistent="persistent" max-width="290">
    <v-card>
      <v-card-title class="display-1 red--text">Error</v-card-title>
      <v-card-text>{{message}}</v-card-text>
      <v-card-actions class="pa-5">
        <!-- <v-spacer></v-spacer> -->
        <v-spacer></v-spacer>
        <v-btn
          dark
          color="#ED4956"
          width="100px"
          :persistent="persistent"
          @click="dialog = false"
        >OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      message: "",
      dialog: false,
      persistent: false,
    };
  },
  methods: {
    showError(message) {
      this.message = message;
      if (message === "Payment failure") {
        this.persistent = true;
      }
      this.dialog = true;
    },
  },
};
</script>


<style scoped>
.v-card__text {
  font-size: 1.4rem;
  line-height: 150%;
}

.v-btn {
  width: 10rem;
  font-size: 1.4rem;
  text-transform: capitalize;
}
</style>