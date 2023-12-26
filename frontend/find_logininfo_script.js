let categoryRecog = 'findId';
let idValue;
let authNumber = '';
const errorMsg = document.querySelector('.errorMsg');
const findIdBtn = document.querySelector('#findId');
const changePw = document.querySelector('#changePwInput');
const changePw2 = document.querySelector('#changePw2Input');


categoryHandler(categoryRecog); // 최초 접속 시 실행

// 카테고리 핸들러
function categoryHandler(categoryRecog) {

    const findIdInput_container = document.querySelector('.findIdInput_container');
    const findPwInput_container = document.querySelector('.findPwInput_container');
    const explainMsg = document.querySelector('.explainMsg');
    const confirmBtn = document.querySelector('.confirmBtn');

    errorMsg.style.display = 'none'; // 에러 메시지 가리기

    // 선택 초기화
    const findInfoCategoryBtns = document.querySelectorAll('.findInfoCategoryBtns_container button');
    findInfoCategoryBtns.forEach((btn) => {
        btn.classList.remove('selected');
    });

    if(categoryRecog === 'findId') {
        const findId = document.querySelector('#findId');
        findId.classList.add('selected');
        findIdInput_container.style.display = 'block';
        findPwInput_container.style.display = 'none';
        explainMsg.textContent = '인증받은 번호로 아이디(이메일 주소)를 전달드립니다.';
        confirmBtn.textContent = '아이디(이메일 주소)받기';
    } else if(categoryRecog === 'findPw') {
        const findPw = document.querySelector('#findPw');
        findPw.classList.add('selected');
        findPwInput_container.style.display = 'block';
        findIdInput_container.style.display = 'none';
        explainMsg.textContent = '가입한 이메일 주소로 비밀번호 재설정 링크 전달드립니다.';
        confirmBtn.textContent = '비밀번호 재설정 링크받기';
    }
}

// 폰 번호 입력 제어
const phoneInput = document.querySelector('#phoneInput');
const phoneMaxInputLength = 11; // 최대 입력 길이
phoneInput.addEventListener('input', function(event) {
    const inputText = event.target.value;

    // 입력값에서 하이픈 제거
    const filteredText = inputText.replace(/-/g, '');
  
    // 숫자 이외의 문자 제거
    const numericText = filteredText.replace(/[^\d]/g, '');

    // 형식에 맞게 변환하여 입력 필드에 설정
    if (numericText.length <= phoneMaxInputLength) {
        const formattedText = numericText.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
        phoneInput.value = formattedText;
    } else {
        // 입력 제한된 길이를 초과하면 입력 불가
        phoneInput.value = phoneInput.value.slice(0, phoneMaxInputLength);
    }
});

// 아이디 찾기 카테고리 버튼 클릭 시
const nameInput = document.querySelector('#nameInput');
findIdBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // console.log('아이디 찾기 카테고리 버튼 클릭!');

    categoryRecog = 'findId';
    categoryHandler(categoryRecog); // 선택 카테고리 변경
});

// 비밀번호 찾기 카테고리 버튼 클릭 시
const findPwBtn = document.querySelector('#findPw');
findPwBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // console.log('아이디 찾기 카테고리 버튼 클릭!');

    categoryRecog = 'findPw';
    categoryHandler(categoryRecog); // 선택 카테고리 변경
    findPwCategoryFirstSetting();
});

