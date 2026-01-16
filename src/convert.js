const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("CMD ERROR:", cmd);
        console.error(stderr);
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function convertOfficeToPdf(input, outdir, outname) {
  const targetPdf = path.join(outdir, outname);

  // LibreOffice는 outdir 기준으로 파일명을 자동 생성하니까
  // 일단 outdir로 변환시키고, 나중에 우리가 원하는 이름으로 rename
  await run(`libreoffice --headless --convert-to pdf:writer_pdf_Export "${input}" --outdir "${outdir}"`);

  // outdir 안에 생긴 pdf 찾기
  const files = fs.readdirSync(outdir).filter(f => f.toLowerCase().endsWith(".pdf"));
  if (files.length === 0) {
    throw new Error(`PDF 변환 실패: ${input}`);
  }

  // 가장 최근에 생성된 PDF를 선택
  let latest = files[0];
  let latestTime = fs.statSync(path.join(outdir, latest)).mtimeMs;
  for (const f of files) {
    const t = fs.statSync(path.join(outdir, f)).mtimeMs;
    if (t > latestTime) {
      latest = f;
      latestTime = t;
    }
  }

  const srcPdf = path.join(outdir, latest);
  fs.renameSync(srcPdf, targetPdf);

  return targetPdf;
}

async function convertHwpToPdf(input, outdir, outname) {
  const html = path.join(outdir, outname.replace(/\.pdf$/i, ".html"));
  const pdf = path.join(outdir, outname);

  await run(`hwp5txt "${input}" > "${html}"`);
  await run(`wkhtmltopdf "${html}" "${pdf}"`);

  if (!fs.existsSync(pdf)) {
    throw new Error(`HWP PDF 변환 실패: ${input}`);
  }

  return pdf;
}

async function convertToPdf(input, outdir, index) {
  const ext = path.extname(input).toLowerCase();
  const safeBase = path.basename(input).replace(/[^a-zA-Z0-9_.-]/g, "_");
  const outname = `${index}_${safeBase}.pdf`; // ★ 여기서 파일마다 유니크하게

  if (ext === ".pdf") {
    const target = path.join(outdir, outname);
    fs.copyFileSync(input, target);
    return target;
  }

  if ([".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"].includes(ext)) {
    return convertOfficeToPdf(input, outdir, outname);
  }

  if (ext === ".hwp") {
    return convertHwpToPdf(input, outdir, outname);
  }

  throw new Error(`지원하지 않는 파일 형식: ${ext}`);
}

module.exports = { convertToPdf };
