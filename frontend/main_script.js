'use strict';

const img = document.querySelector('.img');
const id = document.querySelector('.id');
const mbti = document.querySelector('.mbti');
const message = document.querySelector('.message');
const ageElement = document.querySelector('.age');
const regionElement = document.querySelector('.region');
const heightElement = document.querySelector('.height');
const occupationElement = document.querySelector('.occupation');
const workplaceElement = document.querySelector('.workplace');
const educationElement = document.querySelector('.education');
const religionElement = document.querySelector('.religion');
const drinkingElement = document.querySelector('.drinking');
const smokingElement = document.querySelector('.smoking');
const bloodTypeElement = document.querySelector('.blood_type');
const bodyTypeElement = document.querySelector('.body_type');
const styleElement = document.querySelector('.style');

const userListContainer = document.querySelector('.userList_container');

const recentBtn = document.querySelector('.recentBtn');
const regionBtn = document.querySelector('.regionBtn');
const heightBtn = document.querySelector('.heightBtn');
const mbtiBtn = document.querySelector('.mbtiBtn');
const occupationBtn = document.querySelector('.occupationBtn');

const btns = [recentBtn, regionBtn, heightBtn, mbtiBtn, occupationBtn];

let matchingOfferBtns = '';

// // URL에서 쿼리 파라미터 추출하는 함수
// function getQueryParams() {
//     const queryString = window.location.search;
//     const urlParams = new URLSearchParams(queryString);
//     return Object.fromEntries(urlParams.entries());
// }
  

// 이용자 회원정보 요청
fetch(`/mainProc`)
.then(response => response.json())
.then(data => {
    // console.log(data);
    id.textContent = data['id'];
    mbti.textContent = data['mbti'];
    ageElement.textContent = data['age'];
    regionElement.textContent = data['region'];
    heightElement.textContent = data['height'];
    occupationElement.textContent = data['occupation'];
    workplaceElement.textContent = data['workplace'];
    educationElement.textContent = data['education'];
    religionElement.textContent = data['religion'];
    drinkingElement.textContent = data['drinking'];
    smokingElement.textContent = data['smoking'];
    bloodTypeElement.textContent = data['blood_type'];
    bodyTypeElement.textContent = data['body_type'];
    styleElement.textContent = data['style'];
    message.innerHTML = `${data['id']}님 어서오세요😊 <br> Coumeet에서 좋은 인연 찾아시길 진심으로 응원하겠습니다🤞`;
    img.src = `../backend/uploads/${data['file']}`;

    // 페이지 열림과 동시에 최초 실행
    UserListRequest(); 
    categoryButtonChange(0);
})
.catch(error => {
    console.log(`Error : ${error}`);
});

// 이용자 List 요청
let userListData = [];
let categoryRecog = 'recent'; // 카테고리 선택 구분자

function UserListRequest() {

  // console.log('userListRequest');

  // 기존에 모든 요소 지우기
  while(userListContainer.firstChild) {
    userListContainer.removeChild(userListContainer.firstChild);
  }

  // 서버로 User LIst 요청
  fetch(`/mainProcUserList`, {
    method : 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        category: categoryRecog,
    })
  })
  .then(response => response.json())
  .then(data => {

    // 기본적으로 리셋
    userListData = [];

    if(data['result'] == 'undifined') {
      const message = document.createElement('div');
      message.textContent = '일치하는 값이 존재하지 않습니다.';
      message.classList.add('listMsg');
      userListContainer.appendChild(message);
    }
    userListData.push(data);
    // console.log(`userListData:${userListData}`);
    renderUserList(userListData);
    registerMatchingOfferBtnListeners();
  })
  .catch(error => {
    console.log(`Error : ${error}`);
  });
}

// 카테고리 버튼 클릭 시
recentBtn.addEventListener('click', (event) => {
  // 최신순 버튼 클릭 시 실행할 동작 작성
  event.preventDefault();
  categoryRecog = 'recent';
  categoryButtonChange(0);
  UserListRequest();
});

