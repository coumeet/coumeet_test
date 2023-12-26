"use strict";

// let hostURL = 'http://localhost:3000/';

const pointColor = "#DB7C8D";
const frequencyColor = "#D9D9D9";
const selectBtnColor = "#F9F2F2";
const subBtnColor = '#767373';
let signupStatus;

// Firebase 휴대폰 인증
// Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-analytics.js";

// 휴대폰 번호 인증

import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
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

// 모든 Check 변수 정의
const checkVariables = {
    genderCheck: 'yes',
    nicknameCheck: 'yes',
    ageCheck: 'yes',
    heightCheck: 'yes',
    regionCheck: 'yes',
    occupationCheck: 'yes',
    mbtiCheck: 'yes',
    styleCheck: 'yes',
    eyeTypeCheck: 'yes',
    bodyTypeCheck: 'yes',
    faceTypeCheck: 'yes',
    lipsCheck: 'yes',
    personalityCheck: 'yes',
    drinkingCheck: 'yes',
    smokingCheck: 'yes',
    religionCheck: 'yes',
    agePreferenceCheck: 'yes',
    relationshipCheck: 'yes',
    distanceCheck: 'yes',
    petCheck: 'yes',
    hobbyCheck: 'yes',
    pictureCheck: 'yes',
    salaryCheck: 'yes',
    phoneCheck: 'yes',
    datingsytleCheck: 'yes',
    letterCheck: 'yes'
};

