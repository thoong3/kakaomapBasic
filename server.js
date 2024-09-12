const express = require('express');
const app = express();
const port = 3000;

// 'public' 폴더에 있는 파일들을 정적 파일로 서빙
app.use(express.static('public'));

// 서버 실행
app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});
