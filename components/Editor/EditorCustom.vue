<template>
  <div>
    <nav-bar
      :path="path"
      :isTitleError="isTitleError"
      :isSaved="isSaved"
      :postId="postId"
    ></nav-bar>
    <client-only>
      <dialog-error ref="dialogErrorRef"></dialog-error>
    </client-only>

    <v-main>
      <div>
        <div v-if="isMobileOrTablet && !header.url">
          <label>
            <v-avatar color="grey" size="60" class="my-3 ml-1 image-container">
              <v-icon color="white" x-large>mdi-file-image</v-icon>
            </v-avatar>
            <div>
              <input
                class="file-upload-input"
                type="file"
                accept="image/*"
                @change="onImageChange"
              />
            </div>
          </label>
        </div>
        <div
          v-if="!isMobileOrTablet && !header.url"
          class="uploader"
          @dragover.prevent
          @drop.prevent="onImageChange"
        >
          <p>Drag your image here</p>
          <div>OR</div>
          <div class="file-input">
            <label for="file-select">Select a image</label>
            <input
              type="file"
              id="file-select"
              @change="onImageChange"
              accept="image/*"
            />
          </div>
        </div>
        <div class="header-section" v-else-if="header.url">
          <v-btn
            class="mt-6"
            dark
            small
            absolute
            top
            right
            fab
            color="pink"
            @click="resetHeader"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <label>
            <div
              v-if="header.url && header.width"
              @dragover.prevent
              @drop.prevent="onImageChange"
            >
              <v-img
                class="header-image"
                :src="header.url"
                :width="header.width"
                :height="header.height"
              ></v-img>
            </div>
            <div
              v-else-if="header.url && !header.width"
              @dragover.prevent
              @drop.prevent="onImageChange"
            >
              <v-img class="header-image" :src="header.url"></v-img>
            </div>

            <input
              class="file-upload-input"
              type="file"
              id="avatar_name"
              accept="image/*"
              @change="onImageChange"
            />
          </label>
        </div>
        <div style="max-width: 740px; margin: 0 auto;">
          <resizable-textarea>
            <textarea
              @keyup="
                onDebounce();
                inputing();
              "
              class="title-text"
              v-model="title"
              rows="1"
              placeholder="Title"
              @keydown.enter.exact.prevent
            ></textarea>
          </resizable-textarea>
        </div>
        <client-only>
          <editor
            @editor-output="editorOutput"
            @inputing="inputing"
            ref="editorRef"
          ></editor>
        </client-only>
        <dialog-now-loading :loading="loading"></dialog-now-loading>
      </div>
    </v-main>
  </div>
</template>

<script>
import ResizableTextarea from "~/assets/ResizableTextarea.js";
import debounce from "lodash/debounce";
import NavBar from "~/components/NavBar";
import { db, firebase } from "~/plugins/firebase";
import DialogNowLoading from "~/components/DialogNowLoading";

