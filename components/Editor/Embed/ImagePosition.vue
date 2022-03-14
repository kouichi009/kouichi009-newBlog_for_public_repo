<template>
  <div>
    <div
      class="image-handler"
      v-if="imgHandler.isShow"
      :style="imgHandler.position"
    >
      <div class="image-hander-menu">
        <button class="btn-toggle" v-on:click="imageSizing('is-normal')">
          <img
            src="~/assets/icons/image-align-normal-active.png"
            v-if="imgHandler.currentSize == 'is-normal'"
          />
          <img
            src="~/assets/icons/image-align-normal.png"
            v-if="imgHandler.currentSize != 'is-normal'"
          />
        </button>
        <button class="btn-toggle" v-on:click="imageSizing('is-expand')">
          <img
            src="~/assets/icons/image-align-expand-active.png"
            v-if="imgHandler.currentSize == 'is-expand'"
          />
          <img
            src="~/assets/icons/image-align-expand.png"
            v-if="imgHandler.currentSize != 'is-expand'"
          />
        </button>
        <button class="btn-toggle" v-on:click="imageSizing('is-full')">
          <img
            src="~/assets/icons/image-align-full-active.png"
            v-if="imgHandler.currentSize == 'is-full'"
          />
          <img
            src="~/assets/icons/image-align-full.png"
            v-if="imgHandler.currentSize != 'is-full'"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { EditorService } from "~/apis/editor/editor_service";
import { UndoService } from "~/apis/editor/undo_service";

export default {
  props: ["imgHandler"],
  methods: {
    imageSizing(sizing) {
      let oldSize = this.imgHandler.currentSize;
      let newSize = sizing;
      this.imgHandler.currentSize = sizing;
      this.imgHandler.currentLine.className =
        "editor-image is-selected " + sizing;
      EditorService.imgSelectCaretPostion_ForFixedBug();
      if (oldSize === newSize) return;
      UndoService.saveHistory();
      this.$emit("editor-output");
    }
  }
};
</script>
