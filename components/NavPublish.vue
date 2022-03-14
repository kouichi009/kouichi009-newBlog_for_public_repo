<template>
  <div>
    <dialog-error ref="dialogErrorRef"></dialog-error>
    <div
      v-if="
        path.first === 'new' ||
          path.full === `/notes/${postId}/edit` ||
          path.full === `/notes/${postId}/edit/`
      "
    >
      <v-dialog v-model="dialog" :persistent="false" max-width="600px">
        <template v-slot:activator="{ on }">
          <v-btn
            class="agreeBtn"
            v-if="isSaved"
            color="#2CB696"
            dark
            large
            v-on="on"
            @click="pushSettingPublish"
            ><span class="f-18">Publish</span></v-btn
          >
          <v-btn class="agreeBtn" v-else disabled large v-on="on"
            ><span class="f-18">Publish</span></v-btn
          >
        </template>
        <v-card v-if="isTitleError && isTitleError.bool">
          <v-card-title class="headline red--text">Error</v-card-title>
          <v-card-text class="f-16">{{ isTitleError.message }}</v-card-text>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn dark color="#ED4956" width="100px" @click="dialog = false"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
        <v-card v-else>
          <v-card-title
            class="headline grey lighten-2"
            primary-title
          ></v-card-title>
          <div class="mx-5 py-5">
            <p class="mb-1 f-12">
              Add or change tags (up to 5) so readers know what your story is
              about
            </p>
            <tags-input
              style="font-size: 23px"
              :add-tags-on-comma="true"
              :add-tags-on-space="true"
              :add-tags-on-blur="true"
              :validate="regexRule"
              :limit="3"
              v-model="selectedTags"
              @keydown="onKeyDown"
              @change="onChange"
              @tag-added="onTagAdded"
              @tag-removed="onTagRemoved"
            ></tags-input>
            <v-card
              v-show="isShowTagWarn"
              class="px-3 py-2 mt-5 mx-5 speech-bubble"
            >
              <p class="subtitle-1">{{ tagWarnText }}</p>
            </v-card>

            <div class="mt-5">
              <!-- <p class="mb-0 f-12">for free or for fee</p> -->
              <v-radio-group row class="mt-0" v-model="radios">
                <v-radio label="free" value="free"></v-radio>
                <v-radio label="fee" value="fee"></v-radio>
              </v-radio-group>
              <div v-show="radios === 'fee'">
                <v-row class="my-3">
                  <p style="font-weight: bold" class="ml-3 mb-0 f-16">
                    Price
                  </p>
                  &nbsp; &nbsp;
                  <v-menu open-on-hover offset-x>
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on">mdi-help-circle-outline</v-icon>
                    </template>
                    <v-card class="menu-text" max-width="300" tile>
                      <p>
                        You can sell your aricle from 1 to 500 USD.
                      </p>
                      <p>We charge {{ commissionRate }}% as selling fees.</p>
                    </v-card>
                  </v-menu>
                </v-row>
                <v-text-field
                  class="mb-0"
                  v-model="price"
                  single-line
                  outlined
                  prefix="$"
                  :rules="[rules.required, rules.number]"
                ></v-text-field>
              </div>
            </div>

            <v-divider></v-divider>

            <v-card-actions class="mt-3">
              <v-spacer></v-spacer>
              <v-btn
                class="mr-5 text-capitalize cancelBtn"
                depressed
                outlined
                color="#a8a8a8"
                text
                @click="dialog = false"
                ><span class="f-16">Cancel</span></v-btn
              >
              <v-btn
                v-if="radios === 'free'"
                class="agreeBtn"
                color="#2CB696"
                dark
                @click="publishNow"
                ><span class="f-16">Publish Now</span></v-btn
              >
              <v-btn
                v-else-if="radios === 'fee'"
                class="agreeBtn"
                color="#2CB696"
                dark
                @click="showDialogPaypart"
                ><span class="f-16">Next</span></v-btn
              >

              <v-dialog
                v-model="dialogPaypart"
                fullscreen
                transition="dialog-bottom-transition"
              >
                <v-card>
                  <v-toolbar fixed color="#F5F5F5">
                    <v-btn class="ml-5" large icon @click="dialog = false">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <div class="f-18 ml-5" color="#F5F5F5">
                      <!-- Set up a paywall -->
                      Choose where in your article to set up a paywall.
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn
                      height="50"
                      class="agreeBtn mr-5"
                      dark
                      color="#2CB696"
                      @click="publishNow"
                      ><span class="f-18">Publish Now</span></v-btn
                    >
                  </v-toolbar>
                  <v-card-text v-if="editingPost">
                    <div class="parentLine medium-editor-container">
                      <div
                        class="f-18"
                        v-for="(content, index) in editingPost.contents"
                        :key="content.id"
                        @click="setPayline(index)"
                      >
                        <p class="setPayline" v-if="paylineIndex === index">
                          To continue reading a one time payment is required.
                        </p>
                        <p class="selectPayline" v-else>
                          You can set up a paywall here.
                        </p>
                        <div class="content" v-html="content.data"></div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-dialog>
            </v-card-actions>
          </div>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import NavPublish from "~/components/NavPublish.vue";
