"use strict"

let hostURL = 'http://localhost:3000/';

const pointcolor = '#DB7C8D';
// const frequencyColor = '#D9D9D9';

const loginLink = document.querySelector('.loginLink');
const navbarLink_container = document.querySelector('.navbarLink_container');

let btnRecog = '';
let point;
let navbarPopupRecog = false;

const currentURL = window.location.href;
let profileLink = '';
let signupStatus;

let selectedPointAmount;
let totalPointAmount;

loginStatusRequest(); // 로그인 상태 체크

// Function : 로그인 상태를 체크한다.
function loginStatusRequest() {
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
        // console.log(`data:${data.result}`); // 데이터를 처리
    
        if(data.result === 'Not Logged in') {
            URLconnectHandler();
        } else {
            // console.log(`data[0]:${data[0].id}`);
            const picture_1 = data[0].picture_1;
            const id = data[0].id;
            point = data[0].point;
            signupStatus = data[0].signupStatus;
    
            if(picture_1){
                //로그인이 되어서 id값을 받았을 경우
                loginLink.style.display = 'none';
        
                // 대시보드 링크 만들기
                const dashboardLink = document.createElement('a');
                dashboardLink.href = "";
                dashboardLink.textContent = '대시보드';
                dashboardLink.className = 'dashboardLink';

                dashboardLink.addEventListener('click', (e) => {
                    console.log(`대시보드 링크 클릭!`);
                    e.preventDefault();

                    btnRecog = 'dashboard';
                    window.location.href = `${hostURL}dashboard?categoryRecog=open`;
                });
        
                navbarLink_container.appendChild(dashboardLink);
        
                // console.log(`data.picture_1:${picture_1}`);
        
                // 이미지 프로필 만들기
                profileLink = document.createElement('a');
                const profileImg = document.createElement('img');
                profileLink.classList.add('myprofileLink');
                profileImg.classList.add('picture');
                profileImg.src = `../backend/uploads/${id}/${picture_1}`;
                profileImg.alt = '';

                // 마이 프로필 링크 클릭 시
                profileLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`마이프로필 링크 클릭!`);
                    window.location.href = `${hostURL}myprofile/profile`;
                });
        
                profileLink.appendChild(profileImg);
                navbarLink_container.appendChild(profileLink);

                // 포인트 창 만들기
                const pointContainer = document.createElement('div');
                pointContainer.classList.add('point_container');
                navbarLink_container.appendChild(pointContainer);

                const pointBtn = document.createElement('p');
                pointBtn.classList.add('pointBtn');
                pointBtn.textContent = point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                pointContainer.appendChild(pointBtn);

                // 포인트 버튼 클릭 시
                pointBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`포인트 버튼 클릭!`);
                    window.location.href = `${hostURL}myprofile/point`;      
                });

                const chargeBtn = document.createElement('button');
                chargeBtn.classList.add('chargeBtn');
                chargeBtn.textContent = '충전하기';
                pointContainer.appendChild(chargeBtn);

                // 충전하기 버튼 클릭 시
                chargeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`충전하기 버튼 클릭!`);

                    //회원가입 상태가 CONFIRM일 경우에만 진행
                    if(signupStatus === 'CONFIRM') {
    
                        // 포인트 충전 정보 받아오기
                        fetch(`/pointRechargeInfoProC`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                            })
                        })
                        .then(response => response.json())
                        .then(data => {

                            const pointRechargeInfo = data.pointRechargeInfo;
                            const userPoint = data.userPoint[0].point;
    
                            const navbarPointRechargePopupContainer = document.querySelector('#navbarPointRechargePopupContainer');
                            navbarPopupOpenHandler(navbarPointRechargePopupContainer);

                            const navbarPointRechargeTotalPoint = document.querySelector('#navbarPointRechargeTotalPoint');
                            navbarPointRechargeTotalPoint.textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';

                            const navbarPointRechargeUsagePoint = document.querySelector('#navbarPointRechargeUsagePoint');
                            navbarPointRechargeUsagePoint.textContent = '+ 0P';
                          
                            const navbarPointRechargeUserPoint = document.querySelector('#navbarPointRechargeUserPoint');
                            navbarPointRechargeUserPoint.textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
    
                            // 토글에 적용시키기
                            const packagesArray = [];
                            // package_x 프로퍼티를 순회하며 배열에 추가
                            for (let i = 1; pointRechargeInfo[0]['package_' + i] !== undefined; i++) {
                            packagesArray.push(pointRechargeInfo[0]['package_' + i]);
                            }
                            // console.log('packagesArray: ', packagesArray);
    
                            // 동적으로 생성할 부모 요소를 선택합니다.
                            const navbarPointRechargeToggle_container = document.querySelector('#navbarPointRechargeToggle_container');
    
                            // 토글 컨테이너의 요소를 모두 지우기
                            while(navbarPointRechargeToggle_container.firstChild) {
                                navbarPointRechargeToggle_container.removeChild(navbarPointRechargeToggle_container.firstChild);
                            }
    
                            // contentsArray 배열의 각 요소에 대해 반복합니다.
                            packagesArray.forEach((content, index) => {
                            // 새로운 요소를 생성합니다.
                            const toggleContentContainer = document.createElement('div');
                            toggleContentContainer.classList.add('toggleContent_container');
                            toggleContentContainer.setAttribute('id', 'pointRechargeToggleCotent_container');
    
    
                            const circleIcon = document.createElement('i');
                            circleIcon.classList.add('fa-regular', 'fa-circle');
                            circleIcon.setAttribute('id', 'toggleBtnIcon');
                            circleIcon.style.color = '#000000';
    
                            const toggleContent = document.createElement('span');
                            toggleContent.classList.add('rechargePoint');
                            toggleContent.textContent = content.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
    
                            const toggleContentAmout = document.createElement('span');
                            toggleContentAmout.classList.add('rechargePointAmount');
                            toggleContentAmout.textContent = '(' + (content*10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '원)';;
    
                            // 부모 요소에 자식 요소를 추가합니다.
                            toggleContentContainer.appendChild(circleIcon);
                            toggleContentContainer.appendChild(toggleContent);
                            toggleContentContainer.appendChild(toggleContentAmout);
                            navbarPointRechargeToggle_container.appendChild(toggleContentContainer);      
                            });
    
                            const toggleContentContainers = document.querySelectorAll('.toggleContent_container');
                            let selectedToggle = null; // 선택된 토글을 추적하기 위한 변수
                            
                            toggleContentContainers.forEach((toggleContentContainer) => {
                                const icon = toggleContentContainer.querySelector('#toggleBtnIcon');
                                toggleContentContainer.addEventListener('click', (e) => {
                                    // console.log('target:',e.target);
                                    if (icon) {
                                        // 다른 토글을 클릭한 경우, 선택 상태로 변경
                                        if (selectedToggle) {
                                        // 이미 선택된 토글이 있으면 선택 해제
                                        const selectedIcon = selectedToggle.querySelector('#toggleBtnIcon');
                                        selectedIcon.classList.remove('fa-solid', 'fa-circle-check');
                                        selectedIcon.classList.add('fa-regular', 'fa-circle');
                                        selectedIcon.style.color = '#000000';
                                        }
                                        icon.classList.remove('fa-regular', 'fa-circle');
                                        icon.classList.add('fa-solid', 'fa-circle-check');
                                        icon.style.color = '#000000';
                                        selectedToggle = toggleContentContainer; // 현재 토글 선택
                                        // const selectedContent = e.target.textContent; // 클릭한 토글의 내용
                                        // console.log(`선택된 토글: ${selectedContent}`);  
                                        const selectedContentParent = e.target.parentNode;
                                        const selectedPointPackage = selectedContentParent.querySelector('.rechargePoint').textContent;
                                        selectedPointAmount = parseInt(selectedPointPackage.replace(/\D/g, ''), 10);
                                        console.log('selectedPointAmount:', selectedPointAmount); // 숫자만 출력 
                                        
                                        // 선택한 포인트에 따라서 값 변동하기
                                        const navbarPointRechargeUsagePoint = document.querySelector('#navbarPointRechargeUsagePoint');
                                        navbarPointRechargeUsagePoint.textContent = '+ ' + selectedPointAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
    
                                        totalPointAmount = point + selectedPointAmount;
    
                                        const navbarPointRechargeTotalPoint = document.querySelector('#navbarPointRechargeTotalPoint');
                                        navbarPointRechargeTotalPoint.textContent = totalPointAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                                    }
                                });
                            });
                        })
                        .catch(error => {
                            console.log(`포인트 충전 정보 불러오기 Error : ${error}`);
                        });


                    }
                    // 회원가입 상태가 CONFIRM이 아닐 경우 
                    else { 
                        alert('회원 상태를 확인해주세요');
                        window.location.href = `${hostURL}myprofile/profile`;      
                    }
                });

                // 충전하기 팝업 완료 버튼 클릭 시
                const pointRechargeConfirmBtn = document.querySelector('#navbarPointRechargeConfirmBtn');
                pointRechargeConfirmBtn.addEventListener('click', async (e) => {
                    console.log('충전하기 팝업 완료 버튼 클릭!');
                    e.preventDefault();
                    e.stopPropagation();

                    console.log(`===========`);
                    console.log('selectedPointAmount:',selectedPointAmount);
                    console.log('totalPointAmount:',totalPointAmount);

                    const confirmMSG = '포인트 충전하시겠습니까?';
                    console.log('Before confirm');
                    if (window.confirm(confirmMSG)) {
                        console.log('After confirm');
                        try {
                            console.log('Before fetch');
                            // 포인트 충전하기
                            const response = await fetch(`/pointRechargeProC`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    selectedPointAmount: selectedPointAmount,
                                    totalPointAmount: totalPointAmount,
                                })
                            });
                            console.log('After fetch');
                            const data = await response.json();

                            if(data['result'] === 'SUCCESS') {
                                alert('포인트 충전이 완료되었습니다.');

                                // 팝업창을 닫는다.
                                const navbarPointRechargePopupContainer = document.querySelector('#navbarPointRechargePopupContainer');
                                const pointRechargeOverlay = document.querySelector('.pointRechargeOverlay');
                                navbarPointRechargePopupContainer.style.transform = 'translate(-50%, -50%) scale(0.9)';
                                navbarPointRechargePopupContainer.style.opacity = 0;

                                // 모바일의 경우
                                if(navbarMyprofileRecog) {
                                    pointRechargeOverlay.style.opacity = 0;
                                    pointRechargeOverlay.style.display = 'none';
                                    navbarPopupRecog = false;
                                }
                                // 모바일이 아닐 경우
                                else {
                                    const overlay = document.querySelector('.navbarOverlay');
                                    overlay.style.opacity = 0;
                                    overlay.style.display = 'none';                                
                                }

                                setTimeout(() => {
                                    navbarPointRechargePopupContainer.style.display = 'none';
                                }, 300); // 애니메이션 지속 시간 (0.3초) 후 숨김

                                // 포인트를 변경한다.
                                const pointBtn = document.querySelector('.pointBtn');
                                pointBtn.textContent = totalPointAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
                            } else {
                                console.log('포인트 충전에 실패했습니다.');
                                alert('포인트 충전에 실패했습니다.');
                            }
                        } catch (error) {
                            console.log(`포인트 충전하기 Error : ${error}`);
                            alert('포인트 충전에 실패했습니다.');
                        }   
                    }
                });

                // 충전하기 팝업 X버튼 클릭 시
                const navbarPointRechargeXBtn = document.querySelector('#navbarPointRechargeXBtn');
                navbarPointRechargeXBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('충전하기 팝업 X버튼 클릭!');
                    const navbarPointRechargePopupContainer = document.querySelector('#navbarPointRechargePopupContainer');
                    navbarPopUpXBtnClickHandler(navbarPointRechargePopupContainer);
                });

                URLconnectHandler();
            }
        }
    })
    .catch(error => {
        console.error(error); // 오류 처리
    });
}

