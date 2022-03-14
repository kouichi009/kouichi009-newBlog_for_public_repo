<template>
  <div>
    <div class="medium-editor-container">
      <div v-if="!isMobileOrTablet">
        <insert-embed
          v-if="editor"
          :dropImgLine="dropImgLine"
          :editor="editor"
          :mediumEditor="mediumEditor"
          :toolbarJquery="$toolbar"
          ref="embedRef"
          @editor-output="editorOutput"
        ></insert-embed>
      </div>
      <div v-else>
        <mobile-editor
          v-if="editor"
          :editor="editor"
          @editor-output="editorOutput"
        ></mobile-editor>
      </div>
      <!-- <div class="editor" v-html="defaultValue" ref="editor"></div> -->

      <div
        class="editor"
        @keyup="
          onDebounce();
          inputing();
        "
      ></div>
      <div id="someRelativeDiv" style="margin-top: 20px; height: 80px;"></div>
    </div>
  </div>
</template>

<script>
import InsertEmbed from "./InsertEmbed";
import debounce from "lodash/debounce";

import MobileEditor from "./MobileEditor";
import { ApiService } from "~/apis/constant_type";
import { EditorService } from "~/apis/editor/editor_service";
import { UndoService } from "~/apis/editor/undo_service";
const CLASS_DRAG_OVER = "medium-editor-dragover";
import ImagePosition from "./Embed/ImagePosition";

