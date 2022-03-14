<template>
  <div class="my-5">
    <v-card v-if="comment">
      <div class="row">
        <img
          @click="goToUserPage"
          :src="comment.user.profileImageUrl"
          alt="Avatar"
          class="comment-avatar"
        />
        <div class="ml-5" @click="goToUserPage">
          <p class="name">
            {{ comment.user.name }}
          </p>
          <p class="date">
            {{ comment.date }}
          </p>
        </div>
        <v-spacer></v-spacer>
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn class="mr-5" v-on="on" icon>
              <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in threeDotList"
              :key="index"
              @click="pushThreeDot(item)"
            >
              <v-list-item-title style="font-size: 1.6rem">{{
                item
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <p class="pb-5 comment-text">{{ comment.contents[0].data }}</p>
      <dialog-confirm
        ref="dialogConfirmRef"
        @comment-delete="commentDelete()"
      ></dialog-confirm>
    </v-card>
  </div>
</template>

<script>
import DialogConfirm from "~/components/DialogConfirm";
import { AuthService } from "~/apis/auth_service";

export default {
  props: ["comment", "commentIndex", "post"],
  data() {
    return {
      threeDotList: []
    };
  },
  components: {
    DialogConfirm
  },
  async mounted() {
    let currentUser = await AuthService.getAuthCurrentUser();
    console.log("comment Component UID: ", currentUser);
    if (!currentUser) {
      return;
    }
    if (
      currentUser.uid === this.comment.user.uid ||
      currentUser.uid === this.post.user.uid
    ) {
      this.threeDotList = ["Delete"];
    }
  },
  updated() {},
  methods: {
    goToUserPage() {
      console.log("goToUserPage");
      this.$router.push({ path: `/u/${this.comment.user.username}` });
    },
    pushThreeDot(item) {
      if (item === "Delete") {
        this.$refs.dialogConfirmRef.deleteCommentDialog();
      }
    },
    commentDelete() {
      this.$emit("comment-delete", this.commentIndex);
    }
  }
};
</script>

<style scoped>
div a {
  text-decoration: none;
  color: black;
}
.comment-text {
  /* margin: 0 30px; */
  font-size: 1.8rem;
  white-space: pre-wrap;
  line-height: 200%;
  /* line-height: 2em; */
}

.name {
  color: #2db696;
  font-size: 1.6rem;
  margin: 0;
  cursor: pointer;
}

.date {
  color: grey;
  font-size: 1.6rem;
  cursor: pointer;
}

.v-card {
  padding: 1rem;
}

.comment-avatar {
  margin-left: 1rem;
  vertical-align: middle;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  cursor: pointer;
}
</style>
