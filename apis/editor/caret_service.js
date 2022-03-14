export const CaretService = {
  isCaretAtStart(element) {
    var atStart = false;
    var selectionRange = null;
    var testRange = null;
    if (window.getSelection) {
      var selection = window.getSelection();

      if (selection.rangeCount) {
        selectionRange = selection.getRangeAt(0);
        testRange = selectionRange.cloneRange();

        testRange.selectNodeContents(element);
        testRange.setEnd(
          selectionRange.startContainer,
          selectionRange.startOffset
        );
        if (selection.type !== "Range") {
          atStart = testRange.toString() == "";
        }
        return atStart;
      }
    }
  },
  isCaretAtEnd(element) {
    var atEnd = false;
    var selectionRange = null;
    var testRange = null;
    if (window.getSelection) {
      var selection = window.getSelection();

      if (selection.rangeCount) {
        selectionRange = selection.getRangeAt(0);
        testRange = selectionRange.cloneRange();

        testRange.selectNodeContents(element);
        testRange.setStart(
          selectionRange.endContainer,
          selectionRange.endOffset
        );
        if (selection.type !== "Range") {
          atEnd = testRange.toString() == "";
        }
        return atEnd;
      }
    }
  },
  setCaretAtStart(element) {
    if (window.getSelection && document.createRange) {
      var range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(true);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (document.body.createTextRange) {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(element);
      textRange.collapse(true);
      textRange.select();
    }
  },
  setCaretAtEnd(element) {
    if (window.getSelection && document.createRange) {
      var range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (document.body.createTextRange) {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(element);
      textRange.collapse(false);
      textRange.select();
    }
  }
};