export default {
  name: "medium-editor",
  data() {
    return {
      num: 0,
      isMobileOrTablet: false,
      mediumEditor: null,
      editor: null,
      $toolbar: null,
      normalImageMaxWidth: 1190,
      dropImgLine: null,
      isShow: false,
      defaultValue2: `<p name='1111' data-type='TEXT'>111111</p><p name='2222' data-type='TEXT'>22222</p><p name='3333' data-type='TEXT'>33333</p>`,
      defaultValue0: `<p name='first0' data-type='TEXT'><br></p>`,
      defaultValue: `<p name='first0' data-type='TEXT'><br></p><p name="huxh" data-type="TEXT">1234</p><pre name="mhcs" class="hljs" spellcheck="false" data-type="PRE"><p name="p4qz" data-type="PRETEXT"><br></p></pre><div name="635r" class="medium-insert-embeds2" contenteditable="false" data-type="EMBED"><div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/ccZua947Y0g?rel=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen="" scrolling="no" allow="encrypted-media; accelerometer; clipboard-write; gyroscope; picture-in-picture"></iframe></div><div class="medium-insert-embeds-overlay"></div></div><p name="6666" data-type="TEXT">55<b>555</b></p><p name="vs2d" class="redo undo editor-image is-normal" data-type="IMG" contenteditable="false"><img src="https://firebasestorage.googleapis.com/v0/b/blog-test01-ec54b.appspot.com/o/tmp%2F8ehryk3tqilm2rlpn3ofxgrtlb56ktkua.png?alt=media&amp;token=78f42f4b-32f7-4d64-b683-8e81f00ca83d"></p><p name="rtpl" data-type="BLOCKQUOTE">333333333</p><p name='first0' data-type='TEXT'>01234</p><h3 name='8888' data-type='H3'>555555555</h3>`
    };
  },
  components: {
    InsertEmbed,
    ImagePosition,
    MobileEditor
  },

  created() {
    if (this.$device.isMobileOrTablet) {
      this.isMobileOrTablet = true;
    }
    // this.isMobileOrTablet = true;
  },

  mounted() {
    this.createElm();
    this.toolbarObserve();
    const fullPath = this.$route.path;
    if (fullPath.includes("new")) {
      let dataStr = `<p name='first001' data-type='TEXT'><br></p>`;
      this.setContent(dataStr);
    }
    EditorService.init(this.editor);

    let that = this;

    $(".medium-editor-toolbar-save").on({
      click: function() {
        that.onDebounce();
      }
    });

    $(".medium-editor-toolbar-input").on({
      keypress: function(e) {
        if (e.keyCode === 13) {
          that.onDebounce();
        }
      }
    });
  },
  methods: {
    editorOutput() {
      console.log("editorOutput@@:");
      this.$emit("editor-output");
    },
    onDebounce: debounce(function() {
      this.editorOutput();
    }, 2000),

    setContent(dataStr) {
      this.editor.setContent(dataStr);
      UndoService.init(this.editor);
    },
    inputing() {
      console.log("input@@@@@@@@@");
      this.$emit("inputing");
      // this.isSaved = false;
    },
    createElm() {
      let that = this;
      var CustomImageDragging = MediumEditor.extensions.fileDragging.extend({
        handleDrag: function(event) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          var target = event.target.classList
            ? event.target
            : event.target.parentElement;

          that.clearClassNames(target);
          if (
            target.tagName === "P" &&
            target.dataset.type === "TEXT" &&
            target.innerText.trim() === ""
          ) {
            if (event.type === "dragover") {
              target.classList.add(CLASS_DRAG_OVER);
            }
          }
        },
        handleDrop: function(event) {
          event.preventDefault();
          event.stopPropagation();
          // Select the dropping target, and set the selection to the end of the target
          // https://github.com/yabwe/medium-editor/issues/980
          // this.base.selectElement(event.target);
          // var selection = this.base.exportSelection();
          // selection.start = selection.end;
          // this.base.importSelection(selection);
          // IE9 does not support the File API, so prevent file from opening in the window
          // but also don't try to actually get the file
          if (event.dataTransfer.files) {
            Array.prototype.slice
              .call(event.dataTransfer.files)
              .forEach(function(file) {
                if (this.isAllowedFile(file)) {
                  if (file.type.match("image")) {
                    var currentLine = event.target;
                    if (
                      currentLine.tagName === "B" ||
                      currentLine.tagName === "I" ||
                      currentLine.tagName === "SPAN"
                    ) {
                      currentLine = currentLine.closest("P");
                    }

                    if (
                      currentLine.tagName === "P" &&
                      currentLine.dataset.type === "TEXT" &&
                      currentLine.innerText.trim() === ""
                    ) {
                      let value = { currentLine, file };
                      that.dropImgLine = value;
                    }
                  }
                }
              }, this);
          }
          // Make sure we remove our class from everything
          // clearClassNames(event.target);
          that.clearClassNames(event.target);
          // MediumEditor.extensions.fileDragging.clearClassNames(target);
        }
      });
      // console.log(CustomImageDragging);

      this.makeInstanceOfMediumEditor(CustomImageDragging);
      if (this.isMobileOrTablet) {
        $(".medium-editor-action-bold i").css("color", "#fff");
        $(".medium-editor-action-italic i").css("color", "#fff");
        $(".medium-editor-action-anchor i").css("color", "#fff");
        $(".medium-editor-action-h3 i").css("color", "#fff");
        $(".medium-editor-action-quote i").css("color", "#fff");
      }
    },
    makeInstanceOfMediumEditor(CustomImageDragging) {
      this.mediumEditor = MediumEditor;
      //
      if (this.isMobileOrTablet) {
        this.editor = new MediumEditor(".editor", {
          placeholder: {
            // text: "Write something great!!",
            hideOnClick: false
          },
          toolbar: {
            buttons: [
              "bold",
              "italic",

              "anchor",
              {
                name: "h3",
                action: "append-h3",
                aria: "header type 3",
                tagNames: ["h3"],
                contentDefault: "<b>H3</b>",
                contentFA: '<i class="fa fa-header">'
              },
              {
                name: "quote",
                action: () => {
                  this.pushBlockQuote();
                },
                aria: "blockquote",
                tagNames: ["blockquote"],
                contentDefault: "<b>&ldquo;</b>",
                contentFA: '<i class="fa fa-quote-right"></i>'
              },

              {
                name: "image",
                action: () => {
                  this.addImage();
                },
                // aria: "blockquote",
                // tagNames: ["blockquote"],
                // contentDefault: "<b>&ldquo;</b>",
                contentFA: `<i class="fa fa-image"></i>`
              }
            ],
            relativeContainer: document.getElementById("someRelativeDiv")
          },
          buttonLabels: "fontawesome",
          spellcheck: false,
          extensions: {
            imageDragging: new CustomImageDragging()
          }
        });
      } else {
        this.editor = new MediumEditor(".editor", {
          placeholder: {
            // text: "Write something great!!",
            hideOnClick: false
          },
          toolbar: {
            buttons: [
              "bold",
              "italic",

              "anchor",
              {
                name: "h3",
                action: "append-h3",
                aria: "header type 3",
                tagNames: ["h3"],
                contentDefault: "<b>H3</b>",
                contentFA: '<i class="fa fa-header">'
              },
              {
                name: "quote",
                action: () => {
                  this.pushBlockQuote();
                },
                aria: "blockquote",
                tagNames: ["blockquote"],
                contentDefault: "<b>&ldquo;</b>",
                contentFA: '<i class="fa fa-quote-right"></i>'
              }
            ]
          },
          buttonLabels: "fontawesome",
          spellcheck: false,
          extensions: {
            imageDragging: new CustomImageDragging()
          }
        });
        document.getElementById("someRelativeDiv").style.display = "none";
      }

      this.editor.elements[0].dataset.type = "EDITOR";
    },
    pushBlockQuote() {
      if (!this.editor) return;
      var currentLine = this.editor.getSelectedParentElement();
      currentLine = EditorService.getClosestParentNode(currentLine);
      if (!currentLine) return;

      console.log("pushblockquote line: ", currentLine);

      this.editor.saveSelection();
      let blockQuoteStr = "BLOCKQUOTE";
      var blockQuoteHTML = "";
      if (currentLine.dataset.type === blockQuoteStr) {
        blockQuoteHTML = `<p name='1234' data-type='TEXT'>${currentLine.innerHTML}</p>`;
        $(".fa-quote-right").removeClass("font-button-active");
        this.setBlockQuote(currentLine, blockQuoteHTML);
      } else if (
        currentLine.dataset.type === "TEXT" ||
        currentLine.dataset.type === "H3"
      ) {
        blockQuoteHTML = `<p name='1234' data-type='${blockQuoteStr}'>${currentLine.innerHTML}</p>`;

        $(".medium-editor-action-h3").removeClass(
          "medium-editor-button-active"
        );
        $(".fa-quote-right").addClass("font-button-active");

        this.setBlockQuote(currentLine, blockQuoteHTML);
      }
      this.editorOutput();
    },
    addImage() {
      if (!this.editor) return;
      var currentLine = this.editor.getSelectedParentElement();
      if (!currentLine) return;
      if (currentLine.innerText.trim() === "") {
        $("#file-input")[0].click();
      }
    },
    setBlockQuote(currentLine, blockQuoteHTML) {
      currentLine.outerHTML = blockQuoteHTML;
      this.editor.restoreSelection();
      UndoService.saveHistory();
    },

    clearClassNames: function(element) {
      element.classList.remove(CLASS_DRAG_OVER);
    },

    toolbarObserve() {
      let that = this;
      this.$toolbar = $(".medium-editor-toolbar");
      console.log("this.@toolbar ", this.$toolbar);
      var toolbarObserver = new MutationObserver(function(event) {
        if (!that.isMobileOrTablet) {
          if (
            $(".medium-editor-action-h3").hasClass(
              "medium-editor-button-active"
            )
          ) {
            $(".medium-editor-action-bold").hide();
            $(".medium-editor-action-italic").hide();
          } else {
            $(".medium-editor-action-bold").show();
            $(".medium-editor-action-italic").show();
          }
        }

        that.fontChange();
      });

      toolbarObserver.observe(this.$toolbar[0], {
        attributes: true,
        attributeFilter: ["class"]
      });
    },

    fontChange() {
      var currentLine = this.editor.getSelectedParentElement();
      currentLine = EditorService.getClosestParentNode(currentLine);

      if (!currentLine) return;
      const nameId = ApiService.makeId(4);
      switch (currentLine.tagName) {
        case "P":
          if (currentLine.dataset.type !== "BLOCKQUOTE") {
            if (!currentLine.getAttribute("name")) {
              currentLine.setAttribute("name", nameId);
            }

            if (currentLine.parentElement.dataset.type === "EDITOR") {
              currentLine.dataset.type = "TEXT";
            } else if (currentLine.parentElement.dataset.type === "PRE") {
              currentLine.dataset.type = "PRETEXT";
            }
          }
          break;
        case "H3":
          if (!currentLine.getAttribute("name")) {
            currentLine.setAttribute("name", nameId);
          }
          currentLine.dataset.type = "H3";
          $(".fa-quote-right").removeClass("font-button-active");
          break;

        default:
          console.log("それ以外よんだよ。 call default@@@@@@@@@@@@@@@@@@");
          break;
      }
    },

    destroyElm() {
      this.editor.destroy();
    }
  },
  destroyed() {
    this.destroyElm();
  }
};
</script>

