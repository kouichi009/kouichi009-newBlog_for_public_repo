<template>
  <button class="btn-toggle" @click="addEmbed">
    <font-awesome-icon :icon="['fas', 'code']" />
  </button>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { ApiService } from "~/apis/constant_type";
import { UndoService } from "~/apis/editor/undo_service";
import { CaretService } from "~/apis/editor/caret_service";

library.add(faCode);

export default {
  props: ["editor", "insert"],
  data() {
    return {
      embedElm: null
    };
  },
  components: {
    FontAwesomeIcon
  },
  methods: {
    addEmbed() {
      let currentLine = this.insert.focusLine;
      var nextLine = currentLine.nextElementSibling;
      var preHTML = "";
      const nameId = ApiService.makeId(4);
      const nameId2 = ApiService.makeId(4);

      if (nextLine) {
        preHTML = `<pre name="${nameId}" class="hljs" spellcheck="false" data-type='PRE'><p name="${nameId2}" data-type='PRETEXT'><br></p></pre>`;
      } else {
        preHTML = `<pre name="${nameId}" class="hljs" spellcheck="false" data-type='PRE'><p name="${nameId2}" data-type='PRETEXT'><br></p></pre><p name="${nameId}" data-type="TEXT"><br></p>`;
      }

      let newCurrentArray = $(preHTML).replaceAll(currentLine);

      this.insert.isToggle = false;
      this.insert.isShow = false;

      if (newCurrentArray[0]) {
        CaretService.setCaretAtEnd(newCurrentArray[0]);
      }
      UndoService.saveHistory();
      this.$emit("editor-output");
    }
  }
};
</script>

<style>
pre {
  white-space: pre-wrap;
}
/* pre {
  font-family: "Menlo", monospace;
  font-size: 15px;
  background-color: #f0f0f0;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  color: #666;
} */
</style>
