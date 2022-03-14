<template>
  <div>
    <v-navigation-drawer app right :width="300" v-model="drawer">
      <v-list-item>
        <v-list-item-title class="title">
          Categories
        </v-list-item-title>
        <v-spacer></v-spacer>
        <v-btn class="right" icon @click="drawer = false">
          <v-icon medium color="black">mdi-close</v-icon>
        </v-btn>
      </v-list-item>
      <v-divider />
      <v-list nav>
        <v-list-item
          v-for="(menu, index) in HELP_CENTER_MENUS"
          :key="index"
          :to="menu.url"
        >
          <v-list-item-content>
            <v-list-item-title style="font-size: 14px; margin-left: 30px;">{{
              menu.title
            }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <h1 @click="toHome" style="cursor: pointer;">Home</h1>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <h1>Help Center</h1>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>
  </div>
</template>

<script>
import { HELP_CENTER_MENUS } from "~/apis/constant_type";
export default {
  data: () => ({
    drawer: false,
    HELP_CENTER_MENUS: HELP_CENTER_MENUS
  }),
  methods: {
    toHome() {
      this.$router.push({ path: `/` });
    }
  }
};
</script>