function URLconnectHandler() {

    if(currentURL === hostURL || currentURL === `${hostURL}matchinglist`) {
        btnRecog = 'matchingList';
        const matchingListLink = document.querySelector('.matchingListLink');
        matchingListLink.style.borderBottom = 'solid 2px var(--point-color)';
        matchingListLink.style.color = pointcolor;
        matchingListLink.style.fontWeight = 'bold';
    } else if(currentURL === `${hostURL}service`) {
        btnRecog = 'service';
        const serviceInfo = document.querySelector('.serviceInfo');
        serviceInfo.style.borderBottom = 'solid 2px var(--point-color)';
        serviceInfo.style.fontWeight = 'bold';
        serviceInfo.style.color = pointcolor;
    } else if(currentURL === `${hostURL}login`) {
        btnRecog = 'login';
        const loginLink = document.querySelector('.loginLink');
        loginLink.style.borderBottom = 'solid 2px var(--point-color)';
        loginLink.style.fontWeight = 'bold';
        loginLink.style.color = pointcolor;
    } else if(currentURL === `${hostURL}dashboard?categoryRecog=open` || currentURL === `${hostURL}dashboard?categoryRecog=receive` || currentURL === `${hostURL}dashboard?categoryRecog=offer` || currentURL === `${hostURL}dashboard?categoryRecog=matching`) {
        btnRecog = 'dashboard';
        const loginLink = document.querySelector('.dashboardLink');
        loginLink.style.borderBottom = 'solid 2px var(--point-color)';
        loginLink.style.fontWeight = 'bold';
        loginLink.style.color = pointcolor;
    } else if(currentURL === `${hostURL}myprofile/profile` || currentURL === `${hostURL}myprofile/point` || currentURL === `${hostURL}myprofile/review` || currentURL === `${hostURL}myprofile/changepw` || currentURL === `${hostURL}myprofile/withdraw`) {
        btnRecog = 'myprofile';
        console.log('navbarMyprofileRecog:',navbarMyprofileRecog);
        if(!navbarMyprofileRecog) {
            if(profileLink) {
                // console.log(`profileLink:${profileLink}`);
                profileLink.style.borderBottom = 'solid 2px var(--point-color)';
                // profileLink.style.fontWeight = 'bold';
                // profileLink.style.color = pointcolor;
            }
        } else {
            profileLink.style.borderBottom = 'transparent';

        }
    } else if(currentURL === `${hostURL}faq`) {
        btnRecog = 'faq';
        const faqLink = document.querySelector('.faq');
        faqLink.style.borderBottom = 'solid 2px var(--point-color)';
        faqLink.style.fontWeight = 'bold';
        faqLink.style.color = pointcolor;
    } else if(currentURL === `${hostURL}aimatching`) {
        btnRecog = 'aimatching';
        const aimatchingLink = document.querySelector('.aimatchingLink');
        aimatchingLink.style.borderBottom = 'solid 2px var(--point-color)';
        aimatchingLink.style.fontWeight = 'bold';
        aimatchingLink.style.color = pointcolor;
        const pointText = document.querySelector('.pointText');
        pointText.style.display = 'block';
        pointText.style.textAlign = 'center';
    }
    
    if(currentURL === `${hostURL}myprofile/profile`) {
        const profileManagementLink = document.querySelector('.profileManagementLink');
        profileManagementLink.classList.add('selected');
    }

    if(currentURL === `${hostURL}myprofile/point`) {
        const pointManagementLink = document.querySelector('.pointManagementLink');
        pointManagementLink.classList.add('selected');
    }

    if(currentURL === `${hostURL}myprofile/review`) {
        const mannerReivewLink = document.querySelector('.mannerReivewLink');
        mannerReivewLink.classList.add('selected');
    }

    if(currentURL === `${hostURL}myprofile/changepw`) {
        const pwChangeLink = document.querySelector('.pwChangeLink');
        pwChangeLink.classList.add('selected');
    }

    if(currentURL === `${hostURL}myprofile/withdraw`) {
        const withdrawLink = document.querySelector('.withdrawLink');
        withdrawLink.classList.add('selected');
    }
}


