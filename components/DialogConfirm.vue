<template>
  <div>
    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="display-1">{{ title }}</v-card-title>
        <v-card-text>{{ description }}</v-card-text>
        <v-card-actions class="pa-5">
          <v-btn
            depressed
            outlined
            color="#a8a8a8"
            class="mr-5"
            @click="dialog = false"
            >Cancel</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn dark color="#ED4956" @click="triggerClick(methodName)">{{
            agreeText
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: "",
      description: "",
      agreeText: "",
      dialog: false,
      methodName: ""
    };
  },
  methods: {
    triggerClick(methodName) {
      if (methodName === "deletePost") {
        this.deletePost();
      } else if (methodName === "deleteComment") {
        this.deleteComment();
      } else if (methodName === "deleteCard") {
        this.deleteCard();
      } else if (methodName === "deleteBank") {
        this.deleteBank();
      }
    },
    deleteCardDialog() {
      this.methodName = "deleteCard";
      this.title = "Delete Credit card";
      this.description = "Are you sure?";
      this.agreeText = "Delete";
      this.dialog = true;
    },
    deleteCard() {
      this.dialog = false;
      this.$emit("card-delete");
    },
    deleteBankDialog() {
      this.methodName = "deleteBank";
      this.title = "Delete bank account";
      this.description = "Are you sure?";
      this.agreeText = "Delete";
      this.dialog = true;
    },
    deleteBank() {
      this.dialog = false;
      this.$emit("bank-delete");
    },
    deletePostDialog() {
      this.methodName = "deletePost";
      this.title = "Delete";
      this.description = "Deleted articles are gone forever. Are you sure?";
      this.agreeText = "Delete";
      this.dialog = true;
    },
    async deletePost() {
      this.dialog = false;
      this.$emit("post-delete");
    },
    deleteCommentDialog() {
      this.methodName = "deleteComment";
      this.title = "Delete";
      this.description = "Deleted comments are gone forever. Are you sure?";
      this.agreeText = "Delete";
      this.dialog = true;
    },
    deleteComment() {
      this.dialog = false;
      this.$emit("comment-delete");
    }
  }
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