regionBtn.addEventListener('click', (event) => {
  // 지역 버튼 클릭 시 실행할 동작 작성
  event.preventDefault();
  categoryRecog = 'region';
  categoryButtonChange(1);
  UserListRequest();
});

heightBtn.addEventListener('click', (event) => {
  // 키 버튼 클릭 시 실행할 동작 작성
  event.preventDefault();
  categoryRecog = 'height';
  categoryButtonChange(2);
  UserListRequest(); 
});

mbtiBtn.addEventListener('click', (event) => {
  // MBTI 버튼 클릭 시 실행할 동작 작성
  event.preventDefault();
  categoryRecog = 'mbti';
  categoryButtonChange(3);
  UserListRequest(); 
});

occupationBtn.addEventListener('click', (event) => {
  // 직업 버튼 클릭 시 실행할 동작 작성
  event.preventDefault();
  categoryRecog = 'occupation';
  categoryButtonChange(4);
  UserListRequest(); 
});

// 카테고리 버튼 색깔 변경하는 function
function categoryButtonChange(number) {
  btns[number].style.backgroundColor = '#4c00ff';
  btns[number].style.color = 'white';

  for (let i = 0; i < btns.length; i++) {
    if (i === number) {
      continue;
    }
    btns[i].style.backgroundColor = 'transparent';
    btns[i].style.color = '#000000';
  }
}

// userList에 유저 컨테이너 정보를 랜더링
function renderUserList(userListData) {
  
  for(let i=0; i<userListData[0].length; i++){
    const userContainer = createUserContainer(userListData[0][i]);
    userListContainer.appendChild(userContainer);
    // console.log(`userListContainer:${userListContainer.firstChild}`);
  }
  // registerMatchingOfferBtnListeners();
}

// user container 생성
function createUserContainer(userData) {
  // console.log(userData);
  const userContainer = document.createElement('div');
  userContainer.classList.add('user_container');

  const userImage = document.createElement('img');
  userImage.src = `../backend/uploads/${userData.file}`;
  userImage.alt = 'User Image';
  userImage.classList.add('img');
  userContainer.appendChild(userImage);

  const detailContainer = document.createElement('div');
  detailContainer.classList.add('detail_container');

  const idContainer = document.createElement('div');
  idContainer.classList.add('id_container');
  const idLabel = document.createElement('label');
  idLabel.textContent = '아이디:';
  const idSpan = document.createElement('span');
  idSpan.textContent = userData.id;
  idContainer.appendChild(idLabel);
  idContainer.appendChild(idSpan);
  detailContainer.appendChild(idContainer);

  const ageContainer = document.createElement('div');
  ageContainer.classList.add('age_container');
  const ageLabel = document.createElement('label');
  ageLabel.textContent = '나이(생년월일):';
  const ageSpan = document.createElement('span');
  ageSpan.textContent = userData.age;
  ageContainer.appendChild(ageLabel);
  ageContainer.appendChild(ageSpan);
  detailContainer.appendChild(ageContainer);

  const regionContainer = document.createElement('div');
  regionContainer.classList.add('region_container');
  const regionLabel = document.createElement('label');
  regionLabel.textContent = '지역:';
  const regionSpan = document.createElement('span');
  regionSpan.textContent = userData.region;
  regionContainer.appendChild(regionLabel);
  regionContainer.appendChild(regionSpan);
  detailContainer.appendChild(regionContainer);

  const body_typeContainer = document.createElement('div');
  body_typeContainer.classList.add('body_type_container');
  const body_typeLabel = document.createElement('label');
  body_typeLabel.textContent = '체형:';
  const body_typeSpan = document.createElement('span');
  body_typeSpan.textContent = userData.body_type;
  body_typeContainer.appendChild(body_typeLabel);
  body_typeContainer.appendChild(body_typeSpan);
  detailContainer.appendChild(body_typeContainer);

  const styleContainer = document.createElement('div');
  styleContainer.classList.add('style_container');
  const styleLabel = document.createElement('label');
  styleLabel.textContent = '스타일:';
  const styleSpan = document.createElement('span');
  styleSpan.textContent = userData.style;
  styleContainer.appendChild(styleLabel);
  styleContainer.appendChild(styleSpan);
  detailContainer.appendChild(styleContainer);

  // 나머지 사용자 정보에 해당하는 HTML 요소를 동일하게 생성
  userContainer.appendChild(detailContainer);

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button_container');

  const matchingOfferBtn = document.createElement('button');
  matchingOfferBtn.textContent = '매칭 신청';
  matchingOfferBtn.classList.add('matchingOfferBtn');
  matchingOfferBtn.setAttribute('id', `${userData.id}_matchingOfferBtn`);
  buttonContainer.appendChild(matchingOfferBtn);

  const bookmarkBtn = document.createElement('button');
  bookmarkBtn.textContent = '찜하기';
  bookmarkBtn.classList.add('bookmarkBtn');
  matchingOfferBtn.setAttribute('id', `${userData.id}_bookmarkBtn`);
  buttonContainer.appendChild(bookmarkBtn);

  userContainer.appendChild(buttonContainer);

  return userContainer;
}


