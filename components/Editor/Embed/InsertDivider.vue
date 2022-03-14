<template>
  <button class="btn-toggle" @click="addEmbed">
    <font-awesome-icon :icon="['fas', 'minus']" />
  </button>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faMinus } from "@fortawesome/free-solid-svg-icons";
import { ApiService } from "~/apis/constant_type";
import { UndoService } from "~/apis/editor/undo_service";
import { CaretService } from "~/apis/editor/caret_service";

library.add(faMinus);

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
      var previousLine = currentLine.previousElementSibling;
      var nextLine = currentLine.nextElementSibling;
      let nameId1 = ApiService.makeId(4);
      let nameId2 = ApiService.makeId(4);
      var divideHTML = "";
      if (nextLine) {
        divideHTML = `<div name='${nameId1}' data-type='DIVIDE' contenteditable='false'><hr class='section-divider' /></div>`;
      } else {
        divideHTML = `<div name='${nameId1}' data-type='DIVIDE' contenteditable='false'><hr class='section-divider' /></div><p name='${nameId2}' data-type='TEXT'><br></p>`;
      }

      let newCurrentArray = $(divideHTML).replaceAll(currentLine);

      this.insert.isToggle = false;
      this.insert.isShow = false;

      if (newCurrentArray[1]) {
        CaretService.setCaretAtEnd(newCurrentArray[1]);
      }
      UndoService.saveHistory();
      this.$emit("editor-output");
    }
  }
};
</script>

<style>
hr.section-divider {
  margin-top: 52px;
  margin-bottom: 42px;
  background-color: red;
}

hr.section-divider {
  display: block;
  border: 0;
  text-align: center;
  overflow: visible;
}

hr.section-divider:before {
  --x-height-multiplier: 0.342;
  --baseline-multiplier: 0.22;
  font-family: medium-content-slab-serif-font, Georgia, Cambria,
    "Times New Roman", Times, serif;
  font-weight: 400;
  font-style: italic;
  font-size: 30px;
  letter-spacing: 0.6em;
}
hr.section-divider:before {
  content: "...";
  display: inline-block;
  margin-left: 0.6em;
  color: rgba(0, 0, 0, 0.68);
  position: relative;
  top: -30px;
}
</style>
