"use strict"

const pointColor = "#DB7C8D";
const frequencyColor = "#D9D9D9";
const selectBtnColor = "#F9F2F2";
const subBtnColor = '#767373';
let firebaseConfig;


// Firebase 휴대폰 인증
// Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-analytics.js";

// 휴대폰 번호 인증

import { getAuth , RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
// import { captureRejectionSymbol } from "nodemailer/lib/xoauth2";
// https://firebase.google.com/docs/web/setup#available-libraries

let signupCategories = {
    "occupation" : [],
    "mbti" : [],
    "style" : [],
    "eyeType" : [],
    "bodyType" : [],
    "faceType" : [],
    "lips" : [],
    "personality" : [],
    "drinking" : [],
    "smoking" : [],
    "religion" : [],
    "agePreference" : [],
    "relationship" : [],
    "distance" : [],
    "pet" : [],
    "hobby" : [],
};

let signupData;
let areaData;
let datingStyleData;

// 회원가입 ProgressBar 
const progressBar = document.querySelector('.progressBar');
const progressNumber = document.querySelector('.progressNumber');

// 모든 Progressbar 변수 정의
const progressVariables = {
    idProgress: 0,
    pwProgress: 0,
    nameProgress: 0,
    genderProgress: 0,
    nicknameProgress: 0,
    ageProgress: 0,
    heightProgress: 0,
    regionProgress: 0,
    occupationProgress: 0,
    mbtiProgress: 0,
    styleProgress: 0,
    eyesTypeProgress: 0,
    bodyTypeProgress: 0,
    faceTypeProgress: 0,
    lipsProgress: 0,
    personalityProgress: 0,
    drinkingProgress: 0,
    smokingProgress: 0,
    religionProgress: 0,
    agePreferenceProgress: 0,
    relationshipProgress: 0,
    distanceProgress: 0,
    petProgress: 0,
    hobbyProgress: 0,
    pictureProgress: 0,
    salaryProgress: 0,
    phoneProgress: 0,
    datingstyleProgress: 0,
    letterProgress: 0
};

// 모든 Check 변수 정의
const checkVariables = {
    idCheck: 'no',
    pwCheck: 'no',
    nameCheck: 'no',
    genderCheck: 'no',
    nicknameCheck: 'no',
    ageCheck: 'no',
    heightCheck: 'no',
    regionCheck: 'no',
    occupationCheck: 'no',
    mbtiCheck: 'no',
    styleCheck: 'no',
    eyeTypeCheck: 'no',
    bodyTypeCheck: 'no',
    faceTypeCheck: 'no',
    lipsCheck: 'no',
    personalityCheck: 'no',
    drinkingCheck: 'no',
    smokingCheck: 'no',
    religionCheck: 'no',
    agePreferenceCheck: 'no',
    relationshipCheck: 'no',
    distanceCheck: 'no',
    petCheck: 'yes',
    hobbyCheck: 'no',
    pictureCheck: 'no',
    salaryCheck: 'no',
    phoneCheck: 'no',
    datingsytleCheck: 'no',
    letterCheck: 'no'
};

let datingStyles = {
    "contactTerms" : [],
    "statusReport" : [],
    "datingCost" : [],
    "hobbyPreference" : [],
    "datingStyles" : [],
    "manner" : [],
    "datingTerm" : [],
    "anniversary" : [],
    "contactPreference" : [],
    "comfortStyle" : [],
}

let area = {
    "서울특별시" : [],
    "경기도" : [],
    "인천광역시" : [],
    "강원도" : [],
    "충청북도" : [],
    "충청남도" : [],
    "대전광역시" : [],
    "세종특별자치시" : [],
    "전라북도" : [],
    "전라남도" : [],
    "광주광역시" : [],
    "경상북도" : [],
    "경상남도" : [],
    "부산광역시" : [],
    "대구광역시" : [],
    "울산광역시" : [],
    "제주특별자치도" : [],
};

// 회원가입 정보 서버로 부터 받기
function requestSignupData() {
    return new Promise((resolve, reject) => {
        fetch('/signupdataProc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            // console.log('data:',data.signupData);
            signupData = data.signupData;
            areaData = data.areaData;
            datingStyleData = data.datingStyleData;
            firebaseConfig = data.firebaseConfig;
            
            // console.log('firebaseConfig:',firebaseConfig);
            // console.log('signupData:',signupData);
            // console.log('areaData:',areaData);
            // console.log('datingStyleData:',datingStyleData);


            signupData.forEach((item) => {
                const category = item.category;

                if (signupCategories.hasOwnProperty(category)) {
                    const values = Object.entries(item).map(([key, val]) => {
                        if (typeof val === 'string' && key.startsWith('content_')) {
                            return val;
                        } else {
                            return null;
                        }
                    }).filter(val => val !== null);

                    signupCategories[category] = signupCategories[category].concat(values);
                }
            });

            // console.log('areaData:',areaData);

            areaData.forEach((item) => {
                const category = item.city;

                if (area.hasOwnProperty(category)) {
                    const values = Object.entries(item).map(([key, val]) => {
                        if (typeof val === 'string' && key.startsWith('gu_')) {
                            return val;
                        } else {
                            return null;
                        }
                    }).filter(val => val !== null);

                    area[category] = area[category].concat(values);
                }
            });

            datingStyleData.forEach((item) => {
                const category = item.category;

                if (datingStyles.hasOwnProperty(category)) {
                    const values = Object.entries(item).map(([key, val]) => {
                        if (typeof val === 'string' && key.startsWith('content_')) {
                            return val;
                        } else {
                            return null;
                        }
                    }).filter(val => val !== null);

                    datingStyles[category] = datingStyles[category].concat(values);
                }
            });


            resolve(); // resolve를 호출하여 완료를 알립니다.
        })
        .catch(error => {
            console.error('회원 가입 정보 서버 통신 Error:', error);
            reject(error); // 에러가 발생하면 reject를 호출하여 에러를 알립니다.
        });
    });
}