// 로그아웃 버튼 클릭 시
const logoutBtn = document.querySelector('.logoutBtn');

logoutBtn.addEventListener('click', (event)=>{

    event.preventDefault();

    fetch(`/logoutProc`)
    .then(() => {
      // 로그아웃 후 페이지를 갱신
      window.location.reload();
    })
    .catch(error => {
      console.log(`Error : ${error}`);
    });

});

// 회원 탈퇴 버튼 클릭 시
const withdrawBtn = document.querySelector('.withdrawBtn');

withdrawBtn.addEventListener('click', (event)=> {

    event.preventDefault();

    if(window.confirm('정말로 진행하시겠습니까?')){
        fetch(`/withdrawProc`)
        .then(() => {
            // 로그아웃 후 페이지를 갱신
            window.location.reload();
          })
          .catch(error => {
            console.log(`Error : ${error}`);
          });
    }
});


// 각 매칭 신청 버튼에 이벤트 리스너 등록하는 함수
function registerMatchingOfferBtnListeners() {
  const matchingOfferBtns = document.querySelectorAll('.matchingOfferBtn');
  matchingOfferBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();

      const idValue = btn.id.split('_')[0];
      console.log(`idValue:${idValue}`);

      if(window.confirm('매칭을 신청하겠습니까?')){
        fetch(`/matchingOffer`, {
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

          if(data['result'] == 'success'){
            alert('매칭 신청이 완료되었습니다.');

            // 매칭 리스트로 이동
            searchMate.style.display = 'none';
            matchingList.style.display = 'block';
            matchingCategoryBtnsChange(0);
            MatchingUserListRequest(); 

          } else if(data['result'] == 'history') {
            alert('매칭 이력이 있는 이용자입니다');
          }
          else {
            alert('알 수 없는 오류가 발생했습니다. 다시 신청해주세요.');
          }
        })
        .catch(error => {
          console.log(`Error : ${error}`);
        });
    }
    });
  });
}

const userListBtn = document.querySelector('.userListBtn');
const matchingListBtn = document.querySelector('.matchingListBtn');
const searchMate = document.querySelector('.searchMate');
const matchingList = document.querySelector('.matchingList');

// 이용자 목록 버튼 클릭 시
userListBtn.addEventListener('click', (event) => {

  event.preventDefault();

  searchMate.style.display = 'block';
  matchingList.style.display = 'none';

})



// 매칭현황 카테고리 선택 시 
const offerBtn = document.querySelector('.offerBtn');
const receiveBtn = document.querySelector('.receiveBtn');
const matchingBtn = document.querySelector('.matchingBtn');
const matchingCategoryBtns = [offerBtn, receiveBtn, matchingBtn];
let matchingCategoryRecog = 'offer';

