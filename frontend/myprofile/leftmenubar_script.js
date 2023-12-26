let myprofileRecog = '';

// 좌측 메뉴에 정보 넣기

LeftmenuInfoRequest();

function LeftmenuInfoRequest() {
    fetch(`/myprofile/leftmenuProc`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        })
    })
    .then(response => response.json())
    .then(data => {
        myprofileRecog = data['myprofileRecog'];
        // console.log(`data['myprofileRecog'][0]:${data['myprofileRecog']}`);
        
        const picture = document.createElement('img');
        picture.classList.add('picture');
        picture.src = `../../backend/uploads/${data['data'][0].id}/${data['data'][0].picture_1}`;
        console.log('picture.src:',picture.src);

        const leftMenu_container = document.querySelector('.leftMenu_container');
        const menuContainer = document.querySelector('.menu_container');
        leftMenu_container.insertBefore(picture, menuContainer);

        LeftmenuRecogHandler(myprofileRecog);
    })
    .catch(error => {
        // window.location.href = 'http://localhost:3000/';
        console.log(`이용자 사진 이미지 불러오기 Error : ${error}`);
    });
}

function LeftmenuRecogHandler(myprofileRecog) {

    // 모든 메뉴 항목을 선택 취소
    const menuItems = document.querySelectorAll('.menu_container a');
    menuItems.forEach((menuItem) => {
        menuItem.classList.remove('selected');
    });

    // 선택한 항목에 selected 클래스 추가
    switch (myprofileRecog) {
        case 'profile':
        document.querySelector('.profileManagementLink').classList.add('selected');
        break;
        case 'point':
        document.querySelector('.pointManagementLink').classList.add('selected');
        break;
        case 'manner':
        document.querySelector('.mannerReivewLink').classList.add('selected');
        break;
        case 'pw':
        document.querySelector('.pwChangeLink').classList.add('selected');
        break;
        case 'review':
        document.querySelector('.mannerReivewLink').classList.add('selected');
        break;
        case 'changepw':
        document.querySelector('.pwChangeLink').classList.add('selected');
        break;
        case 'withdraw':
        document.querySelector('.withdrawLink').classList.add('selected');
        break;
        default:
        break;
    }
}

// '프로필 관리' 버튼 클릭 시
const profileManagementLink = document.querySelector('.profileManagementLink');

profileManagementLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('프로필 관리 버튼 클릭!');
    window.location.href = `${hostURL}myprofile/profile`;
});

//////////////////// 포인트 관리 ///////////////////////////////////////
const pointManagementLink = document.querySelector('.pointManagementLink');

pointManagementLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('포인트 관리 클릭!');
    window.location.href = `${hostURL}myprofile/point`; 
});

//////////////////// 매너 후기 ///////////////////////////////////////
const mannerReivewLink = document.querySelector('.mannerReivewLink');

mannerReivewLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('매너 후기 클릭!');
    window.location.href = `${hostURL}myprofile/review`; 
});

//////////////////// 비밀번호 변경 ///////////////////////////////////////
const pwChangeLink = document.querySelector('.pwChangeLink');

pwChangeLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('비밀번호 변경 클릭!');
    window.location.href = `${hostURL}myprofile/changepw`; 
});


//////////////////// 로그아웃 ///////////////////////////////////////
const logoutLink = document.querySelector('.logoutLink');

logoutLink.addEventListener('click', (e) => {
    e.preventDefault();

    console.log(`로그아웃 클릭!`);

    fetch('/logoutProc', {
        method: 'GET',
    })
    .then((response) => {
        if (response.status === 200) {
            // 로그아웃 성공 시, 원하는 동작 수행 (예: 리다이렉트 또는 메시지 표시)
            window.location.href = hostURL; // 메인 페이지로 리다이렉트
        } else {
            // 로그아웃 실패 시, 오류 처리
            console.error('로그아웃 실패');
        }
    })
    .catch((error) => {
        console.error('로그아웃 요청 오류:', error);
    });
});

//////////////////// 회원탈퇴 ///////////////////////////////////////
const withdrawLink = document.querySelector('.withdrawLink');

withdrawLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('회원탈퇴 클릭!');
    window.location.href = `${hostURL}myprofile/withdraw`; 
});