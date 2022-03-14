<template>
  <div v-if="authCurrentUser">
    <dialog-error ref="dialogErrorRef"></dialog-error>
    <v-menu offset-y v-if="!isLoading">
      <template v-slot:activator="{ on }">
        <v-badge
          :content="badgeCount"
          :value="badgeCount"
          color="green"
          overlap
          class="mr-5"
        >
          <v-icon large v-on="on" @click="resetBadge">mdi-bell-outline</v-icon>
        </v-badge>
      </template>
      <v-card class="mx-auto scroll" tile>
        <v-list>
          <v-subheader class="title">Notifications</v-subheader>
          <v-list-item-group
            v-for="(notification, i) in notifications"
            :key="i"
          >
            <v-list-item v-if="notification.info.type === 'admin'">
              <v-list-item-avatar>
                <v-img
                  class="noti-avatar"
                  src="https://d291vdycu0ht11.cloudfront.net/nuxt/production/img/37bc316.png"
                ></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>{{
                  notification.message
                }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <!-- ///////////////////////////////////////////////////////////////// -->

            <v-list-item
              v-else-if="notification.user && notification.post"
              @click="goToDetail(notification)"
            >
              <v-list-item-avatar>
                <v-img
                  class="noti-avatar"
                  :src="notification.user.profileImageUrl"
                ></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="my-0">
                  <nuxt-link :to="`/u/${notification.user.username}`">
                    <span class="black--text">{{
                      notification.user.name
                    }}</span> </nuxt-link
                  >&nbsp; &nbsp;
                  <span class="grey--text text--darken-1">
                    {{ notification.message }}
                  </span>
                </v-list-item-title>
                <v-list-item-title class="my-0">{{
                  notification.post.title
                }}</v-list-item-title>

                <v-list-item-subtitle class="grey--text text--darken-1 my-0">
                  {{ notification.date }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <!-- ///////////////////////////////////////////////////////////////// -->

            <v-list-item v-else>
              <v-list-item-avatar>
                <v-img
                  class="noti-avatar"
                  src="https://d291vdycu0ht11.cloudfront.net/nuxt/production/img/37bc316.png"
                ></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title
                  >This post was already removed.</v-list-item-title
                >
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
          </v-list-item-group>
          <client-only>
            <infinite-loading-component
              :componentName="'notification'"
              @infinite-handler="infiniteHandler"
            ></infinite-loading-component>
          </client-only>
        </v-list>
      </v-card>
    </v-menu>

    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-avatar class="mr-1">
            <img :src="authCurrentUser.photoURL" alt="avatar" />
          </v-avatar>
        </v-btn>
      </template>

      <v-list flat>
        <v-list-item @click="goToUserProfile">
          <v-list-item-content>
            <v-list-item-title class="title black--text">
              {{ authCurrentUser.displayName }}
              <br />
              <span style="font-weight: normal; color: grey;"
                >Show my pages</span
              >
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item-group v-for="(item, i) in items" :key="`first-${i}`">
          <nuxt-link :to="item.url">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title
                  class="black--text"
                  v-text="item.title"
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </nuxt-link>
        </v-list-item-group>
        <v-divider></v-divider>
        <v-list-item-group v-for="(item, i) in items2" :key="`second-${i}`">
          <v-list-item v-if="item.url === '/'" @click="handleSignOut">
            <v-list-item-content>
              <v-list-item-title
                class="black--text"
                v-text="item.title"
              ></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <nuxt-link :to="item.url" v-else>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title
                  class="black--text"
                  v-text="item.title"
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </nuxt-link>
        </v-list-item-group>
      </v-list>
    </v-menu>
    <v-btn
      v-if="!pencilBtnFlg"
      color="#2CB696"
      class="ml-2 white--text text-capitalize"
      to="/new"
      style="font-size: 1.6rem;"
      nuxt
      >Write a story</v-btn
    >
    <v-btn class="ml-2" v-else-if="pencilBtnFlg" icon to="/new" nuxt>
      <v-icon color="#2CB696" class="ml-2" style="font-size: 60px;"
        >mdi-pencil-box</v-icon
      >
    </v-btn>
  </div>
</template>

<script>
import InfiniteLoadingComponent from "~/components/InfiniteLoadingComponent.vue";
import {
  FETCH_NOTIFICATIONS,
  FETCH_NEXT_NOTIFICATIONS,
  RESET_BADGE_NOTIFICATIONS,
  LOGOUT
} from "~/store/actions_type";
import { UserService } from "~/apis/user_service";
import DialogError from "~/components/DialogError";
export default {
  data() {
    return {
      pencilBtnFlg: false,
      lastVisible: null,
      isEmpty: false,
      errorMessage: "",
      items: [
        { title: "Articles", url: "/notes/drafts" },
        { title: "Liked Articles", url: "/notes/liked" },
        { title: "Purchased Articles", url: "/notes/purchased" }
      ],
      items2: [
        { title: "Settings", url: "/settings/account" },
        { title: "Help", url: "/help/contactus" },
        { title: "Sign out", url: "/" }
      ],
      url: {}
    };
  },
  components: {
    DialogError,
    InfiniteLoadingComponent
  },
  async mounted() {
    var x = window.matchMedia("(max-width: 576px)");
    if (x.matches) {
      this.pencilBtnFlg = true;
    }
    let returnObj = await this.firstCall();
    this.lastVisible = returnObj.lastVisible;
    this.isEmpty = returnObj.isEmpty;
  },
  methods: {
    async goToUserProfile() {
      const refCurrentUser = await UserService.getUserFromUid(
        this.authCurrentUser.uid
      );
      this.$router.push({ path: `/u/${refCurrentUser.username}` });
    },

    async infiniteHandler($state) {
      console.log("infiniteHandler notification@@@@@@@@@@@@@@@@@: ");
      try {
        if (this.isEmpty) {
          $state.complete();
          return;
        }
        const returnObj = await this.nextCall();
        this.lastVisible = returnObj.lastVisible;
        if (returnObj.isEmpty) {
          $state.complete();
        } else {
          $state.loaded();
        }
      } catch (err) {
        this.errorMessage = err.message;
        $state.complete();
      }
    },
    async firstCall() {
      let returnObj = await this.$store.dispatch(
        `notification_module/${FETCH_NOTIFICATIONS}`,
        this.authCurrentUser.uid
      );
      return returnObj;
    },
    async nextCall() {
      const returnObj = await this.$store.dispatch(
        `notification_module/${FETCH_NEXT_NOTIFICATIONS}`,
        {
          currentUid: this.authCurrentUser.uid,
          lastVisible: this.lastVisible,
          notifications: this.notifications
        }
      );
      return returnObj;
    },
    goToDetail(notification) {
      var url = "";
      switch (notification.info.type) {
        case "like":
        case "paid":
          if (notification.post.status === 1) {
            url = `/n/${notification.post.slug}`;
            this.$router.push({ path: url });
          } else {
            this.$refs.dialogErrorRef.showError(
              "This post has been already deleted."
            );
          }
          break;
        case "comment":
          if (notification.comment.status === 1) {
            url = `/n/${notification.post.slug}/comments`;
            this.$router.push({ path: url });
          } else {
            this.$refs.dialogErrorRef.showError(
              "This comment has been already deleted."
            );
          }
          break;
        default:
          console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");
          break;
      }
    },
    async handleSignOut() {
      try {
        console.log("logout 0");
        await this.$store.dispatch(`auth_module/${LOGOUT}`);
        console.log("logout 4");
        if (this.$route.path === "/") {
          window.location.reload();
        } else {
          this.$router.push({ path: `/` });
        }
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      }
    },
    resetBadge() {
      if (this.badgeCount > 0) {
        const currentUid = this.authCurrentUser.uid;
        this.$store.dispatch(
          `notification_module/${RESET_BADGE_NOTIFICATIONS}`,
          currentUid
        );
      }
    }
  },
  computed: {
    notifications() {
      const notifications = this.$store.getters[
        "notification_module/notifications"
      ];
      return notifications;
    },
    isLoading() {
      return this.$store.getters["notification_module/isLoading"];
    },
    badgeCount() {
      return this.$store.getters["notification_module/badgeCount"];
    },
    authCurrentUser() {
      const authCurrentUser = this.$store.getters[
        "auth_module/authCurrentUser"
      ];
      return authCurrentUser;
    }
  }
};
</script>

<style scoped>
.scroll {
  overflow-y: auto;
  max-width: 40rem;
  max-height: 40rem;
}
div a {
  text-decoration: none;
}
.v-list-item__title {
  font-size: 1.4rem;
}
.v-list-item__subtitle {
  font-size: 1.2rem;
}
@media (max-width: 576px) {
  .scroll {
    max-width: 25rem;
    max-height: 30rem;
  }
}
</style>
