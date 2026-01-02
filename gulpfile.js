const { src, dest, series } = require("gulp");
const inlinesource = require("gulp-inline-source");
const replace = require("gulp-replace");

function inlineAssets() {
  return src("./build/*.html")
    .pipe(replace('.js"></script>', '.js" inline></script>'))
    .pipe(replace('rel="stylesheet">', 'rel="stylesheet" inline>'))
    .pipe(
      inlinesource({
        compress: false,
        ignore: ["png"],
      })
    )
    .pipe(dest("./build"));
}

exports.default = series(inlineAssets);