<style>
.editor {
  font-size: 18px;
}
.medium-insert-embeds2 {
  position: relative;
}
.medium-insert-embeds-overlay {
  position: absolute;
  /* opacity: 0.5; */
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  cursor: pointer;
}
.medium-insert-embeds2.is-selected div,
.is-selected img {
  outline: 10px solid #02a87c;
}

.font-button-active {
  background-color: transparent;
  color: #00bd6a;
}
.medium-editor-relative-toolbar {
  visibility: visible;
}
.image-upload > input {
  display: none;
}

/* .blogCard {
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 12px;
  margin-bottom: 1.6rem;
}
.blogCardCont {
  position: relative;
  margin-bottom: 5px;
  min-height: 100px;
}
.blogCardCont p {
  font-size: 12px;
  overflow: hidden;
  margin: 0;
}
.blogCardTxt {
  margin-right: 210px;
}
.blogCardTxt p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.blogCardTitle {
  margin-bottom: 5px;
  overflow: hidden;
  -webkit-line-clamp: 2 !important;
}
.blogCardTitle a {
  font-size: 18px;
  line-height: 1.4;
  color: #3d3f44;
  font-weight: bold;
  text-decoration: none;
}
.blogCardTitle a:hover {
  text-decoration: underline;
}
.blogCardImg {
  margin-left: 100px;
  position: absolute;
  top: 0;
  right: 0;
}
.blogCardImg__wrap {
  float: right;
  width: 15%;
  min-width: 100px;
  height: 100px;
  overflow: hidden;
  position: relative;
}
.blogCardImg__wrap img {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: none;
  max-height: 100%;
  transform: translateY(-50%) translateX(-50%);
  -webkit-transform: translateY(-50%) translateX(-50%);
}
.blogCardFooter {
  font-size: 12px;
}
.blogCardFooter a {
  color: #9aa5ab;
}
.blogCardFooter a img {
  margin-right: 5px;
}
.blogCardTitle a i,
.blog article .blogCardFooter a i {
  display: none;
}
.blogCard.blogCard--noimg .blogCardCont {
  min-height: auto;
}
.blogCardTxt1 {
  margin-right: 210px;
} */
</style>