// 아무 입력값이 없다는 것을 대비하기 위한 변수 지정하기
let pictures = []; // pictures 정의 = 이유? 처음 접속했을 때 pictures값을 서버에 전송해야 하기 때문에 통일해야 함
let genderButtonValue = '';
let cityValue = '';
let guValue = '';
let buttonStates = [
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
let occupationSelectedFile = '';

const hobbyContainer = document.querySelector('.hobbyBtn_container');
let selectedPersonalityTexts = [];
let selectedStyleTexts = [];
let selectedHobbyTexts = [];

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

            console.log('areaData:',areaData);

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

    // 지역 버튼 만들기
    const cityContainer = document.querySelector('.city_container');
    for (const areaName in area) {
        const cityBtn = document.createElement('button');
        cityBtn.classList.add('city');
        cityBtn.textContent = areaName;
        cityContainer.appendChild(cityBtn);
    }

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

    // 이용자 정보 요청
    function userInfoRequest() {
        fetch(`/userInfoRequestProC`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            })
        })
        .then(response => response.json())
        .then(data => {
            // console.log(`data:${data.result}`);

            // 비로그인으로 접속했을 경우
            if (data.result === 'no result') {
                // console.log(`hostURL:${hostURL}`);
                window.location.href = 'http://localhost:3000/';
            }
            // 로그인으로 접속 했을 경우
            else {
                userInfoSetting(data);
            }
        })
        .catch(error => {
            // window.location.href = 'http://localhost:3000/';
            console.log(`이용자 전체 정보 불러오기 Error : ${error}`);

        });
    }

    userInfoRequest();

    // Function : 서버에서 받은 이용자에 정보를 세팅하는 기능
    function userInfoSetting(data) {

        const signUpConfirmStatus = document.querySelector('.signUpConfirmStatus');
        signupStatus = data[0].signupStatus;
        if(signupStatus === 'WAITING') {
            signUpConfirmStatus.textContent = '회원가입 승인 대기중';
        } else if(signupStatus === 'CONFIRM') {
            signUpConfirmStatus.textContent = '회원가입 승인 완료';
        } else if(signupStatus === 'REJECT') {
            signUpConfirmStatus.textContent = '회원가입 승인 거절';
            const signupRefuse_container = document.querySelector('.signupRefuse_container');
            signupRefuse_container.style.display = 'block';

            const signupRefuseDate = document.querySelector('.signupRefuseDate');

            const serverTime = data[0].signupRefuseDate;
            const serverDate = new Date(serverTime);
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            const localTime = serverDate.toLocaleDateString('ko-KR', options);
            signupRefuseDate.textContent = `(거절일 : ${localTime})`;

            const signupRefuseMsg = document.querySelector('.signupRefuseMsg');
            signupRefuseMsg.textContent = data[0].signupRefuseMsg;

            const signUpConfirmBtn = document.querySelector('#signUpConfirmBtn');
            signUpConfirmBtn.textContent = '승인 재신청';
        } else if(signupStatus === 'STOP') {
            signUpConfirmStatus.textContent = '서비스 사용 중지';
            const signupRefuse_container = document.querySelector('.signupRefuse_container');
            signupRefuse_container.style.display = 'block';

            const signupRefuseTitle = document.querySelector('.signupRefuseTitle');
            signupRefuseTitle.textContent = '중지 사유';
            const signupRefuseDate = document.querySelector('.signupRefuseDate');
            signupRefuseDate.textContent = '';

            const signupRefuseMsg = document.querySelector('.signupRefuseMsg');
            signupRefuseMsg.textContent = '신고 누적 5회 이상으로 서비스 사용이 중지되었습니다. 추가 문의는 coumeet@gmail.com으로 진행해주세요';
        }

        const signUpDate = document.querySelector('.signUpDate');

        // 서버에서 받은 시간 데이터 (예: '2023-10-18T15:00:00.000Z')
        const serverTime = data[0].signupdate;
        // 서버 시간을 JavaScript Date 객체로 파싱
        const serverDate = new Date(serverTime);
        // 프론트엔드에서 표시할 시간 형식을 설정 (YYYY-MM-DD 형식)
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        // 원하는 시간대로 시간을 변환
        const localTime = serverDate.toLocaleDateString('ko-KR', options);
        // 결과를 프론트엔드에 출력
        signUpDate.textContent = `(회원가입일 : ${localTime})`;

        // 아이디 
        const idInput = document.querySelector('#id');
        const idInput_container = document.querySelector('#idInput_container');
        idInput.value = data[0].id;
        idInput.classList.add('disabled');
        idInput_container.classList.add('disabled');
        idInput.disabled = true;

        // 이름
        const nameInput = document.querySelector('#nameInput');
        const nameInput_container = document.querySelector('#nameInput_container');
        nameInput.value = data[0].name;
        nameInput.classList.add('disabled');
        nameInput_container.classList.add('disabled');
        nameInput.disabled = true;

        // 성별
        const genderBtns = document.querySelectorAll('.genderBtns_container button');
        genderBtns.forEach((btn) => {
            if (btn.textContent === data[0].gender) {
                btn.classList.add('selected');
                genderButtonValue = data[0].gender;
            }
        });

        //닉네임
        const nickNameInput = document.querySelector('#nickNameInput');
        const nickNameNOC = document.querySelector('#nickNameNOC');
        nickNameInput.value = data[0].nickname;
        nickNameNOC.textContent = nickNameInput.value.length + '/10';

        //나이
        const ageInput = document.querySelector('#ageInput');
        ageInput.value = data[0].age + ' 살';

        //키
        const heightInput = document.querySelector('#heightInput');
        heightInput.value = data[0].height + ' cm';

        //사는곳
        const cityButtons = document.querySelectorAll('.city');
        const guContainer = document.querySelector('.gu_container');

        //지역
        const regionCity = data[0].regionCity;
        const regionGu = data[0].regionGu;
        cityButtons.forEach((button) => {
            if (button.textContent === regionCity) {
                button.classList.add('selected');
                cityValue = regionCity;
            }
        });

        const gu_container = document.querySelector('.gu_container');

        if (area[regionCity]) {
            area[regionCity].forEach((gu) => {
                const guButton = document.createElement('button');
                guButton.classList.add('gu');
                guButton.textContent = gu;
                guContainer.appendChild(guButton);

                if (guButton.textContent === regionGu) {
                    gu_container.scrollTop = guButton.offsetTop; // guButton의 상단 위치로 스크롤 이동
                    guButton.classList.add('selected');
                    guValue = regionGu;
                }
            });
        }

        // 지역 버튼 선택
        const guButtons = document.querySelectorAll('.gu');

        guButtons.forEach(button => {
            button.addEventListener('click', function () {
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
            });
        });

        //직업
        occupationButtonValue = data[0].occupation;
        const occupationSelectBtns = document.querySelectorAll('#occupationSelectBtns_container button');
        occupationSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].occupation) {
                btn.classList.add('selected');
            }
        });

        //직업상세
        const occupationDetailInput = document.querySelector('#occupationDetailInput');
        const occupationDetailNOC = document.querySelector('#occupationDetailNOC');
        occupationDetailInput.value = data[0].occupationDetail;
        occupationDetailNOC.textContent = occupationDetailInput.value.length + '/10';
        //재직증명서
        const occupationFileMsg_container = document.querySelector('#occupationFileMsg_container')
        occupationFileMsg_container.style.display = 'block';
        const occupationfileName = document.querySelector('.occupationfileName');

        console.log('data[0].occupationFile:',data[0].occupationFile);
        if (data[0].occupationFile) {
            occupationfileName.style.color = frequencyColor;
            occupationfileName.textContent = `업로드 파일 : ${data[0].occupationFile}`;
            occupationSelectedFile = data[0].occupationFile;
        }


        //MBTI
        mbtiButtonValue = data[0].mbti;
        const mbtiSelectBtns = document.querySelectorAll('#mbtiSelectBtns_container button');
        mbtiSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].mbti) {
                btn.classList.add('selected');
            }
        });

        //스타일
        let styleButtonValue = data[0].style;
        selectedStyleTexts = styleButtonValue.split(', ');
        console.log('selectedStyleTexts:',selectedStyleTexts);
        const styleSelectBtns = document.querySelectorAll('#styleSelectBtns_container button');
        styleSelectBtns.forEach((btn) => {
            if (selectedStyleTexts.includes(btn.textContent)) {
                btn.classList.add('selected');
            }
        });

        // 스타일 버튼 제어(클릭 했을 경우, 중복선택 3개)
        const styleInput_container = document.querySelector('#styleInput_container');
        const styleErrorMsg = document.querySelector('#styleErrorMsg');
        let selectedStyleCount = selectedStyleTexts.length;

        // console.log('styleSelectBtns:',styleSelectBtns);

        styleSelectBtns.forEach(button => {
            button.addEventListener('click', function (e) {

                console.log(button.classList);
                
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

                    if (selectedStyleCount === 0) {

                        styleErrorMsg.style.display = "block";
                        styleErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        styleErrorMsg.style.color = 'red';
                        styleInput_container.style.border = `1px solid ${pointColor}`;

                        checkVariables.styleCheck = 'no'
                    }

                } else if (selectedStyleCount < 3) {
                    const buttonName = this.textContent;
                    this.classList.add('selected');
                    selectedStyleCount++;

                    // 배열에 선택된 텍스트 추가
                    selectedStyleTexts.push(buttonName);

                    checkVariables.styleCheck = 'yes'

                    styleErrorMsg.style.display = "none";
                    styleInput_container.style.border = `1px solid ${frequencyColor}`;
                }

                console.log('selectedStyleCount:',selectedStyleCount);

            });
        });


        //쌍커풀
        eyeTypeButtonValue = data[0].eyeType;
        const eyesTypeSelectBtns = document.querySelectorAll('#eyeTypeSelectBtns_container button');
        eyesTypeSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].eyeType) {
                btn.classList.add('selected');
            }
        });

        //체형
        bodyTypeButtonValue = data[0].bodyType;
        const bodyTypeSelectBtns = document.querySelectorAll('#bodyTypeSelectBtns_container button');
        bodyTypeSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].bodyType) {
                btn.classList.add('selected');
            }
        });

        //얼굴상
        faceTypeButtonValue = data[0].faceType;
        const faceTypeSelectBtns = document.querySelectorAll('#faceTypeSelectBtns_container button');
        faceTypeSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].faceType) {
                btn.classList.add('selected');
            }
        });

        //입술
        lipsButtonValue = data[0].lips;
        const lipsSelectBtns = document.querySelectorAll('#lipsSelectBtns_container button');
        lipsSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].lips) {
                btn.classList.add('selected');
            }
        });

        //성격
        const personality = data[0].personality;
        selectedPersonalityTexts = personality.split(', ');
        const personalitySelectBtns = document.querySelectorAll('#personalitySelectBtns_container button');
        personalitySelectBtns.forEach((btn) => {
            selectedPersonalityTexts.forEach((value) => {
                if (btn.textContent === value) {
                    btn.classList.add('selected');
                }
            });
        });

        // 성격 버튼 제어(클릭 했을 경우, 중복선택 3개)
        const personalityInput_container = document.querySelector('#personalityInput_container');
        const personalityErrorMsg = document.querySelector('#personalityErrorMsg');
        let selectedPersonalityCount = selectedPersonalityTexts.length;

        // console.log(`selectedPersonalityTexts:${selectedPersonalityTexts}`);

        personalitySelectBtns.forEach(button => {
            button.addEventListener('click', function () {

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

                    if (selectedPersonalityCount === 0) {

                        personalityErrorMsg.style.display = "block";
                        personalityErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        personalityErrorMsg.style.color = 'red';
                        personalityInput_container.style.border = `1px solid ${pointColor}`;

                        checkVariables.personalityCheck = 'no'
                    }

                } else if (selectedPersonalityCount < 3) {
                    const buttonName = this.textContent;
                    this.classList.add('selected');
                    selectedPersonalityCount++;

                    // 배열에 선택된 텍스트 추가
                    selectedPersonalityTexts.push(buttonName);

                    checkVariables.personalityCheck = 'yes'

                    personalityErrorMsg.style.display = "none";
                    personalityInput_container.style.border = `1px solid ${frequencyColor}`;

                    // console.log(`selectedPersonalityTexts:${selectedPersonalityTexts}`);
                }
            });
        });

        //음주
        drinkingButtonValue = data[0].drinking;
        const drinkingSelectBtns = document.querySelectorAll('#drinkingSelectBtns_container button');
        drinkingSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].drinking) {
                btn.classList.add('selected');
            }
        });

        //흡연
        smokingButtonValue = data[0].smoking;
        const smokingSelectBtns = document.querySelectorAll('#smokingSelectBtns_container button');
        smokingSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].smoking) {
                btn.classList.add('selected');
            }
        });

        //종교
        religionButtonValue = data[0].religion;
        const religionSelectBtns = document.querySelectorAll('#religionSelectBtns_container button');
        religionSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].religion) {
                btn.classList.add('selected');
            }
        });

        //나이선호
        agePreferenceButtonValue = data[0].agePreference;
        const agePreferenceSelectBtns = document.querySelectorAll('#agePreferenceSelectBtns_container button');
        agePreferenceSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].agePreference) {
                btn.classList.add('selected');
            }
        });

        //친구관계
        relationshipButtonValue = data[0].relationship;
        const relationshipSelectBtns = document.querySelectorAll('#relationshipSelectBtns_container button');
        relationshipSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].relationship) {
                btn.classList.add('selected');
            }
        });

        //장거리
        distanceButtonValue = data[0].distance;
        const distanceSelectBtns = document.querySelectorAll('#distanceSelectBtns_container button');
        distanceSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].distance) {
                btn.classList.add('selected');
            }
        });

        //애완동물
        petButtonValue = data[0].pet;
        const petSelectBtns = document.querySelectorAll('#petSelectBtns_container button');
        petSelectBtns.forEach((btn) => {
            if(btn.textContent === data[0].pet) {
                btn.classList.add('selected');
            }
        });

        //취미
        const hobbyBtns = document.querySelectorAll('#hobbySelectBtns_container button')
        const hobby = data[0].hobby;
        selectedHobbyTexts = hobby.split(', ');
        hobbyBtns.forEach((btn) => {
            selectedHobbyTexts.forEach((value) => {
                if (btn.textContent === value) {
                    btn.classList.add('selected');
                }
            })
        });

        // 취미 버튼 제어(클릭 했을 경우, 중복선택 5개)
        const hobbyInput_container = document.querySelector('#hobbyInput_container');
        const hobbyErrorMsg = document.querySelector('#hobbyErrorMsg');
        let selectedHobbyCount = selectedHobbyTexts.length;

        hobbyBtns.forEach(button => {
            button.addEventListener('click', function () {

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

                    if (selectedHobbyCount === 0) {
                        // console.log(`select!`);

                        hobbyErrorMsg.style.display = "block";
                        hobbyErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        hobbyErrorMsg.style.color = 'red';
                        hobbyInput_container.style.border = `1px solid ${pointColor}`;

                        checkVariables.hobbyCheck = 'no';
                    }

                } else if (selectedHobbyCount < 6) {
                    // console.log(`here!`);
                    const buttonName = this.textContent;
                    this.classList.add('selected');
                    selectedHobbyCount++;

                    // 배열에 선택된 텍스트 추가
                    selectedHobbyTexts.push(buttonName);

                    checkVariables.hobbyCheck = 'yes';

                    hobbyErrorMsg.style.display = "none";
                    hobbyInput_container.style.border = `1px solid ${frequencyColor}`;
                    // console.log(`selectedHobbyTexts:${selectedHobbyTexts}`);
                }
                // console.log(`selectedHobbyCount:${selectedHobbyCount}`);
            });
        });

        const pictureImgs = [
            document.querySelector('#picture_1_img'),
            document.querySelector('#picture_2_img'),
            document.querySelector('#picture_3_img')
        ];

        const plusIcons = [
            document.querySelector('#pictureBtn_1_i'),
            document.querySelector('#pictureBtn_2_i'),
            document.querySelector('#pictureBtn_3_i')
        ];

        plusIcons.forEach((icon) => {
            icon.style.display = 'none';
        });

        pictures = [data[0].picture_1, data[0].picture_2, data[0].picture_3];
        for (let i = 0; i < pictureImgs.length; i++) {
            pictureImgs[i].style.display = 'block';
            // pictureImgs[i].style.width = '400px';
            // pictureImgs[i].style.height = '400px';
            pictureImgs[i].src = `../backend/uploads/${data[0].id}/${pictures[i]}`;
            // console.log(`pictures[i]:${pictures[i]}`);
        }

        //연봉
        const SalaryInput = document.querySelector('#SalaryInput');
        const formattedSalary = parseInt(data[0].salary).toLocaleString();
        SalaryInput.value = formattedSalary + ' 만원';

        //연락처
        const phoneInput = document.querySelector('#phone');
        phoneInput.value = data[0].phone;

        //나의연애스타일은?
        const contactTermsBtns = document.querySelectorAll('.contactTermsBtns_container button')
        contactTermsBtns.forEach((btn) => {
            if (btn.textContent === data[0].contactTerms) {
                btn.classList.add('selected');
                buttonStates[0].text = data[0].contactTerms;
            }
        });
        const statusReportBtns = document.querySelectorAll('.statusReportBtns_container button')
        statusReportBtns.forEach((btn) => {
            if (btn.textContent === data[0].statusReport) {
                btn.classList.add('selected');
                buttonStates[1].text = data[0].statusReport;
            }
        });
        const datingCostBtns = document.querySelectorAll('.datingCostBtns_container button')
        datingCostBtns.forEach((btn) => {
            if (btn.textContent === data[0].datingCost) {
                btn.classList.add('selected');
                buttonStates[2].text = data[0].datingCost;
            }
        });
        const hobbyPreferenceBtns = document.querySelectorAll('.hobbyPreferenceBtns_container button')
        hobbyPreferenceBtns.forEach((btn) => {
            if (btn.textContent === data[0].hobbyPreference) {
                btn.classList.add('selected');
                buttonStates[3].text = data[0].hobbyPreference;
            }
        });
        const datingStylesBtns = document.querySelectorAll('.datingStylesBtns_container button')
        datingStylesBtns.forEach((btn) => {
            if (btn.textContent === data[0].datingStyles) {
                btn.classList.add('selected');
                buttonStates[4].text = data[0].datingStyles;
            }
        });
        const mannerBtns = document.querySelectorAll('.mannerBtns_container button')
        mannerBtns.forEach((btn) => {
            if (btn.textContent === data[0].manner) {
                btn.classList.add('selected');
                buttonStates[5].text = data[0].manner;
            }
        });
        const datingTermBtns = document.querySelectorAll('.datingTermBtns_container button')
        datingTermBtns.forEach((btn) => {
            if (btn.textContent === data[0].datingTerm) {
                btn.classList.add('selected');
                buttonStates[6].text = data[0].datingTerm;
            }
        });
        const anniversaryBtns = document.querySelectorAll('.anniversaryBtns_container button')
        anniversaryBtns.forEach((btn) => {
            if (btn.textContent === data[0].anniversary) {
                btn.classList.add('selected');
                buttonStates[7].text = data[0].anniversary;
            }
        });
        const contactPreferenceBtns = document.querySelectorAll('.contactPreferenceBtns_container button')
        contactPreferenceBtns.forEach((btn) => {
            if (btn.textContent === data[0].contactPreference) {
                btn.classList.add('selected');
                buttonStates[8].text = data[0].contactPreference;
            }
        });
        const comfortStyleBtns = document.querySelectorAll('.comfortStyleBtns_container button')
        comfortStyleBtns.forEach((btn) => {
            if (btn.textContent === data[0].comfortStyle) {
                btn.classList.add('selected');
                buttonStates[9].text = data[0].comfortStyle;
            }
        });

        //나의연인에게
        const formattedLetter = data[0].letter.replace(/<br>/g, '\n');
        const letterInput = document.querySelector('#letterInput');
        letterInput.innerHTML = formattedLetter;
        const letterNOC = document.getElementById('letterNOC');
        letterNOC.textContent = letterInput.value.length + '/200';

        //문제 없이 여기까지 왔다면 → 모든 체크 밸류 yes로 만들기
        for (const key in checkVariables) {
            if (checkVariables.hasOwnProperty(key)) {
                checkVariables[key] = 'yes';
            }
        }

        editOnOffHandler(signupStatus);
    }

    // 회원정보 수정 On,Off Handler
    function editOnOffHandler(signupStatus) {

        if(signupStatus === 'WAITING' || signupStatus === 'STOP') {
            const input_containers = document.querySelectorAll('.input_container');
            input_containers.forEach(container => {
                container.classList.add('disabled');
            });
        
            const btns_containers = document.querySelectorAll('.btns_container');
            btns_containers.forEach(container => {
                container.classList.add('disabled');
            });
        
            const btns_btns = document.querySelectorAll('.btns_btn');
            btns_btns.forEach(btn => {
                btn.disabled = true;
            });
        
            const checkBtns = document.querySelectorAll('.checkBtn');
            checkBtns.forEach(input => {
                input.disabled = true;
            });
        
            const cityBtns = document.querySelectorAll('.city');
            cityBtns.forEach(input => {
                input.disabled = true;
            });
        
            const guBtns = document.querySelectorAll('.gu');
            guBtns.forEach(input => {
                input.disabled = true;
            });
        
            const inputfields = document.querySelectorAll('.inputfield');
            inputfields.forEach(input => {
                input.disabled = true;
            });
        
            const selectInputs = document.querySelectorAll('.selectInput');
            selectInputs.forEach(input => {
                input.disabled = true;
            });
        
            const pictureBtns = document.querySelectorAll('.pictureBtn');
            pictureBtns.forEach(input => {
                input.disabled = true;
            });
        
            const pictureXBtns = document.querySelectorAll('.pictureBtn i');
            pictureXBtns.forEach(input => {
                // console.log('input',input);
                input.style.display = 'none';
            });
        
            const dating_btns = document.querySelectorAll('.dating_btn');
            dating_btns.forEach(input => {
                input.disabled = true;
            });
        
            const letterInput = document.querySelector('#letterInput');
            letterInput.disabled = true;
        }
    }

    // 성별 입력 제어하기
    const genderInput_container = document.querySelector('#genderInput_container');
    const genderBtns = document.querySelectorAll('#genderBtn');
    const genderErrorMsg = document.querySelector('#genderErrorMsg');

    genderBtns.forEach((button) => {

        button.addEventListener('click', function () {

            genderBtns.forEach((btn) => {
                btn.classList.remove('selected');
            });

            genderButtonValue = this.textContent;

            this.classList.add('selected');
            checkVariables.genderCheck = 'yes';
        });
    });

    // 닉네임 입력 제어하기(글자수 제한)
    const nickNameInput = document.getElementById('nickNameInput');
    const nickNameNOC = document.getElementById('nickNameNOC');
    const nickNameInput_container = document.querySelector('#nickNameInput_container');
    const NICKNAME_MAX_NAME_LENGTH = 10;


    nickNameInput.addEventListener('input', function (event) {
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
    });

    //닉네임 중복 확인 버튼 클릭 시
    nickNameCheckBtn.addEventListener('click', () => {

        // 서버에 nickname정보 전달
        const nickNameValue = nickNameInput.value; // nickname 정보
        console.log(`nickname : ${nickNameValue}`);

        //닉네임을 입력 안했을 경우
        if (nickNameInput.value == "") {
            nickNameErrorMsg.style.display = "block";
            nickNameErrorMsg.innerHTML = "닉네임을 입력해주세요.";
            nickNameErrorMsg.style.color = 'red';
            nickNameInput_container.style.border = `1px solid ${pointColor}`;

            checkVariables.nicknameCheck = 'no';
        }
        // 닉네임을 입력했을 경우
        else {
            fetch('/nickNamecheck', {
                method: 'POST',
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
                    }
                    else if (data.result == 'no_match') {
                        nickNameErrorMsg.style.display = "block";
                        nickNameErrorMsg.innerHTML = "사용 가능한 닉네임입니다";
                        nickNameErrorMsg.style.color = "blue";
                        nickNameInput_container.style.border = `1px solid ${frequencyColor}`;

                        // 아디이 중복체크 확인
                        checkVariables.nicknameCheck = 'yes';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    checkVariables.nicknameCheck = 'no';
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
        if (inputValue == "") {
            checkVariables.ageCheck = 'no';

            // 일치하지 않는 경우
            ageErrorMsg.style.display = 'block';
            ageErrorMsg.innerHTML = "나이를 입력해주세요.";
            ageErrorMsg.style.color = "red";
            ageInput_container.style.border = `1px solid ${pointColor}`;
        } else {
            checkVariables.ageCheck = 'yes';
            ageErrorMsg.style.display = 'none';
            ageInput_container.style.border = `1px solid ${frequencyColor}`;
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
        if (inputValue == "") {
            checkVariables.heightCheck = 'no';

            // 일치하지 않는 경우
            heightErrorMsg.style.display = 'block';
            heightErrorMsg.innerHTML = "나이를 입력해주세요.";
            heightErrorMsg.style.color = "red";
            heightInput_container.style.border = `1px solid ${pointColor}`;
        } else {
            checkVariables.heightCheck = 'yes';
            heightErrorMsg.style.display = 'none';
            heightInput_container.style.border = `1px solid ${frequencyColor}`;
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

    // 지역 선택 제어하기
    const cityButtons = document.querySelectorAll('.city');
    const guContainer = document.querySelector('.gu_container');
    const regionErrorMsg = document.querySelector('#regionErrorMsg');
    const regionInput_container = document.querySelector('#regionInput_container');

    cityButtons.forEach(button => {
        button.addEventListener('click', function () {
            const cityName = this.textContent;
            cityValue = this.textContent;
            console.log(`cityValue:${cityValue}`);

            // 모든 버튼의 색깔 초기화
            cityButtons.forEach(btn => {
                btn.classList.remove('selected');
            });

            checkVariables.regionCheck = 'no';

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
                    button.addEventListener('click', function () {
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
                    });
                });
            }
        });
    });

    // 직업 제어
    const occupationInput_container = document.querySelector('#occupationInput_container');
    const occupationBtns = document.querySelectorAll('#occupationBtn');
    const occupationErrorMsg = document.querySelector('#occupationErrorMsg');
    let occupationCheck = 'yes';
    let occupationDetailCheck = 'yes';
    let occupationFileCheck = 'yes';
    let occupationButtonValue = '';

    occupationBtns.forEach((button) => {
        button.addEventListener('click', function() {

            occupationBtns.forEach((btn) => {
                btn.classList.remove('selected');
            });

            occupationButtonValue = this.textContent;
            // console.log('occupationButtonValue:',occupationButtonValue);

            this.classList.add('selected');
            occupationCheck = 'yes';

            if(occupationCheck == 'yes' && occupationDetailCheck == 'yes' && occupationFileCheck == 'yes') {
                checkVariables.occupationCheck = 'yes'
            } else {
                checkVariables.occupationCheck = 'no'
            }
        });
    });

    // 직업 상세업무 제어
    const occupationDetailInput = document.getElementById('occupationDetailInput');
    const occupationDetailNOC = document.getElementById('occupationDetailNOC');
    const OCCUPATIONDETAIL_MAX_NAME_LENGTH = 10;

    occupationDetailInput.addEventListener('input', function (event) {

        const inputValue = event.target.value;
        const sanitizedValue = inputValue.replace(/\s/g, ''); // 띄어쓰기 제거

        //직업상세를 입력 안했을 경우
        if (inputValue == "") {
            occupationErrorMsg.style.display = "block";
            occupationErrorMsg.innerHTML = "상세업무를 입력해주세요.";
            occupationErrorMsg.style.color = 'red';
            occupationInput_container.style.border = `1px solid ${pointColor}`;

            occupationDetailCheck = 'no';
            checkVariables.occupationCheck = 'no';
        }
        // 직업상세를 입력했을 경우
        else {

            // console.log(`inputValue:${inputValue}`);
            occupationErrorMsg.style.display = "none";
            occupationInput_container.style.border = `1px solid ${frequencyColor}`;

            if (sanitizedValue.length <= OCCUPATIONDETAIL_MAX_NAME_LENGTH) {
                occupationDetailInput.value = sanitizedValue; // 띄어쓰기가 제거된 값을 입력란에 설정
                occupationDetailNOC.textContent = `${sanitizedValue.length}/${OCCUPATIONDETAIL_MAX_NAME_LENGTH}`;
            } else {
                occupationDetailInput.value = sanitizedValue.slice(0, OCCUPATIONDETAIL_MAX_NAME_LENGTH); // 최대 길이 초과 시 문자열 자르기
                occupationDetailNOC.textContent = `${OCCUPATIONDETAIL_MAX_NAME_LENGTH}/${OCCUPATIONDETAIL_MAX_NAME_LENGTH}`;
            }

            occupationDetailCheck = 'yes'

            if (occupationCheck == 'yes' && occupationDetailCheck == 'yes' && occupationFileCheck == 'yes') {
                checkVariables.occupationCheck = 'yes'
            } else {
                checkVariables.occupationCheck = 'no'
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

            // 파일 이름을 표시
            const occupationFileMsg_container = document.querySelector('#occupationFileMsg_container');
            const occupationfileName = document.querySelector('.occupationfileName');
            occupationFileMsg_container.style.display = 'block';
            occupationfileName.style.color = frequencyColor;
            occupationfileName.textContent = `업로드 파일 : ${occupationSelectedFile.name}`;

            occupationErrorMsg.style.display = 'none';
            occupationInput_container.style.border = `1px solid ${frequencyColor}`;
            occupationFileCheck = 'yes';

            if (occupationCheck == 'yes' && occupationDetailCheck == 'yes' && occupationFileCheck == 'yes') {
                checkVariables.occupationCheck = 'yes'
            } else {
                checkVariables.occupationCheck = 'no'
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
    });

    function handleSelectChange(selectElement, errorMsgElement, inputContainer, checkVariableKey) {
        selectElement.addEventListener('change', () => {
            if (selectElement.value === "") {
                errorMsgElement.style.display = "block";
                errorMsgElement.innerHTML = "필수 입력 사항입니다.";
                errorMsgElement.style.color = 'red';
                inputContainer.style.border = `1px solid ${pointColor}`;

                checkVariables[checkVariableKey] = 'no';
            } else {
                errorMsgElement.style.display = "none";
                inputContainer.style.border = `1px solid ${frequencyColor}`;

                checkVariables[checkVariableKey] = 'yes';
            }
        });
    }

    // 버튼 선택 핸들러
    function buttonClickHandler(text, check, callback) {
        const btns = document.querySelectorAll(`#${text}Btn`);
        
        btns.forEach((button) => {
            button.addEventListener('click', function() {
                btns.forEach((btn) => {
                    btn.classList.remove('selected');
                });

                const buttonValue = this.textContent;

                this.classList.add('selected');
                if (check) {
                    checkVariables[check] = 'yes';
                }

                callback(buttonValue);
            });
        });
    }

    // mbti 선택 확인
    const mbtiInput_container = document.querySelector('#mbtiInput_container');
    const mbtiErrorMsg = document.querySelector('#mbtiErrorMsg');
    let mbtiButtonValue = '';
    buttonClickHandler('mbti', 'mbtiCheck', function(value) {
        mbtiButtonValue = value;
    });


    // 스타일 선택 확인
    // const styleInput_container = document.querySelector('#styleInput_container');
    // let styleButtonValue = '';
    // const styleErrorMsg = document.querySelector('#styleErrorMsg');
    // buttonClickHandler('style', 'styleCheck', function(value) {
    //     styleButtonValue = value;
    // });

    // 쌍커풀 선택 확인
    const eyesTypeInput_container = document.querySelector('#eyesTypeInput_container');
    let eyeTypeButtonValue = '';
    const eyesTypeErrorMsg = document.querySelector('#eyesTypeErrorMsg');
    buttonClickHandler('eyeType', 'eyeTypeCheck', function(value) {
        eyeTypeButtonValue = value;
    });

    // 체형 선택 확인
    const body_typeInput_container = document.querySelector('#body_typeInput_container');
    let bodyTypeButtonValue = '';
    const body_typeErrorMsg = document.querySelector('#body_typeErrorMsg');
    buttonClickHandler('bodyType', 'bodyTypeCheck', function(value) {
        bodyTypeButtonValue = value;
    });

    // 얼굴상 선택 확인
    const face_typeInput_container = document.querySelector('#face_typeInput_container');
    let faceTypeButtonValue = '';
    const face_typeErrorMsg = document.querySelector('#face_typeErrorMsg');
    buttonClickHandler('faceType', 'faceTypeCheck', function(value) {
        faceTypeButtonValue = value;
    });

    // 입술 선택 확인
    const lips_typeInput_container = document.querySelector('#lips_typeInput_container');
    let lipsButtonValue = '';
    const lips_typeErrorMsg = document.querySelector('#lips_typeErrorMsg');
    buttonClickHandler('lips', 'lipsCheck', function(value) {
        lipsButtonValue = value;
    });

    // 음주 선택 확인
    const drinking_habitsInput_container = document.querySelector('#drinking_habitsInput_container');
    let drinkingButtonValue = '';
    const drinking_habitsErrorMsg = document.querySelector('#drinking_habitsErrorMsg');
    buttonClickHandler('drinking', 'drinkingCheck', function(value) {
        drinkingButtonValue = value;
    });

    // 흡연 선택 확인
    const smoking_habitsInput_container = document.querySelector('#smoking_habitsInput_container');
    let smokingButtonValue = '';
    const smoking_habitsErrorMsg = document.querySelector('#smoking_habitsErrorMsg');
    buttonClickHandler('smoking', 'smokingCheck', function(value) {
        smokingButtonValue = value;
    });

    // 종교 선택 확인
    const religionInput_container = document.querySelector('#religionInput_container');
    let religionButtonValue = '';
    const religionErrorMsg = document.querySelector('#religionErrorMsg');
    buttonClickHandler('religion', 'religionCheck', function(value) {
        religionButtonValue = value;
    });

    // 나이 선호 선택 확인
    const agePreferenceInput_container = document.querySelector('#agePreferenceInput_container');
    let agePreferenceButtonValue = '';
    const agePreferenceErrorMsg = document.querySelector('#agePreferenceErrorMsg');
    buttonClickHandler('agePreference', 'agePreferenceCheck', function(value) {
        agePreferenceButtonValue = value;
    });

    // 친구관계 선택 확인
    const relationshipInput_container = document.querySelector('#relationshipInput_container');
    let relationshipButtonValue = '';
    const relationshipErrorMsg = document.querySelector('#relationshipErrorMsg'); 
    buttonClickHandler('relationship', 'relationshipCheck', function(value) {
        relationshipButtonValue = value;
    });

    // 장거리 선택 확인
    const distanceInput_container = document.querySelector('#distanceInput_container');
    let distanceButtonValue = '';
    const distanceErrorMsg = document.querySelector('#distanceErrorMsg'); 
    buttonClickHandler('distance', 'distanceCheck', function(value) {
        distanceButtonValue = value;
    });

    // 애완동물 선택 확인
    const petInput_container = document.querySelector('#petInput_container');
    let petButtonValue = '';
    const petErrorMsg = document.querySelector('#petErrorMsg'); 
    buttonClickHandler('pet', 'petCheck', function(value) {
        petButtonValue = value;
    });


    // 사진 X 버튼 및 Plus 아이콘 클릭 시
    const pictureXBtns = document.querySelectorAll('.picturesBtn_container .fa-rectangle-xmark');

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

    const resizedpictureImgs = [];

    const pictureImgs = [
        document.querySelector('#picture_1_img'),
        document.querySelector('#picture_2_img'),
        document.querySelector('#picture_3_img')
    ];

    const plusIcons = [
        document.querySelector('#pictureBtn_1_i'),
        document.querySelector('#pictureBtn_2_i'),
        document.querySelector('#pictureBtn_3_i')
    ];

    const pictureErrorMsg = document.querySelector('#pictureErrorMsg');

    let uploadedPictures = [true, true, true]; // 사진 업로드 상태를 추적하는 배열

    pictureXBtns.forEach((xBtn, index) => {
        xBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            // 클릭된 X 버튼의 부모 요소인 button의 id 값을 추출
            const buttonId = e.currentTarget.parentNode.id;
            console.log(`사진 X버튼 클릭! 버튼의 id: ${buttonId}`);

            xBtn.style.display = 'none';
            pictureImgs[index].src = '';
            pictureImgs[index].style.display = 'none';
            plusIcons[index].style.display = 'block';
            uploadedPictures[index] = false;
        });
    });

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

        } else {
            console.log('모든 사진 업로드가 완료되지 않았습니다.');

            pictureErrorMsg.style.display = "block";
            pictureErrorMsg.innerHTML = "필수 입력 사항입니다.";
            pictureErrorMsg.style.color = 'red';

            checkVariables.pictureCheck = 'no';
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
        if (inputValue == "") {
            checkVariables.salaryCheck = 'no';
            SalaryErrorMsg.style.display = 'block';
            SalaryErrorMsg.innerHTML = "연봉을 입력해주세요.";
            SalaryErrorMsg.style.color = "red";
            SalaryInput_container.style.border = `1px solid ${pointColor}`;
        } else {

            checkVariables.salaryCheck = 'yes';
            SalaryErrorMsg.style.display = 'none';
            SalaryInput_container.style.border = `1px solid ${frequencyColor}`;
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
    const firebaseConfig = {
        apiKey: "AIzaSyAqJCcAfMTe8yvjW1PYkyVxf_uFG-1QxwI",
        authDomain: "phonecertification.firebaseapp.com",
        projectId: "phonecertification",
        storageBucket: "phonecertification.appspot.com",
        messagingSenderId: "112808255787",
        appId: "1:112808255787:web:acb5528065ed5aa92ba56e",
        measurementId: "G-3KFQ8092MS"
    };

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
    phoneInput.addEventListener('input', function (event) {

        // checkVariables.phoneCheck = 'no';
        // checkVariables.phoneCheck = 'yes'; // 임시로 열어둠

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

        event.preventDefault();

        if (phoneInput.value === "") {

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
    phoneCertificationSubmitBtn.addEventListener('click', (event) => {

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

    const datingsStyleErrorMsg = document.querySelector('#datingsStyleErrorMsg');

    function datingstyleAddButtonClickListener(buttons, state) {
        buttons.forEach((button, index) => {
            button.addEventListener('click', function () {
                // 모든 버튼의 색깔 초기화
                buttons.forEach(btn => {
                    btn.classList.remove('selected');
                });

                // 선택된 버튼의 스타일 변경
                this.classList.add('selected');
                state.text = this.textContent;
                // console.log(state.text);

                // 모든 버튼이 선택되었는지 확인
                const allSelected = buttonStates.every(buttonState => buttonState.text !== '');
                if (allSelected) {
                    console.log('모든 버튼이 선택되었습니다.');
                    // 여기에서 필요한 로직 수행
                    checkVariables.datingsytleCheck = 'yes'

                    datingsStyleErrorMsg.style.display = 'none';

                } else {
                    console.log('모든 버튼이 선택되지 않았습니다.');
                    checkVariables.datingsytleCheck = 'no'
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

    letterInput.addEventListener('input', function (event) {
        const inputValue = event.target.value;

        // 입력 값이 없을 경우
        if (inputValue == "") {
            checkVariables.letterCheck = 'no';

            letterErrorMsg.style.display = 'block';
            letterErrorMsg.innerHTML = "필수 입력 사항입니다.";
            letterErrorMsg.style.color = "red";
            letterInput_container.style.border = `1px solid ${pointColor}`;
        } else {
            checkVariables.letterCheck = 'yes';
            letterErrorMsg.style.display = 'none';
            letterInput_container.style.border = `1px solid ${frequencyColor}`;
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

    // 회원가입 '완료' 버튼 클릭 시
    signUpConfirmBtn.addEventListener('click', (event) => {

        // 서버에 id정보 전달
        const idValue = id.value;
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
        const occupationFileNameValue = decodeURIComponent(occupationSelectedFile.name); // 파일명 전달 (한글 깨지지 않기 위해)
        const mbtiValue = mbtiButtonValue;
        console.log('mbtiButtonValue:',mbtiButtonValue);
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

        let picture_1NameValue = '';
        let picture_2NameValue = '';
        let picture_3NameValue = '';

        let picture_1Value = resizedpictureImgs[0];
        if(resizedpictureImgs[0]) {
            picture_1NameValue = decodeURIComponent(resizedpictureImgs[0].name); // 파일명 전달 (한글 깨지지 않기 위해)
        }

        let picture_2Value = resizedpictureImgs[1];
        if(resizedpictureImgs[1]) {
            picture_2NameValue = decodeURIComponent(resizedpictureImgs[1].name); // 파일명 전달 (한글 깨지지 않기 위해)
        }

        let picture_3Value = resizedpictureImgs[2];
        if(resizedpictureImgs[2]) {
            picture_3NameValue = decodeURIComponent(resizedpictureImgs[2].name); // 파일명 전달 (한글 깨지지 않기 위해)
        }

        // 이용자가 사진 값을 변경하지 않았을 경우를 확인하기
        if(picture_1Value === undefined) {
            picture_1Value = pictures[0];
        } 
        if(picture_2Value === undefined) {
            picture_2Value = pictures[1];
        }
        if(picture_3Value === undefined) {
            picture_3Value = pictures[2];
        }

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

        // console.log("idValue:", idValue);
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
        console.log("mbtiValue:", mbtiValue);
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

        // 입력 폼 Check 확인하기
        let allYes = true; // 모든 변수가 'yes'인지를 나타내는 플래그
        const targetHeight = 250; // 추가 여백으로 설정할 높이 (픽셀)

        // console.log(`checkVariables.genderCheck:${checkVariables.genderCheck}`);

        for (const key in checkVariables) {
            if (Object.hasOwnProperty.call(checkVariables, key)) {
                const value = checkVariables[key];
                // console.log(`key : ${key}`);
                if (value !== 'yes') {
                    console.log(`${key} is set to 'no'`);

                    if (key === 'idCheck') {
                        // idErrorMsg.style.display = "block";
                        // idErrorMsg.innerHTML = "아이디를 확인해주세요.";
                        // idErrorMsg.style.color = 'red';
                        // idInput_container.style.border = `1px solid ${pointColor}`;
                        // window.scrollTo({
                        //     top: idInput_container.offsetTop - targetHeight,
                        //     behavior: 'smooth'
                        // });
                    } else if (key === 'pwCheck') {
                        // pwErrorMsg.style.display = 'block';
                        // pwErrorMsg.innerHTML = "비밀번호를 확인해주세요.";
                        // pwErrorMsg.style.color = "red";
                        // pw2Input_container.style.border = `1px solid ${pointColor}`;
                        // window.scrollTo({
                        //     top: pw2Input_container.offsetTop - targetHeight,
                        //     behavior: 'smooth'
                        // });
                    } else if (key === 'genderCheck') {
                        genderErrorMsg.style.display = 'block';
                        genderErrorMsg.innerHTML = "성별을 확인해주세요.";
                        genderErrorMsg.style.color = "red";
                        genderInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: genderInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'nameCheck') {
                        nameErrorMsg.style.display = 'block';
                        nameErrorMsg.innerHTML = "이름을 확인해주세요.";
                        nameErrorMsg.style.color = "red";
                        nameInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: nameInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'nicknameCheck') {
                        nickNameErrorMsg.style.display = "block";
                        nickNameErrorMsg.innerHTML = "닉네임을 확인해주세요.";
                        nickNameErrorMsg.style.color = 'red';
                        nickNameInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: nickNameInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'ageCheck') {
                        ageErrorMsg.style.display = 'block';
                        ageErrorMsg.innerHTML = "나이를 입력해주세요.";
                        ageErrorMsg.style.color = "red";
                        ageInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: ageInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'heightCheck') {
                        heightErrorMsg.style.display = "block";
                        heightErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        heightErrorMsg.style.color = 'red';
                        heightInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: heightInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'regionCheck') {
                        regionErrorMsg.style.display = 'block';
                        regionErrorMsg.innerHTML = "지역을 확인해주세요.";
                        regionErrorMsg.style.color = "red";
                        regionInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: regionInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'occupationCheck') {
                        occupationErrorMsg.style.display = "block";
                        occupationErrorMsg.innerHTML = "직업(재직증명서 업로드 등)을 확인해주세요.";
                        occupationErrorMsg.style.color = 'red';
                        occupationInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: occupationInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'mbtiCheck') {
                        mbtiErrorMsg.style.display = "block";
                        mbtiErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        mbtiErrorMsg.style.color = 'red';
                        mbtiInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: mbtiInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'styleCheck') {
                        styleErrorMsg.style.display = "block";
                        styleErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        styleErrorMsg.style.color = 'red';
                        styleInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: styleInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'eyeTypeCheck') {
                        eyesTypeErrorMsg.style.display = "block";
                        eyesTypeErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        eyesTypeErrorMsg.style.color = 'red';
                        eyesTypeInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: eyesTypeInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'bodyTypeCheck') {
                        body_typeErrorMsg.style.display = "block";
                        body_typeErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        body_typeErrorMsg.style.color = 'red';
                        body_typeInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: body_typeInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'faceTypeCheck') {
                        face_typeErrorMsg.style.display = "block";
                        face_typeErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        face_typeErrorMsg.style.color = 'red';
                        face_typeInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: face_typeInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'lipsCheck') {
                        lips_typeErrorMsg.style.display = "block";
                        lips_typeErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        lips_typeErrorMsg.style.color = 'red';
                        lips_typeInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: lips_typeInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'personalityCheck') {
                        personalityErrorMsg.style.display = "block";
                        personalityErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        personalityErrorMsg.style.color = 'red';
                        personalityInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: personalityInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'drinkingCheck') {
                        drinking_habitsErrorMsg.style.display = "block";
                        drinking_habitsErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        drinking_habitsErrorMsg.style.color = 'red';
                        drinking_habitsInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: drinking_habitsInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'smokingCheck') {
                        smoking_habitsErrorMsg.style.display = "block";
                        smoking_habitsErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        smoking_habitsErrorMsg.style.color = 'red';
                        smoking_habitsInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: smoking_habitsInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'religionCheck') {
                        religionErrorMsg.style.display = "block";
                        religionErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        religionErrorMsg.style.color = 'red';
                        religionInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: religionInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'agePreferenceCheck') {
                        agePreferenceErrorMsg.style.display = "block";
                        agePreferenceErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        agePreferenceErrorMsg.style.color = 'red';
                        agePreferenceInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: agePreferenceInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'relationshipCheck') {
                        relationshipErrorMsg.style.display = "block";
                        relationshipErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        relationshipErrorMsg.style.color = 'red';
                        relationshipInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: relationshipInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'distanceCheck') {
                        distanceErrorMsg.style.display = "block";
                        distanceErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        distanceErrorMsg.style.color = 'red';
                        distanceInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: distanceInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'petCheck') {
                        petErrorMsg.style.display = "block";
                        petErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        petErrorMsg.style.color = 'red';
                        petInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: petInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'hobbyCheck') {
                        hobbyErrorMsg.style.display = "block";
                        hobbyErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        hobbyErrorMsg.style.color = 'red';
                        hobbyInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: hobbyInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'pictureCheck') {
                        pictureErrorMsg.style.display = "block";
                        pictureErrorMsg.innerHTML = "필수 입력 사항입니다.";
                        pictureErrorMsg.style.color = 'red';
                        const picture_container = document.querySelector('.picture_container');
                        window.scrollTo({
                            top: picture_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'salaryCheck') {
                        SalaryErrorMsg.style.display = 'block';
                        SalaryErrorMsg.innerHTML = "연봉을 확인해주세요.";
                        SalaryErrorMsg.style.color = "red";
                        SalaryInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: SalaryInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'phoneCheck') {
                        phoneErrorMsg.style.display = 'block';
                        phoneErrorMsg.innerHTML = "인증을 진행해주세요.";
                        phoneErrorMsg.style.color = "red";
                        phoneInput_container.style.border = `1px solid ${pointColor}`;
                        window.scrollTo({
                            top: phoneInput_container.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'datingsytleCheck') {
                        datingsStyleErrorMsg.style.display = 'block';
                        datingsStyleErrorMsg.innerHTML = "나의 연애 스타일을 모두 선택해주세요.";
                        datingsStyleErrorMsg.style.color = "red";
                        window.scrollTo({
                            top: datingsStyleErrorMsg.offsetTop - targetHeight,
                            behavior: 'smooth'
                        });
                    } else if (key === 'letterCheck') {
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
            formData.append('occupationFileName', occupationFileNameValue);
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
            formData.append('picture_1Name', picture_1NameValue);
            formData.append('picture_2', picture_2Value);
            formData.append('picture_2Name', picture_2NameValue);
            formData.append('picture_3', picture_3Value);
            formData.append('picture_3Name', picture_3NameValue);
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
            formData.append('signupStatus', signupStatus);


            fetch('/signupProc', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.result === 'success') {
                    if(signupStatus === 'REJECT') {
                        alert('회원가입 재신청이 완료되었습니다. \n심사까지 최대 3일이 소요됩니다.');
                    } else {
                        alert('프로필 저장이 완료되었습니다.');
                    }
                    event.preventDefault();
                    window.location.href = `${hostURL}myprofile/profile`;
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

});