requestSignupData().then(()=> {

    //// 버튼 만들기
    const occupationInputContainer = document.querySelector('#occupationInput_container');
    createButtonForCategory(occupationInputContainer, 'occupation');

    const mbtiInputContainer = document.querySelector('#mbtiInput_container');
    createButtonForCategory(mbtiInputContainer, 'mbti');

    const styleInputContainer = document.querySelector('#styleInput_container');
    createButtonForCategory(styleInputContainer, 'style');

    const eyesTypeInputContainer = document.querySelector('#eyesTypeInput_container');
    createButtonForCategory(eyesTypeInputContainer, 'eyeType');

    const body_typeInputContainer = document.querySelector('#body_typeInput_container');
    createButtonForCategory(body_typeInputContainer, 'bodyType');

    const face_typeInputContainer = document.querySelector('#face_typeInput_container');
    createButtonForCategory(face_typeInputContainer, 'faceType');

    const lips_typeInputContainer = document.querySelector('#lips_typeInput_container');
    createButtonForCategory(lips_typeInputContainer, 'lips');

    const personalityInputContainer = document.querySelector('#personalityInput_container');
    createButtonForCategory(personalityInputContainer, 'personality');

    const drinking_habitsInputContainer = document.querySelector('#drinking_habitsInput_container');
    createButtonForCategory(drinking_habitsInputContainer, 'drinking');

    const smoking_habitsInputContainer = document.querySelector('#smoking_habitsInput_container');
    createButtonForCategory(smoking_habitsInputContainer, 'smoking');

    const religionInputContainer = document.querySelector('#religionInput_container');
    createButtonForCategory(religionInputContainer, 'religion');

    const agePreferenceInputContainer = document.querySelector('#agePreferenceInput_container');
    createButtonForCategory(agePreferenceInputContainer, 'agePreference');

    const relationshipInputContainer = document.querySelector('#relationshipInput_container');
    createButtonForCategory(relationshipInputContainer, 'relationship');

    const distanceInputContainer = document.querySelector('#distanceInput_container');
    createButtonForCategory(distanceInputContainer, 'distance');

    const petInputContainer = document.querySelector('#petInput_container');
    createButtonForCategory(petInputContainer, 'pet');

    const hobbyInputContainer = document.querySelector('#hobbyInput_container');
    createButtonForCategory(hobbyInputContainer, 'hobby');


    function createButtonForCategory(inputContainer ,text) {

        // console.log('inputContainer:',inputContainer);
        // console.log('text:',text);

        // console.log(signupCategories);

        const btns_container = document.createElement('div');
        btns_container.classList.add('selectBtns_container');
        btns_container.setAttribute('id', `${text}SelectBtns_container`);
        signupCategories[text].forEach((value) => {
            const btn = document.createElement('button');
            btn.classList.add('btns_btn');
            btn.setAttribute('id', `${text}Btn`);
            btn.textContent = value;
            btns_container.appendChild(btn);
        });
        inputContainer.appendChild(btns_container);
    }

    // 지역 버튼 만들기
    const cityContainer = document.querySelector('.city_container');
    for (const areaName in area) {
        const cityBtn = document.createElement('button');
        cityBtn.classList.add('city');
        cityBtn.textContent = areaName;
        cityContainer.appendChild(cityBtn);
    }

    // 연애스타일 버튼 생성하기
    createDatingStyleButtonForCategory('contactTerms');
    createDatingStyleButtonForCategory('statusReport');
    createDatingStyleButtonForCategory('datingCost');
    createDatingStyleButtonForCategory('hobbyPreference');
    createDatingStyleButtonForCategory('datingStyles');
    createDatingStyleButtonForCategory('manner');
    createDatingStyleButtonForCategory('datingTerm');
    createDatingStyleButtonForCategory('anniversary');
    createDatingStyleButtonForCategory('contactPreference');
    createDatingStyleButtonForCategory('comfortStyle');


    function createDatingStyleButtonForCategory(text) {

        // console.log('inputContainer:',inputContainer);
        // console.log('text:',text);
        
        const inputContainer = document.querySelector(`.${text}Btns_container`);
        const btns_container = document.createElement('div');
        btns_container.classList.add(`${text}Btns_container`);
        datingStyles[text].forEach((value) => {
            const btn = document.createElement('button');
            btn.classList.add('dating_btn');
            btn.setAttribute('id', `${text}Btn`);
            btn.textContent = value;
            btns_container.appendChild(btn);
        });
        inputContainer.appendChild(btns_container);
    }


    // 변수들의 총합을 저장할 변수 초기화
    let totalProgress = 0;
    // 초기값 설정
    progressBar.style.width = '0%';
    progressNumber.textContent = '0%';
    let progressAmount = 3.44827586206897;

    function progressBarUpdate() {

        totalProgress = 0;
        progressBar.style.width = '0%';
        progressNumber.textContent = '0%';

        // progressVariables 객체의 각 속성 값을 순회하며 더하기
        for (const key in progressVariables) {
            if (Object.hasOwnProperty.call(progressVariables, key)) {
                // console.log('progressVariables[key]:',progressVariables[key]);
                totalProgress += progressVariables[key];
            }
        }

        // console.log('Total Progress:', totalProgress);

        progressBar.style.width = parseFloat(progressBar.style.width) + totalProgress + '%';
        // console.log(`progressBar.style.width:${progressBar.style.width}`);

        const currentNumber = parseFloat(progressNumber.textContent);
        const updatedNumber = currentNumber + totalProgress;
        progressNumber.textContent = updatedNumber.toFixed(1) + '%';
        // console.log(`progressNumber.textContent:${progressNumber.textContent}`);

    }

    //아이디 중복 확인
    const id = document.querySelector('#id');
    const idCheckBtn = document.querySelector('#idCheckBtn');
    const idErrorMsg = document.querySelector('#idErrorMsg');
    const idInput_container = document.querySelector('#idInput_container');

    // 아이디 input 실시간 체크
    id.addEventListener('input', () => {
        checkVariables.idCheck = 'no'; 
        progressVariables.idProgress = 0;
        progressBarUpdate();

        idErrorMsg.style.display = "none";
        idInput_container.style.border = `1px solid ${frequencyColor}`;
    });

    //이메일 인증 버튼 클릭 시
    idCheckBtn.addEventListener('click', ()=> {
        emailVerification();
    });

    let authNumber;

    //이메일 재전송하기 버튼 클릭 시
    const emailResendBtn = document.querySelector('.emailResendBtn');
    emailResendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const idInput = document.querySelector('#id');
        const emailValue = idInput.value;

        // 인증번호 전달 서버 통신
        fetch('/authNumberProc', {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emailValue: emailValue,
            })
        })
        .then(response => response.json())
        .then(data => {
            // console.log('data:',data);
            authNumber = data['authNumber'];

            alert('인증번호 재전달이 완료되었습니다.\n다시 한번 이메일을 확인하고 인증번호를 입력해주세요');

        })        
        .catch(error => {
            console.error('인증 번호 서버 통신 Error:', error);
        });

    });

    function emailVerification() {
        if(idCheckBtn.textContent === '이메일 인증') {

            // 서버에 id정보 전달
            const idValue = id.value; // id 정보
            // console.log(`id : ${idValue}`);

            let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

            //아디이 입력 안했을 경우
            if(id.value == "") {
                idErrorMsg.style.display = "block";
                idErrorMsg.innerHTML = "아이디를 입력해주세요.";
                idErrorMsg.style.color='red';
                idInput_container.style.border = `1px solid ${pointColor}`;
                checkVariables.idCheck = 'no';

                progressVariables.idProgress = 0;
                progressBarUpdate();
            } else if(!emailPattern.test(idValue)) {
                idErrorMsg.style.display = "block";
                idErrorMsg.style.color='red';
                idErrorMsg.innerHTML = "유효하지 않은 이메일 주소입니다.";
                idInput_container.style.border = `1px solid ${pointColor}`;
                checkVariables.idCheck = 'no';

                progressVariables.idProgress = 0;
                progressBarUpdate();
            }
            // 아이디를 입력했을 경우
            else {
                fetch('/idcheck', {
                    method : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: idValue,
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.result === 'confirm') {
                        idErrorMsg.style.display = "block";
                        idErrorMsg.innerHTML = "아이디가 중복됩니다.";
                        idErrorMsg.style.color='red';
                        idInput_container.style.border = `1px solid ${pointColor}`;
                        checkVariables.idCheck = 'no';
                        progressVariables.idProgress = 0;
                        progressBarUpdate();
                    }
                    else if (data.result == 'no_match') {
                        idCheckBtn.textContent = '이메일 재입력';
                        // 이메일 입력창 disabled만들기
                        const idInput = document.querySelector('#id')
                        idInput.disabled = true;
                        idInput.classList.add('disabled');
                        // 인증번호 창 열기
                        const auth_container = document.querySelector('#auth_container');
                        auth_container.style.display = 'block';
                        auth_container.style.display = 'flex';
                        const emailResend_container = document.querySelector('.emailResend_container');
                        emailResend_container.style.display = 'block';


                        const emailValue = idInput.value;

                        // 인증번호 전달 서버 통신
                        fetch('/authNumberProc', {
                            method : 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                emailValue: emailValue,
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            // console.log('data:',data);
                            authNumber = data['authNumber'];
                        })        
                        .catch(error => {
                            console.error('인증 번호 서버 통신 Error:', error);
                        });
                        
                        // 인증번호 확인 버튼 클릭 시
                        const authCheckBtn = document.querySelector('#authCheckBtn');
                        authCheckBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            console.log('인증번호 확인 버튼 클락!');
                            const authNumberInput = document.querySelector('#auth');
                            const authNumberInputValue = authNumberInput.value;

                            if(authNumberInputValue === authNumber) {
                                idErrorMsg.style.display = "block";
                                idErrorMsg.innerHTML = "이메일 인증이 완료되었습니다";
                                idErrorMsg.style.color = "blue";
                                idInput_container.style.border = `1px solid ${frequencyColor}`;
                                authNumberInput.disabled = true;
                                authNumberInput.classList.add('disabled');

                                const emailResend_container = document.querySelector('.emailResend_container');
                                emailResend_container.style.display = 'none';

                                // 아디이 중복체크 확인
                                checkVariables.idCheck = 'yes'; 
                                // 상태바 업데이트
                                progressVariables.idProgress = progressAmount;
                                progressBarUpdate();
                            } else {
                                idErrorMsg.style.display = "block";
                                idErrorMsg.innerHTML = "인증번호가 일치하지 않습니다";
                                idErrorMsg.style.color = "red";

                                checkVariables.idCheck = 'no';
                                progressVariables.idProgress = 0;
                                progressBarUpdate();
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    checkVariables.idCheck = 'no'; 
                    progressVariables.idProgress = 0;
                    progressBarUpdate();
                })
            }
        }
        else if(idCheckBtn.textContent === '이메일 재입력') {
            idErrorMsg.style.display = "none";
            // 이메일 입력창 disabled 취소하기
            const idInput = document.querySelector('#id')
            idInput.disabled = false;
            idInput.classList.remove('disabled');
            idInput.value = '';
            // 인증번호 창 닫기
            const auth_container = document.querySelector('#auth_container');
            auth_container.style.display = 'none';
            const emailResend_container = document.querySelector('.emailResend_container');
            emailResend_container.style.display = 'none'
            // 인증번호 입력창 초기화
            const authInputfield = document.querySelector('#auth');
            authInputfield.value = '';
            authInputfield.disabled = false;
            authInputfield.classList.remove('disabled');

            checkVariables.idCheck = 'no'; 
            progressVariables.idProgress = 0;
            progressBarUpdate();

            idCheckBtn.textContent = '이메일 인증';
        }
    }

    function authNumberRequest(emailValue) {

    }

    // 비밀번호 중복 확인
    const pw = document.querySelector('#pw');
    const pw2 = document.querySelector('#pw2');
    const pwErrorMsg = document.querySelector('#pwErrorMsg');
    const pw2Input_container = document.querySelector('#pw2Input_container');

    // 비밀번호 입력 필드의 입력 이벤트 리스너
    pw.addEventListener("input", checkPasswordMatch);
    pw2.addEventListener("input", checkPasswordMatch);

    function checkPasswordMatch() {
        console.log('비밀번호 체크');
        const pwValue = pw.value;
        const pw2Value = pw2.value;

        checkVariables.pwCheck = 'no'; 
        progressVariables.pwProgress = 0;
        progressBarUpdate();

        pwErrorMsg.style.display = 'none';
        pw2Input_container.style.border = `1px solid ${frequencyColor}`;

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
            checkVariables.pwCheck = 'yes';
            pw2Input_container.style.border = `1px solid ${frequencyColor}`;

            progressVariables.pwProgress = progressAmount;
            progressBarUpdate();
            
        } else {
            // 일치하지 않거나 조건을 만족하지 않는 경우
            pwErrorMsg.style.display = 'block';
            pwErrorMsg.innerHTML = "비밀번호가 일치하지 않거나, 특수문자, 숫자, 그리고 텍스트를 모두 포함해야 합니다.";
            pwErrorMsg.style.color = "red";
            pw2Input_container.style.border = `1px solid ${pointColor}`;

            checkVariables.pwCheck = 'no'; 
            progressVariables.pwProgress = 0;
            progressBarUpdate();
        }
    }


    // 이름 입력 제어하기(글자수 제한)
    const nameInput = document.getElementById('nameInput');
    const nameNOC = document.getElementById('nameNOC');
    const nameErrorMsg = document.querySelector('#nameErrorMsg');
    const nameInput_container = document.querySelector('#nameInput_container');
    const NAME_MAX_NAME_LENGTH = 10; 

    nameInput.addEventListener('input', function(event) {
        const inputValue = event.target.value;
        const sanitizedValue = inputValue.replace(/\s/g, ''); // 띄어쓰기 제거

        // 입력 값이 없을 경우
        if(inputValue == "") {
            checkVariables.nameCheck = 'no';
            progressVariables.nameProgress = 0;
            progressBarUpdate();

            // 일치하지 않는 경우
            nameErrorMsg.style.display = 'block';
            nameErrorMsg.innerHTML = "이름을 입력해주세요.";
            nameErrorMsg.style.color = "red";
            nameInput_container.style.border = `1px solid ${pointColor}`;
        } else {

            if (sanitizedValue.length <= NAME_MAX_NAME_LENGTH) {
                nameInput.value = sanitizedValue; // 띄어쓰기가 제거된 값을 입력란에 설정
                nameNOC.textContent = `${sanitizedValue.length}/${NAME_MAX_NAME_LENGTH}`;
            } else {
                nameInput.value = sanitizedValue.slice(0, NAME_MAX_NAME_LENGTH); // 최대 길이 초과 시 문자열 자르기
                nameNOC.textContent = `${NAME_MAX_NAME_LENGTH}/${NAME_MAX_NAME_LENGTH}`;
            }

            checkVariables.nameCheck = 'yes';
            progressVariables.nameProgress = progressAmount;
            progressBarUpdate();
            nameErrorMsg.style.display = 'none';
            nameInput_container.style.border = `1px solid ${frequencyColor}`;
        }

        // console.log(`nameCheck:${nameCheck}`);
    });


    // 성별 입력 제어하기
    const genderInput_container = document.querySelector('#genderInput_container');
    const genderBtns = document.querySelectorAll('#genderBtn');
    const genderErrorMsg = document.querySelector('#genderErrorMsg');
    let genderButtonValue = '';

    genderBtns.forEach((button) => {

        button.addEventListener('click', function() {

            genderBtns.forEach((btn) => {
                btn.classList.remove('selected');
            });

            genderButtonValue = this.textContent;

            this.classList.add('selected');
            checkVariables.genderCheck = 'yes'
            progressVariables.genderProgress = progressAmount;
            progressBarUpdate();
        });
    });


    // 닉네임 입력 제어하기(글자수 제한)
    const nickNameInput = document.getElementById('nickNameInput');
    const nickNameNOC = document.getElementById('nickNameNOC');
    const NICKNAME_MAX_NAME_LENGTH = 10; 


    nickNameInput.addEventListener('input', function(event) {
        const inputValue = event.target.value;
        const sanitizedValue = inputValue.replace(/\s/g, ''); // 띄어쓰기 제거

        nickNameErrorMsg.style.display = "none";
        nickNameInput_container.style.border = `1px solid ${frequencyColor}`;

        if (sanitizedValue.length <= NICKNAME_MAX_NAME_LENGTH) {
            nickNameInput.value = sanitizedValue; // 띄어쓰기가 제거된 값을 입력란에 설정
            nickNameNOC.textContent = `${sanitizedValue.length}/${NICKNAME_MAX_NAME_LENGTH}`;
        } else {
            nickNameInput.value = sanitizedValue.slice(0, NICKNAME_MAX_NAME_LENGTH); // 최대 길이 초과 시 문자열 자르기
            nickNameNOC.textContent = `${NICKNAME_MAX_NAME_LENGTH}/${NICKNAME_MAX_NAME_LENGTH}`;
        }

        checkVariables.nicknameCheck = 'no';
        progressVariables.nicknameProgress = 0;
        progressBarUpdate();
    });

    // 닉네임 버튼 중복 처리
    const nickNameCheckBtn = document.querySelector('#nickNameCheckBtn');
    const nickNameErrorMsg = document.querySelector('#nickNameErrorMsg');
    const nickNameInput_container = document.querySelector('#nickNameInput_container');

    //닉네임 중복 확인 버튼 클릭 시
    nickNameCheckBtn.addEventListener('click', ()=> {

        // 서버에 nickname정보 전달
        const nickNameValue = nickNameInput.value; // nickname 정보
        console.log(`nickname : ${nickNameValue}`);

        //닉네임을 입력 안했을 경우
        if(nickNameInput.value == "") {
            nickNameErrorMsg.style.display = "block";
            nickNameErrorMsg.innerHTML = "닉네임을 입력해주세요.";
            nickNameErrorMsg.style.color = 'red';
            nickNameInput_container.style.border = `1px solid ${pointColor}`;

            checkVariables.nicknameCheck = 'no';
            progressVariables.nicknameProgress = 0;
            progressBarUpdate();
        } 
        // 닉네임을 입력했을 경우
        else {
            fetch('/nickNamecheck', {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nickname: nickNameValue,
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.result === 'confirm') {
                    nickNameErrorMsg.style.display = "block";
                    nickNameErrorMsg.innerHTML = "닉네임이 중복됩니다.";
                    nickNameErrorMsg.style.color = 'red';
                    nickNameInput_container.style.border = `1px solid ${pointColor}`;
                    checkVariables.nicknameCheck = 'no';
                    progressVariables.nicknameProgress = 0;
                    progressBarUpdate();
                }
                else if (data.result == 'no_match') {
                    nickNameErrorMsg.style.display = "block";
                    nickNameErrorMsg.innerHTML = "사용 가능한 닉네임입니다";
                    nickNameErrorMsg.style.color = "blue";
                    nickNameInput_container.style.border = `1px solid ${frequencyColor}`;
        
                    // 아디이 중복체크 확인
                    checkVariables.nicknameCheck = 'yes';
                    progressVariables.nicknameProgress = progressAmount;
                    progressBarUpdate();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                checkVariables.nicknameCheck = 'no';
                progressVariables.nicknameProgress = 0;
                progressBarUpdate();
            })
        }
    });


    // 나이 입력 제어하기
    const ageInput = document.querySelector('#ageInput');
    const ageErrorMsg = document.querySelector('#ageErrorMsg');
    const ageInput_container = document.querySelector('#ageInput_container');

    ageInput.addEventListener('input', (event) => {
        const inputValue = event.target.value.replace(/[^\d]/g, ''); // 숫자 이외의 문자 제거
        const truncatedValue = Math.min(inputValue, 99); // 최대 99까지만 허용 // 최대 3글자까지만 유지
        const formattedValue = ageAddCurrencySuffix(truncatedValue);
        ageInput.value = formattedValue;

        // 입력 값이 없을 경우
        if(inputValue == "") {
            checkVariables.ageCheck = 'no';
            progressVariables.ageProgress = 0;
            progressBarUpdate();

            // 일치하지 않는 경우
            ageErrorMsg.style.display = 'block';
            ageErrorMsg.innerHTML = "나이를 입력해주세요.";
            ageErrorMsg.style.color = "red";
            ageInput_container.style.border = `1px solid ${pointColor}`;
        } else {
            checkVariables.ageCheck = 'yes';
            progressVariables.ageProgress = progressAmount;
            ageErrorMsg.style.display = 'none';
            ageInput_container.style.border = `1px solid ${frequencyColor}`;
            progressBarUpdate();
        }
    });
    
    function ageAddCurrencySuffix(value) {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            const formattedValue = numericValue.toLocaleString('en-US'); // 숫자에 천 단위 콤마 추가
            return formattedValue + ' 살';
        }
        return value; // 숫자가 아닌 경우 그대로 반환
    }


    // 키 입력 제어하기
    const heightInput = document.querySelector('#heightInput');
    const heightErrorMsg = document.querySelector('#heightErrorMsg');
    const heightInput_container = document.querySelector('#heightInput_container');

    heightInput.addEventListener('input', (event) => {
        const inputValue = event.target.value.replace(/[^\d]/g, ''); // 숫자 이외의 문자 제거
        const truncatedValue = Math.min(inputValue, 999); // 최대 999까지만 허용 // 최대 4글자까지만 유지
        const formattedValue = heightAddCurrencySuffix(truncatedValue);
        heightInput.value = formattedValue;

        // 입력 값이 없을 경우
        if(inputValue == "") {
            checkVariables.heightCheck = 'no';
            progressVariables.heightProgress = 0;
            progressBarUpdate();

            // 일치하지 않는 경우
            heightErrorMsg.style.display = 'block';
            heightErrorMsg.innerHTML = "나이를 입력해주세요.";
            heightErrorMsg.style.color = "red";
            heightInput_container.style.border = `1px solid ${pointColor}`;
        } else {
            checkVariables.heightCheck = 'yes';
            progressVariables.heightProgress = progressAmount;
            heightErrorMsg.style.display = 'none';
            heightInput_container.style.border = `1px solid ${frequencyColor}`;
            progressBarUpdate();
        }
    });
    
    function heightAddCurrencySuffix(value) {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            const formattedValue = numericValue.toLocaleString('en-US'); // 숫자에 천 단위 콤마 추가
            return formattedValue + ' cm';
        }
        return value; // 숫자가 아닌 경우 그대로 반환
    }

    // 지역 선택하기
    const cityButtons = document.querySelectorAll('.city');
    const guContainer = document.querySelector('.gu_container');
    const regionErrorMsg = document.querySelector('#regionErrorMsg');
    const regionInput_container = document.querySelector('#regionInput_container');
    let cityValue = '';
    let guValue = '';

    cityButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cityName = this.textContent;
            cityValue = this.textContent;
            console.log(`cityValue:${cityValue}`);

            // 모든 버튼의 색깔 초기화
            cityButtons.forEach(btn => {
                btn.classList.remove('selected');
            });

            checkVariables.regionCheck = 'no';
            progressVariables.regionProgress = 0;
            progressBarUpdate();

            // 선택된 버튼의 스타일 변경
            this.classList.add('selected');

            guContainer.innerHTML = '';

            if (area[cityName]) {
                area[cityName].forEach(gu => {
                    const guButton = document.createElement('button');
                    guButton.classList.add('gu');
                    guButton.textContent = gu;
                    guContainer.appendChild(guButton);
                });

                // 지역 버튼 선택
                const guButtons = document.querySelectorAll('.gu');

                guButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        guValue = this.textContent;
                
                        // 모든 버튼의 색깔 초기화
                        guButtons.forEach(btn => {
                            btn.classList.remove('selected');
                        });
                
                        // 선택된 버튼의 스타일 변경
                        this.classList.add('selected');

                        regionErrorMsg.style.display = 'none';
                        regionInput_container.style.border = `1px solid ${frequencyColor}`;

                        checkVariables.regionCheck = 'yes';
                        progressVariables.regionProgress = progressAmount;
                        progressBarUpdate();
                
                    });
                });
            }
        });
    });

    // 직업 제어

    const occupationInput_container = document.querySelector('#occupationInput_container');
    const occupationBtns = document.querySelectorAll('#occupationBtn');
    const occupationErrorMsg = document.querySelector('#occupationErrorMsg');
    let occupationCheck = 'no';
    let occupationDetailCheck = 'no';
    let occupationFileCheck = 'no';
    let occupationButtonValue = '';

    occupationBtns.forEach((button) => {
        button.addEventListener('click', function() {

            occupationBtns.forEach((btn) => {
                btn.classList.remove('selected');
            });

            occupationButtonValue = this.textContent;

            this.classList.add('selected');
            occupationCheck = 'yes';

            if(occupationCheck == 'yes' && occupationDetailCheck == 'yes' && occupationFileCheck == 'yes') {
                checkVariables.occupationCheck = 'yes'
                progressVariables.occupationProgress = progressAmount;
                progressBarUpdate();
            } else {
                progressVariables.occupationProgress = 0;
                progressBarUpdate();
            }
        });
    });

    // 직업 상세업무 제어
    const occupationDetailInput_container = document.querySelector('#occupationDetailInput_container');
    const occupationDetailInput = document.getElementById('occupationDetailInput');
    const occupationDetailNOC = document.getElementById('occupationDetailNOC');
    const OCCUPATIONDETAIL_MAX_NAME_LENGTH = 10; 

    occupationDetailInput.addEventListener('input', function(event) {

        const inputValue = event.target.value;
        const sanitizedValue = inputValue.replace(/\s/g, ''); // 띄어쓰기 제거

        // 직업상세를 입력 안했을 경우
        if(inputValue == "") {
            occupationErrorMsg.style.display = "block";
            occupationErrorMsg.innerHTML = "상세업무를 입력해주세요.";
            occupationErrorMsg.style.color = 'red';
            occupationDetailInput_container.style.border = `1px solid ${pointColor}`;

            occupationDetailCheck = 'no';
            checkVariables.occupationCheck = 'no';
            progressVariables.occupationProgress = 0;
            progressBarUpdate();
        } 
        // 직업상세를 입력했을 경우
        else {

            // console.log(`inputValue:${inputValue}`);
            occupationErrorMsg.style.display = "none";
            occupationDetailInput_container.style.border = `1px solid ${frequencyColor}`;

            if (sanitizedValue.length <= OCCUPATIONDETAIL_MAX_NAME_LENGTH) {
                occupationDetailInput.value = sanitizedValue; // 띄어쓰기가 제거된 값을 입력란에 설정
                occupationDetailNOC.textContent = `${sanitizedValue.length}/${OCCUPATIONDETAIL_MAX_NAME_LENGTH}`;
            } else {
                occupationDetailInput.value = sanitizedValue.slice(0, OCCUPATIONDETAIL_MAX_NAME_LENGTH); // 최대 길이 초과 시 문자열 자르기
                occupationDetailNOC.textContent = `${OCCUPATIONDETAIL_MAX_NAME_LENGTH}/${OCCUPATIONDETAIL_MAX_NAME_LENGTH}`;
            }

            occupationDetailCheck = 'yes'

            if(occupationCheck == 'yes' && occupationDetailCheck == 'yes' && occupationFileCheck == 'yes') {
                checkVariables.occupationCheck = 'yes'
                progressVariables.occupationProgress = progressAmount;
                progressBarUpdate();
            } else {
                progressVariables.occupationProgress = 0;
                progressBarUpdate();
            }
        }
    });

    const occupationCheckBtn = document.querySelector('#occupationCheckBtn');

    // 재직증명서 업로드 버튼 클릭 시
    occupationCheckBtn.addEventListener('click', (e) => {
        console.log(`재직증명서 업로드 버튼 클릭!`);
        // 파일 업로드 input 요소를 클릭하여 파일 선택 대화상자를 엽니다.
        const fileInput = document.getElementById('occupationFileInput');
        fileInput.value = '';
        fileInput.click();
    });

    const maxOccupationFileSizeInBytes = 1 * 1024 * 1024;

    let occupationSelectedFile = '';
    let occupationfileNameValue;
    // 파일이 선택되면 실행되는 이벤트 리스너를 추가합니다.
    document.getElementById('occupationFileInput').addEventListener('change', (e) => {
        // 선택한 파일은 e.target.files[0]에서 얻을 수 있습니다.
        occupationSelectedFile = e.target.files[0];

        console.log(`occupationSelectedFile:${occupationSelectedFile}`);

        if (occupationSelectedFile.size > maxOccupationFileSizeInBytes) {
            // 파일 크기가 용량 제한을 초과할 경우 처리
            alert('파일 용량이 1MB를 초과합니다.');
            e.target.value = ''; // 파일 선택 취소
            return;
        }

        if (occupationSelectedFile) {
            // 파일 변수에 저장하여 필요한 작업을 수행할 수 있습니다.
            console.log('선택한 파일:', occupationSelectedFile.name);
            occupationfileNameValue = occupationSelectedFile.name;

            // 파일 이름을 표시
            const occupationFileMsg_container = document.querySelector('#occupationFileMsg_container');
            const occupationfileName = document.querySelector('.occupationfileName');
            occupationFileMsg_container.style.display = 'block';
            occupationfileName.style.color = frequencyColor;
            occupationfileName.textContent = `업로드 파일 : ${occupationSelectedFile.name}`;

            occupationErrorMsg.style.display = 'none';
            occupationInput_container.style.border = `1px solid ${frequencyColor}`;
            occupationFileCheck = 'yes';

            if(occupationCheck == 'yes' && occupationDetailCheck == 'yes' && occupationFileCheck == 'yes') {
                checkVariables.occupationCheck = 'yes'
                progressVariables.occupationProgress = progressAmount;
                progressBarUpdate();
            } else {
                progressVariables.occupationProgress = 0;
                progressBarUpdate();
            }
        }
    });

    const ocuupationFileCancelBtn = document.querySelector('#occupationFileMsg_container i')

    // 재직증명서 업로드 취소 버튼 클릭 시
    ocuupationFileCancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('재직증명서 업로드 취소 버튼 클릭!');

        occupationSelectedFile = ''; //업로드된 파일 정보 초기화
        const occupationFileMsg_container = document.querySelector('#occupationFileMsg_container');
        const occupationfileName = document.querySelector('.occupationfileName');
        occupationFileMsg_container.style.display = 'none';
        occupationfileName.textContent = '';

        occupationFileCheck = 'no';
        checkVariables.occupationCheck = 'no';
        progressVariables.occupationProgress = 0;
        progressBarUpdate();
    });

    // 버튼 선택 핸들러
    function buttonClickHandler(text, check, progress, callback) {
        const btns = document.querySelectorAll(`#${text}Btn`);
        btns.forEach((button) => {
            button.addEventListener('click', function() {
                btns.forEach((btn) => {
                    btn.classList.remove('selected');
                });
        
                const buttonValue = this.textContent;
        
                this.classList.add('selected');
                checkVariables[check] = 'yes';
                progressVariables[progress] = progressAmount;
                progressBarUpdate();

                callback(buttonValue);
            });
        });
    }

    // mbti 선택 확인
    const mbtiInput_container = document.querySelector('#mbtiInput_container');
    const mbtiErrorMsg = document.querySelector('#mbtiErrorMsg');
    let mbtiButtonValue = '';
    buttonClickHandler('mbti', 'mbtiCheck', 'mbtiProgress', function(value) {
        mbtiButtonValue = value;
    });


    // 스타일 선택 확인
    const styleInput_container = document.querySelector('#styleInput_container');
    const styleBtns = document.querySelectorAll('#styleBtn');
    const styleErrorMsg = document.querySelector('#styleErrorMsg');
    let selectedStyleCount = 0;
    const selectedStyleTexts = []; // 선택된 버튼들의 텍스트를 저장할 배열

    styleBtns.forEach(button => {
        button.addEventListener('click', function() {

            if (this.classList.contains('selected')) {
                // 이미 선택된 버튼을 다시 클릭한 경우 선택 취소
                this.classList.remove('selected');
                selectedStyleCount--;

                // 배열에서 선택된 텍스트 제거
                const buttonName = this.textContent;
                const index = selectedStyleTexts.indexOf(buttonName);
                if (index !== -1) {
                    selectedStyleTexts.splice(index, 1);
                }

                if(selectedStyleCount === 0) {
        
                    styleErrorMsg.style.display = "block";
                    styleErrorMsg.innerHTML = "필수 입력 사항입니다.";
                    styleErrorMsg.style.color = 'red';
                    styleInput_container.style.border = `1px solid ${pointColor}`;
        
                    checkVariables.styleCheck = 'no'
                    progressVariables.styleProgress = 0;
                    progressBarUpdate();
                }

            } else if(selectedStyleCount < 3) {
                const buttonName = this.textContent;
                this.classList.add('selected');
                selectedStyleCount++;

                // 배열에 선택된 텍스트 추가
                selectedStyleTexts.push(buttonName);

                checkVariables.styleCheck = 'yes'
                progressVariables.styleProgress = progressAmount;
                progressBarUpdate();

                styleErrorMsg.style.display = "none";
                styleInput_container.style.border = `1px solid ${frequencyColor}`;

                // console.log(`selectedStyleTexts:${selectedStyleTexts}`);
            }

        });
    });


    // 쌍커풀 선택 확인
    const eyesTypeInput_container = document.querySelector('#eyesTypeInput_container');
    let eyeTypeButtonValue = '';
    const eyesTypeErrorMsg = document.querySelector('#eyesTypeErrorMsg');
    buttonClickHandler('eyeType', 'eyeTypeCheck', 'eyeTypeProgress', function(value) {
        eyeTypeButtonValue = value;
    });

    // 체형 선택 확인
    const body_typeInput_container = document.querySelector('#body_typeInput_container');
    let bodyTypeButtonValue = '';
    const body_typeErrorMsg = document.querySelector('#body_typeErrorMsg');
    buttonClickHandler('bodyType', 'bodyTypeCheck', 'bodyTypeProgress', function(value) {
        bodyTypeButtonValue = value;
    });

    // 얼굴상 선택 확인
    const face_typeInput_container = document.querySelector('#face_typeInput_container');
    let faceTypeButtonValue = '';
    const face_typeErrorMsg = document.querySelector('#face_typeErrorMsg');
    buttonClickHandler('faceType', 'faceTypeCheck', 'faceTypeProgress', function(value) {
        faceTypeButtonValue = value;
    });

    // 입술 선택 확인
    const lips_typeInput_container = document.querySelector('#lips_typeInput_container');
    let lipsButtonValue = '';
    const lips_typeErrorMsg = document.querySelector('#lips_typeErrorMsg');
    buttonClickHandler('lips', 'lipsCheck', 'lipsProgress', function(value) {
        lipsButtonValue = value;
    });

    // 성격 버튼 제어(클릭 했을 경우, 중복선택 3개)
    const personalityBtns = document.querySelectorAll('#personalityBtn');
    const personalityInput_container = document.querySelector('#personalityInput_container');
    const personalityErrorMsg = document.querySelector('#personalityErrorMsg');
    let selectedPersonalityCount = 0;
    const selectedPersonalityTexts = []; // 선택된 버튼들의 텍스트를 저장할 배열


    personalityBtns.forEach(button => {
        button.addEventListener('click', function() {

            if (this.classList.contains('selected')) {
                // 이미 선택된 버튼을 다시 클릭한 경우 선택 취소
                this.classList.remove('selected');
                selectedPersonalityCount--;

                // 배열에서 선택된 텍스트 제거
                const buttonName = this.textContent;
                const index = selectedPersonalityTexts.indexOf(buttonName);
                if (index !== -1) {
                    selectedPersonalityTexts.splice(index, 1);
                }

                if(selectedPersonalityCount === 0) {
        
                    personalityErrorMsg.style.display = "block";
                    personalityErrorMsg.innerHTML = "필수 입력 사항입니다.";
                    personalityErrorMsg.style.color = 'red';
                    personalityInput_container.style.border = `1px solid ${pointColor}`;
        
                    checkVariables.personalityCheck = 'no'
                    progressVariables.personalityProgress = 0;
                    progressBarUpdate();
                }

            } else if(selectedPersonalityCount < 3) {
                const buttonName = this.textContent;
                this.classList.add('selected');
                selectedPersonalityCount++;

                // 배열에 선택된 텍스트 추가
                selectedPersonalityTexts.push(buttonName);

                checkVariables.personalityCheck = 'yes'
                progressVariables.personalityProgress = progressAmount;
                progressBarUpdate();

                personalityErrorMsg.style.display = "none";
                personalityInput_container.style.border = `1px solid ${frequencyColor}`;

                // console.log(`selectedPersonalityTexts:${selectedPersonalityTexts}`);
            }

        });
    });

    // 음주 선택 확인
    const drinking_habitsInput_container = document.querySelector('#drinking_habitsInput_container');
    let drinkingButtonValue = '';
    const drinking_habitsErrorMsg = document.querySelector('#drinking_habitsErrorMsg');
    buttonClickHandler('drinking', 'drinkingCheck', 'drinkingProgress', function(value) {
        drinkingButtonValue = value;
    });


    // 흡연 선택 확인
    const smoking_habitsInput_container = document.querySelector('#smoking_habitsInput_container');
    let smokingButtonValue = '';
    const smoking_habitsErrorMsg = document.querySelector('#smoking_habitsErrorMsg');
    buttonClickHandler('smoking', 'smokingCheck', 'smokingProgress', function(value) {
        smokingButtonValue = value;
    });


    // 종교 선택 확인
    const religionInput_container = document.querySelector('#religionInput_container');
    let religionButtonValue = '';
    const religionErrorMsg = document.querySelector('#religionErrorMsg');
    buttonClickHandler('religion', 'religionCheck', 'religionProgress', function(value) {
        religionButtonValue = value;
    });

    // 나이 선호 선택 확인
    const agePreferenceInput_container = document.querySelector('#agePreferenceInput_container');
    let agePreferenceButtonValue = '';
    const agePreferenceErrorMsg = document.querySelector('#agePreferenceErrorMsg');
    buttonClickHandler('agePreference', 'agePreferenceCheck', 'agePreferenceProgress', function(value) {
        agePreferenceButtonValue = value;
    });

    // 친구관계 선택 확인
    const relationshipInput_container = document.querySelector('#relationshipInput_container');
    let relationshipButtonValue = '';
    const relationshipErrorMsg = document.querySelector('#relationshipErrorMsg'); 
    buttonClickHandler('relationship', 'relationshipCheck', 'relationshipProgress', function(value) {
        relationshipButtonValue = value;
    });

    // 장거리 선택 확인
    const distanceInput_container = document.querySelector('#distanceInput_container');
    let distanceButtonValue = '';
    const distanceErrorMsg = document.querySelector('#distanceErrorMsg'); 
    buttonClickHandler('distance', 'distanceCheck', 'distanceProgress', function(value) {
        distanceButtonValue = value;
    });

    // 애완동물 선택 확인
    const petInput_container = document.querySelector('#petInput_container');
    let petButtonValue = '';
    const petErrorMsg = document.querySelector('#petErrorMsg'); 
    buttonClickHandler('pet', 'petCheck', 'petProgress', function(value) {
        petButtonValue = value;
    });

    // 취미 버튼 제어(클릭 했을 경우, 중복선택 5개)
    const hobbyBtns = document.querySelectorAll('#hobbyBtn');
    const hobbyInput_container = document.querySelector('#hobbyInput_container');
    const hobbyErrorMsg = document.querySelector('#hobbyErrorMsg');
    let selectedHobbyCount = 0;
    const selectedHobbyTexts = []; // 선택된 버튼들의 텍스트를 저장할 배열

    hobbyBtns.forEach(button => {
        button.addEventListener('click', function() {

            if (this.classList.contains('selected')) {
                // 이미 선택된 버튼을 다시 클릭한 경우 선택 취소
                this.classList.remove('selected');
                selectedHobbyCount--;

                // 배열에서 선택된 텍스트 제거
                const buttonName = this.textContent;
                const index = selectedHobbyTexts.indexOf(buttonName);
                if (index !== -1) {
                    selectedHobbyTexts.splice(index, 1);
                }

                if(selectedHobbyCount === 0) {
                    // console.log(`select!`);
        
                    hobbyErrorMsg.style.display = "block";
                    hobbyErrorMsg.innerHTML = "필수 입력 사항입니다.";
                    hobbyErrorMsg.style.color = 'red';
                    hobbyInput_container.style.border = `1px solid ${pointColor}`;
        
                    checkVariables.hobbyCheck = 'no';
                    progressVariables.hobbyProgress = 0;
                    progressBarUpdate();
                }

            } else if(selectedHobbyCount < 6) {
                // console.log(`here!`);
                const buttonName = this.textContent;
                this.classList.add('selected');
                selectedHobbyCount++;

                // 배열에 선택된 텍스트 추가
                selectedHobbyTexts.push(buttonName);

                checkVariables.hobbyCheck = 'no';
                progressVariables.hobbyProgress = 0;
                progressBarUpdate();

                checkVariables.hobbyCheck = 'yes';
                progressVariables.hobbyProgress = progressAmount;
                progressBarUpdate();

                hobbyErrorMsg.style.display = "none";
                hobbyInput_container.style.border = `1px solid ${frequencyColor}`;

                // console.log(`selectedHobbyTexts:${selectedHobbyTexts}`);
            } 

            // console.log(`selectedHobbyCount:${selectedHobbyCount}`);
        });
    });


    // 사진 선택 버튼 제어
    const pictureBtns = [
        document.querySelector('#pictureBtn_1'),
        document.querySelector('#pictureBtn_2'),
        document.querySelector('#pictureBtn_3')
    ];

    const pictureInputs = [
        document.querySelector('#picture_1_input'),
        document.querySelector('#picture_2_input'),
        document.querySelector('#picture_3_input')
    ];

    const pictureImgs = [
        document.querySelector('#picture_1_img'),
        document.querySelector('#picture_2_img'),
        document.querySelector('#picture_3_img')
    ];

    const resizedpictureImgs = [];

    const plusIcons = [
        document.querySelector('#pictureBtn_1_i'),
        document.querySelector('#pictureBtn_2_i'),
        document.querySelector('#pictureBtn_3_i')
    ];

    const pictureErrorMsg = document.querySelector('#pictureErrorMsg');

    let uploadedPictures = [false, false, false]; // 사진 업로드 상태를 추적하는 배열

    function resizeImage(src, width, height, callback) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 이미지의 원본 가로 폭과 높이
            const originalWidth = img.width;
            const originalHeight = img.height;

            // 1:1 비율로 자르기 위한 가로와 세로 크기 결정
            let cropWidth, cropHeight;
            if (originalWidth > originalHeight) {
                cropWidth = originalHeight;
                cropHeight = originalHeight;
            } else {
                cropWidth = originalWidth;
                cropHeight = originalWidth;
            }

            // 이미지 중앙에서 자르기
            const offsetX = (originalWidth - cropWidth) / 2;
            const offsetY = (originalHeight - cropHeight) / 2;

            // 캔버스 크기 설정
            canvas.width = width;
            canvas.height = height;

            // 이미지 자르기
            ctx.drawImage(img, offsetX, offsetY, cropWidth, cropHeight, 0, 0, width, height);

            // Blob 객체 생성
            canvas.toBlob((blob) => {
                callback(blob); // 리사이즈된 이미지를 콜백 함수로 전달
            }, 'image/jpeg'); // 이미지 포맷을 JPEG로 변경
        };
    }

    for (let i = 0; i < pictureBtns.length; i++) {
        pictureBtns[i].addEventListener('click', () => {
            pictureInputs[i].click();
        });

        pictureInputs[i].addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const maxPictureFileSizeInBytes = 5 * 1024 * 1024; // 5MB 용량 제한

                if (file.size > maxPictureFileSizeInBytes) {
                    // 파일 크기가 용량 제한을 초과할 경우 처리
                    alert('파일 용량이 5MB를 초과합니다.');
                    event.target.value = ''; // 파일 선택 취소
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const originalImgSrc = e.target.result;

                    resizeImage(originalImgSrc, 400, 400, (resizedBlob) => {
                        // Blob 객체를 파일로 저장
                        const uniqueId = Date.now(); // 현재 시간을 기반으로 고유한 ID 생성
                        const fileName = `resized_image_${i}_${uniqueId}.jpg`;
                        const resizedFile = new File([resizedBlob], fileName);
                        // 이제 resizedFile을 사용하여 이미지를 파일로 저장할 수 있습니다.
                        // console.log('resizedFile:',resizedFile);
                        resizedpictureImgs[i] = resizedFile;
                        // 이미지를 파일로 저장한 후 추가 작업 수행
                        pictureImgs[i].src = URL.createObjectURL(resizedFile); // 이미지를 표시
                        pictureImgs[i].style.display = 'block';
                        plusIcons[i].style.display = 'none';
                        uploadedPictures[i] = true; // 사진 업로드 완료 상태로 변경
                        checkAllPicturesUploaded(); // 모든 사진이 업로드되었는지 체크
                    });               
                };
                reader.readAsDataURL(file);
            }
        });
    }


    function checkAllPicturesUploaded() {
        const allUploaded = uploadedPictures.every(status => status === true);
        if (allUploaded) {
            console.log('모든 사진이 업로드되었습니다.');

            // 여기에서 필요한 로직 수행
            pictureErrorMsg.style.display = "none";
            checkVariables.pictureCheck = 'yes';
            progressVariables.pictureProgress = progressAmount;
            progressBarUpdate();

        } else {
            console.log('사진 업로드가 완료되지 않았습니다.');

            pictureErrorMsg.style.display = "block";
            pictureErrorMsg.innerHTML = "사진은 3장 모두 업로드가 되어야 합니다";
            pictureErrorMsg.style.color = 'red';

            checkVariables.pictureCheck = 'no';
            progressVariables.pictureProgress = 0;
            progressBarUpdate();
        }
    }

    // 연봉 입력 제어
    const SalaryInput = document.querySelector('#SalaryInput');
    const SalaryInput_container = document.querySelector('#SalaryInput_container');
    const SalaryErrorMsg = document.querySelector('#SalaryErrorMsg');

    SalaryInput.addEventListener('input', (event) => {
        const inputValue = event.target.value.replace(/[^\d]/g, ''); // 숫자 이외의 문자 제거
        const formattedValue = addCurrencySuffix(inputValue);
        SalaryInput.value = formattedValue;

        // 입력 값이 없을 경우
        if(inputValue == "") {
            checkVariables.salaryCheck = 'no';
            progressVariables.salaryProgress = 0;
            progressBarUpdate();

            SalaryErrorMsg.style.display = 'block';
            SalaryErrorMsg.innerHTML = "연봉을 입력해주세요.";
            SalaryErrorMsg.style.color = "red";
            SalaryInput_container.style.border = `1px solid ${pointColor}`;
        } else {
            
            checkVariables.salaryCheck = 'yes';
            progressVariables.salaryProgress = progressAmount;
            SalaryErrorMsg.style.display = 'none';
            SalaryInput_container.style.border = `1px solid ${frequencyColor}`;
            progressBarUpdate();
        }
    });
    
    function addCurrencySuffix(value) {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
        const formattedValue = numericValue.toLocaleString('en-US'); // 숫자에 천 단위 콤마 추가
        return formattedValue + ' 만원';
    }
    return value; // 숫자가 아닌 경우 그대로 반환
    }

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    // const firebaseConfig = {
    // apiKey: "AIzaSyAqJCcAfMTe8yvjW1PYkyVxf_uFG-1QxwI",
    // authDomain: "phonecertification.firebaseapp.com",
    // projectId: "phonecertification",
    // storageBucket: "phonecertification.appspot.com",
    // messagingSenderId: "112808255787",
    // appId: "1:112808255787:web:acb5528065ed5aa92ba56e",
    // measurementId: "G-3KFQ8092MS"
    // };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    const auth = getAuth();
    auth.languageCode = 'ko';

    const phoneInput = document.querySelector('#phone'); // 휴대폰 번호
    const phoneInput_container = document.querySelector('#phoneInput_container');
    const phonecertificationSendBtn = document.querySelector('#certificationSendBtn'); // 인증 보내기 버튼
    const phoneCertificationNumber = document.querySelector('#phoneCertificationNumber'); // 인증 번호
    const phoneCertificationSubmitBtn = document.querySelector('#phoneCertificationSubmitBtn'); // 인증 확인 버튼
    const phoneCertification_container = document.querySelector('#phoneCertification_container');
    const phoneErrorMsg = document.querySelector('#phoneErrorMsg');
    const phoneCertificationInput_container = document.querySelector('#phoneCertificationInput_container');
    const phoneMaxInputLength = 11; // 최대 입력 길이


    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'certificationSendBtn', {
    'size': 'invisible',
    'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        onSignInSubmit();
    }
    });

    // 폰 번호 입력 제어
    phoneInput.addEventListener('input', function(event) {

        // checkVariables.phoneCheck = 'no';
        // checkVariables.phoneCheck = 'yes'; // 임시로 열어둠
        progressVariables.phoneProgress = 0;
        progressBarUpdate();

        const inputText = event.target.value;

        // 입력값에서 하이픈 제거
        const filteredText = inputText.replace(/-/g, '');
    
        // 숫자 이외의 문자 제거
        const numericText = filteredText.replace(/[^\d]/g, '');

        // 형식에 맞게 변환하여 입력 필드에 설정
        if (numericText.length <= phoneMaxInputLength) {
            const formattedText = numericText.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
            phoneInput.value = formattedText;
            phoneErrorMsg.style.display = 'none';
        } else {
            // 입력 제한된 길이를 초과하면 입력 불가
            phoneInput.value = phoneInput.value.slice(0, phoneMaxInputLength);
        }

    });


    // 폰 인증번호 전송 버튼 클릭 시
    phonecertificationSendBtn.addEventListener('click', (event) => {

        checkVariables.phoneCheck = 'no';
        progressVariables.phoneProgress = 0;
        progressBarUpdate();

        event.preventDefault();

        if(phoneInput.value === "") {

            phoneErrorMsg.style.display = 'block';
            phoneErrorMsg.innerHTML = "연락처를 입력해주세요.";
            phoneErrorMsg.style.color = "red";
            phoneInput_container.style.border = `1px solid ${pointColor}`;

        } else {

            // 이미 가입되어 있는 휴대폰 번호인지 확인
            fetch(`/singupCheckProC`, {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: phoneInput.value,
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('data:',data);

                if(data['result'] ==='EXIST') {
                    phoneErrorMsg.style.display = 'block';
                    phoneErrorMsg.innerHTML = "이미 가입된 번호입니다. 다른 번호를 사용해주세요.";
                    phoneErrorMsg.style.color = "red";
                } else {
                    phoneCertification_container.style.display = 'block';
                    phoneCertification_container.style.display = 'flex';

                    phonecertificationSendBtn.textContent = '재전송';
            
                    phoneErrorMsg.style.display = 'block';
                    phoneErrorMsg.innerHTML = "인증번호가 오지 않는다면 연락처를 다시 확인해주세요.";
                    phoneErrorMsg.style.color = "blue";
                    phoneInput_container.style.border = `1px solid ${frequencyColor}`;
            
                    const phoneValue = phoneInput.value.replace(/-/g, '');
            
                    console.log(`phoneValue:${phoneValue}`);
                
                    const phoneNumber = '+82'+ phoneValue; //휴대폰 번호 넣어주기
                    const appVerifier = window.recaptchaVerifier;
                
                    try {
                        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
                        .then((confirmationResult) => {
                            // SMS sent. Prompt user to type the code from the message, then sign the
                            // user in with confirmationResult.confirm(code).
                            window.confirmationResult = confirmationResult;
                
                        }).catch((error) => {
                            // Error; SMS not sent
                            console.log(`error : ${error}`);
                        });
                    } catch (error) {
                        console.error('Error caught in try-catch block:', error);
                    }
                }
            })
            .catch(error => {
                console.log(`회원 정보 불러오기 Error : ${error}`);
            });
        }
    });


    // 인증 확인 버튼을 눌렀을 경우
    phoneCertificationSubmitBtn.addEventListener('click', (event)=> {

        console.log("인증확인 버튼 클릭!");

        event.preventDefault();

        const code = phoneCertificationNumber.value;
        confirmationResult.confirm(code).then((result) => {
        // User signed in successfully.
        const user = result.user;
        console.log(result);

        phoneErrorMsg.style.display = 'block';
        phoneErrorMsg.innerHTML = '인증이 완료되었습니다.';
        phoneErrorMsg.style.color = 'blue';

        phoneCertificationInput_container.style.border = `1px solid ${frequencyColor}`;
        checkVariables.phoneCheck = 'yes';
        progressVariables.phoneProgress = progressAmount;
        progressBarUpdate();

        }).catch((error) => {
        // User couldn't sign in (bad verification code?)
        console.log(error);
        phoneErrorMsg.style.display = 'block';
        phoneErrorMsg.innerHTML = '인증 번호를 확인해주세요';
        phoneErrorMsg.style.color = 'red';
        phoneCertificationInput_container.style.border = `1px solid ${pointColor}`;
        phoneCheck = 'no';
        });
    });


    const buttonStates = [
        { text: '' }, // contactTermsBtns
        { text: '' }, // statusReportBtns
        { text: '' }, // datingCostBtns
        { text: '' }, // hobbyPreferenceBtns
        { text: '' }, // datingStylesBtns
        { text: '' }, // mannerBtns
        { text: '' }, // datingTermBtns
        { text: '' }, // anniversaryBtns
        { text: '' }, // contactPreferenceBtns
        { text: '' }  // comfortStyleBtns
    ];

    const datingsStyleErrorMsg = document.querySelector('#datingsStyleErrorMsg');

    function datingstyleAddButtonClickListener(buttons, state) {
        buttons.forEach((button, index) => {
            button.addEventListener('click', function() {
                // 모든 버튼의 색깔 초기화
                buttons.forEach(btn => {
                    btn.classList.remove('selected');
                });

                // 선택된 버튼의 스타일 변경
                this.classList.add('selected');
                state.text = this.textContent;
                // console.log(state.text);
                // console.log('buttonStates:',buttonStates);

                // 모든 버튼이 선택되었는지 확인
                const allSelected = buttonStates.every(buttonState => buttonState.text !== '');
                // console.log('allSelected:',allSelected);
                if (allSelected) {
                    console.log('모든 버튼이 선택되었습니다.');
                    // 여기에서 필요한 로직 수행
                    checkVariables.datingsytleCheck = 'yes'
                    progressVariables.datingstyleProgress = progressAmount;
                    progressBarUpdate();

                    datingsStyleErrorMsg.style.display = 'none';
                    
                } else {
                    console.log('모든 버튼이 선택되지 않았습니다.');
                    checkVariables.datingsytleCheck = 'no'
                    progressVariables.datingstyleProgress = 0;
                    progressBarUpdate();
                }
            });
        });
    }

    // 각 버튼에 대해 상태 객체를 전달하면서 클릭 리스너 등록
    const contactTermsBtns = document.querySelectorAll('#contactTermsBtn');
    datingstyleAddButtonClickListener(contactTermsBtns, buttonStates[0]);

    const statusReportBtns = document.querySelectorAll('#statusReportBtn');
    datingstyleAddButtonClickListener(statusReportBtns, buttonStates[1]);

    const datingCostBtns = document.querySelectorAll('#datingCostBtn');
    datingstyleAddButtonClickListener(datingCostBtns, buttonStates[2]);

    const hobbyPreferenceBtns = document.querySelectorAll('#hobbyPreferenceBtn');
    datingstyleAddButtonClickListener(hobbyPreferenceBtns, buttonStates[3]);

    const datingStylesBtns = document.querySelectorAll('#datingStylesBtn');
    datingstyleAddButtonClickListener(datingStylesBtns, buttonStates[4]);

    const mannerBtns = document.querySelectorAll('#mannerBtn');
    datingstyleAddButtonClickListener(mannerBtns, buttonStates[5]);

    const datingTermBtns = document.querySelectorAll('#datingTermBtn');
    datingstyleAddButtonClickListener(datingTermBtns, buttonStates[6]);

    const anniversaryBtns = document.querySelectorAll('#anniversaryBtn');
    datingstyleAddButtonClickListener(anniversaryBtns, buttonStates[7]);

    const contactPreferenceBtns = document.querySelectorAll('#contactPreferenceBtn');
    datingstyleAddButtonClickListener(contactPreferenceBtns, buttonStates[8]);

    const comfortStyleBtns = document.querySelectorAll('#comfortStyleBtn');
    datingstyleAddButtonClickListener(comfortStyleBtns, buttonStates[9]);


    // 나의 연인에게 글자수 제어
    const letterInput = document.getElementById('letterInput');
    const letterNOC = document.getElementById('letterNOC');
    const letterInput_container = document.querySelector('#letterInput_container');
    const letterErrorMsg = document.querySelector('#letterErrorMsg');
    const LETTER_MAX_NAME_LENGTH = 200; 

    letterInput.addEventListener('input', function(event) {
        const inputValue = event.target.value;

        // 입력 값이 없을 경우
        if(inputValue == "") {
            checkVariables.letterCheck = 'no';
            progressVariables.letterProgress = 0;
            progressBarUpdate();

            letterErrorMsg.style.display = 'block';
            letterErrorMsg.innerHTML = "필수 입력 사항입니다.";
            letterErrorMsg.style.color = "red";
            letterInput_container.style.border = `1px solid ${pointColor}`;
        } else {
            checkVariables.letterCheck = 'yes';
            progressVariables.letterProgress = progressAmount;
            letterErrorMsg.style.display = 'none';
            letterInput_container.style.border = `1px solid ${frequencyColor}`;
            progressBarUpdate();
        }

        if (inputValue.length <= LETTER_MAX_NAME_LENGTH) {
            // nickNameInput.value = sanitizedValue; // 띄어쓰기가 제거된 값을 입력란에 설정
            letterNOC.textContent = `${inputValue.length}/${LETTER_MAX_NAME_LENGTH}`;
        } else {
            letterInput.value = inputValue.slice(0, LETTER_MAX_NAME_LENGTH); // 최대 길이 초과 시 문자열 자르기
            letterNOC.textContent = `${LETTER_MAX_NAME_LENGTH}/${LETTER_MAX_NAME_LENGTH}`;
        }
    });

    // 회원가입 완료 버튼 클릭 시
    const signUpConfirmBtn = document.querySelector('#signUpConfirmBtn');
    signUpConfirmBtn.disabled = true;
    const signUpCancelBtn = document.querySelector('#signUpCancelBtn');

    // 회원가입 시 동의하기 제어하기
    let agreeChecks = {
        termsCheck: false,
        privacyCheck: false,
        marketingCheck : false
    }

    const totalBtn = document.getElementById('totalBtn');
    const termsofuseBtn = document.getElementById('termsofuseBtn');
    const privacyBtn = document.getElementById('privacyBtn');
    const marketingBtn = document.getElementById('marketingBtn');

    const toggleCheck = (btn, checkRecog, checks) => {

        if(checkRecog === 'total') {
            const isChecked = btn.style.color === 'rgb(219, 124, 141)'; // 현재 상태 확인

            const allBtns = document.querySelectorAll('.agreementContent_container i');

            if (isChecked) {
                allBtns.forEach((btn) => {
                    btn.classList.remove('fa-solid');
                    btn.classList.add('fa-regular');
                    btn.style.color = '#d9d9d9'; // 체크 해제
                })
                for (let key in agreeChecks) {
                    agreeChecks[key] = false;
                }

                signUpConfirmBtn.disabled = true;

            } else {
                allBtns.forEach((btn) => {
                    btn.classList.remove('fa-regular');
                    btn.classList.add('fa-solid');
                    btn.style.color = '#db7c8d'; // 체크
                });
                for (let key in agreeChecks) {
                    agreeChecks[key] = true;
                }

                signUpConfirmBtn.disabled = false;
            }
        } else {
            const isChecked = btn.style.color === 'rgb(219, 124, 141)'; // 현재 상태 확인
            const totalBtn = document.getElementById('totalBtn');

            if (isChecked) {
                btn.classList.remove('fa-solid');
                btn.classList.add('fa-regular');
                btn.style.color = '#d9d9d9'; // 체크 해제
                checks[checkRecog] = false;

                totalBtn.classList.remove('fa-solid');
                totalBtn.classList.add('fa-regular');
                totalBtn.style.color = '#d9d9d9'; // 체크 해제
                signUpConfirmBtn.disabled = true;

                if(checks['termsCheck'] === true & checks['privacyCheck'] === true) {
                    signUpConfirmBtn.disabled = false;
                }

            } else {
                btn.classList.remove('fa-regular');
                btn.classList.add('fa-solid');
                btn.style.color = '#db7c8d'; // 체크
                checks[checkRecog] = true;

                if(checks['termsCheck'] === true & checks['privacyCheck'] === true) {
                    signUpConfirmBtn.disabled = false;
                }
                
                // 모두 선택되었다면 전체 동의하기 버튼 클릭으로 변경
                for (let key in agreeChecks) {
                    if (agreeChecks[key] === false) {
                        // 하나라도 선택되지 않은 것이 있다면 함수 종료
                        return;
                    }
                }
                
                // 모든 체크가 선택되었을 때 전체 동의하기 버튼을 클릭 상태로 변경
                totalBtn.classList.remove('fa-regular');
                totalBtn.classList.add('fa-solid');
                totalBtn.style.color = '#db7c8d';
                signUpConfirmBtn.disabled = false;

            }
        }


        // console.log('checks:',checks);
    };

    // 진체 동의하기 클릭 시
    const totalBtn_container = document.querySelector('.totalBtn_container');
    totalBtn_container.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('전체 동의하기 클릭');
        const checkRecog = 'total';
        toggleCheck(totalBtn, checkRecog, agreeChecks);

    });

    const termsofuseBtn_container = document.querySelector('#termsofuseBtn_container');
    termsofuseBtn_container.addEventListener('click', () => {
        const checkRecog = 'termsCheck';
        toggleCheck(termsofuseBtn, checkRecog, agreeChecks);
    });

    const privacyBtn_container = document.querySelector('#privacyBtn_container');
    privacyBtn_container.addEventListener('click', () => {
        const checkRecog = 'privacyCheck';
        toggleCheck(privacyBtn, checkRecog, agreeChecks);
    });

    const marketingBtn_container = document.querySelector('#marketingBtn_container');
    marketingBtn_container.addEventListener('click', () => {
        const checkRecog = 'marketingCheck';
        toggleCheck(marketingBtn, checkRecog, agreeChecks);
    });

    // const fileInput = document.querySelector('.fileInput');
    // const fileMsg = document.querySelector('.fileMsg');

    // 회원가입 '완료' 버튼 클릭 시
    signUpConfirmBtn.addEventListener('click', (event)=> {

        // 서버에 id정보 전달
        const idValue = id.value;
        const pwValue = pw.value;
        const nameValue = document.querySelector('#nameInput').value;
        const genderValue = genderButtonValue;
        const nicknameValue = document.querySelector('#nickNameInput').value;
        const ageValue = parseInt(document.querySelector('#ageInput').value);
        const heightValue = parseInt(document.querySelector('#heightInput').value);
        const regionCityValue = cityValue;
        const regionGuValue = guValue;
        const occupationValue = occupationButtonValue;
        const occupationDetailValue = document.querySelector('#occupationDetailInput').value;
        const occupationFileValue = occupationSelectedFile;
        const mbtiValue = mbtiButtonValue;
        const styleValue = selectedStyleTexts.join(", ");
        const eyeTypeValue = eyeTypeButtonValue;
        const bodyTypeValue = bodyTypeButtonValue;
        const faceTypeValue = faceTypeButtonValue;
        const lipsValue = lipsButtonValue;
        const personalityValue = selectedPersonalityTexts.join(", ");
        const drinkingValue = drinkingButtonValue;
        const smokingValue = smokingButtonValue;
        const religionValue = religionButtonValue;
        const agePreferenceValue = agePreferenceButtonValue;
        const relationshipValue = relationshipButtonValue;
        const distanceValue = distanceButtonValue;
        const petValue = petButtonValue;
        const hobbyValue = selectedHobbyTexts.join(", ");
        const picture_1Value = resizedpictureImgs[0];
        const picture_2Value = resizedpictureImgs[1];
        const picture_3Value = resizedpictureImgs[2];
        const salaryValue = parseInt(document.querySelector('#SalaryInput').value.replace('만', '').replace(/,/g, ''), 10);
        const phoneValue = phone.value;
        const contactTermsValue = buttonStates[0].text;
        const statusReportValue = buttonStates[1].text;
        const datingCostValue = buttonStates[2].text;
        const hobbyPreferenceValue = buttonStates[3].text;
        const datingStylesValue = buttonStates[4].text;
        const mannerValue = buttonStates[5].text;
        const datingTermValue = buttonStates[6].text;
        const anniversaryValue = buttonStates[7].text;
        const contactPreferenceValue = buttonStates[8].text;
        const comfortStyleValue = buttonStates[9].text;
        const letterInput = document.querySelector('#letterInput').value;
        const letterValue = letterInput.replace(/\n/g, '<br>'); // 줄바꿈도 적용
        const termsOfUseAgreement = agreeChecks['termsCheck'];
        const privacyPolicyAgreement = agreeChecks['privacyCheck'];
        const marketingAgreement = agreeChecks['marketingCheck'];

        // console.log("idValue:", idValue);
        // console.log("pwValue:", pwValue);
        // console.log("nameValue:", nameValue);
        // console.log("genderValue:", genderValue);
        // console.log("nicknameValue:", nicknameValue);
        // console.log("ageValue:", ageValue);
        // console.log("heightValue:", heightValue);
        // console.log("regionCityValue:", regionCityValue);
        // console.log("regionGuValue:", regionGuValue);
        // console.log("occupationValue:", occupationValue);
        // console.log("occupationDetailValue:", occupationDetailValue);
        // console.log("occupationFile", occupationFileValue);
        // console.log("mbtiValue:", mbtiValue);
        // console.log("styleValue:", styleValue);
        // console.log("eyeTypeValue:", eyeTypeValue);
        // console.log("bodyTypeValue:", bodyTypeValue);
        // console.log("faceTypeValue:", faceTypeValue);
        // console.log("lipsValue:", lipsValue);
        // console.log("personalityValue:", personalityValue);
        // console.log("drinkingValue:", drinkingValue);
        // console.log("smokingValue:", smokingValue);
        // console.log("religionValue", religionValue);
        // console.log("agePreferenceValue:", agePreferenceValue);
        // console.log("relationshipValue:", relationshipValue);
        // console.log("distanceValue:", distanceValue);
        // console.log("petValue:", petValue);
        // console.log("hobbyValue:", hobbyValue);
        // console.log("picture_1Value:", picture_1Value);
        // console.log("picture_2Value:", picture_2Value);
        // console.log("picture_3Value:", picture_3Value);
        // console.log("salaryValue:", salaryValue);
        // console.log("phoneValue:", phoneValue);
        // console.log("contactTermsValue:", contactTermsValue);
        // console.log("statusReportValue:", statusReportValue);
        // console.log("datingCostValue:", datingCostValue);
        // console.log("hobbyPreferenceValue:", hobbyPreferenceValue);
        // console.log("datingStylesValue:", datingStylesValue);
        // console.log("mannerValue:", mannerValue);
        // console.log("datingTermValue:", datingTermValue);
        // console.log("anniversaryValue:", anniversaryValue);
        // console.log("contactPreferenceValue:", contactPreferenceValue);
        // console.log("comfortStyleValue:", comfortStyleValue);
        // console.log("letterValue:", letterValue);
        // console.log("termsOfUseAgreement:", termsOfUseAgreement);
        // console.log("privacyPolicyAgreement:", privacyPolicyAgreement);
        // console.log("marketingAgreement:", marketingAgreement);



        // 입력 폼 Check 확인하기
        let allYes = true; // 모든 변수가 'yes'인지를 나타내는 플래그
        const targetHeight = 250; // 추가 여백으로 설정할 높이 (픽셀)

        console.log(`checkVariables.genderCheck:${checkVariables.genderCheck}`);

        for (const key in checkVariables) {
            if (Object.hasOwnProperty.call(checkVariables, key)) {
                const value = checkVariables[key];
                // console.log(`key : ${key}`);
                if (value !== 'yes') {
                    console.log(`${key} is set to 'no'`);

                    if(key === 'idCheck') {
                        idErrorMsg.style.display = "block";
                        idErrorMsg.innerHTML = "아이디를 확인해주세요.";
                        idErrorMsg.style.color='red';
                        idInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: idInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'pwCheck') {
                        pwErrorMsg.style.display = 'block';
                        pwErrorMsg.innerHTML = "비밀번호를 확인해주세요.";
                        pwErrorMsg.style.color = "red";
                        pw2Input_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: pw2Input_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'genderCheck') {
                        genderErrorMsg.style.display = 'block';
                        genderErrorMsg.innerHTML = "성별을 확인해주세요.";
                        genderErrorMsg.style.color = "red";
                        genderInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: genderInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'nameCheck') {
                        nameErrorMsg.style.display = 'block';
                        nameErrorMsg.innerHTML = "이름을 확인해주세요.";
                        nameErrorMsg.style.color = "red";
                        nameInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: nameInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'nicknameCheck') {
                        nickNameErrorMsg.style.display = "block";
                        nickNameErrorMsg.innerHTML = "닉네임을 확인해주세요.";
                        nickNameErrorMsg.style.color = 'red';
                        nickNameInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: nickNameInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'ageCheck') {
                        ageErrorMsg.style.display = 'block';
                        ageErrorMsg.innerHTML = "나이를 입력해주세요.";
                        ageErrorMsg.style.color = "red";
                        ageInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: ageInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'heightCheck') {
                        heightErrorMsg.style.display = "block";
                        heightErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        heightErrorMsg.style.color = 'red';
                        heightInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: heightInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'regionCheck') {
                        regionErrorMsg.style.display = 'block';
                        regionErrorMsg.innerHTML = "지역을 확인해주세요.";
                        regionErrorMsg.style.color = "red";
                        regionInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: regionInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'occupationCheck') {
                        occupationErrorMsg.style.display = "block";
                        occupationErrorMsg.innerHTML = "직업(재직증명서 업로드 등)을 확인해주세요.";
                        occupationErrorMsg.style.color = 'red';
                        occupationInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: occupationInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'mbtiCheck') {
                        mbtiErrorMsg.style.display = "block";
                        mbtiErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        mbtiErrorMsg.style.color = 'red';
                        mbtiInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: mbtiInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'styleCheck') {
                        styleErrorMsg.style.display = "block";
                        styleErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        styleErrorMsg.style.color = 'red';
                        styleInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: styleInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'eyeTypeCheck') {
                        eyesTypeErrorMsg.style.display = "block";
                        eyesTypeErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        eyesTypeErrorMsg.style.color = 'red';
                        eyesTypeInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: eyesTypeInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'bodyTypeCheck') {
                        body_typeErrorMsg.style.display = "block";
                        body_typeErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        body_typeErrorMsg.style.color = 'red';
                        body_typeInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: body_typeInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'faceTypeCheck') {
                        face_typeErrorMsg.style.display = "block";
                        face_typeErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        face_typeErrorMsg.style.color = 'red';
                        face_typeInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: face_typeInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'lipsCheck') {
                        lips_typeErrorMsg.style.display = "block";
                        lips_typeErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        lips_typeErrorMsg.style.color = 'red';
                        lips_typeInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: lips_typeInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'personalityCheck') {
                        personalityErrorMsg.style.display = "block";
                        personalityErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        personalityErrorMsg.style.color = 'red';
                        personalityInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: personalityInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'drinkingCheck') {
                        drinking_habitsErrorMsg.style.display = "block";
                        drinking_habitsErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        drinking_habitsErrorMsg.style.color = 'red';
                        drinking_habitsInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: drinking_habitsInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'smokingCheck') {
                        smoking_habitsErrorMsg.style.display = "block";
                        smoking_habitsErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        smoking_habitsErrorMsg.style.color = 'red';
                        smoking_habitsInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: smoking_habitsInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'religionCheck') {
                        religionErrorMsg.style.display = "block";
                        religionErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        religionErrorMsg.style.color = 'red';
                        religionInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: religionInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'agePreferenceCheck') {
                        agePreferenceErrorMsg.style.display = "block";
                        agePreferenceErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        agePreferenceErrorMsg.style.color = 'red';
                        agePreferenceInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: agePreferenceInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'relationshipCheck') {
                        relationshipErrorMsg.style.display = "block";
                        relationshipErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        relationshipErrorMsg.style.color = 'red';
                        relationshipInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: relationshipInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'distanceCheck') {
                        distanceErrorMsg.style.display = "block";
                        distanceErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        distanceErrorMsg.style.color = 'red';
                        distanceInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: distanceInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'petCheck') {
                        petErrorMsg.style.display = "block";
                        petErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        petErrorMsg.style.color = 'red';
                        petInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: petInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'hobbyCheck') {
                        hobbyErrorMsg.style.display = "block";
                        hobbyErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        hobbyErrorMsg.style.color = 'red';
                        hobbyInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: hobbyInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'pictureCheck') {
                        pictureErrorMsg.style.display = "block";
                        pictureErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        pictureErrorMsg.style.color = 'red';
                        const picture_container = document.querySelector('.picture_container');
                        window.scrollTo({
                            top: picture_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'salaryCheck') {
                        SalaryErrorMsg.style.display = 'block';
                        SalaryErrorMsg.innerHTML = "연봉을 확인해주세요.";
                        SalaryErrorMsg.style.color = "red";
                        SalaryInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: SalaryInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'phoneCheck') {
                        phoneErrorMsg.style.display = 'block';
                        phoneErrorMsg.innerHTML = "인증을 진행해주세요.";
                        phoneErrorMsg.style.color = "red";
                        phoneInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: phoneInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'datingsytleCheck') {
                        datingsStyleErrorMsg.style.display = 'block';
                        datingsStyleErrorMsg.innerHTML = "나의 연애 스타일을 모두 선택해주세요.";
                        datingsStyleErrorMsg.style.color = "red";
                        window.scrollTo({
                            top: datingsStyleErrorMsg.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if(key === 'letterCheck') {
                        letterErrorMsg.style.display = 'block';
                        letterErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        letterErrorMsg.style.color = "red";
                        letterInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: letterInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } 

                    allYes = false; // 하나라도 'yes'가 아니면 플래그를 false로 설정
                    break; // 더 이상 확인할 필요가 없으므로 반복문 종료
                }
            }
        }
        
        if (allYes) {

            console.log(`All Yes!`);

            const formData = new FormData();

            formData.append('id', idValue);
            formData.append('pw', pwValue);
            formData.append('name', nameValue);
            formData.append('gender', genderValue);
            formData.append('nickname', nicknameValue);
            formData.append('age', ageValue);
            formData.append('height', heightValue);
            formData.append('regionCity', regionCityValue);
            formData.append('regionGu', regionGuValue);
            formData.append('occupation', occupationValue);
            formData.append('occupationDetail', occupationDetailValue);
            formData.append('occupationFile', occupationFileValue);
            formData.append('occupationFileName',occupationfileNameValue);
            formData.append('mbti', mbtiValue);
            formData.append('style', styleValue);
            formData.append('eyeType', eyeTypeValue);
            formData.append('bodyType', bodyTypeValue);
            formData.append('faceType', faceTypeValue);
            formData.append('lips', lipsValue);
            formData.append('personality', personalityValue);
            formData.append('drinking', drinkingValue);
            formData.append('smoking', smokingValue);
            formData.append('religion', religionValue);
            formData.append('agePreference', agePreferenceValue);
            formData.append('relationship', relationshipValue);
            formData.append('distance', distanceValue);
            formData.append('pet', petValue);
            formData.append('hobby', hobbyValue);
            formData.append('picture_1', picture_1Value);
            formData.append('picture_2', picture_2Value);
            formData.append('picture_3', picture_3Value);
            formData.append('salary', salaryValue);
            formData.append('phone', phoneValue);
            formData.append('contactTerms', contactTermsValue);
            formData.append('statusReport', statusReportValue);
            formData.append('datingCost', datingCostValue);
            formData.append('hobbyPreference', hobbyPreferenceValue);
            formData.append('datingStyles', datingStylesValue);
            formData.append('manner', mannerValue);
            formData.append('datingTerm', datingTermValue);
            formData.append('anniversary', anniversaryValue);
            formData.append('contactPreference', contactPreferenceValue);
            formData.append('comfortStyle', comfortStyleValue);
            formData.append('letter', letterValue);
            formData.append('termsOfUseAgreement', termsOfUseAgreement);
            formData.append('privacyPolicyAgreement', privacyPolicyAgreement);
            formData.append('marketingAgreement', marketingAgreement);

            fetch('/signupProc', {
                method : 'POST',
                body: formData,
                // headers: {
                //     'Content-Type': 'application/json'
                // },
                // body: JSON.stringify({
                //     id: idValue,
                //     pw: pwValue,
                //     mbti: mbtiValue,
                //     phone: phoneNumber,
                // })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.result === 'success') {

                    alert('회원가입이 완료되었습니다.');

                    event.preventDefault();
                    window.location.href = `${hostURL}login`;
                }
                else if (data.result == 'fail') {
                    alert('알수 없는 오류입니다. 다시 시도해주세요');
                }
            })
            .catch(error => {
                console.log('Error:', error);
            })
        } else {
            console.log("모든 변수가 'yes'가 아닙니다.");
        }

    });

    // 취소 버튼 클릭 시
    signUpCancelBtn.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = `${hostURL}login`;
    });

});

