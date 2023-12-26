"use strict"

const pointColor = "#DB7C8D";
const frequencyColor = "#D9D9D9";
const selectBtnColor = "#F9F2F2";
const subBtnColor = '#767373';

let selectedReportContents = [];
let selectedReviewContents = [];
let userListData = [];
let userData;
let categoryRecog = undefined;
let occupationInfo = '';
let matchingOfferType = '';
let dashboardSignupStatus;
const list_container = document.querySelector('.list_container');

// 이용자 정보 받아오기
userInfoGetFromServer();
function userInfoGetFromServer() {
        fetch('/loginStatusProC', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => response.json()) // 응답을 JSON으로 파싱
        .then(data => {
            if(data[0].id){
                dashboardSignupStatus = data[0].signupStatus;
                // console.log(`dashboardSignupStatus:${dashboardSignupStatus}`);
            }
        })
        .catch(error => {
            console.log(`이용자 정보 불러오기 Error : ${error}`);
        });
}

// 최초 URL 접속 시
categorySelectHandler();

// 정보 열람 목록 클릭 시
const openListBtn = document.querySelector('.openListBtn');
openListBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('정보 열람 목록 클릭!');

    categoryRecog = 'open';
    window.location.href = `${hostURL}dashboard?categoryRecog=${categoryRecog}`;
    categorySelectHandler();
    UserListRequest();
});

// 보낸 신청 목록 클릭 시
const offerListBtn = document.querySelector('.offerListBtn');

offerListBtn.addEventListener('click', (e) => {
    e.preventDefault();

    categoryRecog = 'offer';
    window.location.href = `${hostURL}dashboard?categoryRecog=${categoryRecog}`;
    categorySelectHandler();
    UserListRequest();
})

// 신청 받은 목록 클릭 시
const receiveListBtn = document.querySelector('.receiveListBtn');

receiveListBtn.addEventListener('click', (e) => {
    e.preventDefault();

    categoryRecog = 'receive';
    window.location.href = `${hostURL}dashboard?categoryRecog=${categoryRecog}`;
    categorySelectHandler();
    UserListRequest();
})

// 매칭 목록 클릭 시
const matchingListBtn = document.querySelector('.matchingListBtn');

matchingListBtn.addEventListener('click', (e) => {
    e.preventDefault();

    categoryRecog = 'matching';
    window.location.href = `${hostURL}dashboard?categoryRecog=${categoryRecog}`;
    categorySelectHandler();
    UserListRequest();
})

function categorySelectHandler() {

    // console.log(`categoryRecog:${categoryRecog}`);

    // 선택된 것 모두 리셋한다.
    const btns_container = document.querySelectorAll('.btns_container button')
    btns_container.forEach((btn) => {
        btn.classList.remove('selected');
    });

    if (categoryRecog === 'open') {
        const openListBtn = document.querySelector('.openListBtn');
        openListBtn.classList.add('selected');
    }
    else if (categoryRecog === 'offer') {
        const offerListBtn = document.querySelector('.offerListBtn');
        offerListBtn.classList.add('selected');
    }
    else if (categoryRecog === 'receive') {
        const receiveListBtn = document.querySelector('.receiveListBtn');
        receiveListBtn.classList.add('selected');
    }
    else if (categoryRecog === 'matching') {
        const matchingListBtn = document.querySelector('.matchingListBtn');
        matchingListBtn.classList.add('selected');
    }
}



///// 이용자 목록 불러오기 /////

// 최초 URL 접속 시
UserListRequest(); //이용자 리스트 요청하기

