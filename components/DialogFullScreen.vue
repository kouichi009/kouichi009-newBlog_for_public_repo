<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="dialog = false">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <div>
          <div class="center">
            <h1>{{title}}</h1>
            <p>{{description}}</p>
            <br />
          </div>
        </div>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      type: "",
      title: "",
      description: "",
      agreeBtnText: "",
    };
  },
  show(type) {
    this.dialog = true;
    this.type = type;
    switch (type) {
      case "username":
        this.title = "Confirm";
        this.description = `When you change your name, existing links to your profile will no longer work. You must update this link on any external sites.`;
        this.agreeBtnText = "I understand, change my name";
        break;
      case "":
        break;

      default:
        console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");
        break;
    }
  },
};
</script>

<style scoped>
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  -moz-transform: translateX(-50%) translateY(-50%);
  -webkit-transform: translateX(-50%) translateY(-50%);
  transform: translateX(-50%) translateY(-50%);
}
</style>