import { CaretService } from "~/apis/editor/caret_service";
import { UndoService } from "~/apis/editor/undo_service";
import { ApiService } from "~/apis/constant_type";

export const EditorService = {
  editor: null,

  init(editor) {
    this.editor = editor;
  },
  getClosestParentNode(currentLine) {
    if (!currentLine) {
      return null;
    }
    // closeset メソッドはそれ自体のタグも含む
    if (
      currentLine.tagName === "IMG" ||
      currentLine.tagName === "B" ||
      currentLine.tagName === "I" ||
      currentLine.tagName === "A" ||
      currentLine.tagName === "SPAN" ||
      currentLine.outerHTML.trim() === "<br>"
    ) {
      currentLine = currentLine.closest("P, H3, PRE"); // pre内にBoldとかが入ったときのために。
    } else if ($(currentLine.parentNode).hasClass("medium-insert-embeds2")) {
      currentLine = currentLine.parentNode;
    } else if (currentLine.dataset.type === "PRETEXT") {
      currentLine = currentLine.closest("PRE"); // preは基本こっちを走る。
    }
    return currentLine;
  },
  pushKeyDown(event) {
    UndoService.undoManage(event);
    var currentLine = this.editor.getSelectedParentElement();
    currentLine = this.getClosestParentNode(currentLine);

    var previousLine = currentLine.previousElementSibling;
    var nextLine = currentLine.nextElementSibling;

    let isCaretAtStart = CaretService.isCaretAtStart(currentLine);
    let isCaretAtEnd = CaretService.isCaretAtEnd(currentLine);

    if (
      currentLine &&
      (currentLine.dataset.type === "IMG" ||
        currentLine.dataset.type === "EMBED")
    ) {
      if (this.isLetter(event)) {
        event.preventDefault();
      }
    }
    return {
      previousLine,
      currentLine,
      nextLine,
      isCaretAtStart,
      isCaretAtEnd
    };
  },
  pushBackSpace(
    previousLine,
    currentLine,
    nextLine,
    isCaretAtStart,
    isCaretAtEnd,
    event
  ) {
    if (
      currentLine.dataset.type === "IMG" ||
      currentLine.dataset.type === "EMBED"
    ) {
      this.deleteLine(event, currentLine);
      return;
    }
    if (previousLine) {
      if (
        previousLine.dataset.type === "IMG" ||
        previousLine.dataset.type === "PRE" ||
        previousLine.dataset.type === "EMBED"
      ) {
        if (
          (isCaretAtStart && !isCaretAtEnd) ||
          (isCaretAtStart && isCaretAtEnd && !nextLine)
        ) {
          this.moveCaret(event, previousLine);
        } else if (isCaretAtStart && isCaretAtEnd && nextLine) {
          event.preventDefault();
          $(currentLine).remove();
          CaretService.setCaretAtEnd(previousLine);
          UndoService.saveHistory();
        }
      } else if (previousLine.dataset.type === "DIVIDE" && isCaretAtStart) {
        this.deleteLine(event, previousLine);
      }
    }
  },
  pushEnter(currentLine, isCaretAtStart, event) {
    let innerText = currentLine.innerText.trim();

    if (innerText.match(/^http(?:s)?:\/\//)) {
      event.preventDefault();
      this.embed(currentLine, innerText);
    } else if (
      currentLine &&
      (currentLine.dataset.type === "IMG" ||
        currentLine.dataset.type === "EMBED")
    ) {
      event.preventDefault();
      let newArray = $(
        `<p name="enter" data-type="TEXT"><br></p>`
      ).insertBefore(currentLine);
      CaretService.setCaretAtEnd(newArray[0]);
      UndoService.saveHistory();
    } else if (
      currentLine &&
      currentLine.dataset.type === "BLOCKQUOTE" &&
      isCaretAtStart
    ) {
      event.preventDefault();
      let newArray = $(
        `<p name="enter" data-type="TEXT"><br></p>`
      ).insertBefore(currentLine);
      UndoService.saveHistory();
    }
  },
  deleteLine(event, oldLine) {
    event.preventDefault();
    let newLine = `<p name='2588' data-type='TEXT'><br></p>`;
    let newLineArray = $(newLine).replaceAll(oldLine);
    CaretService.setCaretAtEnd(newLineArray[0]);
    UndoService.saveHistory();
  },
  moveCaret(event, line) {
    event.preventDefault();
    CaretService.setCaretAtEnd(line);
  },
  async embed(currentLine, url) {
    // iframelyでいく。
    let that = this;
    let innerText = currentLine.innerText.trim();

    $.ajax({
      crossDomain: true,
      cache: false,
      url: process.env.MEDIUM_IFRAMELY_URL,
      dataType: "json",
      data: {
        url: url
      },
      success: function(data) {
        var html = data && data.html;
        let nameId = ApiService.makeId(4);
        let newCurrentArray = $(
          `<div name='${nameId}' class='medium-insert-embeds2' contenteditable="false" data-type='EMBED'>${html}<div class="medium-insert-embeds-overlay"></div></div><p name='6666' data-type='TEXT'><br></p>`
        ).replaceAll(currentLine);
        CaretService.setCaretAtEnd(newCurrentArray[1]);
        UndoService.saveHistory();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $(currentLine).after(`<p name='7890' data-type='TEXT'><br></p>`);
        UndoService.saveHistory();
      }
    });
  },
  getDetectCurrentLine(e) {
    let isTypingKeyboard = $(e.target).hasClass("editor");
    var currentLine = null;
    if (isTypingKeyboard) {
      currentLine = this.editor.getSelectedParentElement();
    } else {
      currentLine = e.target;
    }
    currentLine = this.getClosestParentNode(currentLine);
    return currentLine;
  },
  imgSelectCaretPostion_ForFixedBug() {
    this.editor.restoreSelection();
    var currentLine = this.editor.getSelectedParentElement();
    currentLine = this.getClosestParentNode(currentLine);

    // ↓こうしないとなぜか画像にカーソルを合わせれない。この動きがないと、backspaceとかで画像を消そうとしても何も反応しない。
    let lastElement = $(currentLine.parentNode)
      .children()
      .last()[0];

    CaretService.setCaretAtEnd(lastElement);
    CaretService.setCaretAtEnd(currentLine);
  },

  editablePaste() {
    let currentLine = this.editor.getSelectedParentElement();
    let $prevAll = $(currentLine)
      .prevAll()
      .addBack();

    var datasetStr = "";
    if (currentLine.parentNode.dataset.type === "EDITOR") {
      datasetStr = "TEXT";
    } else if (currentLine.parentNode.dataset.type === "PRE") {
      datasetStr = "PRETEXT";
    }

    $.each($prevAll, function(key, value) {
      if (!value.dataset.type) {
        let nameId = ApiService.makeId(4);
        value.setAttribute("name", nameId);
        value.dataset.type = datasetStr;
      }
    });
  },

  editableInput(event) {
    if (
      (event.inputType === "insertText" && event.data === null) ||
      event.inputType === "insertParagraph"
    ) {
      //改行　enter押した
      this.insertNewLine();
    } else if (
      // bold とか italic font buttonを押したら呼ばれる
      event.inputType === "" &&
      event.data === null
    ) {
      var currentLine = this.editor.getSelectedParentElement();

      currentLine = this.getClosestParentNode(currentLine);
      if (!currentLine) return;

      const nameId = ApiService.makeId(4);
      switch (currentLine.tagName) {
        case "P":
          currentLine.setAttribute("name", nameId);

          if (currentLine.parentElement.dataset.type === "EDITOR") {
            currentLine.dataset.type = "TEXT";
          } else if (currentLine.parentElement.dataset.type === "PRE") {
            currentLine.dataset.type = "PRETEXT";
          }
          break;
        case "H3":
          currentLine.setAttribute("name", nameId);
          currentLine.dataset.type = "H3";
          break;

        default:
          console.log("それ以外よんだよ。 call default@@@@@@@@@@@@@@@@@@");
          break;
      }
    }
  },
  insertNewLine() {
    let editorElement = document.getElementsByClassName("editor")[0];
    var currentLine = this.editor.getSelectedParentElement();
    currentLine = EditorService.getClosestParentNode(currentLine);
    var previousLine = currentLine.previousElementSibling;
    var nextLine = currentLine.nextElementSibling;

    let editorChildren = editorElement.children;

    if (editorChildren.length === 0) return;
    if (currentLine.classList.contains("editor")) return;
    if (!previousLine) return;
    if (
      currentLine &&
      currentLine.tagName === "DIV" &&
      !currentLine.dataset.type
    ) {
      let prevAll = $(currentLine)
        .prevAll()
        .addBack();

      $.each(prevAll, function(index, element) {
        if (
          !element.dataset.type &&
          element.tagName === "DIV" &&
          element.innerText.trim().length === 0
        ) {
          let newLine = `<p name='change' data-type='TEXT'><br></p>`;
          let newLineArray = $(newLine).replaceAll(element);
        }
      });

      return;
    }

    const nameId = ApiService.makeId(4);

    if (currentLine.tagName === "P") {
      if (
        !currentLine.getAttribute("name") ||
        currentLine.getAttribute("name") === previousLine.getAttribute("name")
      ) {
        if (previousLine.innerText.trim() === "") {
          previousLine.innerHTML = "<br>";
        } else if (currentLine.innerText.trim() === "") {
          currentLine.innerHTML = "<br>";
        }
        currentLine.setAttribute("name", nameId);
        if (currentLine.parentNode.dataset.type === "EDITOR") {
          currentLine.dataset.type = "TEXT";
        } else if (currentLine.parentNode.dataset.type === "PRE") {
          currentLine.dataset.type = "PRETEXT";
        }
      }
    }
  },

  isLetter(e) {
    var regex = new RegExp("^[a-zA-Z0-9 ]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
      return true;
    }
    switch (e.which) {
      case 220:
      case 219:
      case 221:
      case 222:
      case 186:
      case 191:
      case 187:
      case 188:
      case 190:
      case 111:
      case 107:
      case 109:
      case 110:
        return true;
        break;

      default:
        break;
    }

    return false;
  }
};
