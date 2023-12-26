"use strict"

// let hostURL = 'http://localhost:3000';

const pointColor = "#DB7C8D";
const frequencyColor = "#D9D9D9";
let loginStatus = "OFF";

// 로그인 기능 구현
const idInput = document.querySelector('.idInput');
const pwInput = document.querySelector('.pwInput')
const loginErrorMsg = document.querySelector('.loginErrorMsg');
const loginBtn = document.querySelector('.loginBtn');
let pwfailCount = ''; // 비밀번호 실패 카운트

idInput.addEventListener('input', () => {
    idInput.style.border = `1px solid ${frequencyColor}`;
});

pwInput.addEventListener('input', () => {
    pwInput.style.border = `1px solid ${frequencyColor}`;
});

// 로그인 버튼에서 Enter를 눌렀을 경우
pwInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        loginFunctionHandler();
    }
  });

// 로그인 상태 유지 버튼
const loginStatusBtn = document.querySelector('.loginStatusBtn'); // 로그인 상태 버튼
let autoLoginStatus = "OFF";

// 로그인 상태 유지 버튼 선택 시
loginStatusBtn.addEventListener('click', (event)=> {

    event.preventDefault();

    if(autoLoginStatus == "OFF") {
        loginStatusBtn.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #767373;"></i><p>로그인 상태 유지</p>`;
        autoLoginStatus = "ON";
    } else if(autoLoginStatus == "ON") {
        loginStatusBtn.innerHTML = `<i class="fa-regular fa-circle-check" style="color: #767373;"></i><p>로그인 상태 유지</p>`;
        autoLoginStatus = "OFF";
    }
});

// 로그인 버튼 클릭 시
loginBtn.addEventListener('click', ()=> {
    loginFunctionHandler();
});

function loginFunctionHandler() {
       //아무것도 입력하지 않았을 경우
       if(idInput.value === "") {
        loginErrorMsg.style.display = "block";
        loginErrorMsg.innerHTML = "아이디를 입력해주세요.";
        loginErrorMsg.style.color = "red";
        idInput.style.border = `1px solid ${pointColor}`;
    } else if(pwInput.value === "") {
        loginErrorMsg.style.display = "block";
        loginErrorMsg.innerHTML = "비밀번호를 입력해주세요.";
        loginErrorMsg.style.color = "red";
        pwInput.style.border = `1px solid ${pointColor}`;
    } 
    // 무언가를 입력했을 경우
    else {
        // 서버에 id, pw 정보 전달
        const idValue = idInput.value; // id 정보
        const pwValue = pwInput.value; // pw 정보
        console.log(`id : ${idValue}, pw : ${pwValue}`);

        //이메일 주소 형식에 맞지 않았을 경우
        let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        //이메일 주소 형식에 맞지 않았을 경우
        if(!emailPattern.test(idValue)) {
            loginErrorMsg.style.display = "block";
            loginErrorMsg.style.color='red';
            loginErrorMsg.innerHTML = "유효하지 않은 이메일 주소입니다.";
            idInput.style.border = `1px solid ${pointColor}`;
        } 
        else {
            
            //아이디와 비밀번호가 일치하지 않았을 경우

            // 서버에서 confirm or error 메시지 수렁
            fetch('/loginProc', {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: idValue,
                    pw: pwValue,
                    autoLoginStatus: autoLoginStatus,
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);

                // 아이디가 존재하지 않을 때
                if (data.result === 'id no exist') {
                    loginErrorMsg.style.display = "block";
                    loginErrorMsg.style.color='red';
                    loginErrorMsg.innerHTML = "존해하지 않는 아이디입니다.";
                    idInput.style.border = `1px solid ${pointColor}`;
                }
                else if (data.result === 'fail') {
                    loginErrorMsg.style.display = "block";
                    loginErrorMsg.style.color='red';
                    loginErrorMsg.innerHTML = "비밀번호가 일치하지 않습니다.";
                    idInput.style.border = `1px solid ${pointColor}`;
                } 
                else if (data.result === 'pwcountfail too much')  {
                    loginErrorMsg.style.display = "block";
                    loginErrorMsg.style.color='red';
                    loginErrorMsg.innerHTML = "비밀번호를 5회 이상 실패하였습니다. 비밀번호 찾기로 재설정해주세요.";
                    idInput.style.border = `1px solid ${pointColor}`;
                }
                else if(data.result === 'success') {
                    window.location.href = `${hostURL}`;
                    loginStatus = 'ON';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            })
        }
    }
}

// const findPwBtn = document.querySelector('.findPwBtn');

// // 비밀번호 찾기 버튼 클릭 시
// findPwBtn.addEventListener('click', (event)=> {
//     event.preventDefault();
//     window.location.href = `${hostURL}/findpw`;
// });

// 회원 가입 버튼 클릭 시
const signUpBtn = document.querySelector('.signUpBtn');

signUpBtn.addEventListener('click', (event)=> {

    event.preventDefault();

    window.location.href = `${hostURL}signup`;
});

// 아이디 비밀번호 찾기 버튼 클릭 시
const findIdPwBtn = document.querySelector('.findIdPwBtn');
findIdPwBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('아이디/비밀번호 찾기 버튼 클릭!');
    window.location.href = `${hostURL}findInfo`;
});