function UserListRequest() {

    // 기존에 모든 요소 지우기
    while (list_container.firstChild) {
        list_container.removeChild(list_container.firstChild);
    }

    // 페이지 넘김 버튼도 초기화하기
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    // 서버로 User LIst 요청
    fetch(`/dashboardUserListProc`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            categoryRecog: categoryRecog,
        })
    })
        .then(response => response.json())
        .then(data => {
            // 기본적으로 리셋
            userListData = [];

            const resultNotFound = document.querySelector('.resultNotFound');
            // 일치하는 User List가 없을 경우
            if (data['result'] == 'undifined') {
                categoryRecog = data['categoryRecog'];
                resultNotFound.style.display = 'block'; // 결과가 없다는 container 나타내기
                categorySelectHandler();
            }
            else {
                resultNotFound.style.display = 'none'; // 결과가 없다는 container 사라지게 하기
                categoryRecog = data[0]['categoryRecog'];
                categorySelectHandler();
                userListData.push(data);
                renderUserList(userListData);
            }
        })
        .catch(error => {
            console.log(`대시보드 이용자 목록 불러오기 Error : ${error}`);
        });

}

// userList에 유저 컨테이너 정보를 랜더링
function renderUserList(userListData) {
    for (let i = 0; i < userListData[0].length; i++) {
        const userContainer = createUserContainer(userListData[0][i]);
        list_container.appendChild(userContainer);
    }


    // 페이지 버튼 생성 및 관리
    pageBtnHandler();
}

