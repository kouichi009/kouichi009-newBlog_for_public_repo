<template>
  <div v-if="post && user">
    <client-only>
      <dialog-error ref="dialogErrorRef"></dialog-error>
      <dialog-confirm
        ref="dialogConfirmRef"
        @post-delete="postDelete"
      ></dialog-confirm>
      <sign-up-in ref="signUpInRef"></sign-up-in>
    </client-only>
    <div class="ma-5">
      <div class="header-section">
        <v-img v-if="width" :src="post.headerImage"></v-img>
        <h1>{{ post.title }}</h1>
        <v-row class="fav-btn" @click="toggleFavorite" v-if="currentUid">
          <v-icon large class="mr-1 ml-3" v-if="post.isLiked" color="red"
            >mdi-heart</v-icon
          >
          <v-icon large class="mr-1 ml-3" v-else>mdi-heart</v-icon>
          <span class="f-16">
            {{ post.likeCount }}
          </span>
        </v-row>
        <v-row class="fav-btn" @click="toggleFavorite" v-if="!currentUid">
          <v-icon large class="mr-1 ml-3">mdi-heart</v-icon>
          <span class="f-16">
            {{ post.likeCount }}
          </span>
        </v-row>
        <br />
        <div class="alignleft">
          <nuxt-link :to="`/u/${post.user.username}`">
            <div class="row mt-5 ml-1">
              <v-avatar>
                <img
                  :src="post.user.profileImageUrl"
                  class="avatar-image"
                  alt="Go to the profile"
                />
              </v-avatar>
              <p class="ml-3 black--text name">
                {{ post.user.name }}
                <br />
                <span class="grey--text text--darken-1">{{ post.date }}</span>
              </p>
            </div>
          </nuxt-link>
        </div>
        <div class="alignright mt-3 mr-5">
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon>
                <v-icon>mdi-dots-horizontal</v-icon>
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
        </div>
      </div>
      <div class="clear-align"></div>
      <br />
      <div class="medium-editor-container">
        <!-- {{post.}}
        <h3>1111</h3>
        <h3>222222</h3> -->

        <div
          class=""
          v-for="(content, index) in post.contents"
          :key="content.id"
        >
          <div
            v-show="index === post.paylineIndex"
            class="text-center mt-5 mx-auto"
            style="max-width: 72rem"
          >
            <p class="separator">Paywall</p>
          </div>
          <div>
            <div class="content" v-html="content.data"></div>
          </div>
          <!-- {{ content.data }} -->
          <!-- <detail-content :content="content"></detail-content> -->
        </div>
      </div>

      <div class="footer-section">
        <div v-if="currentUid">
          <payline
            class="mb-5"
            :post="post"
            v-if="!post.isPaid && post.isToll && currentUid !== post.user.uid"
            @buy-no-user="buyNoUser"
          ></payline>
        </div>
        <div v-else-if="!currentUid">
          <payline
            class="mb-5"
            :post="post"
            v-if="!post.isPaid && post.isToll"
            @buy-no-user="buyNoUser"
          ></payline>
        </div>
        <span class="ml-5" v-for="tag in post.tags" :key="tag.id">
          <tag :tag="tag"></tag>
        </span>
        <div class="my-5">
          <v-btn
            large
            fab
            outlined
            icon
            v-if="currentUid"
            @click="toggleFavorite"
          >
            <v-icon v-if="post.isLiked" color="red">mdi-heart</v-icon>
            <v-icon v-else>mdi-heart</v-icon>
          </v-btn>
          <v-btn
            large
            fab
            outlined
            icon
            v-if="!currentUid"
            @click="toggleFavorite"
          >
            <v-icon>mdi-heart</v-icon>
          </v-btn>

          <span class="f-18 mx-2">
            {{ post.likeCount }}
          </span>
        </div>
        <v-divider class="mx-4 my-3"></v-divider>

        <div class="pl-3 py-5">
          <nuxt-link :to="`/u/${post.user.username}`">
            <div class="row">
              <img
                :src="post.user.profileImageUrl"
                alt="Avatar"
                class="footer-writer-avatar"
              />
              <div class="ml-5">
                <p class="footer-writer-name">
                  {{ post.user.name }}
                </p>
                <p
                  class="footer-writer-description"
                  v-html="user.description"
                ></p>
              </div>
            </div>
          </nuxt-link>
        </div>
        <v-divider class="mx-4 my-3"></v-divider>
        <br />
        <v-btn
          class="title"
          outlined
          color="success"
          block
          height="80"
          @click="goToComment"
        >
          <v-icon left>mdi-comment</v-icon>
          <span class="text-capitalize" style="font-size: 1.6rem">{{
            commentText
          }}</span>
        </v-btn>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </div>
  </div>
</template>

<script>
import Tag from "~/components/Tag";
import Payline from "~/components/Payline";
import SignUpIn from "~/components/SignUpIn.vue";
import DialogConfirm from "~/components/DialogConfirm";
import NavBar from "@/components/NavBar";
import DialogError from "~/components/DialogError";
import {
  FETCH_POST,
  FETCH_COMMENTS,
  FAVORITE_ADD,
  FAVORITE_REMOVE,
  FETCH_POST_ISLIKED,
  POST_DELETE
} from "~/store/actions_type";
import { FETCH_START } from "~/store/mutations_type";

