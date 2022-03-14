<template>
  <div>
    <nav-bar></nav-bar>
    <div class="parent-container">
      <div class="container">
        <h2>Oops! Page not found.</h2>
        <h1>404</h1>
        <p>
          We can't find the page you're looking for.
        </p>
        <a href="/">Go back home</a>
      </div>
    </div>
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
  components: { NavBar },
  async mounted() {
    await this.$store.dispatch(`auth_module/${GET_AUTH_CURRENTUSER}`);
  }
};
</script>

<style scoped>
.parent-container {
  margin: 0;
  padding: 0;
  font-family: "montserrat", sans-serif;
  min-height: 100vh;
}

.container {
  width: 100%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  color: #343434;
}

.container h1 {
  font-size: 160px;
  margin: 0;
  font-weight: 900;
  letter-spacing: 20px;
  background: url("~@/assets/background_404.jpg") center no-repeat;
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
}

.container h2 {
  font-size: 40px;
}

.container p {
  font-size: 20px;
  margin-bottom: 30px;
}

.container a {
  text-decoration: none;
  background: #e55039aa;
  color: #fff;
  padding: 12px 24px;
  display: inline-block;
  border-radius: 25px;
  font-size: 16px;
  text-transform: uppercase;
  transition: 0.4s;
}

.container a:hover {
  background: #e55039;
}
</style>
