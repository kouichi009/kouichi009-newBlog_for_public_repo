<template>
  <div>
    <editor-custom></editor-custom>
  </div>
</template>

<script>
import EditorCustom from "~/components/Editor/EditorCustom";
import { GET_AUTH_CURRENTUSER } from "~/store/actions_type";

export default {
  data() {
    return {
      currentUid: ""
    };
  },
  async mounted() {
    let authCurrentUser = await this.$store.dispatch(
      `auth_module/${GET_AUTH_CURRENTUSER}`
    );
    if (!authCurrentUser) {
      this.$router.push({ path: `/` });
    }
  },
  components: {
    EditorCustom
  }
};
</script>