import {
  POST_CREATE,
  CHECK_OVERLAP_POST_ID,
  CREATE_EDITING_POST,
  UPDATE_EDITING_POST,
  FETCH_EDITING_POST,
  FETCH_POST_FROM_ID
} from "~/store/actions_type";
import DialogError from "~/components/DialogError";
import moment from "moment";
import { FETCH_END, SET_EDITINGPOST } from "~/store/mutations_type";
import { ApiService } from "~/apis/constant_type";
import Editor from "~/components/Editor/index";
export default {
  components: {
    NavBar,
    DialogError,
    ResizableTextarea,
    Editor,
    DialogNowLoading
  },
  data() {
    return {
      editor: null,
      contents: [],
      title: "",
      postId: "",
      path: {
        first: null,
        full: null
      },
      isTitleError: { bool: true, message: "Enter a title" },
      isSaved: false,
      status: 0,
      header: {
        url: "",
        width: 0,
        height: 0
      },
      isMobileOrTablet: false,
      loading: false
    };
  },
  async mounted() {
    if (this.$device.isMobileOrTablet) {
      this.isMobileOrTablet = true;
    }

    //タブキーの無効化。editor.jsは、タブキーで、移動してフォーカスさせると改行でバグが発生する。
    window.onkeydown = function(e) {
      if (e.keyCode == 9) return false; // Disable Tab!
    };
    const fullPath = this.$route.path;
    if (fullPath.includes("new")) {
      const firstPath = this.$route.path.replace(/\//g, "");
      this.path.first = firstPath;
      this.path.full = fullPath;
      this.postId = db.collection("posts").doc().id;
      this.isSaved = false;
      this.$store.commit(`post_module/${FETCH_END}`, null);
      this.$store.commit(`post_module/${SET_EDITINGPOST}`, null);
    } else {
      const splits = fullPath.split("/");
      var postId = splits[splits.length - 2];
      this.postId = postId;
      const firstPath = splits[splits.length - 3];
      this.path.first = firstPath;
      this.path.full = fullPath;
      const editingPost = this.$store.dispatch(
        `post_module/${FETCH_EDITING_POST}`,
        postId
      );
      const post = this.$store.dispatch(
        `post_module/${FETCH_POST_FROM_ID}`,
        postId
      );
      //※ postResponseは、NavPublish.vueのcomputedのpostに使われてる
      const [editingPostResponse, postResponse] = await Promise.all([
        editingPost,
        post
      ]);
      let contents = editingPostResponse.contents;
      this.title = editingPostResponse.title;
      this.status = editingPostResponse.status;
      this.showHeaderImage(editingPostResponse.headerImage);
      let dataArray = [];
      contents.forEach(function(block, index) {
        dataArray.push(block.data);
      });
      // dataStr = dataArray.join("");
      this.$refs.editorRef.setContent(dataArray.join(""));
    }
  },
  methods: {
    setContens1() {
      this.contents = [
        {
          data: { text: "test1" },
          type: "paragraph"
        }
      ];
      this.editorjs.destroy();
      this.mountEditor();
      //   this.editorjs.data = {
      //     blocks: this.contents,
      //   };
      //   delete this.editorjs;
      //   this.mountEditorJS();
      //   this.editorjs.data.blocks = this.contents;
    },
    inputing() {
      this.isSaved = false;
      console.log("input@@@@@@@5555555555555");
    },
    onChange() {},
    uploadCallback(url) {},
    onDebounce: debounce(function() {
      this.editorOutput();
    }, 2000),
    async editorOutput() {
      console.log("editorOoutPUT@@@@@@@");

      let isUplodingNow = $(".editor")
        .children("[data-type='IMG']")
        .hasClass("imgUploadingNow");
      if (isUplodingNow) {
        this.isSaved = true;
        return;
      }
      // return;
      const status = this.status;
      //
      let editorChildren = $(".editor")
        .children()
        .toArray();
      const title = this.title.trim();
      var contents = [];
      console.log("editorCHildren: ", editorChildren);
      editorChildren.forEach(block => {
        let contentBlock = {
          data: block.outerHTML,
          type: block.dataset.type
        };
        console.log("aa ", contentBlock);
        contents.push(contentBlock);
      });
      this.createDraftPost(title, contents, status);
      // this.createPost(title, contents, status);
    },
    async createDraftPost(title, contents, status) {
      var errorMessage = "";
      try {
        console.log(this.editingPost);
        if (this.editingPost) {
          console.log("postID: ", this.postId);
          await this.$store.dispatch(
            `post_module/${FETCH_EDITING_POST}`,
            this.postId
          );
        }
        console.log(
          "createDraftPost: ",
          this.postId,
          title,
          contents,
          status,
          this.editingPost
        );
        if (!this.editingPost) {
          const editingPost = {
            id: this.postId,
            title: title,
            contents: contents,
            status: status,
            uid: this.currentUid,
            headerImage: this.header.url,
            createdAt: null,
            updatedAt: null,
            deletedAt: null
          };
          let newEditingPost = await this.$store.dispatch(
            `post_module/${CREATE_EDITING_POST}`,
            editingPost
          );
        } else {
          const editingPost = {
            id: this.editingPost.id,
            title: title,
            contents: contents,
            headerImage: this.header.url,
            updatedAt: null
          };
          let newEditingPost = await this.$store.dispatch(
            `post_module/${UPDATE_EDITING_POST}`,
            editingPost
          );
        }
        this.isSaved = true;
      } catch (err) {
        console.log("errorMessage: ", err.message);
      }
    },
    // async updateDraftPost(title, contents, status) {
    //   var errorMessage = "";
    //   try {
    //     console.log("createDraftPost: ", this.postId, title, contents, status);
    //     const editingPost = {
    //       id: this.postId,
    //       title: title,
    //       contents: contents,
    //       status: status,
    //       uid: this.user.uid,
    //       headerImage: this.header.url,
    //       createdAt: null,
    //       updatedAt: null,
    //       deletedAt: null
    //     };
    //
    //     let newEditingPost = await this.$store.dispatch(
    //       `post_module/${CREATE_EDITING_POST}`,
    //       editingPost
    //     );
    //     this.isSaved = true;
    //   } catch (err) {
    //     console.log("errorMessage: ", err.message);
    //     errorMessage = err.message;
    //     this.$refs.dialogErrorRef.showError(`${errorMessage}`);
    //   }
    // },
    createLine(cont) {
      cont = cont.replace(/<[^>]*>/g, " ");
      cont = cont.replace(/\s+/g, " ");
      cont = cont.replace(/&nbsp;/g, " ");
      cont = cont.trim();
      var lettersCount = cont.length;
      var wordsCount = cont.split(" ").length;
      if (lettersCount >= 79) {
        //あとで実装する。79文字以上あったら改行扱いとする。
      }
    },
    preventNav(event) {
      //   if (!this.isEditing) return;
      event.preventDefault();
      event.returnValue = "";
    },
    async onDropHeader(e) {},
    async onImageChange(e) {
      try {
        console.log("onImageChange");
        this.loading = true;
        const images = e.target.files || e.dataTransfer.files;
        let rawImage = images[0];
        // console.log("rawImage: 2 ", rawImage);
        let compressedImage = await ApiService.compressImage(
          rawImage,
          800,
          800
        );
        if (!compressedImage) {
          this.$refs.dialogErrorRef.showError("Invalid image format");
          return;
        }
        let url = await ApiService.uploadImageToStorage(compressedImage);
        this.showHeaderImage(url);
      } catch (err) {
        console.log(err.message);
        this.$refs.dialogErrorRef.showError("Invalid image format");
      } finally {
        this.loading = false;
      }
    },
    showHeaderImage(url) {
      let that = this;
      var img = new Image();
      img.src = url;
      img.onload = () => {
        // console.log("typeof: ", typeof img.width);
        // console.log("width: ", img.width);
        // console.log("height: ", img.height);
        this.resetHeader();
        if (img.width > 760) {
          this.header.width = 0;
          this.header.height = 0;
        } else {
          this.header.width = img.width;
          this.header.height = img.height;
        }
        this.header.url = url;
        that.editorOutput();
      };
    },
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = error => reject(error);
      });
    },
    resetHeader() {
      // console.log("resetHeader()");
      this.header = {
        url: "",
        width: 0,
        height: 0
      };
    }
  },
  beforeMount() {
    // window.onpopstate = function () {
    //   alert("browser-back");
    // };
    window.addEventListener("beforeunload", this.preventNav);
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.preventNav);
  },
  watch: {
    title: function(newVal, oldVal) {
      const titleTrim = newVal.trim();
      if (titleTrim) {
        this.isTitleError.bool = false;
        this.isTitleError.message = "";
      } else {
        this.isTitleError.bool = true;
        this.isTitleError.message = "You need to write title";
      }
    }
  },
  computed: {
    user() {
      let user = this.$store.getters["auth_module/user"];
      return user;
    },
    editingPost() {
      var editingPost = this.$store.getters["post_module/editingPost"];
      return editingPost;
    },
    currentUid() {
      const currentUid = this.$store.getters["auth_module/currentUid"];
      return currentUid;
    }
  }
};
</script>

