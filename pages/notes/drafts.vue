<template>
  <div>
    <nav-bar></nav-bar>
    <dialog-error ref="dialogErrorRef"></dialog-error>
    <dialog-confirm
      ref="dialogConfirmRef"
      @post-delete="postDelete"
    ></dialog-confirm>
    <v-main>
      <div class="container-fluid mx-auto my-2">
        <my-post-tab></my-post-tab>
        <v-list>
          <template v-for="(displayPost, index) in displayPosts">
            <!-- <v-list-item :key="displayPost.id"> -->
            <my-post
              :post="displayPost"
              :index="index"
              :postIndex="index"
              :key="displayPost.id"
              @post-delete-dialog="postDeleteDialog($event)"
            ></my-post>
            <v-divider :key="index"></v-divider>
          </template>
        </v-list>

        <v-pagination
          v-model="page"
          :length="length"
          @input="pageChange"
        ></v-pagination>
      </div>
    </v-main>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar";
import MyPostTab from "~/components/MyPostTab.vue";
import { SET_POSTS } from "~/store/mutations_type";
import MyPost from "~/components/MyPost.vue";
import DialogError from "~/components/DialogError";
import DialogConfirm from "~/components/DialogConfirm";
import { AuthService } from "~/apis/auth_service";
import {
  FETCH_DRAFT_POSTS,
  EDITING_POST_DELETE,
  GET_AUTH_CURRENTUSER
} from "~/store/actions_type";
export default {
  components: {
    NavBar,
    MyPostTab,
    MyPost,
    DialogError,
    DialogConfirm
  },
  data() {
    return {
      lastVisible: null,
      isFirstCalled: false,
      displayPosts: [],
      page: 1,
      length: 0,
      pageSize: 3,
      selectedPostIndex: -1
    };
  },
  async mounted() {
    try {
      let authCurrentUser = await this.$store.dispatch(
        `auth_module/${GET_AUTH_CURRENTUSER}`
      );
      if (!authCurrentUser) {
        this.$router.push({ path: `/` });
        return;
      }
      this.$store.dispatch(
        `user_module/${FETCH_DRAFT_POSTS}`,
        authCurrentUser.uid
      );
    } catch (err) {
      const errorMessage = err.message;
      this.showErrorMessage(errorMessage);
    }
  },
  methods: {
    showErrorMessage(errorMessage) {
      this.$refs.dialogErrorRef.showError(errorMessage);
    },

    pageChange: function(pageNumber) {
      this.displayPosts = this.posts.slice(
        this.pageSize * (pageNumber - 1),
        this.pageSize * pageNumber
      );
    },
    postDeleteDialog(event) {
      console.log("event: draft ", event);
      this.selectedPostIndex = event;
      this.$refs.dialogConfirmRef.deletePostDialog();
    },
    async postDelete() {
      try {
        var deletePostIndex = this.selectedPostIndex;

        await this.$store.dispatch(
          `post_module/${EDITING_POST_DELETE}`,
          this.displayPosts[deletePostIndex]
        );
        console.log(this.displayPosts);

        console.log(deletePostIndex, this.displayPosts[deletePostIndex]);
        if (this.page != 1) {
          deletePostIndex = this.pageSize * (this.page - 1) + deletePostIndex;
        }
        this.posts.splice(deletePostIndex, 1);
        this.$store.commit(`user_module/${SET_POSTS}`, this.posts);
        if (this.posts.length === 0) {
          this.displayPosts = [];
        }
        if (this.displayPosts.length === 1 && this.posts.length > 0) {
          this.page = 1;
        }
      } catch (err) {
        this.showErrorMessage(err.message);
      }
    }
  },

  watch: {
    posts: function(newValArray, oldValArray) {
      if (0 < newValArray.length) {
        this.length = Math.ceil(newValArray.length / this.pageSize);
        this.displayPosts = newValArray.slice(
          this.pageSize * (this.page - 1),
          this.pageSize * this.page
        );
      }
    }
  },

  computed: {
    posts() {
      const posts = this.$store.getters["user_module/posts"];
      return posts;
    }
  }
};
</script>

<style scoped>
.container-fluid {
  max-width: 720px;
}
</style>