const logo = document.querySelector('.logo');

// Function : 로고 클릭 시
logo.addEventListener('click', (event)=> {

    event.preventDefault();
    console.log('logo click!');

    btnRecog = 'matchingList';
    window.location.href = `${hostURL}`;

});

const serviceInfo = document.querySelector('.serviceInfo');

// Function : 서비스 소개 버튼 클릭 시
serviceInfo.addEventListener('click', (event)=> {
    event.preventDefault();

    btnRecog = 'serviceInfo';
    window.location.href = `${hostURL}service`;

});

// 로그인 버튼 선택 시
loginLink.addEventListener('click', (event)=> {
    event.preventDefault();

    btnRecog = 'login';
    window.location.href = `${hostURL}login`;

});

// FAQ 버튼 클릭 시 
const faqLink = document.querySelector('.faq');
faqLink.addEventListener('click', (event)=> {
    event.preventDefault();

    btnRecog = 'faq';
    window.location.href = `${hostURL}faq`;

});

// AI매칭 버튼 클릭 시 
const aimatchingLink = document.querySelector('.aimatchingLink');

aimatchingLink.addEventListener('click', (event)=> {
    event.preventDefault();

    btnRecog = 'aimatching';
    window.location.href = `${hostURL}aimatching`;

});

// 매칭 리스트 버튼 클릭 시 
const matchingListLink = document.querySelector('.matchingListLink');