import NavNotificationAvatar from "~/components/NavNotificationAvatar.vue";
import { POST_CREATE, POST_UPDATE } from "~/store/actions_type";
import DialogError from "~/components/DialogError";
import { ApiService, COMMISSION_RATE } from "~/apis/constant_type";
import Slug from "slug";
import { UserService } from "~/apis/user_service";
export default {
  props: ["path", "postId", "isTitleError", "isSaved"],
  data() {
    return {
      radios: "free",
      dialog: false,
      dialogPaypart: false,
      price: "1",
      priceRegex: /^\s*-?[1-9]\d*(\.\d{1,2})?\s*$/,
      rules: {
        required: value => !!value || "Required.",
        counter: value => value.length <= 3 || "Max 3 characters",
        number: value => {
          return (
            (this.priceRegex.test(value) &&
              (value === "" || parseFloat(value) <= 500)) ||
            "Invalid number."
          );
        }
      },
      tagWarnText: "",
      isShowTagWarn: false,
      selectedTags: [],
      isLoading: false,
      isToll: false,
      paylineIndex: 1,
      commissionRate: COMMISSION_RATE
      // selectedTags: [
      //   { key: "web-development", value: "Web Development" },
      //   { key: "php", value: "PHP" },
      //   { key: "javascript", value: "JavaScript" }
      // ]
    };
  },
  components: { NavPublish, NavNotificationAvatar, DialogError },
  watch: {
    //postオブジェクトが親コンポーネントから渡ってきたときに呼ばれる
    post: function(newVal, oldVal) {
      if (!newVal) {
        return;
      }
      if (newVal.price) {
        this.price = String(newVal.price);
      }
      newVal.tags.forEach(tag => {
        this.selectedTags.push({ key: "", value: tag });
      });
      if (newVal.isToll) {
        this.radios = "fee";
        this.paylineIndex = newVal.paylineIndex;
      } else {
        this.radios = "free";
      }
    },
    // editページで、すでの有料公開されてるのを無料に変更したり、もしくは逆の場合のために。
    radios: function(newVal, oldVal) {
      if (newVal === "fee") {
        this.isToll = true;
      } else if (newVal === "free") {
        this.isToll = false;
      }
    }
  },
  methods: {
    showDialogPaypart() {
      console.log(
        "showDialoPaypart: ",
        this.price,
        typeof this.price,
        this.price === "",
        !this.price,
        this.price.length,
        this.price.size
      );
      let isError = false;
      const priceAmount = Number(this.price);

      console.log(
        "price bool: ",
        priceAmount,
        this.price,
        this.priceRegex.test(this.price)
      );
      if (!this.priceRegex.test(this.price)) {
        console.log("false@@@");
      } else {
        console.log("true@@@");
      }

      if (
        !this.priceRegex.test(this.price) ||
        isNaN(priceAmount) ||
        !priceAmount ||
        this.price.charAt(0) === "0" ||
        priceAmount > 500
      ) {
        isError = true;
      }
      console.log("isError ", isError);

      if (isError) return;
      this.dialogPaypart = true;
    },
    async pushSettingPublish() {
      // const editingPost = await this.$store.dispatch(
      //   `post_module/${FETCH_EDITING_POST}`,
      //   this.postId
      // );
      console.log(this.editingPost, this.editingPost.contents);
      // this.editingPost = this.setContents(editingPost);
      // this.editingPost = ["aa", "bb"];
      // console.log("settingPublish@@@@@ ", this.editingPost);
      // // editingPost = this.setContents(editingPost);
    },
    setPayline(index) {
      this.paylineIndex = index;
    },
    backPage() {
      this.$router.back();
    },
    async publishNow() {
      var errorMessage = "";
      // try {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      if (this.isToll === false) {
        this.paylineIndex = -1;
      }
      let newPost = null;
      let newPostSlug = null;

      if (!this.post) {
        newPost = await this.getPostFromEditingPostForCreate();
        newPostSlug = newPost.slug;
        newPost = await this.$store.dispatch(
          `post_module/${POST_CREATE}`,
          newPost
        );
      } else {
        let { post, postId, postSlug } = this.getPostFromEditingPostForUpdate();
        newPostSlug = postSlug;
        newPost = await this.$store.dispatch(`post_module/${POST_UPDATE}`, {
          post,
          postId
        });
      }
      console.log("newPost: ", newPost, newPostSlug);

      this.$router.push({
        path: `/n/${newPostSlug}`
      });
      // } catch (err) {
      //   errorMessage = err.message;
      //   this.$refs.dialogErrorRef.showError(errorMessage);
      // } finally {
      //   this.isLoading = false;
      // }
    },
    profileAvaClick() {},
    test(item) {
      this.selection = null;
    },
    setPost() {
      this.showPostSetDialog();
    },
    showPostSetDialog() {},
    onKeyDown(event) {
      var line = {};
      if (
        event.key === "Tab" ||
        event.key === "Enter" ||
        event.key === " " ||
        event.key === ","
      ) {
        if (this.isValidTag === false) {
          this.isShowTagWarn = true;
          setTimeout(() => {
            this.isShowTagWarn = false;
          }, 4000);
        }
      } else {
      }
    },
    onChange(value) {
      // this.text2(value);
      // this.text = value + "you";
    },
    regexRule(tag) {
      if (tag.length < 2) {
        this.isValidTag = false;
        this.tagWarnText = "2 or more characters";
      } else {
        const regex = /^[a-zA-Z\d]+-?[a-zA-Z\d]*[a-zA-Z\d]$/;
        const found = tag.match(regex);
        if (found) {
          this.isValidTag = true;
        } else {
          this.isValidTag = false;
          this.tagWarnText =
            "Tags only support letters, numbers, spaces, and dashes.";
        }
      }
      return this.isValidTag;
      //      return tag === "abc";
      // return tag.length === 3;
      // const paragraph =
      //   "The quick brown fox jumps over the lazy dog. It barked.";
      // const regex = /[A-Z]/g;
      // const found = paragraph.match(regex);
      // console.log(found);
    },
    onTagAdded(tag) {
      // this.selectedTags.push(tag);
    },
    onTagRemoved(tag) {
      // var index = this.selectedTags.indexOf(tag);
      // if (index !== -1) this.selectedTags.splice(index, 1);
    },
    async getPostFromEditingPostForCreate() {
      const shortId = ApiService.makeId(8);
      const refCurrentUser = await UserService.getUserFromUid(this.currentUid);
      const newSlug = Slug(this.editingPost.title) + "-" + shortId;
      const tagArr = this.selectedTags;
      var newTags = [];
      tagArr.forEach(function(tag) {
        newTags.push(tag.value);
      });
      var post = {
        id: this.postId,
        title: this.editingPost.title,
        slug: newSlug,
        createdAt: null,
        updatedAt: null,
        deletedAt: null,
        contents: this.editingPost.contents,
        headerImage: this.editingPost.headerImage,
        likeCount: 0,
        commentCount: 0,
        paidCount: 0,
        status: 1,
        isToll: this.isToll,
        tags: newTags,
        price: Number(this.price),
        paylineIndex: this.paylineIndex,
        user: {
          profileImageUrl: refCurrentUser.profileImageUrl,
          username: refCurrentUser.username,
          name: refCurrentUser.name,
          uid: refCurrentUser.uid
        }
      };
      return post;
    },
    getPostFromEditingPostForUpdate() {
      console.log(
        "editingPost2: ",
        this.editingPost,
        this.editingPost.contents,
        this.post
      );
      const tagArr = this.selectedTags;
      var newTags = [];
      tagArr.forEach(function(tag) {
        newTags.push(tag.value);
      });
      var post = {
        title: this.editingPost.title,
        updatedAt: null,
        contents: this.editingPost.contents,
        headerImage: this.editingPost.headerImage,
        isToll: this.isToll,
        tags: newTags,
        price: Number(this.price),
        paylineIndex: this.paylineIndex
      };
      console.log(post, this.post, this.post.slug);
      return {
        post: post,
        postId: this.post.id,
        postSlug: this.post.slug
      };
    }
  },
  computed: {
    post() {
      const post = this.$store.getters["post_module/post"];
      return post;
    },
    editingPost() {
      var editingPost = this.$store.getters["post_module/editingPost"];
      return editingPost;
    },
    user() {
      let user = this.$store.getters["auth_module/user"];
      return user;
    },
    currentUid() {
      const currentUid = this.$store.getters["auth_module/currentUid"];
      return currentUid;
    }
  }
};
</script>