const matchingList_user_container = document.querySelector('.matchingList_user_container');
let matchingUserListData = [];

// 매칭 현황 버튼 클릭 시
matchingListBtn.addEventListener('click', (event) => {

  event.preventDefault();

  searchMate.style.display = 'none';
  matchingList.style.display = 'block';
  matchingCategoryRecog = 'offer';
  matchingCategoryBtnsChange(0);
  MatchingUserListRequest(); 
})

offerBtn.addEventListener('click', (event) => {
  // 신청목록 버튼 클릭 시 실행할 동작 작성
  event.preventDefault();
  matchingCategoryRecog = 'offer';
  matchingCategoryBtnsChange(0);
  MatchingUserListRequest(); 
});

receiveBtn.addEventListener('click', (event) => {
  // 제안목록 버튼 클릭 시 실행할 동작 작성
  event.preventDefault();
  matchingCategoryRecog = 'receive';
  matchingCategoryBtnsChange(1);
  MatchingUserListRequest(); 
});

matchingBtn.addEventListener('click', (event) => {
  // 매칭목록 버튼 클릭 시 실행할 동작 작성
  event.preventDefault();
  matchingCategoryRecog = 'matching';
  matchingCategoryBtnsChange(2);
  MatchingUserListRequest(); 
});

function MatchingUserListRequest() {

  // console.log('userListRequest');

  // 기존에 모든 요소 지우기
  while(matchingList_user_container.firstChild) {
    matchingList_user_container.removeChild(matchingList_user_container.firstChild);
  }

  // 서버로 User LIst 요청
  fetch(`/matchingList`, {
    method : 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        category: matchingCategoryRecog,
    })
  })
  .then(response => response.json())
  .then(data => {

    console.log(data);

    // 기본적으로 리셋
    matchingUserListData = [];

    if(data['result'] == 'undifined') {
      const message = document.createElement('div');
      message.textContent = '일치하는 값이 존재하지 않습니다.';
      message.classList.add('listMsg');
      matchingList_user_container.appendChild(message);
    }
    matchingUserListData.push(data);
    console.log(`matchingUserListData:${matchingUserListData}`);
    matchingRenderUserList(matchingUserListData);
    MatchingAcceptBtnListeners(); // 수락 버튼 Event Listener 등록
    MatchingRejectBtnListeners() ; // 거절 버튼 Event Listener 등록

  })
  .catch(error => {
    console.log(`Error : ${error}`);
  });
}

// 카테고리 버튼 색깔 변경하는 function
function matchingCategoryBtnsChange(number) {
  matchingCategoryBtns[number].style.backgroundColor = '#4c00ff';
  matchingCategoryBtns[number].style.color = 'white';

  for (let i = 0; i < matchingCategoryBtns.length; i++) {
    if (i === number) {
      continue;
    }
    matchingCategoryBtns[i].style.backgroundColor = 'transparent';
    matchingCategoryBtns[i].style.color = '#000000';
  }
}

// userList에 유저 컨테이너 정보를 랜더링
function matchingRenderUserList(matchingUserListData) {

  // console.log(`matchingUserListData:${matchingUserListData[0][1].id}`);

  for(let i=0; i<matchingUserListData[0].length; i++){
    const userContainer = createMatchingUserContainer(matchingUserListData[0][i]);
    matchingList_user_container.appendChild(userContainer);
    // console.log(`userListContainer:${userListContainer.firstChild}`);
  }
  // registerMatchingOfferBtnListeners();
}

