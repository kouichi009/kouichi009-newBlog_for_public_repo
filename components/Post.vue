<template>
  <div class="container-fluid px-5 py-2 mx-auto">
    <v-card v-if="post.user">
      <client-only>
        <dialog-error ref="dialogErrorRef"></dialog-error>
        <sign-up-in ref="signUpInRef"></sign-up-in>
      </client-only>
      <nuxt-link :to="`/u/${post.user.username}`">
        <v-list-item>
          <v-list-item-avatar color="grey">
            <v-img :src="post.user.profileImageUrl"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ post.user.name }}
            </v-list-item-title>
            <v-list-item-subtitle class="grey--text text--darken-1">
              {{ post.date }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </nuxt-link>

      <nuxt-link :to="`/n/${post.slug}`">
        <v-img height="360" :src="post.headerImage"></v-img>

        <v-card-text class="text--primary a-1">
          <h1 class="f-25 f-bold line-height-120">{{ post.title }}</h1>
          <br />
          <p class="f-16 line-height-150">{{ post.shortContent }}</p>
        </v-card-text>
      </nuxt-link>

      <span class="ml-5" v-for="tag in post.tags" :key="tag.id">
        <tag :tag="tag"></tag>
      </span>

      <v-divider class="mx-4 my-3"></v-divider>

      <v-card-actions class="ma-5">
        <div class="mb-3">
          <v-btn icon @click="toggleFavorite">
            <v-icon large class="mr-1" v-if="post.isLiked" color="red"
              >mdi-heart</v-icon
            >
            <v-icon large class="mr-1" v-else>mdi-heart-outline</v-icon>
          </v-btn>
          <span class="icon-text-count vertical-middle">
            {{ post.likeCount }}
          </span>

          <v-btn class="ml-5 mr-1" icon :to="`/n/${post.slug}/comments`" nuxt>
            <v-icon large>mdi-comment-outline</v-icon>
          </v-btn>

          <span class="icon-text-count vertical-middle">
            {{ post.commentCount }}
          </span>
        </div>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import firebase from "~/plugins/firebase";
import {
  FAVORITE_ADD,
  FAVORITE_REMOVE,
  FETCH_POST_ISLIKED
} from "~/store/actions_type";
import { mapGetters } from "vuex";
import { LOAD_END } from "~/store/mutations_type";
import SignUpIn from "~/components/SignUpIn.vue";
import DialogError from "~/components/DialogError";
import Tag from "~/components/Tag";

export default {
  props: ["post"],
  components: {
    DialogError,
    SignUpIn,
    Tag
  },
  mounted() {
    this.$store.commit(`post_module/${LOAD_END}`);
  },
  data() {
    return {};
  },
  filters: {
    shortText(text, length, suffix) {
      if (text.length >= length) {
        return text.substring(0, length) + suffix;
      } else {
        return text;
      }
    }
  },
  methods: {
    async fetchPostIsLiked(post) {
      const newPost = await this.$store.dispatch(
        `post_module/${FETCH_POST_ISLIKED}`,
        {
          post,
          currentUid: this.currentUid
        }
      );
      // post.isLiked = isLiked;
      return newPost;
    },
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
    }
  },
  computed: {
    isLoading() {
      return this.$store.getters["post_module/isLoading"];
    },
    currentUid() {
      const currentUid = this.$store.getters["auth_module/currentUid"];
      return currentUid;
    }
  }
};
</script>

<style scoped>
.container-fluid {
  max-width: 720px;
  background-color: darkslategray;
}
.vertical-middle {
  vertical-align: middle;
}

div a {
  text-decoration: none;
}

/* p {
  text-decoration: none;
} */

.post-card {
  max-width: 680px;
  background-color: red;
  top: 20px;
  bottom: 20px;
  left: 0;
  right: 0;
  margin: auto;
}

.card-top-image {
  max-height: 400px;
}

.icon-text-count {
  font-size: 20px;
}

.v-list-item__title,
.v-list-item__subtitle {
  font-size: 1.4rem;
}
</style>
