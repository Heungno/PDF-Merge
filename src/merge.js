const { exec } = require("child_process");

function mergePdfs(files, output) {
  return new Promise((resolve, reject) => {
    const list = files.map(f => `"${f}"`).join(" ");
    const cmd = `pdfunite ${list} "${output}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("PDF 병합 오류:", cmd);
        console.error(stderr);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = { mergePdfs };
