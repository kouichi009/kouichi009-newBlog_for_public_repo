<template>
  <div>
    <infinite-loading class="infinite-loading" @infinite="infiniteHandler">
      <span slot="no-more">---- {{ loadedMessageNoMore }} ----</span>
      <span slot="no-results">---- {{ loadedMessageNoOne }} ----</span>
    </infinite-loading>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loadedMessageNoMore: "There are no more posts.",
      loadedMessageNoOne: "There are currently no posts."
    };
  },
  props: ["componentName"],

  created() {
    console.log("created load compoent: ", this.componentName);
  },
  mounted() {
    console.log("load compoent: ", this.componentName);

    if (this.componentName === "notification") {
      this.loadedMessageNoMore = "There are no more notifications.";
      this.loadedMessageNoOne = "There are currently no notifications.";
    } else if (this.componentName === "comment") {
      this.loadedMessageNoMore = "There are no more comments.";
      this.loadedMessageNoOne = "There are currently no comments.";
    }
  },

  methods: {
    async infiniteHandler($state) {
      console.log(this.$options.name);

      this.$emit("infinite-handler", $state);
    }
  }

  // computed: {
  //   nomoreposts() {
  //     const fullPath = this.$route.path;
  //     if (fullPath.includes("new")) {
  //       let dataStr = `<p name='first001' data-type='TEXT'><br></p>`;
  //       this.setContent(dataStr);
  //     }
  //     console.log(fullPath);

  //     return;
  //   },
  //   posts() {
  //     const posts = this.$store.getters["home_module/posts"];
  //     return posts;
  //   }
  // }
};
</script>
