<template>
  <div>
    <file-upload
      ref="upload"
      class="btn-toggle"
      extensions="gif,jpg,jpeg,png,webp"
      accept="image/png,image/gif,image/jpeg,image/webp"
      :multiple="false"
      v-model="insert.files"
      @input-filter="inputFilter"
      @input-file="inputFile"
    >
      <font-awesome-icon :icon="['far', 'images']" />
    </file-upload>
  </div>
</template>

<script>
import { ApiService } from "~/apis/constant_type";
import VueUploadComponent from "vue-upload-component";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faImages } from "@fortawesome/free-regular-svg-icons";
import { ImageService } from "~/apis/editor/image_service";
import { EditorService } from "~/apis/editor/editor_service";
import { CaretService } from "~/apis/editor/caret_service";
import { UndoService } from "~/apis/editor/undo_service";
library.add(faImages);
export default {
  props: ["editor", "insert", "imgHandler", "dropImgLine"],
  components: {
    FontAwesomeIcon,
    "file-upload": VueUploadComponent
  },
  data() {
    return {
      uploadUrl: "http://",
      currentLine: null,
      currentImg: null,
      currentSize: "is-normal",
      position: {
        top: "0"
      },
      isShow: false
    };
  },
  methods: {
    initializeExisting() {
      const handlerVm = this;
      var editorImages = document.getElementsByClassName("editor-image");
      editorImages = Array.from(editorImages);
      editorImages.map(async editorImage => {
        editorImage.onclick = function() {
          setTimeout(() => {
            handlerVm.sizingHandler(this);
          });
        };
      });
    },
    sizingHandler(elm) {
      if (!elm) return;
      const className = elm.className;
      if (className.indexOf("expand") > -1) {
        this.currentSize = "is-expand";
      } else if (className.indexOf("full") > -1) {
        this.currentSize = "is-full";
      } else {
        this.currentSize = "is-normal";
      }
      const img = elm.querySelector("img");
      this.currentLine = elm;
      this.isShow = true;
      let top = img.offsetTop;
      let position = {
        top: top + "px"
      };
      this.$emit("imageClick", {
        position: position,
        currentLine: this.currentLine,
        isShow: this.isShow,
        currentSize: this.currentSize
      });
    },
    inputFilter(newFile, oldFile, prevent) {
      if (newFile && !oldFile) {
        if (/(\/|^)(Thumbs\.db|desktop\.ini|\..+)$/.test(newFile.name)) {
          return prevent();
        }
        if (/\.(php5?|html?|jsx?)$/i.test(newFile.name)) {
          return prevent();
        }
      }
    },
    async inputFile(newFile, oldFile) {
      let currentLine = this.insert.focusLine;
      if (!currentLine || !newFile) return;
      console.log("inputFile@@@@@@@@@: ", currentLine, newFile);
      this.insertImage(currentLine, newFile.file);
    },
    insertImage(currentLine, file) {
      console.log("insertImage########: ", currentLine, file);
      if (currentLine.outerHTML.trim() === "<br>") {
        currentLine = $(currentLine).closest("P")[0];
      }
      const that = this;
      this.insert.isShow = false;
      this.insert.isToggle = false;
      // FileReaderの生成
      const reader = new FileReader();
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
        that.selectImage(imgLine);
        EditorService.imgSelectCaretPostion_ForFixedBug();
        let compressedFile = await ApiService.compressImage(file, 2000, 1100);
        let url = await ApiService.uploadImageToStorage(compressedFile);
        imgLine.classList.remove("imgUploadingNow");
        imgLine.firstChild.src = url;
        UndoService.saveHistory();
        that.$emit("editor-output");
      };
      // ファイルの読み込み
      reader.readAsDataURL(file);
    },
    selectImage(imgLine) {
      this.imgHandler.isShow = false;
      imgLine.classList.add("is-selected");
      if (!$(imgLine).hasClass("not-stretch")) {
        this.sizingHandler(imgLine);
      }
      this.insert.isShow = false;
      this.insert.isToggle = false;
      CaretService.setCaretAtEnd(imgLine);
      this.editor.saveSelection();
    }
  },
  mounted() {
    this.initializeExisting();
  },
  watch: {
    dropImgLine: function(newVal, oldVal) {
      this.insertImage(newVal.currentLine, newVal.file);
    }
  }
};
</script>

<style></style>