// 확인 버튼 클릭 시
const confirmBtn = document.querySelector('.confirmBtn');
confirmBtn.addEventListener('click', (e) => {
    e.preventDefault();

    errorMsg.style.display = 'none';

    if(categoryRecog === 'findId') {
        console.log('아이디 찾기 확인 버튼 클릭');

        const nameValue = nameInput.value;
        const phoneValue = phoneInput.value;

        // 입력값이 없을 경우
        if(nameValue === '' || phoneValue === '') {
            errorMsg.style.display = 'block';
            errorMsg.textContent = '이름이나 연락처를 입력해주세요';
        } else {
            // 서버 통신 시작
            fetch(`/findIdProc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nameValue: nameValue,
                    phoneValue: phoneValue,
                })
            })
            .then(response => response.json())
            .then(data => {
                if(data['result'] === 'FAIL') {
                    errorMsg.style.display = 'block';
                    errorMsg.textContent = '일치하는 회원 정보가 없습니다';
                } else if(data['result'] === 'SUCCESS') {
                    alert('연락처로 계정 아이디(이메일) 정보가 전송 완료되었습니다');
                    window.location.reload();
                }   
            })
            .catch(error => {
                console.log(`아이디 찾기 서버 통신 Error : ${error}`);
            });
        }

    } else if(categoryRecog === 'findPw') {
        console.log('비밀번호 찾기 확인 버튼 클릭');
        
        idValue = document.querySelector('#emailInput').value;
        let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        

        if(idValue === '') {
            errorMsg.style.display = 'block';
            errorMsg.textContent = '아이디(이메일)를 입력해주세요';
        } else if(!emailPattern.test(idValue)) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = '유효하지 않은 이메일 주소입니다';
        } else {

            // 이메일 비활성화
            const emailInput = document.querySelector('#emailInput');
            emailInput.disabled = true;
            emailInput.classList.add('disabled');
            // 인증번호 창 열기
            const authNumberInput_container = document.querySelector('#authNumberInput_container');
            authNumberInput_container.style.display = 'block';
            authNumberInput_container.style.display = 'flex';
            // 인증번호 확인 버튼 나타나기
            const authNumberBtn = document.querySelector('#authNumberBtn');
            confirmBtn.style.display = 'none';
            authNumberBtn.style.display = 'block';

            // 서버 통신 시작
            fetch(`/findPwProc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idValue: idValue,
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('data:',data);
                if(data['result'] === 'NO EXIST EMAIL') {
                    errorMsg.style.display = 'block';
                    errorMsg.textContent = '존재하지 않는 계정(아이디)입니다';
                } else {
                    authNumber = data['authNumber'];
                    // console.log('authNumber:',authNumber);
                    
                    // 인증번호 확인 버튼 클릭
                    authNumberBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log('인증번호 확인 버튼 클릭');
                        const authNumberInput = document.querySelector('#authNumberInput');
                        const authNumberInputValue = authNumberInput.value;

                        authNumberInput.addEventListener('input', ()=> {
                            authNumberInput.classList.remove('disabled');
                        });

                        console.log('authNumberInputValue:',authNumberInputValue);

                        if(authNumberInputValue === authNumber) {
                            console.log('인증번호 입력 일치'); 
                            authNumberInput.disabled = true;
                            authNumberInput.classList.add('disabled');
                            errorMsg.style.display = 'none';

                            authNumberBtn.style.display = 'none';
                            const changePwInput_container = document.querySelector('#changePwInput_container');
                            const changePw2Input_container = document.querySelector('#changePw2Input_container');
                            changePwInput_container.style.display = 'block';
                            changePwInput_container.style.display = 'flex';
                            changePw2Input_container.style.display = 'block';
                            changePw2Input_container.style.display = 'flex';
                            const pwChangeBtn = document.querySelector('#pwChangeBtn');
                            pwChangeBtn.style.display = 'block';

                            changePw.addEventListener("input", checkPasswordMatch);
                            changePw2.addEventListener("input", checkPasswordMatch);

                            // 비밀번호 재설정 완료 버튼 클릭 시
                            pwChangeBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                console.log('비밀번호 재설정 완료 버튼 클릭');
                                errorMsg.style.display = 'none';
                                const changePwValue = changePw.value;

                                fetch('/myprofile/changepwProc', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        changePwValue: changePwValue,
                                        idValue: idValue,
                                    })
                                })
                                .then(response => response.json())
                                .then(data => {
                                    const result = data['result'];
                                    console.log('result : ', result);
                        
                                    if(result === 'SUCCESS') {
                                        alert('비밀번호 변경이 완료되었습니다');
                                        window.location.href = `${hostURL}login`;
                                    } else {
                                        alert('알 수 없는 오류로 비밀번호 변경에 실패했습니다.\n다시 시도해주세요');
                                    }
                                })
                                .catch(error => {
                                    console.log(`비밀 번호 변경하기 Error : ${error}`);
                                });
                            });

                        } else {
                            errorMsg.style.display = 'block';
                            errorMsg.textContent = '인증번호가 일치하지 않습니다';
                        }
                    });


                    // if(data['result'] === 'FAIL') {
                    //     errorMsg.style.display = 'block';
                    //     errorMsg.textContent = '일치하는 회원 정보가 없습니다';
                    // } else if(data['result'] === 'SUCCESS') {
                    //     alert('연락처로 계정 아이디(이메일) 정보가 전송 완료되었습니다');
                    //     window.location.reload();
                    // } 
                }
            })
            .catch(error => {
                console.log(`아이디 찾기 서버 통신 Error : ${error}`);
            });
        }

    }
});