<style scoped>
.cancelBtn {
  font-size: 1.6rem;
  text-transform: capitalize;
  margin-right: 2rem;
}
.agreeBtn {
  font-size: 1.6rem;
  text-transform: capitalize;
}
.selectPayline {
  border-style: dotted;
  border-width: 2px;
  border-color: darkgray;
  color: #4e4e4e;
  text-align: center;
  line-height: 40px;
  cursor: pointer;
  max-width: 72rem;
  margin: 2rem auto;
}
.setPayline {
  color: white;
  text-align: center;
  line-height: 40px;
  background-color: black;
  font-weight: bold;
  max-width: 72rem;
  margin: 2rem auto;
}
.parentLine {
  margin: 50px 0px;
}
.content ::v-deep .medium-insert-embeds2.is-selected div,
.content ::v-deep .is-selected img {
  outline: initial;
}
.menu-text {
  /* text-align: center; */
  padding: 10px;
  font-size: 14px;
  line-height: 2em;
  /* max-width: "200"; */
}

@media (max-width: 576px) {
  .cancelBtn {
    font-size: 1.3rem;
    text-transform: capitalize;
    margin-right: 1rem;
  }
  .agreeBtn {
    font-size: 1.3rem;
    text-transform: capitalize;
  }
}
</style>
