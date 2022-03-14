<template>
  <div></div>
</template>

<script>
import debounce from "lodash/debounce";
import { ApiService } from "~/apis/constant_type";
import { UndoService } from "~/apis/editor/undo_service";
import { EditorService } from "~/apis/editor/editor_service";
import { CaretService } from "~/apis/editor/caret_service";
import { ImageService } from "~/apis/editor/image_service";

export default {
  data() {
    return {};
  },
  props: ["editor"],
  methods: {
    subscribe() {
      let that = this;
      this.editor.subscribe("editableKeyup", this.detect);
      this.editor.subscribe("editableClick", this.detect);
      this.editor.subscribe("editableKeydown", this.handleKeydown2);
      this.editor.subscribe("editablePaste", this.editablePaste);
      this.editor.subscribe(
        "editableInput",
        debounce(function(event, editable) {
          if (event.type !== "input") {
            return;
          }
          that.editorOutput();

          UndoService.saveHistory();
        }, 500)
      );
      this.editor.subscribe("editableInput", this.editableInput);
    },

    unsubscribe() {
      //   this.editor.unsubscribe("editableKeyup", this.detectShowToggle);
      //   this.editor.unsubscribe("editableClick", this.detectShowToggle);
      this.editor.unsubscribe("editableKeydown", this.handleKeydown2);
      // this.editor.unsubscribe(
      //   "editableKeydownDelete",
      //   this.editableKeydownDelete
      // );

      // this.editor.unsubscribe("editableInput", this.editableInput);
    },

    editableInput(event) {
      EditorService.editableInput(event);
    },
    editablePaste(event, target) {
      EditorService.editablePaste();
    },

    detect(e) {
      try {
        let currentLine = EditorService.getDetectCurrentLine(e);
        if (!currentLine) return;

        if (currentLine.innerText.trim() !== "") {
          $(".medium-editor-action-image").prop("disabled", true);
          $(".medium-editor-action-image .fa-image").addClass(
            "font-button-inactive"
          );
        } else {
          $(".medium-editor-action-image").prop("disabled", false);
          $(".medium-editor-action-image .fa-image").removeClass(
            "font-button-inactive"
          );
        }
        $(".editor .is-selected").removeClass("is-selected");
        $(".fa-quote-right").removeClass("font-button-active");

        if (currentLine.dataset.type === "BLOCKQUOTE") {
          $(".medium-editor-action-quote").addClass(
            "medium-editor-button-active"
          );

          $(".fa-quote-right").addClass("font-button-active");

          return;
        }

        if (
          currentLine.tagName === "H3" &&
          CaretService.isCaretAtStart(currentLine)
        ) {
          let prevAll = $(currentLine).prevAll();
          const newNameId = ApiService.makeId(4);
          $(currentLine).attr("name", newNameId);
          $.each(prevAll, function(index, element) {
            if (
              !element.dataset.type &&
              element.tagName === "P" &&
              element.innerText.trim().length === 0
            ) {
              const newNameId = ApiService.makeId(4);
              $(element).attr("name", newNameId);
              element.dataset.type = "TEXT";
            }
          });
          return;
        }
        if (currentLine && currentLine.dataset.type === "IMG") {
          this.selectImage(currentLine);
        } else if (currentLine && currentLine.dataset.type === "EMBED") {
          this.selectImage(currentLine);
        }
      } catch (err) {
        console.log("err@@@@@@@@@@@@@: ", err.message);
      }
    },
    selectImage(imgLine) {
      imgLine.classList.add("is-selected");

      CaretService.setCaretAtEnd(imgLine);
      this.editor.saveSelection();
    },

    handleKeydown2: function(event) {
      let {
        previousLine,
        currentLine,
        nextLine,
        isCaretAtStart,
        isCaretAtEnd
      } = EditorService.pushKeyDown(event);
      switch (event.which) {
        case 8:
          EditorService.pushBackSpace(
            previousLine,
            currentLine,
            nextLine,
            isCaretAtStart,
            isCaretAtEnd,
            event
          );
          break;
        case 13:
          EditorService.pushEnter(currentLine, isCaretAtStart, event);
          break;

        default:
          break;
      }
    },

    setImage() {
      let that = this;
      let $input = $(
        `<input id="file-input" type="file" name="name" accept="image/png,image/gif,image/jpeg,image/webp" style="display: none;" />`
      ).insertAfter(".medium-editor-action-image");
      $input[0].onchange = e => {
        let file = e.target.files[0];
        var currentLine = that.editor.getSelectedParentElement();
        currentLine = EditorService.getClosestParentNode(currentLine);
        console.log("onchange: ", currentLine, file);
        that.insertImage(currentLine, file);
      };
    },
    insertImage(currentLine, file) {
      // FileReaderの生成
      const reader = new FileReader();
      let that = this;

      reader.onload = async function() {
        // ファイルを読み込んだ後の処理
        let dataUrl = reader.result;
        let isBigger = await ImageService.isBiggerThanNormal(dataUrl);
        var stretchClass = "is-normal";
        if (!isBigger) {
          stretchClass = "not-stretch";
        }

        var previousLine = currentLine.previousElementSibling;
        var nextLine = currentLine.nextElementSibling;

        const nameId = ApiService.makeId(4);

        var imgHTML = "";
        if (nextLine) {
          imgHTML = `<p name='${nameId}' contenteditable="false" class='imgUploadingNow redo undo editor-image ${stretchClass}' data-type='IMG'><img src="${dataUrl}" /></p>`;
        } else {
          imgHTML = `<p name='${nameId}' contenteditable="false" class='imgUploadingNow redo undo editor-image ${stretchClass}' data-type='IMG'><img src="${dataUrl}" /></p><p name='9876' class='USA' data-type='TEXT'><br></p>`;
        }

        let newCurrentArray = $(imgHTML).replaceAll(currentLine);
        let imgLine = newCurrentArray[0];

        let compressedFile = await ApiService.compressImage(file, 2000, 1100);
        let url = await ApiService.uploadImageToStorage(compressedFile);
        imgLine.classList.remove("imgUploadingNow");
        imgLine.firstChild.src = url;

        that.editorOutput();
        UndoService.saveHistory();
      };
      // ファイルの読み込み
      reader.readAsDataURL(file);
    },
    editorOutput() {
      this.$emit("editor-output");
    }
  },
  mounted() {
    this.subscribe();

    this.setImage();

    $(".medium-editor-toolbar-close").click(function() {
      $(".medium-editor-toolbar-form").removeClass(
        "medium-editor-toolbar-form-active"
      );
      $("#medium-editor-toolbar-actions1").css("display", "block");
    });
  },
  destroyed() {
    this.unsubscribe();
  }
};
</script>

<style>
.font-button-inactive {
  background-color: transparent;
  color: grey;
}
/* 
.medium-editor-button-active i {
  color: #fff;
}
.medium-editor-action-quote i {
  color: #fff;
} */

/* .overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
  opacity: 0.3;
  transition: 0.5s ease;
  background-color: #008cba;
} */
</style>
