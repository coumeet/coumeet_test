
let paymentStatus = false;
let receivedOffer = false;
let loginStatus = false;
let loginedUserGender = '';
let occupationInfo = '';
let signupConfirmRecog = '';
let personDetailSignupStatus;
let matchingOfferType = '';
let selectedReviewContents = [];
let selectedReportContents = [];

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

            datingStyleData = data.datingStyleData;

            // console.log('areaData:',areaData);

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
    // Function : 로그인 상태 체크
    function loginStatusRequest() {
        // 로그인 상태를 체크한다.
        fetch('/loginStatusProC', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // 요청 본문 데이터
            })
        })
        .then(response => response.json()) // 응답을 JSON으로 파싱
        .then(data => {
            // console.log(data); // 데이터를 처리
            
            if(data.result === 'Not Logged in'){
                loginStatus = false;
            } else {
                if(data[0].id){
                    loginStatus = true;
                    loginedUserGender = data[0].gender;
                    signupConfirmRecog = data[0].signupConfirmdate;
                    personDetailSignupStatus = data[0].signupStatus;
                    console.log(`personDetailSignupStatus:${personDetailSignupStatus}`);
                    // console.log(`loginedUserGender:${loginedUserGender}`);
                    // console.log(`signupConfirmRecog:${signupConfirmRecog}`);
                }
            }
        })
        .catch(error => {
            console.error(error); // 오류 처리
        });
    }

    loginStatusRequest(); // 로그인 상태 체크

    // Function : 찜한 Count 정보 요청
    function favoriteCountRequest() {
        fetch(`/favoriteCountProc`, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            })
        })
        .then(response => response.json())
        .then(data => {
            const favoriteCountValue = data[0].selectedIdCount;
            const favoriteCount = document.querySelector('.favoriteCount');
            favoriteCount.textContent = favoriteCountValue;

            // 로그인한 이용자가 이미 선택을 했을 경우
            const selectedTologinUser = data[0].selectedTologinUser;
            if(selectedTologinUser === 1) {
                const heartIcon = document.querySelector('.favoriteCount_container i') ;
                heartIcon.classList.remove('fa-regular');
                heartIcon.classList.add('fa-solid');
                heartIcon.style.color = '#d72828';
            }
        })    
        .catch(error => {
            console.log(`찜 Count 불러오기 Error : ${error}`);
        });
    }

    favoriteCountRequest();

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

    let userData = []; // 이용자 정보를 받아서 공용으로 쓰기 위한 변수

    // Function : 이용자 상세 정보 요청
    function personDetailRequest() {
        fetch(`/personInfoProc`, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            })
        })
        .then(response => response.json())
        .then(data => {
            userData = data['data'][0];
            // console.log(`userData.id = ${userData.id}`);

            //// 받은 데이터들을 집어넣기

            // 나를 소개합니다 → 기본 정보
            const lettertMsg = document.querySelector('.lettertMsg');
            lettertMsg.innerHTML = userData.letter;

            const introduceMeInfoImg = document.querySelector('.introduceMeInfoImg');
            if(userData.gender === '남자') {
                introduceMeInfoImg.src = `img/14.png`;
            } else if (userData.gender === '여자') {
                introduceMeInfoImg.src = `img/15.png`;
            }

            const nicknameContent = document.querySelector('#nicknameContent');
            nicknameContent.textContent = userData.nickname;

            const genderContent = document.querySelector('#genderContent');
            genderContent.textContent = userData.gender;

            const ageContent = document.querySelector('#ageContent');
            ageContent.textContent = userData.age + '살';

            // const occupationContent = document.querySelector('#occupationContent');
            // occupationContent.textContent = userData.occupation;
            // occupationInfo = userData.occupation;

            const occupationDetailContent = document.querySelector('#occupationDetailContent');
            occupationDetailContent.textContent = userData.occupationDetail;

            const regionContent = document.querySelector('#regionContent');
            regionContent.textContent = userData.regionCity + " " + userData.regionGu;

            const heightContent = document.querySelector('#heightContent');
            heightContent.textContent = userData.height+"cm";

            const MBTIContent = document.querySelector('#MBTIContent');
            MBTIContent.textContent = userData.mbti;

            const styleContent = document.querySelector('#styleContent');
            styleContent.textContent = userData.style;

            const eyetypeContent = document.querySelector('#eyetypeContent');
            eyetypeContent.textContent = userData.eyeType;

            const bodyTypeContent = document.querySelector('#bodyTypeContent');
            bodyTypeContent.textContent = userData.bodyType;

            const faceTypeContent = document.querySelector('#faceTypeContent');
            faceTypeContent.textContent = userData.faceType;

            const lipsContent = document.querySelector('#lipsContent');
            lipsContent.textContent = userData.lips;

            const personality_container = document.querySelector('.personality_container');
            const personalityArray = userData.personality.split(', ');
            personalityArray.forEach(value => {
                const introduceMeInfo_boxContent = document.createElement('div');
                introduceMeInfo_boxContent.classList.add('introduceMeInfo_boxContent');
                introduceMeInfo_boxContent.setAttribute('id', 'personalityBox');
                introduceMeInfo_boxContent.textContent = value;
                personality_container.appendChild(introduceMeInfo_boxContent);
            });

            const drinkingContent = document.querySelector('#drinkingContent');
            drinkingContent.textContent = userData.drinking;

            const smokingContent = document.querySelector('#smokingContent');
            smokingContent.textContent = userData.smoking;

            const religionContent = document.querySelector('#religionContent');
            religionContent.textContent = userData.religion;

            const agePreferenceContent = document.querySelector('#agePreferenceContent');
            agePreferenceContent.textContent = userData.agePreference;

            const relationshipContent = document.querySelector('#relationshipContent');
            relationshipContent.textContent = userData.relationship;

            const distanceContent = document.querySelector('#distanceContent');
            distanceContent.textContent = userData.distance;

            const petContent = document.querySelector('#petContent');
            petContent.textContent = userData.pet;

            const hobby_container = document.querySelector('.hobby_container');
            const hobbyArray = userData.hobby.split(', ');
            hobbyArray.forEach(value => {
                const introduceMeInfo_boxContent = document.createElement('div');
                introduceMeInfo_boxContent.classList.add('introduceMeInfo_boxContent');
                introduceMeInfo_boxContent.textContent = value;
                hobby_container.appendChild(introduceMeInfo_boxContent);
            });

            // 나를 소개합니다 → 나의 연애 스타일은?
            const statusReportBtns = document.querySelectorAll('#statusReportBtn');
            statusReportBtns.forEach((btn) => {
                if(btn.textContent === userData.statusReport) {
                    btn.classList.add('selected');
                }
            });

            const contactTermsBtns = document.querySelectorAll('#contactTermsBtn');
            contactTermsBtns.forEach((btn) => {
                if(btn.textContent === userData.contactTerms) {
                    btn.classList.add('selected');
                }
            });

            const datingCostBtns = document.querySelectorAll('#datingCostBtn');
            datingCostBtns.forEach((btn) => {
                if(btn.textContent === userData.datingCost) {
                    btn.classList.add('selected');
                }
            });

            const hobbyPreferenceBtns = document.querySelectorAll('#hobbyPreferenceBtn');
            hobbyPreferenceBtns.forEach((btn) => {
                if(btn.textContent === userData.hobbyPreference) {
                    btn.classList.add('selected');
                }
            });

            const datingStylesBtns = document.querySelectorAll('#datingStylesBtn');
            datingStylesBtns.forEach((btn) => {
                if(btn.textContent === userData.datingStyles) {
                    btn.classList.add('selected');
                }
            });

            const mannerBtns = document.querySelectorAll('#mannerBtn');
            mannerBtns.forEach((btn) => {
                if(btn.textContent === userData.manner) {
                    btn.classList.add('selected');
                }
            });

            const datingTermBtns = document.querySelectorAll('#datingTermBtn');
            datingTermBtns.forEach((btn) => {
                if(btn.textContent === userData.datingTerm) {
                    btn.classList.add('selected');
                }
            });

            const anniversaryBtns = document.querySelectorAll('#anniversaryBtn');
            anniversaryBtns.forEach((btn) => {
                if(btn.textContent === userData.anniversary) {
                    btn.classList.add('selected');
                }
            });

            const contactPreferenceBtns = document.querySelectorAll('#contactPreferenceBtn');
            contactPreferenceBtns.forEach((btn) => {
                if(btn.textContent === userData.contactPreference) {
                    btn.classList.add('selected');
                }
            });

            // 매너 후기 불러오기
            UserMannersHandler(userData);

            const comfortStyleBtns = document.querySelectorAll('#comfortStyleBtn');
            comfortStyleBtns.forEach((btn) => {
                if(btn.textContent === userData.comfortStyle) {
                    btn.classList.add('selected');
                }
            });

            //추가 정보 
            const picture_container = document.querySelector('.picture_container');
            const img1 = document.createElement('img');
            img1.src = `../backend/uploads/${userData.id}/${userData.picture_1}`;
            img1.alt = '';
            picture_container.appendChild(img1);

            const img2 = document.createElement('img');
            img2.src = `../backend/uploads/${userData.id}/${userData.picture_2}`;
            img2.alt = '';
            picture_container.appendChild(img2);

            const img3 = document.createElement('img');
            img3.src = `../backend/uploads/${userData.id}/${userData.picture_3}`;
            img3.alt = '';
            picture_container.appendChild(img3);

            // 이미지 드래그 할 수 없도록 설정
            const pictures = document.querySelectorAll('.picture_container img')
            // console.log(`pictures:${pictures}`);
            pictures.forEach((pic => {
                pic.addEventListener('dragstart', function(e) {
                    e.preventDefault();
                });
            }))

            const nameInfoContent = document.querySelector('#nameInfoContent');
            // nameInfoContent.textContent = userData.name;

            const phoneInfoContent = document.querySelector('#phoneInfoContent');
            // phoneInfoContent.textContent = userData.phone;

            const occupationContent = document.querySelector('#occupationContent');
            occupationContent.textContent = userData.occupation;

            const salaryInfoContent = document.querySelector('#salaryInfoContent');
            const formattedSalary = parseInt(userData.salary).toLocaleString();
            salaryInfoContent.textContent = formattedSalary +'만원';

            // 상대방에게 열람을 신청했을 경우
            openStatus = data['openStatus'];
            // 상대방에게 매칭 신청을 했을 경우
            offerStatus = data['offerStatus'];
            // 상대방이 매칭을 신청했을 경우
            receivedOffer = data['receivedOffer'];
            // 상대방과 매칭이 되었을 경우
            matchingStatus = data['matchingStatus'];
            // console.log(`openStatus:${openStatus}, offerStatus:${offerStatus}, receivedOffer:${receivedOffer}, matchingStatus:${matchingStatus}`);

            additionalInfoAndBtnHandler(openStatus, offerStatus, receivedOffer, matchingStatus, userData);

        })
        .catch(error => {
            console.log(`이용자 상세 정보 불러오기 Error : ${error}`);
        });
    }

    // Function : 이용자의 매너 후기 정보 가져오기
    function UserMannersHandler(userData) {
        console.log('이용자 매너 후기 정보 불러오기');
        // 서버로 부터 정보를 받아오기
        fetch(`/mannerReivewProc`, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: userData.id,
            })
        })
        .then(response => response.json())
        .then(data => {
            const reviewList = data['reviewList'];
            const countReviewContents = data['countReviewContents'];

            // console.log('Review List:', reviewList);
            // console.log('countReviewContents:', countReviewContents);

            // 매너 후기 정보 기준을 받아오기(reviewList)
            // Review List 데이터에서 content 정보를 추출
            const reviewContents = [];
            for (let i = 1; reviewList[0][`content_${i}`]; i++) {
                reviewContents.push(reviewList[0][`content_${i}`]);

                // 새로운 요소를 생성
                const mannerDetailContainer = document.createElement('div');
                mannerDetailContainer.classList.add('mannerDetail_container');

                const mannerTitle = document.createElement('span');
                mannerTitle.classList.add('mannersInfoTitle');
                mannerTitle.textContent = `${i}. ${reviewList[0][`content_${i}`]}`;

                const userGroupIcon = document.createElement('i');
                userGroupIcon.classList.add('fa-solid', 'fa-user-group');
                userGroupIcon.style.color = '#000000';

                const mannerResult = document.createElement('span');
                mannerResult.classList.add('mannersInfoResult');

                if(countReviewContents) {
                    if(countReviewContents[`${reviewList[0][`content_${i}`]}`]) {
                        mannerResult.textContent = '(' + countReviewContents[`${reviewList[0][`content_${i}`]}`] + ')';
                    } else {
                        mannerResult.textContent = '(0)';  // 초기값으로 0 또는 원하는 값 설정
                    }
                }
                else {
                    mannerResult.textContent = '(0)'; 
                }

                // 요소를 DOM에 추가
                mannerDetailContainer.appendChild(mannerTitle);
                mannerDetailContainer.appendChild(userGroupIcon);
                mannerDetailContainer.appendChild(mannerResult);

                // mannersInfo_container에 추가
                const mannersInfoContainer = document.querySelector('.mannersInfo_container');
                mannersInfoContainer.appendChild(mannerDetailContainer);
            }

            // 이용자의 매너 후기 정보를 가져와서 적용시키기(userReviews)
        })
        .catch(error => {
            console.log(`매너 후기 정보 불러오기 Error : ${error}`);
        });    
    }

    // 이용자 정보 요청하여 받기(서버통신)
    personDetailRequest();


    const favoriteCount_container = document.querySelector('.favoriteCount_container');

    // 찜하기 버튼 클릭 시
    favoriteCount_container.addEventListener('click', (e) => {
        e.preventDefault();

        console.log(`찜하기 버튼 클릭!`);

        // 비회원 일 경우
        if(loginStatus === false) {
            window.location.href = `${hostURL}login`;
        } 
        // 회원 일 경우
        else if(loginStatus === true) {

            if(personDetailSignupStatus === 'CONFIRM') {
                // 서버 요청
                fetch(`/favoriteIconBtnProc`, {
                    method : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        selectedId: userData.id,
                    })
                })
                .then(response => response.json())
                .then(data => {
                    const heartIcon = document.querySelector('.favoriteCount_container i') ;
                    // 찜하기 성공
                    if(data['result'] === 'insert') {
                        // 해당 찜하기 버튼(♡→♥) 변경
                        heartIcon.classList.remove('fa-regular');
                        heartIcon.classList.add('fa-solid');
                        heartIcon.style.color = '#d72828';
                        favoriteCountRequest();
                    } 
                    // 이미 찜한 경우
                    else if(data['result'] === 'delete') {
                        // 해당 찜하기 버튼(♥→♡) 변경
                        heartIcon.classList.remove('fa-solid');
                        heartIcon.classList.add('fa-regular');
                        heartIcon.style.color = '#db7c8d';
                        favoriteCountRequest();
                    }
                })
                .catch(error => {
                    console.log(`찜하기 Error : ${error}`);
                });        
            } else {
                alert('회원 상태를 확인해주세요');
                window.location.href = `${hostURL}myprofile/profile`;
            }
        }
    });


    ////// 추가 정보 열람을 클릭했을 때 //////
    const additionalInfomBtn = document.querySelector('#additionalInfomBtn');

    additionalInfomBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // console.log(`추가 정보 열람하기 버튼 선택! : ${userData.id}`);

        //로그인이 되지 않았을 경우
        if(loginStatus === false) {
            window.location.href = `${hostURL}login`;
        } 
        else {
            // 회원가입 승인이 되지 않았을 경우
            if(personDetailSignupStatus !== 'CONFIRM') {
                alert('회원 상태를 확인해주세요');
                window.location.href = `${hostURL}myprofile/profile`;      
            } 
            else {

                matchingOfferType = 'additional_info';
                console.log('matchingOfferType:',matchingOfferType);

                // 포인트 사용 정보 받아오기
                fetch(`/pointUsageProC`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: userData.id,
                        matchingOfferType: matchingOfferType,
                        gender: userData.gender,
                        type: '사용',
                    })
                })
                .then(response => response.json())
                .then(data => {
                    const userPoint = data['userPoint'];
                    const paymentPointAmount = data['paymentPointAmount'];
                    const remainUserPoint = data['remainUserPoint'];

                    console.log(`userPoint:${userPoint}`);
                    console.log(`paymentPointAmount:${paymentPointAmount}`);
                    console.log(`remainUserPoint:${remainUserPoint}`);

                    // 포인트 정보 추가
                    document.querySelector('#openInfoUserPoint').textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                    document.querySelector('#openInfoUsagePoint').textContent = '-'+ paymentPointAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                    document.querySelector('#openInfoRemainPoint').textContent = remainUserPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';

                    // 이용자 정보 추가
                    document.querySelector('#openInfoPopupSubTitle').textContent = `‘${userData.nickname}’님과 매칭을 신청하시겠습니까?`;
                })
                .catch(error => {
                    console.log(`추가 정보 열람, 포인트 사용 정보 받아오기 Error : ${error}`);
                });

                const openInfoPopupContainer = document.querySelector('#openInfoPopupContainer');
                popupOpenHandler(openInfoPopupContainer);
            }
        }
    });

    // 완료 버튼 클릭 시(추가 정보 열람을 최종적으로 요청했을 경우)
    const openInfoConfirmBtn = document.querySelector('#openInfoConfirmBtn');
    openInfoConfirmBtn.addEventListener('click', (e) => {
        console.log('추가 정보 열람 완료 버튼 클릭!');
        e.preventDefault();

        const confirmMSG = '추가 정보 열람은 포인트가 사용됩니다. 그래도 진행하시겠습니까?';

        // 사용자가 "확인"을 눌렀을 때 실행할 코드
        // 서버에 추가 정보 열람하기 신청하고 그 결과값을 받기
        if (window.confirm(confirmMSG)) {
            fetch(`/additionalInfoProC`, {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    selectedId: userData.id,
                    gender: loginedUserGender,
                })
            })
            .then(response => response.json())
            .then(data => {
                const result = data['result'];
                console.log(`result : ${result}`);

                // 포인트가 부족할 경우
                if(result === 'POINT NOT ENOUGH') {
                    window.alert('포인트가 부족합니다. 포인트를 충전해주세요');
                    window.location.href = `${hostURL}myprofile/point`;      
                } 
                // 정상적으로 진행이 되었을 경우
                else if(result === 'SUCCESS') {
                    window.alert('추가 정보가 열람되었습니다.');
                    openStatus = true;
                    location.reload();
                    // additionalInfoAndBtnHandler(openStatus, offerStatus, receivedOffer, matchingStatus);
                } 
                // 그 외에 상황일 경우
                else {
                    alert('알 수 없는 오류가 발생하였습니다. 새로고침을 해주세요.');
                }
            })
            .catch(error => {
                console.log(`추가 정보 열람 Error : ${error}`);
            });
        }
    });

    // 추가 정보 열람 팝업 X버튼 클릭 시
    const openInfoXBtn = document.querySelector('#openInfoXBtn');
    openInfoXBtn.addEventListener('click', (e) => {
        console.log('매칭 신청 팝업 X버튼 클릭!');
        popUpXBtnClickHandler(openInfoPopupContainer);
    });

    ////// 매칭 신청하기를 클릭했을 때 //////
    const matchingOfferBtn = document.querySelector('#matchingOfferBtn');

    matchingOfferBtn.addEventListener('click', (e) => {
        console.log('매칭 신청하기 클릭!');    

        // 로그인 여부 확인
        if(loginStatus === false) {
            window.location.href = `${hostURL}login`;
        } 
        else {
            // 회원가입 승인 여부 확인
            if(personDetailSignupStatus !== 'CONFIRM') {
                alert('회원 상태를 확인해주세요');
                window.location.href = `${hostURL}myprofile/profile`;  
            } 
            else {
                // let confirmMSG = '';
                occupationInfo = userData.occupation;
            
                if(occupationInfo === '일반 직업') {
                    matchingOfferType = 'matchingOffer_normal';
                } else if(occupationInfo === '대기업' || occupationInfo === '공무원(6급 이하)' || occupationInfo === '공기업' || occupationInfo === '교직원') {
                    matchingOfferType = 'matchingOffer_middle';
                } else if(occupationInfo === '전문직(변호사, 검판사 등)' || occupationInfo === '공무원(5급 이상)') {
                    matchingOfferType = 'matchingOffer_high';
                }

                console.log('occupationInfo:',occupationInfo);
                console.log('matchingOfferType:',matchingOfferType);

                // 포인트 사용 정보 받아오기
                fetch(`/pointUsageProC`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: userData.id,
                        matchingOfferType: matchingOfferType,
                        gender: userData.gender,
                        type: '사용',
                    })
                })
                .then(response => response.json())
                .then(data => {
                    const userPoint = data['userPoint'];
                    const paymentPointAmount = data['paymentPointAmount'];
                    const remainUserPoint = data['remainUserPoint'];

                    // console.log(`userPoint:${userPoint}`);
                    // console.log(`paymentPointAmount:${paymentPointAmount}`);
                    // console.log(`remainUserPoint:${remainUserPoint}`);

                    // 포인트 정보 추가
                    document.querySelector('#matchingOfferUserPoint').textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                    document.querySelector('#matchingOfferUsagePoint').textContent = '-' + paymentPointAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                    document.querySelector('#matchingOfferRemainPointt').textContent = remainUserPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';

                    // 이용자 정보 추가
                    document.querySelector('#matchingOfferPopupSubTitle').textContent = `‘${userData.nickname}’님과 매칭을 신청하시겠습니까?`;
                    document.querySelector('#matchingOfferUsagePointSubtitle').textContent = `(매칭 신청 / ${userData.occupation})`;
                })
                .catch(error => {
                    console.log(`매칭 신청, 포인트 사용 정보 받아오기 Error : ${error}`);
                });

                // 팝업창 띄우기
                const matchingOfferPopupContainer = document.querySelector('#matchingOfferPopupContainer');
                popupOpenHandler(matchingOfferPopupContainer);
            }
        }
    });

    // 매칭 신청하기 완료 버튼 클릭 시(매칭 신청을 최종적으로 요청했을 경우)
    const matchingOfferConfirmBtn = document.querySelector('#matchingOfferConfirmBtn');
    matchingOfferConfirmBtn.addEventListener('click', (e) => {
        console.log('매칭 신청 완료 버튼 클릭!');
        e.preventDefault();

        const confirmMSG = '매칭 신청은 포인트가 사용됩니다. 그래도 진행하시겠습니까?';
        const loginedUserGender = userData.gender;

        if (window.confirm(confirmMSG)) {
            fetch(`/matchingOfferProC`, {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    selectedId: userData.id,
                    gender: loginedUserGender,
                    matchingOfferType: matchingOfferType,
                })
            })
            .then(response => response.json())
            .then(data => {
        
                const result = data['result'];
                console.log(`result : ${result}`);
        
                // 로그인이 되어 있지 않을 경우
                if(result === 'NOT LOGIN') {
                    window.location.href = `${hostURL}login`;
                }  
                // 이미 신청한 사람일 경우 
                else if(result === 'HISTORY') {
                    alert('이미 매칭 기록(신청, 매칭, 거절)이 있는 이용자입니다.');
                } 
                else {
                    // 포인트가 부족할 경우
                    if(result === 'POINT NOT ENOUGH') {
                        window.alert('포인트가 부족합니다. 포인트를 충전해주세요');
                        window.location.href = `${hostURL}myprofile/point`;      
                    } 
                    // 정상적으로 진행이 되었을 경우
                    else if(result === 'SUCCESS') {
                        window.alert('매칭 신청이 완료되었습니다.');
                        offerStatus = true;
                        window.location.href = `${hostURL}dashboard?categoryRecog=offer`;
                    } 
                    // 그 외에 상황일 경우
                    else {
                        alert('알 수 없는 오류가 발생하였습니다. 새로고침을 해주세요.');
                        window.location.href = `${hostURL}dashboard?categoryRecog=open`;
                    }
                }
            })
            .catch(error => {
                console.log(`매칭 신청하기 Error : ${error}`);
            });
        }
    });

    // 매칭 신청 팝업 X버튼 클릭 시
    const matchingOfferXBtn = document.querySelector('#matchingOfferXBtn');
    matchingOfferXBtn.addEventListener('click', (e) => {
        console.log('매칭 신청 팝업 X버튼 클릭!');
        popUpXBtnClickHandler(matchingOfferPopupContainer);
    });


    // 추가 정보 열람 여부에 따른 Handler
    function additionalInfoAndBtnHandler(openStatus, offerStatus, receivedOffer, matchingStatus, userData) {
        const nameInfoContent = document.querySelector('#nameInfoContent'); // 이름 정보
        const phoneInfoContent = document.querySelector('#phoneInfoContent'); // 연락처 정보
        const salaryInfoContent = document.querySelector('#salaryInfoContent'); // 연봉 정보
        const occupationContent = document.querySelector('#occupationContent');
        const pictures = document.querySelectorAll('.picture_container img');
        const additionalInfoBtn = document.getElementById('additionalInfomBtn');
        const matchingOfferBtn = document.querySelector('#matchingOfferBtn');
        const statusMsg = document.querySelector('.statusMsg');

        const confirmBtn_container = document.querySelector('.confirmBtn_container');

        const occupationInfo = userData.occupation; // 직업 정보 넣기
        console.log('occupationInfo:',occupationInfo);

        if(occupationInfo === '일반 직업') {
            matchingOfferType = 'matchingOffer_normal';
        } else if(occupationInfo === '대기업' || occupationInfo === '공무원(6급 이하)' || occupationInfo === '공기업' || occupationInfo === '교직원') {
            matchingOfferType = 'matchingOffer_middle';
        } else if(occupationInfo === '전문직(변호사, 검판사 등)' || occupationInfo === '공무원(5급 이상)') {
            matchingOfferType = 'matchingOffer_high';
        }

        console.log('matchingOfferType:',matchingOfferType);

        // 매칭이 되었을 경우
        if(matchingStatus === true) {
            // nameInfoContent.style.display = 'block';
            // phoneInfoContent.style.display = 'block';
            salaryInfoContent.style.display = 'block';
            occupationContent.style.display = 'block';
            statusMsg.style.display = 'block';
            statusMsg.textContent = '(상대방과 매칭 완료)';
            pictures.forEach((picture) => {
                picture.classList.add('pay');
            });

            const confirmBtns = document.querySelectorAll('.confirmBtn_container button');
            confirmBtns.forEach((btn) => {
                btn.remove();
            });

            // 후기, 신고 진행 여부 확인
            let reviewCheckRecog = false;
            let reportCheckRecog = false;
            fetch(`/reviewReportHistoryCheckProC`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: userData.id,
                })
            })
            .then(response => response.json())
            .then(data => {
                // console.log(`data['reviewCheckRecog'] : ${data['reviewCheckRecog']}`);
                // console.log(`data['reportCheckRecog'] : ${data['reportCheckRecog']}`);

                reviewCheckRecog = data['reviewCheckRecog'];
                reportCheckRecog = data['reportCheckRecog'];


                const reviewBtn = document.createElement('button');
                reviewBtn.className = 'confirmBtn';
                reviewBtn.id = 'reviewBtn';
                reviewBtn.textContent = '후기작성';
        
                if(reviewCheckRecog === true) {
                    reviewBtn.disabled = true;
                    reviewBtn.style.cursor = 'default';
                    reviewBtn.style.pointerEvents = 'none';
                    reviewBtn.textContent = '후가작성 완료';
                } 
        
                confirmBtn_container.appendChild(reviewBtn);
                
                // 후기작성 버튼 클릭 시
                reviewBtn.addEventListener('click', (e) => {
                    e.preventDefault();

                    if(personDetailSignupStatus === 'CONFIRM') {
                        const reviewPopupContainer = document.querySelector('#reviewPopupContainer');
                        popupOpenHandler(reviewPopupContainer);
        
                        const reviewErrorMsg = document.querySelector('#reviewErrorMsg');
                        reviewErrorMsg.style.display = 'none';
        
                        // 토글 내용 불러오기
                        fetch(`/reviewcontentProC`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
        
                            const reviewPopupSubTitle = document.querySelector('#reviewPopupSubTitle');
                            reviewPopupSubTitle.textContent = `매칭 이후 ‘${userData.nickname}’님은 어땠나요?`;
        
                            const contentsArray = [];
                            // content_x 프로퍼티를 순회하며 배열에 추가
                            for (let i = 1; data[0]['content_' + i] !== undefined; i++) {
                                contentsArray.push(data[0]['content_' + i]);
                            }
        
                            // 동적으로 생성할 부모 요소를 선택합니다.
                            const reviewToggle_container = document.querySelector('#reviewToggle_container');
        
                            // 토글 컨테이너의 요소를 모두 지우기
                            while (reviewToggle_container.firstChild) {
                                reviewToggle_container.removeChild(reviewToggle_container.firstChild);
                            }
            
                            // contentsArray 배열의 각 요소에 대해 반복합니다.
                            contentsArray.forEach((content, index) => {
                                // 새로운 요소를 생성합니다.
                                const toggleContentContainer = document.createElement('div');
                                toggleContentContainer.classList.add('toggleContent_container');
        
                                const circleIcon = document.createElement('i');
                                circleIcon.classList.add('fa-regular', 'fa-circle');
                                circleIcon.setAttribute('id', 'toggleBtnIcon');
                                circleIcon.style.color = '#000000';
        
                                const toggleContent = document.createElement('span');
                                toggleContent.classList.add('toggleContent');
                                toggleContent.textContent = content;
        
                                // 부모 요소에 자식 요소를 추가합니다.
                                toggleContentContainer.appendChild(circleIcon);
                                toggleContentContainer.appendChild(toggleContent);
                                reviewToggle_container.appendChild(toggleContentContainer);
        
                                toggleContentContainer.addEventListener('click', (e) => {
                                    const icon = toggleContentContainer.querySelector('#toggleBtnIcon');
                                    // console.log(`iconClassList:${icon.classList}`);
                                    if(icon) {
                                        if(icon.classList.contains('fa-regular')) {
                                            icon.classList.remove('fa-regular', 'fa-circle');
                                            icon.classList.add('fa-solid', 'fa-circle-check');
                                            icon.style.color = '#000000';
                                            selectedReviewContents.push(e.target.textContent);
                                        } else {
                                            icon.classList.remove('fa-solid', 'fa-circle-check');
                                            icon.classList.add('fa-regular', 'fa-circle');
                                            icon.style.color = '#000000';
                                            const index = selectedReviewContents.indexOf(e.target.textContent);
                                            selectedReviewContents.slice(e.target.textContent);
                                            if (index !== -1) {
                                                selectedReviewContents.splice(index, 1);
                                            }
                                        }
                                        console.log(`selectedReviewContents:${selectedReviewContents}`);
                                    }
                                });
                            });
                            
                        })
                        .catch(error => {
                            console.log(`리뷰 정보 불러오기 Error : ${error}`);
                        });

                    } else {
                        alert('회원 상태를 확인해주세요');
                        window.location.href = `${hostURL}myprofile/profile`;
                    }
                });

                const reportBtn = document.createElement('button');
                reportBtn.className = 'confirmBtn';
                reportBtn.id = 'reportBtn';
                reportBtn.textContent = '신고하기';
                confirmBtn_container.appendChild(reportBtn);

                if(reportCheckRecog === true) {
                    reportBtn.disabled = true;
                    reportBtn.style.cursor = 'default';
                    reportBtn.style.pointerEvents = 'none';
                    reportBtn.textContent = '신고하기 완료';
                } 

                // 신고하기 버튼 클릭 시
                reportBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('신고하기 버튼 클릭!');

                    if(personDetailSignupStatus === 'CONFIRM') {
                        const reportPopupContainer = document.querySelector('#reportPopupContainer');
                        popupOpenHandler(reportPopupContainer);
        
                        // 후기 글자 입력 초기화
                        const reportInput = document.querySelector('#reportInput');
                        reportInput.value = '';
                        const reportNOC = document.querySelector('#reportNOC');
                        reportNOC.textContent = '0/200';
        
                        // 신고하기 토글 목록 불러오기
                        fetch(`/reportcontentProC`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            
                            const reportPopupSubTitle = document.querySelector('#reportPopupSubTitle');
                            reportPopupSubTitle.textContent = `‘${userData.nickname}’님은 어떤 문제가 있었나요?`;
        
                            const contentsArray = [];
                            // content_x 프로퍼티를 순회하며 배열에 추가
                            for (let i = 1; data[0]['content_' + i] !== undefined; i++) {
                                contentsArray.push(data[0]['content_' + i]);
                            }
        
                            // 동적으로 생성할 부모 요소를 선택합니다.
                            const reportToggle_container = document.querySelector('#reportToggle_container');
        
                            // 토글 컨테이너의 요소를 모두 지우기
                            while (reportToggle_container.firstChild) {
                                reportToggle_container.removeChild(reportToggle_container.firstChild);
                            }

                            // contentsArray 배열의 각 요소에 대해 반복합니다.
                            contentsArray.forEach((content, index) => {
                                // 새로운 요소를 생성합니다.
                                const toggleContentContainer = document.createElement('div');
                                toggleContentContainer.classList.add('toggleContent_container');
        
                                const circleIcon = document.createElement('i');
                                circleIcon.classList.add('fa-regular', 'fa-circle');
                                circleIcon.setAttribute('id', 'toggleBtnIcon');
                                circleIcon.style.color = '#000000';
        
                                const toggleContent = document.createElement('span');
                                toggleContent.classList.add('toggleContent');
                                toggleContent.textContent = content;
        
                                // 부모 요소에 자식 요소를 추가합니다.
                                toggleContentContainer.appendChild(circleIcon);
                                toggleContentContainer.appendChild(toggleContent);
                                reportToggle_container.appendChild(toggleContentContainer);
        
                                toggleContentContainer.addEventListener('click', (e) => {
                                    const icon = toggleContentContainer.querySelector('#toggleBtnIcon');
                                    // console.log(`iconClassList:${icon.classList}`);
                                    if(icon) {
                                        if(icon.classList.contains('fa-regular')) {
                                            icon.classList.remove('fa-regular', 'fa-circle');
                                            icon.classList.add('fa-solid', 'fa-circle-check');
                                            icon.style.color = '#000000';
                                            selectedReportContents.push(e.target.textContent);
                                        } else {
                                            icon.classList.remove('fa-solid', 'fa-circle-check');
                                            icon.classList.add('fa-regular', 'fa-circle');
                                            icon.style.color = '#000000';
                                            const index = selectedReportContents.indexOf(e.target.textContent);
                                            selectedReportContents.slice(e.target.textContent);
                                            if (index !== -1) {
                                                selectedReportContents.splice(index, 1);
                                            }
                                        }
                                        console.log(`selectedReportContents:${selectedReportContents}`);
                                    }
                                });
        
                                // 글자수 제한 넣기
                                const reportInput = document.getElementById('reportInput');
                                const reportNOC = document.getElementById('reportNOC');
                                const REPORT_MAX_NAME_LENGTH = 200; 
        
                                reportInput.addEventListener('input', function(event) {
                                    const inputValue = event.target.value;
                                    if (inputValue.length <= REPORT_MAX_NAME_LENGTH) {
                                        // nickNameInput.value = sanitizedValue; // 띄어쓰기가 제거된 값을 입력란에 설정
                                        reportNOC.textContent = `${inputValue.length}/${REPORT_MAX_NAME_LENGTH}`;
                                    } else {
                                        reportInput.value = inputValue.slice(0, REPORT_MAX_NAME_LENGTH); // 최대 길이 초과 시 문자열 자르기
                                        reportNOC.textContent = `${REPORT_MAX_NAME_LENGTH}/${REPORT_MAX_NAME_LENGTH}`;
                                    }
                                });
                            });
                            

                        })
                        .catch(error => {
                            console.log(`신고하기 정보 불러오기 Error : ${error}`);
                        });
                    } else {
                        alert('회원 상태를 확인해주세요');
                        window.location.href = `${hostURL}myprofile/profile`;
                    }
                });
                
            })
            .catch(error => {
                console.log(`후기 작성 여부 확인 Error : ${error}`);
            });

            // const reviewBtn = document.createElement('button');
            // reviewBtn.classList.add('confirmBtn');
            // reviewBtn.setAttribute('id', 'reviewBtn');
            // reviewBtn.textContent = '후기작성';

            // const reportBtn = document.createElement('button');
            // reportBtn.classList.add('confirmBtn');
            // reportBtn.setAttribute('id', 'reportBtn');
            // reportBtn.textContent = '신고하기';

            confirmBtn_container.appendChild(reviewBtn);
            confirmBtn_container.appendChild(reportBtn);

            statusMsg.style.display = 'block';
            statusMsg.textContent = '(진행중 : 상대방과 매칭 완료)';
        }
        // 상대방이 매칭을 신청했을 경우
        else {
            if(receivedOffer === true) {
                nameInfoContent.style.display = 'none';
                phoneInfoContent.style.display = 'none';
                salaryInfoContent.style.display = 'block';
                occupationContent.style.display = 'block';
                pictures.forEach((picture) => {
                    picture.classList.add('pay');
                });
                statusMsg.style.display = 'block';
                statusMsg.textContent = '(진행중 : 상대방에게 매칭 신청 받음)';

                const confirmBtns = document.querySelectorAll('.confirmBtn_container button');
                confirmBtns.forEach((btn) => {
                    btn.remove();
                });
        
                const acceptBtn = document.createElement('button');
                acceptBtn.classList.add('confirmBtn');
                acceptBtn.setAttribute('id', 'acceptBtn');
                acceptBtn.textContent = '수락하기';

                // 수락하기 버튼 클릭 시
                acceptBtn.addEventListener('click', (e) => {
                    console.log('수락하기 버튼 클릭!');

                    if(personDetailSignupStatus === 'CONFIRM') {

                        if (userData.occupation === '일반 직업') {
                            matchingOfferType = 'matchingOffer_normal';
                        } else if (userData.occupation === '대기업' || userData.occupation === '공무원(6급 이하)' || userData.occupation === '공기업' || userData.occupation === '교직원') {
                            matchingOfferType = 'matchingOffer_middle';
                        } else if (userData.occupation === '전문직(변호사, 검판사 등)' || userData.occupation === '공무원(5급 이상)') {
                            matchingOfferType = 'matchingOffer_high';
                        }
            
                        // 포인트 사용 정보 받아오기
                        fetch(`/pointUsageProC`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: userData.id,
                                matchingOfferType: matchingOfferType,
                                gender: userData.gender,
                                type: '사용',
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            const userPoint = data['userPoint'];
                            const paymentPointAmount = data['paymentPointAmount'];
                            const remainUserPoint = data['remainUserPoint'];
            
                            console.log(`userPoint:${userPoint}`);
                            console.log(`paymentPointAmount:${paymentPointAmount}`);
                            console.log(`remainUserPoint:${remainUserPoint}`);
            
                            // 포인트 정보 추가
                            document.querySelector('#matchingAcceptUserPoint').textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                            document.querySelector('#matchingAcceptUsagePoint').textContent = '- ' + paymentPointAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                            document.querySelector('#matchingAcceptRemainPoint').textContent = remainUserPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
            
                            // 이용자 정보 추가
                            document.querySelector('#matchingAcceptPopupSubTitle').textContent = `‘${userData.nickname}’님과 매칭을 수락하시겠습니까?`;
                            document.querySelector('#matchingAcceptUsagePointSubtitle').textContent = `(매칭 수락 / ${userData.occupation})`;
                        })
                        .catch(error => {
                            console.log(`매칭 수락, 포인트 사용 정보 받아오기 Error : ${error}`);
                        });
        
                        const matchingAcceptPopupContainer = document.querySelector('#matchingAcceptPopupContainer');
                        popupOpenHandler(matchingAcceptPopupContainer);
            
                    } else {
                        alert('회원 상태를 확인해주세요');
                        window.location.href = `${hostURL}myprofile/profile`;
                    }
                });
        
                const rejectBtn = document.createElement('button');
                rejectBtn.classList.add('confirmBtn');
                rejectBtn.setAttribute('id', 'rejectBtn');
                rejectBtn.textContent = '거절하기';

                // 거절하기 버튼 클릭 시
                rejectBtn.addEventListener('click', (e) => {
                    console.log('거절하기 버튼 클릭!');

                    if(personDetailSignupStatus === 'CONFIRM') {
                        const confirmMSG = '상대방의 매칭을 거절하겠습니까?';

                        if(window.confirm(confirmMSG)){
                            // 서버로 매칭 수락 요청
                            fetch(`/matchingRejectProC`, {
                                method : 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    id: userData.id,
                                    matchingOfferType: matchingOfferType,
                                    gender : userData.gender,
                                })
                            })
                            .then(response => response.json())
                            .then(data => { 
                                if(data['result'] == 'SUCCESS') {
                                    alert('매칭이 거절되었습니다');
                                    window.location.href = `${hostURL}dashboard?categoryRecog=receive`;        
                                }
                                else if(data['result'] == 'FAIL') {
                                    alert('알 수 없는 오류가 발생하였습니다.');
                                }
                            })
                            .catch(error => {
                                console.log(`매칭 거절하기 Error : ${error}`);
                            });
                        }
                    } else {
                        alert('회원 상태를 확인해주세요');
                        window.location.href = `${hostURL}myprofile/profile`;
                    }
                });
        
                confirmBtn_container.appendChild(acceptBtn);
                confirmBtn_container.appendChild(rejectBtn);
            }
            else {
                // 내가 매칭을 신청을 했을 경우
                if(offerStatus === true) {
                    nameInfoContent.style.display = 'none';
                    phoneInfoContent.style.display = 'none';
                    salaryInfoContent.style.display = 'block';
                    occupationContent.style.display = 'block';
                    pictures.forEach((picture) => {
                        picture.classList.add('pay');
                    });

                    const confirmBtns = document.querySelectorAll('.confirmBtn_container button');
                    confirmBtns.forEach((btn) => {
                        btn.remove();
                    });

                    const cancelBtn = document.createElement('button');
                    cancelBtn.classList.add('confirmBtn');
                    cancelBtn.setAttribute('id', 'cancelBtn');
                    cancelBtn.textContent = '취소하기';

                    // 취소하기 버튼 클릭 했을 경우
                    cancelBtn.addEventListener('click', (e) => {
                        console.log('취소하기 버튼 클릭!');

                        if(personDetailSignupStatus === 'CONFIRM') {

                            if (userData.occupation === '일반 직업') {
                                matchingOfferType = 'matchingOffer_normal';
                            } else if (userData.occupation === '대기업' || userData.occupation === '공무원(6급 이하)' || userData.occupation === '공기업' || userData.occupation === '교직원') {
                                matchingOfferType = 'matchingOffer_middle';
                            } else if (userData.occupation === '전문직(변호사, 검판사 등)' || userData.occupation === '공무원(5급 이상)') {
                                matchingOfferType = 'matchingOffer_high';
                            }
        
                            // 포인트 사용 정보 받아오기
                            fetch(`/pointUsageProC`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    id: userData.id,
                                    matchingOfferType: matchingOfferType,
                                    gender: userData.gender,
                                    type: '환급',
                                })
                            })
                            .then(response => response.json())
                            .then(data => {
                                const userPoint = data['userPoint'];
                                const paymentPointAmount = data['paymentPointAmount'];
                                const remainUserPoint = data['remainUserPoint'];
        
                                console.log(`userPoint:${userPoint}`);
                                console.log(`paymentPointAmount:${paymentPointAmount}`);
                                console.log(`remainUserPoint:${remainUserPoint}`);
        
                                // 포인트 정보 추가
                                document.querySelector('#matchingCancelUserPoint').textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                                document.querySelector('#matchingCancelUsagePoint').textContent = '+'+ paymentPointAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                                document.querySelector('#matchingCancelRemainPoint').textContent = remainUserPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
        
                                // 이용자 정보 추가
                                document.querySelector('#matchingCancelPopupSubTitle').textContent = `‘${userData.nickname}’님과 매칭을 신청하시겠습니까?`;
                                document.querySelector('#matchingCancelUsagePointSubtitle').textContent = `(매칭 취소 / ${userData.occupation})`;
                            })
                            .catch(error => {
                                console.log(`매칭 취소, 포인트 사용 정보 받아오기 Error : ${error}`);
                            });
        
                            const matchingCancelPopupContainer = document.querySelector('#matchingCancelPopupContainer');
                            popupOpenHandler(matchingCancelPopupContainer);

                        } else {
                            alert('회원 상태를 확인해주세요');
                            window.location.href = `${hostURL}myprofile/profile`;    
                        }
                    });

                    confirmBtn_container.appendChild(cancelBtn);

                    statusMsg.style.display = 'block';
                    statusMsg.textContent = '(진행중 : 상대방에게 매칭 신청함)';
                }
                else {
                    // 내가 열람 신청을 했을 경우
                    if(openStatus === true) {                
                        nameInfoContent.style.display = 'none';
                        phoneInfoContent.style.display = 'none';
                        salaryInfoContent.style.display = 'block';
                        occupationContent.style.display = 'block';
                        pictures.forEach((picture) => {
                            picture.classList.add('pay');
                        });
                        additionalInfoBtn.disabled = true;
                        additionalInfoBtn.style.cursor = 'default';
                        additionalInfoBtn.style.pointerEvents = 'none';
                        statusMsg.style.display = 'block';
                        statusMsg.textContent = '(진행중 : 추가 정보 열람)';
                    }
                    // 모든 조건이 아닐 경우 
                    else {
                        nameInfoContent.style.display = 'none';
                        phoneInfoContent.style.display = 'none';
                        salaryInfoContent.style.display = 'none';
                        occupationContent.style.display = 'none';
                        statusMsg.style.display = 'none';
                    }
                }
            }
        }
    }

    // 후기작성 '완료' 버튼을 눌렀을 경우
    const reviewConfirmBtn = document.querySelector('#reviewConfirmBtn');
    reviewConfirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`후기작성 완료 버튼 클릭!`);

        // 아무것도 선택하지 않고 완료를 눌렀을 경우
        if(selectedReviewContents.length === 0) {
            const reviewErrorMsg = document.querySelector('#reviewErrorMsg');
            reviewErrorMsg.style.display = 'block';
        } else {
            // 리뷰 history DB에 저장하기
            fetch(`/reviewHistoryProC`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: userData.id,
                    selectedReviewContents: selectedReviewContents,
                })
            })
            .then(response => response.json())
            .then(data => {
                if(data['result'] === 'ALREADY DID') {
                    alert('이미 후기를 작성한 이용자입니다');
                }
                else if(data['result'] === 'SUCCESS') {
                    alert('후기 등록이 완료되었습니다.');

                    reviewPopupContainer.style.opacity = 0;
                    reviewPopupContainer.style.transform = 'translate(-50%, -50%) scale(0.9)';
                    overlay.style.opacity = 0;
                    window.location.href = `${hostURL}dashboard?categoryRecog=matching`;

                    // 애니메이션이 끝난 후 숨김
                    setTimeout(() => {
                        reviewPopupContainer.style.display = 'none';
                        overlay.style.display = 'none';
                    }, 300); // 애니메이션 지속 시간 (0.3초) 후 숨김
                } else {
                    alert('알 수 없는 오류가 발생하였습니다. \n 다시 시도해주세요');
                }
            })
            .catch(error => {
                console.log(`리뷰 history 저장하기 Error : ${error}`);
            });
        }
    });

    // 신고하기 '완료' 버튼을 눌렀을 경우
    const reportConfirmBtn = document.querySelector('#reportConfirmBtn');
    reportConfirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`신고하기 완료 버튼 클릭!`);
        
        // reportInput값 받기
        const reportInputValue = document.querySelector('#reportInput').value;

        // 아무것도 선택하지 않고 완료를 눌렀을 경우
        if(selectedReportContents.length === 0) {
            const reportErrorMsg = document.querySelector('#reportErrorMsg');
            reportErrorMsg.style.display = 'block';
        } else {
            // 신고하기 history DB에 저장하기
            fetch(`/reportHistoryProC`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: userData.id,
                    selectedReportContents: selectedReportContents,
                    reportInputValue: reportInputValue,
                })
            })
            .then(response => response.json())
            .then(data => {
                if(data['result'] === 'ALREADY DID') {
                    alert('이미 신고한 이용자입니다');
                }
                else if(data['result'] === 'SUCCESS') {
                    alert('신고가 등록이 완료되었습니다.');

                    reportPopupContainer.style.opacity = 0;
                    reportPopupContainer.style.transform = 'translate(-50%, -50%) scale(0.9)';
                    overlay.style.opacity = 0;
                    window.location.href = `${hostURL}dashboard?categoryRecog=matching`;

                    // 애니메이션이 끝난 후 숨김
                    setTimeout(() => {
                        reportPopupContainer.style.display = 'none';
                        overlay.style.display = 'none';
                    }, 300); // 애니메이션 지속 시간 (0.3초) 후 숨김
                } else {
                    alert('알 수 없는 오류가 발생하였습니다. \n 다시 시도해주세요');
                }
            })
            .catch(error => {
                console.log(`신고 history 저장하기 Error : ${error}`);
            });
        }
    });

    // 후기 x버튼 클릭 시
    const reviewXBtn = document.querySelector('#reviewXBtn');
    reviewXBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`X버튼 클릭!`);
        popUpXBtnClickHandler(reviewPopupContainer);
    });

    // 팝업창 open Handler function
    function popupOpenHandler(container) {

        const overlay = document.querySelector('.overlay');
        container.style.display = 'block';
        overlay.style.display = 'block';
        
        requestAnimationFrame(() => {
            container.style.opacity = 1;
            container.style.transform = 'translate(-50%, -50%) scale(1)';
            overlay.style.opacity = 1;
        });

        console.log('overlay:',overlay);

    }

    // 완료 버튼 클릭 시(매칭 취소를 최종적으로 요청했을 경우)
    const matchingCancelConfirmBtn = document.querySelector('#matchingCancelConfirmBtn');
    matchingCancelConfirmBtn.addEventListener('click', (e) => {
        console.log('매칭 취소 완료 버튼 클릭!');
        e.preventDefault();

        const confirmMSG = '매칭을 취소하시겠습니까? \n취소하면 포인트는 환급됩니다';
        if (window.confirm(confirmMSG)) {
            // 서버로 매칭 취소 요청
            fetch(`/matchingCancelProC`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: userData.id,
                    matchingOfferType: matchingOfferType,
                    gender: userData.gender,
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data['result'] == 'SUCCESS') {
                    alert('매칭 취소가 완료되었습니다');
                    window.location.href = `${hostURL}dashboard?categoryRecog=offer`;
                }
                else if (data['result'] == 'FAIL') {
                    alert('알 수 없는 오류가 발생하였습니다.');
                }
            })
            .catch(error => {
                console.log(`매칭 취소하기 Error : ${error}`);
            });
        }
    });

    // 완료 버튼 클릭 시(매칭 수락을 최종적으로 요청했을 경우)
    const matchingAcceptConfirmBtn = document.querySelector('#matchingAcceptConfirmBtn');
    matchingAcceptConfirmBtn.addEventListener('click', (e) => {
        console.log('매칭 수락하기 완료 버튼 클릭!');
        e.preventDefault();

        const confirmMSG = '매칭 신청을 수락하시겠습니까? 수락 시 포인트가 차감됩니다.';

        if (window.confirm(confirmMSG)) {
            // 서버로 매칭 수락 요청
            fetch(`/matchingAcceptProC`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: userData.id,
                    matchingOfferType: matchingOfferType,
                    gender: userData.gender,
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data['result'] == 'POINT NOT ENOUGH') {
                    alert('포인트가 부족합니다');
                    window.location.href = `${hostURL}myprofile/point`;
                }
                else if (data['result'] == 'SUCCESS') {
                    alert('매칭이 수락되었습니다');
                    window.location.href = `${hostURL}dashboard?categoryRecog=matching`;
                }
                else if (data['result'] == 'FAIL') {
                    alert('알 수 없는 오류가 발생하였습니다.');
                }
            })
            .catch(error => {
                console.log(`매칭 수락하기 Error : ${error}`);
            });
        }
    })

    // 매칭 수락하기 팝업 X버튼 클릭 시
    const matchingAcceptXBtn = document.querySelector('#matchingAcceptXBtn');
    matchingAcceptXBtn.addEventListener('click', (e) => {
        console.log('매칭 신청 팝업 X버튼 클릭!');
        popUpXBtnClickHandler(matchingAcceptPopupContainer);
    }); 

    // 신고하기에서 취소하기 버튼 클릭 시
    const reportXBtn = document.querySelector('#reportXBtn');
    reportXBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`신고하기 X버튼 클릭!`);
        popUpXBtnClickHandler(reportPopupContainer);
    });

    // 매칭 취소 팝업 X버튼 클릭 시
    const matchingCancelXBtn = document.querySelector('#matchingCancelXBtn');
    matchingCancelXBtn.addEventListener('click', (e) => {
        console.log('매칭 신청 팝업 X버튼 클릭!');
        popUpXBtnClickHandler(matchingCancelPopupContainer);
    });

    // 팝업창 X버튼 클릭 Handler function
    function popUpXBtnClickHandler(container) {

        const overlay = document.querySelector('.overlay');
        container.style.opacity = 0;
        container.style.transform = 'translate(-50%, -50%) scale(0.9)';
        overlay.style.opacity = 0;

        // 애니메이션이 끝난 후 숨김
        setTimeout(() => {
            container.style.display = 'none';
            overlay.style.display = 'none';
        }, 300); // 애니메이션 지속 시간 (0.3초) 후 숨김
    }
});