matchingListLink.addEventListener('click', (event)=> {
    event.preventDefault();

    btnRecog = 'matchingList';
    window.location.href = `${hostURL}`;

});

// 팝업창 open Handler function
function navbarPopupOpenHandler(container) {

    console.log('navbarMyprofileRecog:',navbarMyprofileRecog);
    navbarPopupRecog = true;

    if(navbarMyprofileRecog) {
        const pointRechargeOverlay = document.querySelector('.pointRechargeOverlay');
        pointRechargeOverlay.style.display = 'block';
    }

    const overlay = document.querySelector('.navbarOverlay');
    container.style.display = 'block';
    overlay.style.display = 'block';
    
    requestAnimationFrame(() => {
        container.style.opacity = 1;
        container.style.transform = 'translate(-50%, -50%) scale(1)';
        overlay.style.opacity = 1;

        if(navbarMyprofileRecog) {
            pointRechargeOverlay.style.opacity = 1;
        }
    });
}

// 팝업창 X버튼 클릭 Handler function
function navbarPopUpXBtnClickHandler(container) {
    container.style.opacity = 0;
    container.style.transform = 'translate(-50%, -50%) scale(0.9)';


    if(navbarMyprofileRecog) {
        const pointRechargeOverlay = document.querySelector('.pointRechargeOverlay');
        pointRechargeOverlay.style.opacity = 0;
        pointRechargeOverlay.style.display = 'none';

        // 애니메이션이 끝난 후 숨김
        setTimeout(() => {
            container.style.display = 'none';
            navbarPopupRecog = false;
        }, 300); // 애니메이션 지속 시간 (0.3초) 후 숨김
    } else {
        const overlay = document.querySelector('.navbarOverlay');
        overlay.style.opacity = 0;

        // 애니메이션이 끝난 후 숨김
        setTimeout(() => {
            container.style.display = 'none';
            overlay.style.display = 'none';
        }, 300); // 애니메이션 지속 시간 (0.3초) 후 숨김
    }
}

