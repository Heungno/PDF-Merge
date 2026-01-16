const fs = require("fs");
const os = require("os");
const path = require("path");
const { convertToPdf } = require("./convert");
const { mergePdfs } = require("./merge");

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log("사용법: node src/worker.js output.pdf file1 file2 ...");
    process.exit(1);
  }

  const output = args[0];
  const inputs = args.slice(1);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "merge-"));
  const converted = [];

  console.log("임시 디렉토리:", tempDir);

  try {
    for (let i = 0; i < inputs.length; i++) {
      const file = inputs[i];
      console.log(`변환 중 (${i + 1}/${inputs.length}): ${file}`);
      const pdf = await convertToPdf(file, tempDir, i + 1);
      console.log(" → 생성된 PDF:", pdf);
      converted.push(pdf);
    }

    console.log("병합 중...");
    await mergePdfs(converted, output);

    console.log(`완료: ${output}`);
  } catch (err) {
    console.error("오류 발생:", err);
  } finally {
    // 디버깅 위해 당장은 tempDir 삭제 안 함
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main();
