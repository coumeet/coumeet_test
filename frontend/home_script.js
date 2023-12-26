"use strict"

const adBannerImg = document.querySelector('.adBannerImg');
// const bottomBannerBox_container = document.querySelector('.bottomBannerBox_container');

// 페이드인아웃 효과 내기
function checkFade() {
    const elementTop = adBannerImg.getBoundingClientRect().top;
    // const bottomBannerBox_container_top = bottomBannerBox_container.getBoundingClientRect().top;
    const triggerPoint = window.innerHeight * 0.7; // 화면 높이의 70% 지점
  
    if (elementTop < triggerPoint) {
        adBannerImg.classList.add('show');
    } else {
        adBannerImg.classList.remove('show');
    }

    // if (bottomBannerBox_container_top < triggerPoint) {
    //     bottomBannerBox_container.classList.add('show');
    // } else {
    //     bottomBannerBox_container.classList.remove('show');
    // }
}

window.addEventListener('scroll', checkFade);
window.addEventListener('load', checkFade); // 초기 로드 시도 효과 적용

// 페이지 로드 시 초기 위치에서 스크롤이 필요한 경우를 위해 이벤트 추가
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkFade, 100);
});

const bottomBannerBox_container = document.querySelector('.bottomBannerBox_container');
bottomBannerBox_container.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('하단 베너 클릭 시');
    window.location.href = hostURL;
});