// user container 생성
function createMatchingUserContainer(userData) {

  console.log(`userData:${userData}`);

  const matchingUserContainer = document.createElement('div');
  matchingUserContainer.classList.add('matching_user_container');

  const userImage = document.createElement('img');
  userImage.src = `../backend/uploads/${userData.file}`;
  userImage.alt = 'User Image';
  matchingUserContainer.appendChild(userImage);

  const detailContainer = document.createElement('div');
  detailContainer.classList.add('detail_container');

  // id_container
  const idContainer = document.createElement('div');
  idContainer.classList.add('id_container');
  const idLabel = document.createElement('label');
  idLabel.textContent = '아이디:';
  const idSpan = document.createElement('span');
  idSpan.textContent = userData.id;
  idContainer.appendChild(idLabel);
  idContainer.appendChild(idSpan);
  detailContainer.appendChild(idContainer);

  // age_container
  const ageContainer = document.createElement('div');
  ageContainer.classList.add('age_container');
  const ageLabel = document.createElement('label');
  ageLabel.textContent = '나이(생년월일):';
  const ageSpan = document.createElement('span');
  ageSpan.textContent = userData.age;
  ageContainer.appendChild(ageLabel);
  ageContainer.appendChild(ageSpan);
  detailContainer.appendChild(ageContainer);

  // region_container
  const regionContainer = document.createElement('div');
  regionContainer.classList.add('region_container');
  const regionLabel = document.createElement('label');
  regionLabel.textContent = '지역:';
  const regionSpan = document.createElement('span');
  regionSpan.textContent = userData.region;
  regionContainer.appendChild(regionLabel);
  regionContainer.appendChild(regionSpan);
  detailContainer.appendChild(regionContainer);

  // body_type_container
  const bodyTypeContainer = document.createElement('div');
  bodyTypeContainer.classList.add('body_type_container');
  const bodyTypeLabel = document.createElement('label');
  bodyTypeLabel.textContent = '체형:';
  const bodyTypeSpan = document.createElement('span');
  bodyTypeSpan.textContent = userData.body_type;
  bodyTypeContainer.appendChild(bodyTypeLabel);
  bodyTypeContainer.appendChild(bodyTypeSpan);
  detailContainer.appendChild(bodyTypeContainer);

  // style_container
  const styleContainer = document.createElement('div');
  styleContainer.classList.add('style_container');
  const styleLabel = document.createElement('label');
  styleLabel.textContent = '스타일:';
  const styleSpan = document.createElement('span');
  styleSpan.textContent = userData.style;
  styleContainer.appendChild(styleLabel);
  styleContainer.appendChild(styleSpan);
  detailContainer.appendChild(styleContainer);

  matchingUserContainer.appendChild(detailContainer);

  // matchingDetail_container
  const matchingDetailContainer = document.createElement('div');
  matchingDetailContainer.classList.add('matchingDetail_container');

  // status_container
  const statusContainer = document.createElement('div');
  statusContainer.classList.add('status_container');
  const statusLabel = document.createElement('label');
  statusLabel.textContent = '상태:';
  const statusSpan = document.createElement('span');
  statusSpan.textContent = userData.result;
  statusContainer.appendChild(statusLabel);
  statusContainer.appendChild(statusSpan);
  matchingDetailContainer.appendChild(statusContainer);

  // offerdate_container
  const offerdateContainer = document.createElement('div');
  offerdateContainer.classList.add('offerdate_container');
  const offerdateLabel = document.createElement('label');
  offerdateLabel.textContent = '신청일:';
  const offerdateSpan = document.createElement('span');

  // 값이 있다면 한국 시간으로 받기
  if(userData.offer_date != null){
    
    const date = new Date(userData.offer_date);
    const koreaTime = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const formattedTime = koreaTime.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    offerdateSpan.textContent = formattedTime;
  } else {
    offerdateSpan.textContent = userData.offer_date;
  }

  offerdateContainer.appendChild(offerdateLabel);
  offerdateContainer.appendChild(offerdateSpan);
  matchingDetailContainer.appendChild(offerdateContainer);

  // matchingdate_container
  const matchingdateContainer = document.createElement('div');
  matchingdateContainer.classList.add('matchingdate_container');
  const matchingdateLabel = document.createElement('label');
  matchingdateLabel.textContent = '매칭일:';
  const matchingdateSpan = document.createElement('span');

  // 값이 있다면 한국 시간으로 받기
  if(userData.matching_date != null){
    console.log(`userData.matching_date : ${userData.matching_date}`);
    const matching_date = new Date(userData.matching_date);
    const matching_date_koreaTime = new Date(matching_date.getTime() + (9 * 60 * 60 * 1000));
    const matching_date_formattedTime = matching_date_koreaTime.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    matchingdateSpan.textContent = matching_date_formattedTime;
  } else {
    matchingdateSpan.textContent = userData.matching_date;
  }

  matchingdateContainer.appendChild(matchingdateLabel);
  matchingdateContainer.appendChild(matchingdateSpan);
  matchingDetailContainer.appendChild(matchingdateContainer);

  // datingregion_container
  const datingregionContainer = document.createElement('div');
  datingregionContainer.classList.add('datingregion_container');
  const datingregionLabel = document.createElement('label');
  datingregionLabel.textContent = '만남장소:';
  const datingregionSpan = document.createElement('span');
  datingregionSpan.textContent = userData.meeting_region;
  datingregionContainer.appendChild(datingregionLabel);
  datingregionContainer.appendChild(datingregionSpan);
  matchingDetailContainer.appendChild(datingregionContainer);

  // datindate_container
  const datindateContainer = document.createElement('div');
  datindateContainer.classList.add('datindate_container');
  const datindateLabel = document.createElement('label');
  datindateLabel.textContent = '만남일자:';
  const datindateSpan = document.createElement('span');
  datindateSpan.textContent = userData.meeting_date;
  datindateContainer.appendChild(datindateLabel);
  datindateContainer.appendChild(datindateSpan);
  matchingDetailContainer.appendChild(datindateContainer);

  matchingUserContainer.appendChild(matchingDetailContainer);

  // matchingBtn_container
  const matchingBtnContainer = document.createElement('div');
  matchingBtnContainer.classList.add('matchingBtn_container');

  if(matchingCategoryRecog == 'receive') {
    // acceptBtn
    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = '수락하기';
    acceptBtn.classList.add('acceptBtn');
    acceptBtn.setAttribute('id', `${userData.id}_acceptBtn`);
    matchingBtnContainer.appendChild(acceptBtn);

    const rejectBtn = document.createElement('button');
    rejectBtn.textContent = '거절하기';
    rejectBtn.classList.add('rejectBtn');
    rejectBtn.setAttribute('id', `${userData.id}_rejectBtn`);
    matchingBtnContainer.appendChild(rejectBtn);

    matchingUserContainer.appendChild(matchingBtnContainer);
  }

  return matchingUserContainer;

}


