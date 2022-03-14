<template>
  <div>
    <nav-bar></nav-bar>
    <dialog-error ref="dialogErrorRef"></dialog-error>
    <v-main>
      <div class="container-fluid mx-auto my-2">
        <v-list>
          <template v-for="(displaySalePost, index) in displaySalesPosts">
            <sale-post
              :displaySalePost="displaySalePost"
              :index="index"
              :key="displaySalePost.id"
            ></sale-post>
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
import { SET_POSTS } from "~/store/mutations_type";
import SalePost from "~/components/SalePost.vue";
import DialogError from "~/components/DialogError";
import { AuthService } from "~/apis/auth_service";
import {
  FETCH_PUBLIC_POSTS,
  FETCH_SALES_POSTS,
  GET_AUTH_CURRENTUSER
} from "~/store/actions_type";
import { RESET_STATE } from "~/store/mutations_type";
export default {
  components: {
    NavBar,
    SalePost,
    DialogError
  },
  data() {
    return {
      lastVisible: null,
      isFirstCalled: false,
      displaySalesPosts: [],
      page: 1,
      length: 0,
      pageSize: 3,
      selectedPostIndex: -1
    };
  },
  async mounted() {
    try {
      this.$store.commit(`transfer_module/${RESET_STATE}`);
      console.log("details@@@@@@@@@@@ ", RESET_STATE);
      let authCurrentUser = await this.$store.dispatch(
        `auth_module/${GET_AUTH_CURRENTUSER}`
      );
      if (!authCurrentUser) {
        this.$router.push({ path: `/` });
        return;
      }
      this.$store.dispatch(`transfer_module/${FETCH_SALES_POSTS}`, {
        currentUid: authCurrentUser.uid
      });
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
      this.displaySalesPosts = this.salesPosts.slice(
        this.pageSize * (pageNumber - 1),
        this.pageSize * pageNumber
      );
    }
  },

  watch: {
    salesPosts: function(newValArray, oldValArray) {
      if (0 < newValArray.length) {
        this.length = Math.ceil(newValArray.length / this.pageSize);
        this.displaySalesPosts = newValArray.slice(
          this.pageSize * (this.page - 1),
          this.pageSize * this.page
        );
      }
    }
  },

  computed: {
    salesPosts() {
      const salesPosts = this.$store.getters["transfer_module/salesPosts"];
      return salesPosts;
    }
  }
};
</script>

<style scoped>
.container-fluid {
  max-width: 720px;
}
</style>
