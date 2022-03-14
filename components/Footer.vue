<template>
  <footer data-v-2aa62fa0="" class="o-footer o-footer--article">
    <ul data-v-2aa62fa0="" class="o-footer__menu">
      <li
        data-v-2aa62fa0=""
        class="o-footer__item"
        v-for="(menu, index) in menuAll"
        :key="index"
      >
        <a
          data-v-2aa62fa0=""
          :href="menu.url"
          class="a-link o-footer__link fn"
          data-v-0446330f=""
          target="_blank"
        >
          {{ menu.title }}
        </a>
      </li>
    </ul>
  </footer>
</template>

<script>
import { HELP_CENTER_MENUS } from "~/apis/constant_type";
export default {
  data() {
    return {
      menuAll: []
    };
  },
  mounted() {
    const addMenus = [
      {
        title: "Privacy Policy",
        url: "/help/privacy_policy"
      },
      {
        title: "Terms & Conditions",
        url: "/help/terms_conditions"
      }
    ];
    this.menuAll = HELP_CENTER_MENUS.concat(addMenus);
  }
};
</script>
<style scoped>
.o-footer[data-v-2aa62fa0] {
  padding: 40px 16px 32px;
  background-color: #f6f9f9;
}
.o-footer__menu[data-v-2aa62fa0] {
  display: inline-flex;
  flex-wrap: wrap;
  -webkit-box-pack: center;
  justify-content: center;
  width: 100%;
}

ul[data-v-2aa62fa0] {
  list-style-type: none;
}

.o-footer__link[data-v-2aa62fa0] {
  color: #6f7372;
}
a[data-v-0446330f] {
  color: inherit;
  text-decoration: none;
}
.o-footer__item[data-v-2aa62fa0] {
  margin-right: 8px;
  margin-bottom: 8px;
  margin-left: 8px;
  font-size: 12px;
}
</style>
