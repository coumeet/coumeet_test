let userSignupStatus;

// 비밀번호 중복 확인
const currentPw = document.querySelector('#currentPw');
const changePw = document.querySelector('#changePw');
const changePw2 = document.querySelector('#changePw2');
const currentPwErrorMsg = document.querySelector('#currentPwErrorMsg');
const pwErrorMsg = document.querySelector('#changePwErrorMsg');
const pw2Input_container = document.querySelector('#pw2Input_container');
const currentPwInput_container = document.querySelector('#currentPwInput_container');

// 비밀번호 변경 확인 버튼
const confirmBtn = document.querySelector('.confirmBtn');

// 비밀번호 입력 필드의 입력 이벤트 리스너
currentPw.addEventListener('input', ()=> {
    currentPwInput_container.classList.remove('selected');
    currentPwErrorMsg.style.display = 'none';
});
changePw.addEventListener("input", checkPasswordMatch);
changePw2.addEventListener("input", checkPasswordMatch);

function checkPasswordMatch() {
    console.log('비밀번호 체크');
    const pwValue = changePw.value;
    const pw2Value = changePw2.value;
    pwErrorMsg.style.display = 'none';

    // 비밀번호가 특수문자, 숫자, 그리고 일반 텍스트를 각각 최소한 1번씩 포함하는지 검사
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(pwValue);
    const hasNumber = /\d/.test(pwValue);
    const hasText = /[a-zA-Z]/.test(pwValue);

    if(pw2Value == "") {

    } else if (pwValue === pw2Value && hasSpecialCharacter && hasNumber && hasText) {
        // 모든 조건을 만족하는 경우
        pwErrorMsg.style.display = 'block';
        pwErrorMsg.innerHTML = "비밀번호가 일치하고 안전합니다";
        pwErrorMsg.style.color = "blue";
        pw2Input_container.classList.remove('selected');
    } else {
        // 일치하지 않거나 조건을 만족하지 않는 경우
        pwErrorMsg.style.display = 'block';
        pwErrorMsg.style.color = "red";
        pwErrorMsg.innerHTML = "비밀번호가 일치하지 않거나, 특수문자, 숫자, 그리고 텍스트를 모두 포함해야 합니다.";
        pw2Input_container.classList.add('selected');
    }
}

// 이용자 회원 상태 확인하기
userSignupStatusCehck();
function userSignupStatusCehck() {

    fetch('/loginStatusProC', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        })
      })
      .then(response => response.json())
      .then(data => {
        userSignupStatus = data[0].signupStatus;
      })
      .catch(error => {
        console.log(`이용자 정보 받아오기 Error : ${error}`);
      });

}

// 비밀번호 변경 확인 버튼 클릭 시 
confirmBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('비밀번호 변경 확인 버튼 클릭!');

    if(userSignupStatus === 'CONFIRM') {
        currentPwErrorMsg.style.display = 'none';
        pwErrorMsg.style.display = 'none';
        currentPwInput_container.classList.remove('selected');
        pw2Input_container.classList.remove('selected');
    
        const currentPwValue = currentPw.value;
        const changePwValue = changePw.value;
    
        console.log(`currentPwValue:${currentPwValue}`);
        console.log(`changePwValue:${changePwValue}`);
    
        // 현재 비밀번호와 새 비밀번호가 일치할 경우
        if(currentPwValue === changePwValue) {
            pwErrorMsg.style.display = 'block';
            pwErrorMsg.style.color = "red";
            pwErrorMsg.innerHTML = "현재 비밀번호와 새 비밀번호가 일치합니다";
            pw2Input_container.classList.add('selected');
        } else {
            pwErrorMsg.style.display = 'none';
            pw2Input_container.classList.remove('selected');
    
            fetch('/myprofile/changepwProc', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPwValue: currentPwValue,
                    changePwValue: changePwValue,
                })
              })
              .then(response => response.json())
              .then(data => {
                const result = data['result'];
                console.log('result : ', result);
    
                if(result === 'CURRENT PW NOT MATCH') {
                    currentPwErrorMsg.style.display = 'block';
                    currentPwErrorMsg.style.color = "red";
                    currentPwErrorMsg.innerHTML = "현재 비밀번호를 확인해주세요";
                    currentPwInput_container.classList.add('selected');
                } else if(result === 'SUCCESS') {
                    alert('비밀번호 변경이 완료되었습니다');
                    window.location.href = `${hostURL}login`;
                } else {
                    alert('회원 상태를 확인해주세요');
                    window.location.href = `${hostURL}myprofile/profile`;
                }
    
              })
              .catch(error => {
                console.log(`비밀 번호 변경하기 Error : ${error}`);
              });
        }
    } else {

    }
});