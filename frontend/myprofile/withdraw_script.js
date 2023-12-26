// 회원탈퇴 진행 버튼 클릭 시
const confirmBtn = document.querySelector('.confirmBtn');
confirmBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('회원탈퇴 진행 버튼 클릭!');

    const confirmMsg = '회원 탈퇴를 진행하시겠습니까?';

    if(window.confirm(confirmMsg)) {
        // 회원 탈퇴 서버 통신 진행
        fetch(`/myprofile/withdrawProc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('data:',data['result']);
            if(data['result'] === 'SUCCESS') {
                alert('회원 탈퇴가 완료되었습니다');
                window.location.href = hostURL;
            }
        })
        .catch(error => {
            console.log(`회원 탈퇴 Error : ${error}`);
        });
    }
});