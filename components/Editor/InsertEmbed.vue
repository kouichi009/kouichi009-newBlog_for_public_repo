<template>
  <div class="image-handler-container">
    <div
      class="insert-image-container"
      v-show="insert.isShow"
      v-bind:style="insert.position"
    >
      <div class="insert-image-toggle">
        <button v-on:click="toggle" class="btn-toggle">
          <font-awesome-icon icon="plus" />
        </button>
      </div>
      <div class="insert-image-menu" v-show="insert.isToggle">
        <insert-image
          :editor="editor"
          :insert="insert"
          :imgHandler="imgHandler"
          :dropImgLine="dropImgLine"
          ref="insertImgRef"
          title="Insert Image"
          @imageClick="imageClickHandler"
          @editor-output="editorOutput"
        ></insert-image>
        <insert-gist
          :editor="editor"
          :insert="insert"
          title="Insert gist"
          @editor-output="editorOutput"
        ></insert-gist>
        <insert-divider
          :editor="editor"
          :insert="insert"
          @editor-output="editorOutput"
        ></insert-divider>
      </div>
    </div>
    <image-position
      :imgHandler="imgHandler"
      @editor-output="editorOutput"
    ></image-position>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import { ApiService } from "~/apis/constant_type";
import { UndoService } from "~/apis/editor/undo_service";
import { EditorService } from "~/apis/editor/editor_service";
import { CaretService } from "~/apis/editor/caret_service";
import InsertImage from "./Embed/InsertImage";
import InsertGist from "./Embed/InsertGist";
import InsertDivider from "./Embed/InsertDivider";
import ImagePosition from "./Embed/ImagePosition";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
library.add(faPlus);
export default {
  components: {
    FontAwesomeIcon,
    InsertImage,
    ImagePosition,
    InsertGist,
    InsertDivider
  },
  data() {
    return {
      insert: {
        position: {
          top: "0",
          left: "0"
        },
        isShow: false,
        isToggle: false,
        embedElm: null,
        files: [],
        focusLine: null
      },
      imgHandler: {
        currentLine: null,
        currentSize: "is-normal",
        position: {
          top: "0px"
        },
        isShow: false
      }
    };
  },
  props: ["editor", "dropImgLine", "mediumEditor", "toolbarJquery"],
  methods: {
    subscribe() {
      let that = this;
      this.editor.subscribe("editableKeyup", this.detectShowToggle);
      this.editor.subscribe("editableClick", this.detectShowToggle);
      this.editor.subscribe("editableKeydown", this.handleKeydown2);
      this.editor.subscribe("editablePaste", this.editablePaste);
      this.editor.subscribe(
        "editableInput",
        debounce(function(event, editable) {
          if (event.type !== "input") {
            return;
          }
          that.editorOutput();
          console.log("embed INPUT:");

          UndoService.saveHistory();
        }, 500)
      );
      this.editor.subscribe("editableInput", this.editableInput);
    },

    unsubscribe() {
      this.editor.unsubscribe("editableKeyup", this.detectShowToggle);
      this.editor.unsubscribe("editableClick", this.detectShowToggle);
      this.editor.unsubscribe("editableKeydown", this.handleKeydown2);
    },

    editorOutput() {
      this.$emit("editor-output");
    },

    editableInput(event) {
      EditorService.editableInput(event);
    },
    editablePaste(event, target) {
      EditorService.editablePaste();
    },

    detectShowToggle(e) {
      try {
        let currentLine = EditorService.getDetectCurrentLine(e);
        if (!currentLine) return;

        $(".editor .is-selected").removeClass("is-selected");
        this.imgHandler.isShow = false;
        this.insert.isToggle = false;

        const selectedArray = this.mediumEditor.selection.getSelectedElements(
          document
        );

        this.toolbarJquery.show();

        if (selectedArray.length > 0) {
          this.hideToolbar(selectedArray);
        }

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
          this.$refs.insertImgRef.selectImage(currentLine);
        } else if (currentLine && currentLine.dataset.type === "EMBED") {
          $(currentLine).addClass("is-selected");
          CaretService.setCaretAtEnd(currentLine);
        }

        let isList = currentLine.tagName === "li";
        let isPre = currentLine.parentNode.tagName === "PRE";
        let isEmbed = $(currentLine.parentNode).hasClass(
          "medium-insert-embeds2"
        );
        const content = currentLine.innerHTML
          .replace(/^(<br\s*\/?>)+/, "")
          .trim();
        if (content || isList || isPre || isEmbed) {
          // Not show toggle if focus line has content & list
          this.insert.isShow = false;
          this.insert.isToggle = false;
          this.insert.focusLine = null;
        } else {
          let top = currentLine.offsetTop;
          let left = currentLine.offsetLeft;
          const currentPos = currentLine.getBoundingClientRect();
          this.insert.position.top = currentPos.top + "px";
          this.insert.position.left = currentPos.left + "px";
          this.insert.isShow = true;
          this.insert.focusLine = currentLine;
        }
      } catch (err) {
        console.log("err@@@@@@@@@@@@@: ", err.message);
      }
    },

    hideToolbar(selectedArray) {
      let that = this;

      $.each(selectedArray, function(index, element) {
        if (
          element.dataset.type === "PRETEXT" ||
          element.dataset.type === "IMG"
        ) {
          that.toolbarJquery.hide();
        }
      });
    },

    handleKeydown2: function(event) {
      //
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
        case 37:
          if (isCaretAtStart && !event.shiftKey) {
            this.moveImageEmbed(event, previousLine, currentLine);
          }
          break;
        case 38:
          if (!event.shiftKey) {
            this.moveImageEmbed(event, previousLine, currentLine);
          }
          break;
        case 39:
          if (isCaretAtEnd && !event.shiftKey) {
            this.moveImageEmbed(event, nextLine, currentLine);
          }
          break;
        case 40:
          if (!event.shiftKey) {
            this.moveImageEmbed(event, nextLine, currentLine);
          }
          break;
        case 46:
          if (
            currentLine.dataset.type === "EMBED" ||
            currentLine.dataset.type === "IMG"
          ) {
            EditorService.deleteLine(event, currentLine);
          } else if (
            nextLine &&
            isCaretAtEnd &&
            (nextLine.dataset.type === "EMBED" ||
              nextLine.dataset.type === "IMG" ||
              nextLine.dataset.type === "DIVIDE")
          ) {
            EditorService.deleteLine(event, nextLine);
          }

          break;

        default:
          break;
      }
    },

    moveImageEmbed(event, moveToLine, currentLine) {
      if (
        moveToLine &&
        (moveToLine.dataset.type === "EMBED" ||
          moveToLine.dataset.type === "IMG")
      ) {
        EditorService.moveCaret(event, moveToLine);
      } else if (
        moveToLine &&
        (currentLine.dataset.type === "EMBED" ||
          currentLine.dataset.type === "IMG")
      ) {
        EditorService.moveCaret(event, moveToLine);
      }
    },

    toggle() {
      this.insert.isToggle = !this.insert.isToggle;
    },
    imageClickHandler(value) {
      this.imgHandler = value;
    },
    handleScroll() {
      if (this.insert.isShow) {
        const currentLine = this.editor.getSelectedParentElement();
        const currentPos = currentLine.getBoundingClientRect();
        this.insert = {
          ...this.insert,
          isShow: true,
          focusLine: currentLine,
          position: {
            top: currentPos.top + "px",
            left: currentPos.left + "px"
          }
        };
      }
    }
  },
  mounted() {
    this.subscribe();
  },
  destroyed() {
    this.unsubscribe();
  },
  beforeMount() {
    this.window = window;
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  }
};
</script>

<style>
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
