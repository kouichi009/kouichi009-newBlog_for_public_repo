<template>
  <div>
    <nav-bar></nav-bar>
    <div class="container">
      <client-only>
        <dialog-error ref="dialogErrorRef"></dialog-error>
      </client-only>
      <label>
        <v-avatar color="grey" size="120" class="mb-3 image-container">
          <v-img :src="avatar"></v-img>
          <div class="overlay icon">
            <v-icon size="70">mdi-camera</v-icon>
          </div>
        </v-avatar>
        <div>
          <input
            class="file-upload-input"
            type="file"
            id="avatar_name"
            accept="image/*"
            @change="onImageChange"
          />
        </div>
      </label>

      <br />
      <v-text-field
        v-model="name"
        label="Enter your name"
        single-line
        outlined
      ></v-text-field>
      <v-textarea
        v-model="description"
        outlined
        rows="4"
        label="Enter a short bio"
      ></v-textarea>

      <v-btn
        v-if="refCurrentUser"
        rounded
        outlined
        color="grey"
        x-large
        :loading="loading"
        @click="cancel"
        style="font-size: 18px; width: 120px;"
        >Cancel</v-btn
      >
      <v-btn
        rounded
        color="success"
        dark
        x-large
        :loading="loading"
        @click="upload"
        style="margin-left: 20px; font-size: 18px; width: 120px;"
        >Save</v-btn
      >
    </div>
    <dialog-now-loading :loading="loading"></dialog-now-loading>
  </div>
</template>

<script>
import {
  FETCH_POSTS,
  FETCH_NEXT_POSTS,
  LOGIN_EMAIL,
  UPDATE_USER,
  GET_USER_FROM_UID,
  GET_AUTH_CURRENTUSER
} from "~/store/actions_type";
import DialogError from "~/components/DialogError";
import DialogConfirmAccount from "~/components/DialogConfirmAccount";
import { db, firebase } from "~/plugins/firebase";
import { ApiService } from "~/apis/constant_type";
import DialogNowLoading from "~/components/DialogNowLoading";
import NavBar from "@/components/NavBar";

export default {
  components: { DialogError, NavBar, DialogNowLoading },
  data() {
    return {
      uploadFile: null,
      name: "",
      description: "",
      avatar: "",
      errorMessage: "",
      refCurrentUser: null,
      loading: false
    };
  },
  async mounted() {
    const authCurrentUser = await this.$store.dispatch(
      `auth_module/${GET_AUTH_CURRENTUSER}`
    );
    if (!authCurrentUser) {
      this.$router.push({ path: `/` });
      return;
    }
    let refCurrentUser = await this.$store.dispatch(
      `user_module/${GET_USER_FROM_UID}`,
      authCurrentUser.uid
    );
    this.refCurrentUser = refCurrentUser;
    this.name = refCurrentUser.name;
    this.description = refCurrentUser.description;
    this.avatar = refCurrentUser.profileImageUrl;
  },
  methods: {
    async onImageChange(e) {
      try {
        const images = e.target.files || e.dataTransfer.files;
        let rawImage = images[0];

        let compressedImage = await ApiService.compressImage(
          rawImage,
          300,
          300
        );
        if (!compressedImage) {
          this.$refs.dialogErrorRef.showError("Not recognized image");
          return;
        }
        this.uploadFile = compressedImage;
        this.getBase64(compressedImage).then(image => (this.avatar = image));
      } catch (err) {
        this.$refs.dialogErrorRef.showError("Not recognized image");
      }
    },
    setError(error, text) {
      this.error =
        (error.response && error.response.data && error.response.data.error) ||
        text;
    },
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    },
    async upload() {
      try {
        let authCurrentUser = await this.$store.dispatch(
          `auth_module/${GET_AUTH_CURRENTUSER}`
        );
        console.log(authCurrentUser);

        if (!authCurrentUser) {
          this.$router.push({ path: `/` });
          return;
        }
        this.loading = true;

        let refCurrentUser = this.refCurrentUser;
        console.log(this.uploadFile);
        if (this.uploadFile) {
          let url = await ApiService.uploadImageToStorage(this.uploadFile);
          refCurrentUser.profileImageUrl = url;
        }

        refCurrentUser.name = this.name;
        refCurrentUser.description = this.description;

        refCurrentUser = await this.$store.dispatch(
          `auth_module/${UPDATE_USER}`,
          {
            refCurrentUser,
            authCurrentUser
          }
        );

        this.$router.push({ path: `/u/${refCurrentUser.username}` });
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      } finally {
        this.loading = false;
      }
    },
    cancel() {
      this.$router.back();
    }
  }
};
</script>

<style>
.container {
  text-align: center;
  padding-top: 50px;
  max-width: 580px;
}

.overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
  opacity: 0;
  transition: 0.3s ease;
  background-color: lightgray;
}
.image-container {
  position: relative;
  cursor: pointer;
  /* width: 100%; */
  /* max-width: 400px; */
}
.image-container:hover .overlay {
  opacity: 0.8;
}

.icon {
  color: white;
  font-size: 100px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  text-align: center;
}

.file-upload-input {
  display: none;
}

.v-textarea textarea {
  line-height: 40px;
}
</style>