//// 반응형에서 메뉴 버튼 클릭 시 /////
const menuBtn = document.querySelector('.menuBtn');
let navbarMyprofileRecog = false;


menuBtn.addEventListener('click', (e) => {

    navbarMyprofileRecog = true;

    e.preventDefault();
    const navbarLink_container = document.querySelector('.navbarLink_container');
    const overlay = document.querySelector('.navbarOverlay');
    const serviceInfo = document.querySelector('.serviceInfo');
    const myprofileLink = document.querySelector('.myprofileLink');
    const point_container = document.querySelector('.point_container');

    if(myprofileLink) {
        navbarLink_container.insertBefore(myprofileLink, serviceInfo);
        navbarLink_container.insertBefore(point_container, serviceInfo);
    }


    // 이용자가 로그인 상태라면 loginMenubar를 나타내게 한다.
    if(signupStatus) {
        const loginMenubar = document.createElement('div');
        loginMenubar.classList.add('loginMenubar');
    
        const profileManagementLink = document.createElement('a');
        profileManagementLink.classList.add('profileManagementLink');
        profileManagementLink.textContent = '프로필 관리';
        loginMenubar.appendChild(profileManagementLink);
    
        const pointManagementLink = document.createElement('a');
        pointManagementLink.classList.add('pointManagementLink');
        pointManagementLink.textContent = '포인트 관리';
        loginMenubar.appendChild(pointManagementLink);
    
        const mannerReivewLink = document.createElement('a');
        mannerReivewLink.classList.add('mannerReivewLink');
        mannerReivewLink.textContent = '매너 후기';
        loginMenubar.appendChild(mannerReivewLink);
    
        const pwChangeLink = document.createElement('a');
        pwChangeLink.classList.add('pwChangeLink');
        pwChangeLink.textContent = '비밀번호 변경';
        loginMenubar.appendChild(pwChangeLink);
    
        const logoutLink = document.createElement('a');
        logoutLink.classList.add('logoutLink');
        logoutLink.textContent = '로그아웃';
        loginMenubar.appendChild(logoutLink);
    
        const withdrawLink = document.createElement('a');
        withdrawLink.classList.add('withdrawLink');
        withdrawLink.textContent = '회원탈퇴';
        loginMenubar.appendChild(withdrawLink);
    
        navbarLink_container.appendChild(loginMenubar);

        // '프로필 관리' 버튼 클릭 시
        profileManagementLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('프로필 관리 버튼 클릭!');
            window.location.href = `${hostURL}myprofile/profile`;
        });

        //////////////////// 포인트 관리 ///////////////////////////////////////
        pointManagementLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('포인트 관리 클릭!');
            window.location.href = `${hostURL}myprofile/point`; 
        });

        //////////////////// 매너 후기 ///////////////////////////////////////
        mannerReivewLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('매너 후기 클릭!');
            window.location.href = `${hostURL}myprofile/review`; 
        });

        //////////////////// 비밀번호 변경 ///////////////////////////////////////
        pwChangeLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('비밀번호 변경 클릭!');
            window.location.href = `${hostURL}myprofile/changepw`; 
        });


        //////////////////// 로그아웃 ///////////////////////////////////////
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
        withdrawLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('회원탈퇴 클릭!');
            window.location.href = `${hostURL}myprofile/withdraw`; 
        });
    }

    navbarLink_container.classList.toggle('show');
    overlay.style.display = 'block';

    if (navbarLink_container.classList.contains('show')) {
        requestAnimationFrame(() => {
            overlay.style.opacity = 1;
            navbarLink_container.style.visibility = 'visible';
            navbarLink_container.style.opacity = 1;
        });
    } else {
        overlay.style.opacity = 0;
        navbarLink_container.style.opacity = 0;

        // 일정 시간 후에 숨김 처리
        setTimeout(() => {
            overlay.style.display = 'none';
            navbarLink_container.style.visibility = 'hidden';
        }, 300); // 0.3초 (트랜지션 시간과 일치하도록 조절)
    }

    URLconnectHandler();
});

