# PDF-Merge
문서를 하나의 PDF로 병합하기

### 터미널에서 아래 명령 실행:
```bash
sudo apt update
sudo apt install -y libreoffice
sudo apt install -y hwp5html
sudo apt install -y wkhtmltopdf
sudo apt install -y poppler-utils

```

### 설치되는 기능:
1. LibreOffice → docx, xlsx, pptx → pdf 변환
2. hwp5html → hwp → html
3. wkhtmltopdf → html → pdf
4. pdfunite → 여러 pdf 병합


### 실행 테스
```bash
node src/worker.js src/result.pdf sample.docx sample.xlsx sample.hwp sample.pdf
```