export default {
  props: ["post", "user"],

  data() {
    return {
      isSignedIn: false,
      threeDotList: [],
      width: 0,
      height: 0,
      commentText: "abc"
    };
  },
  components: {
    Tag,
    Payline,
    DialogConfirm,
    DialogError,
    SignUpIn
  },

  async mounted() {
    this.mediumZoom();
    if (this.post.commentCount === 0) {
      this.commentText = "Write the first comment";
    } else if (this.post.commentCount > 0) {
      this.commentText = `See Comments    (${this.post.commentCount})`;
    }

    if (this.currentUid) {
      this.setThreeDotList();
    }

    // setTimeout(async () => {
    const obj = this.post.headerImage;
    var img = new Image();
    img.onload = () => {
      this.width = img.width;
      this.height = img.height;
      // this.new_image.push({ width: img.width, height: img.height });
    };
    const img2 = await img.onload;

    img.src = obj;
    // });
  },

  methods: {
    async toggleFavorite() {
      if (!this.currentUid) {
        this.$refs.signUpInRef.show("like");
        return;
      }

      try {
        if (this.isLoading) {
          return;
        }

        const post = await this.fetchPostIsLiked(this.post);

        const action = post.isLiked ? FAVORITE_REMOVE : FAVORITE_ADD;
        this.$store.dispatch(`post_module/${action}`, {
          post,
          currentUid: this.currentUid
        });
      } catch (err) {
        const errorMessage = err.message;
        this.$refs.dialogErrorRef.showError(errorMessage);
      }
    },
    async fetchPostIsLiked(post) {
      const newPost = await this.$store.dispatch(
        `post_module/${FETCH_POST_ISLIKED}`,
        {
          post,
          currentUid: this.currentUid
        }
      );
      return newPost;
    },
    goToProfile() {},
    setThreeDotList() {
      if (this.currentUid === this.post.user.uid) {
        this.threeDotList = ["Edit", "Delete"];
      } else if (this.currentUuid === this.user.uid) {
        this.threeDotList = ["Delete"];
      }
    },
    pushThreeDot(item) {
      const post = this.post;
      //
      // returns;
      if (item === "Delete") {
        this.$refs.dialogConfirmRef.deletePostDialog();
      } else if (item === "Edit") {
        this.$router.push({ path: `/notes/${post.id}/edit` });
      }
    },

    async postDelete() {
      try {
        await this.$store.dispatch(`post_module/${POST_DELETE}`, this.post);
        this.$router.push({ path: `/` });
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      }
    },
    buyNoUser() {
      this.$refs.signUpInRef.show("buy");
    },
    goToComment() {
      this.$router.push({ path: `/n/${this.post.slug}/comments` });
    }
  },
  computed: {
    currentUid() {
      const currentUid = this.$store.getters["auth_module/currentUid"];
      return currentUid;
    }
  }
};
</script>

<style scoped lang="scss">
.alignleft {
  float: left;
}
.alignright {
  float: right;
}
.clear-align {
  clear: both;
}
/* .profile-info {
  display: inline;
  text-decoration: none;
  font-size: 12px;
} */
div a {
  text-decoration: none;
}

.post-card {
  max-width: 680px;
  background-color: red;
  position: absolute;
  top: 20px;
  bottom: 20px;
  left: 0;
  right: 0;
  margin: auto;
}
.fav-btn {
  display: inline;
  cursor: pointer;
}
.icon-text-count {
  font-size: 20px;
}

.footer-writer-avatar {
  vertical-align: middle;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
}

.footer-writer-name {
  color: black;
  font-size: 2.6rem;
  font-weight: bold;
  margin-bottom: 0px;
}

.footer-writer-description {
  color: black;
  font-size: 1.8rem;
  white-space: pre-wrap;
  line-height: 2.5rem;
}

.separator {
  font-size: 2.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  text-align: center;
}
.separator::before,
.separator::after {
  content: "";
  flex: 1;
  border-bottom: 1px dashed grey;
}
.separator::before {
  margin-right: 0.25rem;
}
.separator::after {
  margin-left: 0.25rem;
}

h1 {
  word-wrap: break-word;
  margin: 2rem 0;
  line-height: 120%;
  font-size: 4.8rem;
}

.header-section {
  max-width: 72rem;
  margin: 0 auto;
}

.name {
  font-size: 1.6rem;
}

.v-list-item__title {
  font-size: 1.6rem;
}

.footer-section {
  max-width: 72rem;
  margin: 0 auto;
}

.content ::v-deep .medium-insert-embeds-overlay {
  width: initial;
  height: initial;
}

.content ::v-deep .medium-insert-embeds2.is-selected div,
.content ::v-deep .is-selected img {
  outline: initial;
}

// .content ::v-deep .is-selected img {
//   outline: initial;
// }

@media (max-width: 767px) {
  h1 {
    font-size: 3.4rem;
    margin: 30px 0px;
  }
  .header-section {
    margin: 0 20px;
  }
  .footer-writer-avatar {
    vertical-align: middle;
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
  }

  .footer-writer-name {
    color: black;
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 0px;
  }

  .footer-writer-description {
    margin-top: 0.5rem;
    font-size: 1.6rem;
    white-space: pre-wrap;
    line-height: 2rem;
  }

  .footer-section {
    max-width: 72rem;
    margin: 0 20px;
  }
}
</style>
