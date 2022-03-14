<template>
  <div>
    <dialog-error ref="dialogErrorRef"></dialog-error>
    <v-list-item @click="goToDetail">
      <v-list-item-content>
        <v-list-item-title
          v-text="displaySalePost.post.title"
        ></v-list-item-title>
        <v-list-item-subtitle
          >${{ displaySalePost.soldPrice }}</v-list-item-subtitle
        >
        <v-list-item-subtitle
          v-text="displaySalePost.soldDate"
        ></v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <!-- <v-divider :key="index"></v-divider> -->
  </div>
</template>

<script>
import { POST_DELETE } from "~/store/actions_type";
import { db, firebase } from "~/plugins/firebase";
import DialogError from "~/components/DialogError";
export default {
  props: ["displaySalePost"],
  data() {
    return {};
  },
  mounted() {},
  updated() {},
  methods: {
    goToDetail() {
      this.$router.push({ path: `/n/${this.displaySalePost.post.slug}` });
    }
  },
  components: {
    DialogError
  }
};
</script>

<style scoped>
.v-list-item__title {
  font-size: 1.8rem;
}

.v-list-item__subtitle {
  font-size: 1.3rem;
}
</style>
