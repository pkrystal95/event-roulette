const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// 미들웨어
app.use(express.json());
app.use(express.static(__dirname));

// 룰렛 API 엔드포인트
app.post('/api/spin', (req, res) => {
    // 1~6 사이의 랜덤 결과 생성
    const result = Math.floor(Math.random() * 6) + 1;

    // 각 결과에 대한 확률 조정 가능
    // 예: 특정 상품의 확률을 조정하려면 아래와 같이 가중치 적용
    /*
    const weights = [
        { sector: 1, weight: 10 },  // 10% 할인 - 10%
        { sector: 2, weight: 30 },  // 꽝 - 30%
        { sector: 3, weight: 5 },   // 무료쿠폰 - 5%
        { sector: 4, weight: 5 },   // 20% 할인 - 5%
        { sector: 5, weight: 40 },  // 꽝 - 40%
        { sector: 6, weight: 10 }   // 5% 할인 - 10%
    ];

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    let result = 1;
    for (const w of weights) {
        random -= w.weight;
        if (random <= 0) {
            result = w.sector;
            break;
        }
    }
    */

    // 응답 반환
    res.json({
        success: true,
        result: result,
        message: '룰렛 결과'
    });

    // 로그 출력
    console.log(`룰렛 결과: ${result}번 영역`);
});

// HTML 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'roulette.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`);
    console.log('브라우저에서 http://localhost:3000 을 열어주세요.');
});