<style lang="scss">
.title-text {
  overflow: hidden;
  margin: 2rem auto;
  padding: 1rem;
  width: 100%;
  font-size: 4.2rem;
  display: block;
  line-height: 1.3;
  font-weight: bold;
  outline: none;
}
.header-section {
  position: relative;
  max-width: 800px;
  margin: 2rem auto;
}
.header-image {
  display: block;
  cursor: pointer;
  margin: 0 auto;
  width: 100%;
}
.file-upload-input {
  display: none;
}
.image-tool__caption {
  display: none;
}
.image-tool__image-picture {
  margin: 0 auto;
}
.cdx-settings-button[data-tune="withBorder"],
.cdx-settings-button[data-tune="withBackground"] {
  display: none;
}
.uploader {
  margin: 3rem auto;
  max-width: 720px;
  background: grey;
  color: #fff;
  padding: 40px 15px;
  text-align: center;
  border-radius: 10px;
  border: 3px dashed #fff;
  font-size: 20px;
  position: relative;
  .file-input {
    width: 200px;
    margin: auto;
    height: 68px;
    position: relative;
    label,
    input {
      background: #fff;
      color: black;
      width: 100%;
      position: absolute;
      left: 0;
      top: 0;
      padding: 10px;
      border-radius: 4px;
      margin-top: 7px;
      cursor: pointer;
    }
    input {
      opacity: 0;
      z-index: -2;
    }
  }
}
@media (max-width: 767px) {
  .title-text {
    font-size: 3.4rem;
    padding: 0 28px;
  }
}
/* https://github.com/minusobjects/Message-Publista */
</style>