// document에 클릭 이벤트 추가
document.addEventListener('click', (e) => {
    const target = e.target;
    const overlay = document.querySelector('.navbarOverlay');

    // console.log('navbarPopupRecog:',navbarPopupRecog);

    const windowWidth = window.innerWidth;

    if (windowWidth < 768) {

        // 팝업이 켜져있을 경우에는 실행하지 않는다.
        if(!navbarPopupRecog) {
            // 클릭된 요소가 navbarLink_container 또는 그 자식 요소이며, navbarLink_container가 display: block인 경우는 무시
            if (
                target.closest('.navbarLink_container') ||
                (navbarLink_container.classList.contains('show') && target.closest('.navbar_container'))
            ) {
                return;
            }

            // 클릭된 요소가 navbarLink_container가 아니라면 숨김 처리
            navbarLink_container.classList.remove('show');
            overlay.style.display = 'none';
            overlay.style.opacity = 0;
            navbarLink_container.style.opacity = 0;
            navbarMyprofileRecog = false;

            // 로그인 메뉴바 삭제하기
            const loginMenubar = document.querySelector('.loginMenubar');
            if(loginMenubar) {
                loginMenubar.remove();
            }
            
            // 일정 시간 후에 숨김 처리
            setTimeout(() => {
                navbarLink_container.style.visibility = 'hidden';
            }, 300); // 0.3초 (트랜지션 시간과 일치하도록 조절)
        }
    } 
});


// 창 크기 변경 이벤트를 감지하는 함수
function handleResize() {
    const windowWidth = window.innerWidth;

    // 767px를 초과하는 경우
    if (windowWidth > 767) {
        // 원하는 동작을 수행
        // console.log('창 너비가 767px를 초과합니다.');
        const navbarLink_container = document.querySelector('.navbarLink_container');
        navbarLink_container.style.visibility = 'visible';
        navbarLink_container.style.opacity = 1;
        const dashboardLink = document.querySelector('.dashboardLink');
        const myprofileLink = document.querySelector('.myprofileLink');
        const point_container = document.querySelector('.point_container');

        if(dashboardLink) {
            navbarLink_container.appendChild(myprofileLink);
            navbarLink_container.appendChild(point_container);
        }
        
        if(btnRecog==='myprofile') {
            profileLink.style.borderBottom = 'solid 2px var(--point-color)';
        }
    }
}

handleResize();
window.addEventListener('resize', handleResize);