function checkPasswordMatch() {
    console.log('비밀번호 체크');
    const pwValue = changePw.value;
    const pw2Value = changePw2.value;
    errorMsg.style.display = 'none';

    // 비밀번호가 특수문자, 숫자, 그리고 일반 텍스트를 각각 최소한 1번씩 포함하는지 검사
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(pwValue);
    const hasNumber = /\d/.test(pwValue);
    const hasText = /[a-zA-Z]/.test(pwValue);

    if(pw2Value == "") {

    } else if (pwValue === pw2Value && hasSpecialCharacter && hasNumber && hasText) {
        // 모든 조건을 만족하는 경우
        errorMsg.style.display = 'block';
        errorMsg.innerHTML = "비밀번호가 일치하고 안전합니다";
        errorMsg.style.color = "blue";
    } else {
        // 일치하지 않거나 조건을 만족하지 않는 경우
        errorMsg.style.display = 'block';
        errorMsg.style.color = "red";
        errorMsg.innerHTML = "비밀번호가 일치하지 않거나, 특수문자, 숫자, 그리고 텍스트를 모두 포함해야 합니다.";
    }
}

function findPwCategoryFirstSetting() {
    authNumber = '';
    const errorMsg = document.querySelector('.errorMsg');
    errorMsg.style.display = 'none';
    const emailInput_container = document.querySelector('#emailInput_container');
    emailInput_container.style.display = 'block';
    emailInput_container.style.display = 'flex';
    const emailInput = document.querySelector('#emailInput');
    emailInput.disabled = false;
    emailInput.classList.remove('disabled');
    emailInput.value = '';
    const authNumberInput_container = document.querySelector('#authNumberInput_container');
    authNumberInput_container.style.display = 'none';
    const authNumberInput = document.querySelector('#authNumberInput');
    authNumberInput.disabled = false;
    emailInput.classList.remove('disabled');
    authNumberInput.value = '';
    const changePwInput_container = document.querySelector('#changePwInput_container');
    changePwInput_container.style.display = 'none';
    const changePwInput = document.querySelector('#changePwInput');
    changePwInput.value = '';
    const changePw2Input_container = document.querySelector('#changePw2Input_container');
    changePw2Input_container.style.display = 'none';
    const changePw2Input = document.querySelector('#changePw2Input');
    changePw2Input.value = '';
    const confirmBtn = document.querySelector('.confirmBtn');
    confirmBtn.style.display = 'block';
    const authNumberBtn = document.querySelector('#authNumberBtn');
    authNumberBtn.style.display = 'none';
    const pwChangeBtn = document.querySelector('#pwChangeBtn');
    pwChangeBtn.style.display = 'none';
}