// 매칭 수락하기 => List 불러올 때 실행해야 함.
function MatchingAcceptBtnListeners() {
  const matchingAcceptBtns = document.querySelectorAll('.acceptBtn');
  matchingAcceptBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();

      const idValue = btn.id.split('_')[0];
      console.log(`idValue:${idValue}`);

      if(window.confirm('매칭을 수락하겠습니까?')){
        fetch(`/matchingAccept`, {
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

          if(data['result'] == 'success'){
            alert('매칭이 완료되었습니다.');
          } else {
            alert('알 수 없는 오류가 발생했습니다. 다시 신청해주세요.');
          }
        })
        .catch(error => {
          console.log(`Error : ${error}`);
        });
    }
    });
  });
}

// 매칭 거절하기 => List 불러올 때 실행해야 함.
function MatchingRejectBtnListeners() {
  const matchingRejectBtns = document.querySelectorAll('.rejectBtn');
  matchingRejectBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();

      const idValue = btn.id.split('_')[0];
      console.log(`idValue:${idValue}`);

      if(window.confirm('매칭을 거절하시겠습니까?')){
        fetch(`/matchingReject`, {
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

          if(data['result'] == 'success'){
            alert('매칭이 거절되었습니다.');
          } else {
            alert('알 수 없는 오류가 발생했습니다. 다시 신청해주세요.');
          }
        })
        .catch(error => {
          console.log(`Error : ${error}`);
        });
    }
    });
  });
}