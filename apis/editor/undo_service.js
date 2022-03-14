import { CaretService } from "~/apis/editor/caret_service";
import { EditorService } from "~/apis/editor/editor_service";
import { ApiService } from "~/apis/constant_type";

export const UndoService = {
  stack: [],
  position: 0,
  editor: null,

  init(editor) {
    this.stack = [];
    this.position = 0;
    this.editor = editor;
    let editorChildren = $(".editor")
      .children()
      .toArray();
    var state = [];

    editorChildren.forEach(function(block, index) {
      state.push(block.outerHTML);
    });
    this.stack.push({ index: 0, state: state });
  },

  save() {
    var currentLine = this.editor.getSelectedParentElement();

    currentLine = EditorService.getClosestParentNode(currentLine);
    console.log("save@@@@@@@@@@@@@@@@: ", currentLine);

    if (!currentLine) return;

    let elements = $(".editor")
      .children()
      .toArray();

    var state = [];
    elements.forEach(function(block, index) {
      state.push(block.outerHTML);
    });

    this.stack = this.stack.slice(0, this.position + 1);
    if (currentLine.dataset.type === "PRETEXT") {
      currentLine = EditorService.getClosestParentNode(currentLine);
    }
    const index = $(currentLine).prevAll().length;

    this.stack.push({ index, state });
    this.position += 1;
  },
  /**
   * Decreases the current position and renders the data in the editor.
   戻る*/
  undo() {
    if (this.canUndo()) {
      const { index, state } = this.stack[(this.position -= 1)];
      this.commonUndoRedo(index, state);
    }
  },

  /**
   * Increases the current position and renders the data in the editor.
   すすめる
   */
  redo() {
    if (this.canRedo()) {
      const { index, state } = this.stack[(this.position += 1)];
      this.commonUndoRedo(index, state);
    }
  },

  commonUndoRedo(index, state) {
    let that = this;
    let editorChildren = $(".editor")
      .children()
      .toArray();

    state.forEach(function(blockStr, index) {
      var blockHTML = ApiService.convertToHTML(blockStr);
      let blockDataType = blockHTML.dataset.type;
      let blockNameId = blockHTML.getAttribute("name");
      let editorLine = editorChildren[index];
      if (!editorLine) {
        that.appendElement(blockStr);
        return;
      }
      let editorDataType = editorLine.dataset.type;
      let editorNameId = editorLine.getAttribute("name");
      if (blockDataType === "EMBED" && editorDataType === "EMBED") {
        if (editorNameId !== blockNameId) {
          blockHTML = that.replace(editorChildren, blockStr);
        }
      } else if (blockDataType === "IMG" && editorDataType === "IMG") {
        let isSameSize = that.detectSameSizeImage(editorLine, blockHTML);
        if (!isSameSize) {
          blockHTML = that.replace(editorLine, blockStr);
        }
      } else {
        blockHTML = that.replace(editorLine, blockStr);
      }

      if (state.length - 1 === index) {
        that.removeElements(blockHTML);
      }
    });

    // set caret at end of line
    this.moveCaret(index);
  },

  appendElement(blockStr) {
    // append last element when you redo.
    let lastElement = $(".editor")
      .children()
      .last()[0];

    $(blockStr).insertAfter(lastElement);
  },
  removeElements(blockHTML) {
    // remove last element when you undo.
    $(blockHTML)
      .nextAll()
      .remove();
  },

  moveCaret(index) {
    // set caret at end of line
    let editorChildren2 = $(".editor")
      .children()
      .toArray();

    CaretService.setCaretAtEnd(editorChildren2[index]);
  },

  detectSameSizeImage(editorBlock, blockHTML) {
    const className = blockHTML.className;

    var blockImgSize = null;

    if (className.indexOf("expand") > -1) {
      blockImgSize = "is-expand";
    } else if (className.indexOf("full") > -1) {
      blockImgSize = "is-full";
    } else if (className.indexOf("is-normal") > -1) {
      blockImgSize = "is-normal";
    } else if (className.indexOf("not-streach") > -1) {
      blockImgSize = "not-streach";
    }

    if ($(editorBlock).hasClass(blockImgSize)) {
      // same size
      return true;
    }
    return false;
  },

  replace(editorLine, blockStr) {
    let blockHTML = $(blockStr).replaceAll(editorLine)[0];
    return blockHTML;
  },

  canUndo() {
    return this.position > 0;
  },

  canRedo() {
    return this.position < this.count();
  },

  /**
   * Returns the number of changes recorded in the history stack.
   *
   * @returns {Number}
   */
  count() {
    //
    return this.stack.length - 1; // -1 because of initial item
  },
  undoManage(event) {
    if (!event.metaKey || event.keyCode !== 90) return;
    event.preventDefault();
    if (event.shiftKey) {
      UndoService.redo();
    } else {
      UndoService.undo();
    }
  },
  saveHistory() {
    let isUplodingNow = $(".editor")
      .children("[data-type='IMG']")
      .hasClass("imgUploadingNow");

    if (isUplodingNow) return;
    UndoService.save();
  }
};
