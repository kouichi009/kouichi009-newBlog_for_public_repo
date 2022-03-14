<template>
  <div>
    <dialog-error ref="dialogErrorRef"></dialog-error>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title v-text="post.title"></v-list-item-title>
        <v-list-item-subtitle v-text="post.date"></v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon>
              <v-icon large>mdi-dots-horizontal</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in threeDotList"
              :key="index"
              @click="pushThreeDot(item)"
            >
              <v-list-item-title>{{ item }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item-action>
    </v-list-item>
    <!-- <v-divider :key="index"></v-divider> -->
  </div>
</template>

<script>
import { POST_DELETE } from "~/store/actions_type";
import { db, firebase } from "~/plugins/firebase";
import DialogError from "~/components/DialogError";
export default {
  props: ["post", "postIndex"],
  data() {
    return {
      threeDotList: ["Edit", "Delete"]
    };
  },
  mounted() {},
  updated() {},
  methods: {
    pushThreeDot(item) {
      if (item === "Delete") {
        this.$emit("post-delete-dialog", this.postIndex);
      } else if (item === "Edit") {
        this.$router.push({ path: `/notes/${this.post.id}/edit` });
      }
    },

    async postDelete() {
      try {
        await this.$store.dispatch(`post_module/${POST_DELETE}`, this.post);
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      }
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
