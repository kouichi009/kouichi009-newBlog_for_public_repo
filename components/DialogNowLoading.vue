<template>
  <div>
    <v-dialog v-model="loading" hide-overlay persistent width="400">
      <v-card color="primary" dark>
        <v-card-text>
          Please wait
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: ["loading"],
  data() {
    return {
      //   stripe: null,
      //   options: null,
      //   dialog: false,
      //   loading: true,
      //   message: ""
    };
  },

  mounted() {},
  components: {},
  methods: {
    buy() {}
  }
  //   watch: {
  //     loading(val) {
  //       if (!val) return;
  //       setTimeout(() => (this.loading = false), 10000);
  //     }
  //   },
  //   computed: {
  //     privateInfo() {
  //       console.log("pl 1 ", this.$store.getters["auth_module/privateInfo"]);
  //       return this.$store.getters["auth_module/privateInfo"];
  //     }
  //   }
};
</script>
