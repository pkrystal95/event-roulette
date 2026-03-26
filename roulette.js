// 쿠키 관리 함수
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// 상품 매핑 (1~4번 영역)
const prizes = {
    1: "꽝",
    2: "랩톱 미니스팀",
    3: "펩시 콜라 9캔",
    4: "아메리카노"
};

// 각 영역의 시작 각도 (12시 방향이 0도)
// 영역 1: 0~90도, 영역 2: 90~180도, 영역 3: 180~270도, 영역 4: 270~360도
const sectorAngles = {
    1: { start: 0, end: 90, target: 45 },
    2: { start: 90, end: 180, target: 135 },
    3: { start: 180, end: 270, target: 225 },
    4: { start: 270, end: 360, target: 315 }
};

// DOM 요소
const spinButton = document.getElementById('spinButton');
const rouletteWheel = document.getElementById('rouletteWheel');
const resultModal = document.getElementById('resultModal');
const resultText = document.getElementById('resultText');
const closeButton = document.getElementById('closeButton');
const alreadyPlayedMessage = document.getElementById('alreadyPlayedMessage');

let isSpinning = false;

// 초기화: 이미 참여했는지 확인
function init() {
    const hasPlayed = getCookie('roulette_played');
    if (hasPlayed === 'true') {
        spinButton.classList.add('disabled');
        alreadyPlayedMessage.classList.add('show');
    }
}

// 룰렛 회전 함수
async function spinRoulette() {
    // 이미 참여했는지 확인
    const hasPlayed = getCookie('roulette_played');
    if (hasPlayed === 'true') {
        alreadyPlayedMessage.classList.add('show');
        setTimeout(() => {
            alreadyPlayedMessage.classList.remove('show');
        }, 2000);
        return;
    }

    // 이미 회전 중이면 무시
    if (isSpinning) return;

    isSpinning = true;
    spinButton.classList.add('disabled');

    try {
        // 서버에서 결과 받아오기
        const response = await fetch('/api/spin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('서버 응답 오류');
        }

        const data = await response.json();

        // 결과값 검증 (1~4 사이)
        const resultSector = parseInt(data.result);
        if (isNaN(resultSector) || resultSector < 1 || resultSector > 4) {
            throw new Error('유효하지 않은 결과값');
        }

        // 룰렛 회전
        await rotateWheel(resultSector);

        // 쿠키 설정 (1회만 참여 가능하도록)
        setCookie('roulette_played', 'true', 365);

        // 결과 표시
        const prizeName = prizes[resultSector];
        showResult(prizeName);

    } catch (error) {
        console.error('룰렛 에러:', error);
        alert('오류가 발생했습니다. 다시 시도해주세요.');
        isSpinning = false;
        spinButton.classList.remove('disabled');
    }
}

// 휠 회전 애니메이션
function rotateWheel(targetSector) {
    return new Promise((resolve) => {
        // 목표 각도 계산
        // 화살표가 위에 있으므로, 목표 영역이 위로 오도록 회전
        const targetAngle = sectorAngles[targetSector].target;

        // 5바퀴 이상 회전 + 목표 각도
        // 반시계방향 회전을 위해 음수 사용
        const baseRotation = 360 * 5; // 5바퀴
        const finalRotation = baseRotation + (360 - targetAngle);

        // 회전 적용
        rouletteWheel.classList.add('spinning');
        rouletteWheel.style.transform = `rotate(${finalRotation}deg)`;

        // 애니메이션 완료 후
        setTimeout(() => {
            rouletteWheel.classList.remove('spinning');
            isSpinning = false;
            resolve();
        }, 4000);
    });
}

// 결과 모달 표시
function showResult(prizeName) {
    resultText.textContent = `${prizeName}에 당첨되셨습니다!`;
    resultModal.classList.add('show');
}

// 모달 닫기
function closeModal() {
    resultModal.classList.remove('show');
}

// 이벤트 리스너
spinButton.addEventListener('click', spinRoulette);
closeButton.addEventListener('click', closeModal);

// 모달 배경 클릭시 닫기
resultModal.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        closeModal();
    }
});

// 초기화 실행
init();
