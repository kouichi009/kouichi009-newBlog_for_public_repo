export const ImageService = {
  isBiggerThanNormal(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.src = url;
      img.onload = () => {
        var isBigger = false;
        let normalImageMaxWidth = 1190;
        if (img.width > normalImageMaxWidth) {
          //bigger
          isBigger = true;
        } else {
          //smaller
          isBigger = false;
        }
        resolve(isBigger);
      };
    });
  }
};
