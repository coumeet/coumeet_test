
// 자주 묻는 질문 클릭 시
const faqBtn = document.querySelector('.faqBtn');
faqBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('자주 묻는 질문 클릭 시');
    window.location.href = `${hostURL}faq`;
});