// user container 생성
function createUserContainer(userData) {

    // console.log(`userData:${userData.name}`);

    // 새로운 div 엘리먼트 생성
    const userContainer = document.createElement('div');
    userContainer.className = 'user_container';

    // status_container 생성
    const statusContainer = document.createElement('div');
    statusContainer.className = 'status_container';

    const statusTitle = document.createElement('span');
    statusTitle.className = 'statusTitle';

    const statusDate = document.createElement('span');
    statusDate.className = 'statusDate';

    let d_day = '';

    if (categoryRecog === 'offer') {
        statusTitle.textContent = '답변 대기중';
        dDayCalculation();
    }
    else if (categoryRecog === 'receive') {
        statusTitle.textContent = '수락 대기중';
        // statusDate.textContent = userData.statusDate;
        dDayCalculation();
    }
    else if (categoryRecog === 'matching') {
        statusTitle.textContent = '매칭 완료';
        // statusDate.textContent = userData.statusDate;
    }

    function dDayCalculation() {
        // 사용자로부터 날짜를 입력받는 경우, Date 객체로 변환하십시오.
        const userOfferDate = new Date(userData.offer_date);

        // 현재 날짜를 얻습니다.
        const currentDate = new Date();
        // console.log(`userOfferDate:${userOfferDate}`);
        // console.log(`currentDate:${currentDate}`);

        // D-DAY를 계산합니다.
        const timeDifference = currentDate - userOfferDate;
        const daysUntilDDay = Math.floor(8 - (timeDifference / (1000 * 60 * 60 * 24))); // 부호 변경

        if (daysUntilDDay === 0) {
            d_day = 'D-DAY';
        } else if (daysUntilDDay > 0) {
            d_day = `D - ${daysUntilDDay}`;
        } else {
            d_day = `D + ${-daysUntilDDay}`; // 이미 지난 경우
        }
        statusDate.textContent = "(" + d_day + ")";
    }

    statusContainer.appendChild(statusTitle);
    statusContainer.appendChild(statusDate);

    // content_container 생성
    const contentContainer = document.createElement('div');
    contentContainer.className = 'content_container';

    // userImg 생성
    const userImg = document.createElement('img');
    userImg.src = `/backend/uploads/${userData.id}/${userData.picture_1}`;
    userImg.alt = '';
    userImg.className = 'userImg';

    // userInfo_container 생성
    const userInfoContainer = document.createElement('div');
    userInfoContainer.className = 'userInfo_container';

    // userInfo_container 클릭 시  -> 이용자 상세 페이지로 이ㅇㅏ기
    userInfoContainer.addEventListener('click', (e) => {
        e.preventDefault();

        const personInfoURL = `${hostURL}personInfo?idinfo=${userData.idinfo}`;
        // 새로운 브라우저 창에서 URL 열기
        window.location.href = personInfoURL;
        // window.open(personInfoURL, '_blank');
    });

    // letftContent_container 생성
    const letftContent_container = document.createElement('div');
    letftContent_container.className = 'leftContent_container';

    // regionInfo 생성
    const regionInfo = document.createElement('p');
    regionInfo.className = 'regionInfo';
    regionInfo.textContent = userData.regionCity + " " + userData.regionGu;
    
    const profileInfoContent_container = document.createElement('div');
    profileInfoContent_container.classList.add('profileInfoContent_container');

    // 프로필 정보 컨테이너를 생성합니다.
    const profileInfoContainer = document.createElement('div');
    profileInfoContainer.classList.add('profileInfo_container');

    // 각각의 프로필 정보를 생성합니다.
    const infoTitles = ['닉네임', '나이', '키', 'MBTI', '스타일', '체형', '성격', '음주'];
    const infoValues = [userData.nickname, userData.age, userData.height, userData.mbti, userData.style, userData.bodyType, userData.personality, userData.drinking];

    occupationInfo = userData.occupation; // 직업 정보 넣기

    // console.log(`occupationInfo:${occupationInfo}`);

    if (occupationInfo === '일반 직업') {
        matchingOfferType = 'matchingOffer_normal';
    } else if (occupationInfo === '대기업' || occupationInfo === '공무원(6급 이하)' || occupationInfo === '공기업' || occupationInfo === '교직원') {
        matchingOfferType = 'matchingOffer_middle';
    } else if (occupationInfo === '전문직(변호사, 검판사 등)' || occupationInfo === '공무원(5급 이상)') {
        matchingOfferType = 'matchingOffer_high';
    }

    profileInfoContainer.appendChild(regionInfo);

    for (let i = 0; i < infoTitles.length; i++) {
        const infoTitle = document.createElement('span');
        infoTitle.classList.add('infoTitle');
        infoTitle.textContent = `${infoTitles[i]} : `;

        const infoText = document.createElement('span');
        infoText.classList.add('infoText');
        infoText.textContent = infoValues[i];

        const infoParagraph = document.createElement('p');
        infoParagraph.appendChild(infoTitle);
        infoParagraph.appendChild(infoText);

        profileInfoContainer.appendChild(infoParagraph);
    }


    // profileHobbyInfo_container 생성
    const profileHobbyInfoContainer = document.createElement('div');
    profileHobbyInfoContainer.className = 'profileHobbyInfo_container';

    // 취미 정보 엘리먼트들 생성
    const hobbyArray = userData.hobby.split(',').map(item => item.trim());

    // 각각의 취미 정보를 생성합니다.
    hobbyArray.forEach((value) => {
        const hobbyInfo = document.createElement('div');
        // console.log(`hobby:${h}`);
        hobbyInfo.innerHTML = `<span>${value}</span>`;
        profileHobbyInfoContainer.appendChild(hobbyInfo);
    });

    // rightBtn_container 생성
    const rightBtnContainer = document.createElement('div');
    rightBtnContainer.className = 'rightBtn_container';

    const date = document.createElement('p');
    let userDate = '';

    if (categoryRecog === 'open') {
        date.className = 'openDate';
        userDate = new Date(userData.open_date);
        const year = userDate.getFullYear();
        const month = String(userDate.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1이 필요합니다.
        const day = String(userDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        date.textContent = `열람일 : ${formattedDate}`;
    }
    else if (categoryRecog === 'matching') {
        date.className = 'matchingDate';
        userDate = new Date(userData.matching_date);
        const year = userDate.getFullYear();
        const month = String(userDate.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1이 필요합니다.
        const day = String(userDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        date.textContent = `매칭일 : ${formattedDate}`;
    }
    else {
        date.className = 'offerDate';
        userDate = new Date(userData.offer_date);
        const year = userDate.getFullYear();
        const month = String(userDate.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1이 필요합니다.
        const day = String(userDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        date.textContent = `신청일 : ${formattedDate}`;
    }

    rightBtnContainer.appendChild(date);

    if (categoryRecog === 'open') {
        const matchingOfferBtn = document.createElement('button');
        matchingOfferBtn.className = 'confirmBtn';
        matchingOfferBtn.id = 'matchingOfferBtn';
        matchingOfferBtn.textContent = '매칭 신청하기';
        rightBtnContainer.appendChild(matchingOfferBtn);

        // 매칭 신청하기 버튼 클릭했을 때
        matchingOfferBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('매칭 신청하기 클릭!');
            // console.log('e.target:',e.target);

            if(dashboardSignupStatus === 'CONFIRM') {
                if (userData.occupation === '일반 직업') {
                    matchingOfferType = 'matchingOffer_normal';
                } else if (userData.occupation === '대기업' || userData.occupation === '공무원(6급 이하)' || userData.occupation === '공기업' || userData.occupation === '교직원') {
                    matchingOfferType = 'matchingOffer_middle';
                } else if (userData.occupation === '전문직(변호사, 검판사 등)' || userData.occupation === '공무원(5급 이상)') {
                    matchingOfferType = 'matchingOffer_high';
                }
    
                // console.log(`matchingOfferType:${matchingOfferType}`);
    
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

                    // 완료 버튼 클릭 시(매칭 신청을 최종적으로 요청했을 경우)
                    const matchingOfferConfirmBtn = document.querySelector('#matchingOfferConfirmBtn');

                    function clickHandler(e) {
                        e.preventDefault();
                        console.log('매칭 신청 완료 버튼 클릭!');
                        // console.log('e.target:',e.target);

                        let confirmMSG = '매칭 신청은 포인트가 사용됩니다. 그래도 진행하시겠습니까?';
                        // console.log('userData:',userData);
                        let loginedUserGender = userData.gender;

                        if (window.confirm(confirmMSG)) {
                            fetch(`/matchingOfferProC`, {
                                method: 'POST',
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
                                // console.log(`result : ${result}`);

                                // 로그인이 되어 있지 않을 경우
                                if (result === 'NOT LOGIN') {
                                    window.location.href = `${hostURL}login`;
                                }
                                // 이미 신청한 사람일 경우 
                                else if (result === 'HISTORY') {
                                    alert('이미 매칭 기록(신청, 매칭, 거절)이 있는 이용자입니다.');
                                    window.location.href = `${hostURL}dashboard?categoryRecog=open`;
                                }
                                else {
                                    // 포인트가 부족할 경우
                                    if (result === 'POINT NOT ENOUGH') {
                                        window.alert('포인트가 부족합니다. 포인트를 충전해주세요');
                                        window.location.href = `${hostURL}myprofile/point`;
                                    }
                                    // 정상적으로 진행이 되었을 경우
                                    else if (result === 'SUCCESS') {
                                        window.alert('매칭 신청이 완료되었습니다.');
                                        // offerStatus = true;
                                        window.location.href = `${hostURL}dashboard?categoryRecog=offer`;
                                    }
                                    // 그 외에 상황일 경우
                                    else {
                                        alert('알 수 없는 오류가 발생하였습니다. 다시 시도해주세요.');
                                        window.location.href = `${hostURL}dashboard?categoryRecog=open`;
                                    }
                                }
                            })
                            .catch(error => {
                                console.log(`매칭 신청하기 Error : ${error}`);
                            });
                        }
                    }

                    matchingOfferConfirmBtn.addEventListener('click', clickHandler);

                    // 매칭 신청 팝업 X버튼 클릭 시
                    const matchingOfferXBtn = document.querySelector('#matchingOfferXBtn');
                    matchingOfferXBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('매칭 신청 팝업 X버튼 클릭!');  
                        matchingOfferConfirmBtn.removeEventListener('click', clickHandler);

                        popUpXBtnClickHandler(matchingOfferPopupContainer);
                    });
                    
                })
                .catch(error => {
                    console.log(`매칭 신청, 포인트 사용 정보 받아오기 Error : ${error}`);
                });
    
                // 팝업창 띄우기
                const matchingOfferPopupContainer = document.querySelector('#matchingOfferPopupContainer');
                popupOpenHandler(matchingOfferPopupContainer);

            } else {
                alert('회원 상태를 확인해주세요');
                window.location.href = `${hostURL}myprofile/profile`;
            }
        });
    }
    else if (categoryRecog === 'offer') {
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'confirmBtn';
        confirmBtn.id = 'offerCancelBtn';
        confirmBtn.textContent = '취소하기';

        rightBtnContainer.appendChild(confirmBtn);

        // 취소하기 버튼 클릭 했을 경우
        confirmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('취소하기 버튼 클릭!');

            if(dashboardSignupStatus === 'CONFIRM') {
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
    
                    // console.log(`userPoint:${userPoint}`);
                    // console.log(`paymentPointAmount:${paymentPointAmount}`);
                    // console.log(`remainUserPoint:${remainUserPoint}`);
    
                    // 포인트 정보 추가
                    document.querySelector('#matchingCancelUserPoint').textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                    document.querySelector('#matchingCancelUsagePoint').textContent = '+'+ paymentPointAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                    document.querySelector('#matchingCancelRemainPoint').textContent = remainUserPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
    
                    // 이용자 정보 추가
                    document.querySelector('#matchingCancelPopupSubTitle').textContent = `‘${userData.nickname}’님과 매칭을 신청하시겠습니까?`;
                    document.querySelector('#matchingCancelUsagePointSubtitle').textContent = `(매칭 취소 / ${userData.occupation})`;

                    // 완료 버튼 클릭 시(매칭 취소을 최종적으로 요청했을 경우)
                    const matchingCancelConfirmBtn = document.querySelector('#matchingCancelConfirmBtn');

                    function cancelBtnHandler(e) {
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
                    }

                    matchingCancelConfirmBtn.addEventListener('click', cancelBtnHandler);

                    // 매칭 취소 팝업 X버튼 클릭 시
                    const matchingCancelXBtn = document.querySelector('#matchingCancelXBtn');
                    matchingCancelXBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log('매칭 신청 팝업 X버튼 클릭!');
                        matchingCancelConfirmBtn.removeEventListener('click', cancelBtnHandler);
                        popUpXBtnClickHandler(matchingCancelPopupContainer);
                    });
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
    }
    else if (categoryRecog === 'receive') {
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'confirmBtn';
        acceptBtn.id = 'acceptBtn';
        acceptBtn.textContent = '수락하기';

        // 수락하기 버튼 클릭 시
        acceptBtn.addEventListener('click', (e) => {
            console.log('수락하기 버튼 클릭!');
            e.preventDefault();

            if(dashboardSignupStatus === 'CONFIRM') {
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
    
                    // console.log(`userPoint:${userPoint}`);
                    // console.log(`paymentPointAmount:${paymentPointAmount}`);
                    // console.log(`remainUserPoint:${remainUserPoint}`);
    
                    // 포인트 정보 추가
                    document.querySelector('#matchingAcceptUserPoint').textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                    document.querySelector('#matchingAcceptUsagePoint').textContent = '- ' + paymentPointAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                    document.querySelector('#matchingAcceptRemainPoint').textContent = remainUserPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
    
                    // 이용자 정보 추가
                    document.querySelector('#matchingAcceptPopupSubTitle').textContent = `‘${userData.nickname}’님과 매칭을 수락하시겠습니까?`;
                    document.querySelector('#matchingAcceptUsagePointSubtitle').textContent = `(매칭 수락 / ${userData.occupation})`;

                    // // 완료 버튼 클릭 시(매칭 수락을 최종적으로 요청했을 경우)
                    const matchingAcceptConfirmBtn = document.querySelector('#matchingAcceptConfirmBtn');
                    function matchingAcceptBtnHandler(e) {
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
                    }
                    matchingAcceptConfirmBtn.addEventListener('click', matchingAcceptBtnHandler);

                    // 매칭 수락하기 팝업 X버튼 클릭 시
                    const matchingAcceptXBtn = document.querySelector('#matchingAcceptXBtn');
                    matchingAcceptXBtn.addEventListener('click', (e) => {
                        console.log('매칭 신청 팝업 X버튼 클릭!');
                        matchingAcceptConfirmBtn.removeEventListener('click', matchingAcceptBtnHandler);
                        popUpXBtnClickHandler(matchingAcceptPopupContainer);
                    });
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
        rejectBtn.className = 'confirmBtn';
        rejectBtn.id = 'rejectBtn';
        rejectBtn.textContent = '거절하기';

        // 거절하기 버튼 클릭 시
        rejectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('거절하기 버튼 클릭!');

            if(dashboardSignupStatus === 'CONFIRM') {
                const confirmMSG = '상대방의 매칭을 거절하겠습니까?';

                if (window.confirm(confirmMSG)) {
                    // 서버로 매칭 수락 요청
                    fetch(`/matchingRejectProC`, {
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
                                alert('매칭이 거절되었습니다');
                                window.location.href = `${hostURL}dashboard?categoryRecog=receive`;        
                            }
                            else if (data['result'] == 'FAIL') {
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

        rightBtnContainer.appendChild(acceptBtn);
        rightBtnContainer.appendChild(rejectBtn);
    }
    else if (categoryRecog === 'matching') {

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
    
            rightBtnContainer.appendChild(reviewBtn);
            
            // 후기작성 버튼 클릭 시
            reviewBtn.addEventListener('click', (e) => {
                e.preventDefault();

                if(dashboardSignupStatus === 'CONFIRM') {
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

                        // 후기작성 '완료' 버튼을 눌렀을 경우
                        const reviewConfirmBtn = document.querySelector('#reviewConfirmBtn');
                        function reviewConfirmBtnHandler(e) {
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
                                        const overlay = document.querySelector('.overlay');
                                        overlay.style.opacity = 0;

                                        // 애니메이션이 끝난 후 숨김
                                        setTimeout(() => {
                                            reviewPopupContainer.style.display = 'none';
                                            overlay.style.display = 'none';
                                        }, 300); // 애니메이션 지속 시간 (0.3초) 후 숨김

                                        window.location.href = `${hostURL}dashboard?categoryRecog=matching`;

                                    } else {
                                        alert('알 수 없는 오류가 발생하였습니다. \n 다시 시도해주세요');
                                    }
                                })
                                .catch(error => {
                                    console.log(`리뷰 history 저장하기 Error : ${error}`);
                                });
                            }
                        }
                        reviewConfirmBtn.addEventListener('click', reviewConfirmBtnHandler);

                        // x버튼 클릭 시
                        const reviewXBtn = document.querySelector('#reviewXBtn');
                        reviewXBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            console.log(`X버튼 클릭!`);
                            reviewConfirmBtn.removeEventListener('click', reviewConfirmBtnHandler);
                            popUpXBtnClickHandler(reviewPopupContainer);
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
            rightBtnContainer.appendChild(reportBtn);

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

                if(dashboardSignupStatus === 'CONFIRM') {
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
                                    // console.log(`selectedReportContents:${selectedReportContents}`);
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
                        

                        // 신고하기 '완료' 버튼을 눌렀을 경우
                        const reportConfirmBtn = document.querySelector('#reportConfirmBtn');
                        function reportConfirmBtnHandler(e) {
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
                                        const overlay = document.querySelector('.overlay');
                                        overlay.style.opacity = 0;                    
                                        // 애니메이션이 끝난 후 숨김
                                        setTimeout(() => {
                                            reportPopupContainer.style.display = 'none';
                                            overlay.style.display = 'none';
                                        }, 300); // 애니메이션 지속 시간 (0.3초) 후 숨김

                                        window.location.href = `${hostURL}dashboard?categoryRecog=matching`;

                                    } else {
                                        alert('알 수 없는 오류가 발생하였습니다. \n 다시 시도해주세요');
                                    }
                                })
                                .catch(error => {
                                    console.log(`신고 history 저장하기 Error : ${error}`);
                                });
                            }
                        }
                        reportConfirmBtn.addEventListener('click', reportConfirmBtnHandler);

                        // 신고하기에서 취소하기 버튼 클릭 시
                        const reportXBtn = document.querySelector('#reportXBtn');
                        reportXBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            console.log(`신고하기 X버튼 클릭!`);
                            reportConfirmBtn.removeEventListener('click', reportConfirmBtnHandler);
                            popUpXBtnClickHandler(reportPopupContainer);
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
    }

    // content_container에 위에서 생성한 엘리먼트들 추가
    letftContent_container.appendChild(userImg);
    // letftContent_container.appendChild(regionInfo);
    profileInfoContent_container.appendChild(profileInfoContainer);
    profileInfoContent_container.appendChild(profileHobbyInfoContainer);
    letftContent_container.appendChild(profileInfoContent_container);

    userInfoContainer.appendChild(letftContent_container);

    // contentContainer.appendChild(userImg);
    contentContainer.appendChild(userInfoContainer);
    // contentContainer.appendChild(profileHobbyInfoContainer);
    contentContainer.appendChild(rightBtnContainer);

    // userContainer에 status_container와 content_container 추가
    userContainer.appendChild(statusContainer);
    userContainer.appendChild(contentContainer);

    // 유저 컨테이너를 반환합니다.
    return userContainer;
}

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
}

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


// 페이지 버튼 관리 function
function pageBtnHandler() {

    // 한 페이지당 표시할 프로필 수
    const profilesPerPage = 5;

    // 현재 페이지를 추적합니다. 초기값은 1페이지입니다.
    let currentPage = 1;

    // 매칭 프로필 컨테이너와 페이지네이션 요소를 선택합니다.
    const pagination = document.querySelector('.pagination');

    // 페이지 수를 계산합니다.
    const totalPages = Math.ceil(list_container.children.length / profilesPerPage);
    // console.log(`totalPages:${totalPages}`);
    // console.log(`list_container.children.length:${list_container.children.length}`);

    // page 그룹화 만들기
    const pagesPerGroup = 5;
    // 전체 페이지 수를 페이지 그룹 당 페이지 수로 나누어 총 페이지 그룹 수를 계산합니다.
    const totalPageGroups = Math.ceil(totalPages / pagesPerGroup);
    // 현재 페이지 그룹을 추적합니다. 초기값은 1페이지 그룹입니다.
    let currentPageGroup = 1;

    const targetHeight = 250; // 추가 여백으로 설정할 높이 (픽셀)

    // 페이지 버튼 생성 및 추가
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('li');
        pageButton.classList.add('page');
        pageButton.textContent = i;

        // 현재 페이지와 같은 페이지에 'active' 클래스 추가
        if (i === currentPage) {
            pageButton.classList.add('active');
        }

        pagination.appendChild(pageButton);
    }

    // 해당 페이지의 프로필을 표시하는 함수입니다.
    function showPage(page) {

        // console.log(`page:${page}`);
        // 표시할 프로필의 범위를 계산합니다.
        const start = (page - 1) * profilesPerPage;
        const end = start + profilesPerPage;

        // 모든 프로필 요소를 순회하며 해당 페이지에 표시할 것인지 여부를 결정합니다.
        for (let i = 0; i < list_container.children.length; i++) {
            const profile = list_container.children[i];
            if (i >= start && i < end) {
                profile.style.display = 'block';
            } else {
                profile.style.display = 'none';
            }
        }
    }

    // 페이지 그룹 내에서의 상대적인 활성 페이지 설정
    function setActivePageInGroup(relativePage) {
        const pageItems = pagination.querySelectorAll('.page');
        pageItems.forEach(item => item.classList.remove('active'));

        let activePageIndex = '';

        if (groupChangePageRecog === true) {
            if (prevNextPageBtnRecog === 'prev') {
                activePageIndex = pagesPerGroup;
            } else if (prevNextPageBtnRecog === 'next') {
                activePageIndex = relativePage;
            } else {
                activePageIndex = relativePage;
            }

        } else if (groupChangePageRecog === false) {
            activePageIndex = relativePage - (currentPageGroup - 1) * pagesPerGroup;
        }
        // console.log(`currentPageGroup:${currentPageGroup}`);
        // console.log(`relativePage:${relativePage}`);
        // 현재 페이지 그룹 내에서의 상대적인 페이지 번호를 사용하여 활성화 설정

        // console.log(`activePageIndex:${activePageIndex}`);
        pageItems[activePageIndex - 1].classList.add('active');
    }

    let groupChangePageRecog = false;
    let prevNextPageBtnRecog = '';

    // 페이지 그룹을 변경하는 함수
    function changePageGroup(group) {
        groupChangePageRecog = true;
        currentPageGroup = group;
        displayPageGroup(currentPageGroup);

        // 현재 페이지 그룹 내에서의 상대적인 페이지 번호 계산
        const relativePage = currentPage - (currentPageGroup - 1) * pagesPerGroup;

        // 페이지 그룹 내에서 활성 페이지 설정
        setActivePageInGroup(relativePage);
    }


    // 페이지 그룹을 표시할 함수를 만듭니다.
    function displayPageGroup(group) {
        // 페이지 그룹을 클리어합니다.
        pagination.innerHTML = '';

        // console.log(`totalPageGroups:${totalPageGroups}`);
        // console.log(`group:${group}`);

        // 이전 페이지 그룹 버튼을 생성합니다.
        if (totalPageGroups > 1) {
            if (group > 1) {
                const prevGroupButton = document.createElement('li');
                prevGroupButton.classList.add('prevGroup');
                prevGroupButton.textContent = '<<';
                pagination.appendChild(prevGroupButton);
            }
        }

        // 현재 페이지 그룹의 시작 페이지와 끝 페이지를 계산합니다.
        const startPage = (group - 1) * pagesPerGroup + 1;
        const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

        if (prevNextPageBtnRecog === 'prev') {
            currentPage = endPage;
        } else if (prevNextPageBtnRecog === 'next') {
            currentPage = startPage;
        } else {
            currentPage = startPage;
        }

        // 페이지 그룹에 해당하는 페이지 버튼을 생성합니다.
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('li');
            pageButton.classList.add('page');
            pageButton.textContent = i;

            // 현재 페이지인 경우 'active' 클래스를 추가합니다.
            if (i === currentPage) {
                pageButton.classList.add('active');
            }

            pagination.appendChild(pageButton);
        }

        // 다음 페이지 그룹 버튼을 생성합니다.
        if (totalPageGroups > 1) {
            if (!(totalPageGroups === group)) {
                const nextGroupButton = document.createElement('li');
                nextGroupButton.classList.add('nextGroup');
                nextGroupButton.textContent = '>>';
                pagination.appendChild(nextGroupButton);
            }
        }

        showPage(currentPage);
    }

    // 페이지 그룹 이동 버튼을 처리하는 함수입니다.
    pagination.addEventListener('click', (e) => {
        if (e.target.classList.contains('prevGroup')) {
            // 이전 페이지 그룹 버튼을 클릭한 경우
            prevNextPageBtnRecog = 'prev';
            // console.log(`currentPageGroup:${currentPageGroup}`);
            if (currentPageGroup > 1) {
                changePageGroup(currentPageGroup - 1);

                window.scrollTo({
                    top: list_container.offesetTop - targetHeight,
                    behavior: 'smooth'
                });
            }
        } else if (e.target.classList.contains('nextGroup')) {
            // 다음 페이지 그룹 버튼을 클릭한 경우
            prevNextPageBtnRecog = 'next';
            // console.log(`currentPageGroup:${currentPageGroup}`);
            // console.log(`totalPageGroups:${totalPageGroups}`);
            if (currentPageGroup < totalPageGroups) {
                changePageGroup(currentPageGroup + 1);

                window.scrollTo({
                    top: list_container.offesetTop - targetHeight,
                    behavior: 'smooth'
                });
            }
        } else if (e.target.classList.contains('page')) {
            prevNextPageBtnRecog = '';
            groupChangePageRecog = false;
            // 페이지 버튼을 클릭한 경우
            const page = parseInt(e.target.textContent);
            currentPage = page;
            showPage(page); // 선택한 페이지의 프로필을 표시합니다.
            setActivePageInGroup(page); // 활성 페이지를 설정합니다.

            window.scrollTo({
                top: list_container.offesetTop - targetHeight,
                behavior: 'smooth'
            });
        }


    });

    // 나타낼 페이지 그룹을 계산하여 초기에 표시합니다.
    function calculateInitialPageGroup() {
        const initialPageGroup = Math.ceil(currentPage / pagesPerGroup);
        changePageGroup(initialPageGroup);
    }

    calculateInitialPageGroup();
}