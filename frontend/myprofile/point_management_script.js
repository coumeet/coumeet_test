let userPoint = '';
let eventPoint;
let pointSignupStatus;

const pointUsages_container = document.querySelector('.pointUsages_container');

////// 서버에서 정보 받아오기 //////

userPointInfoRequest();

// id의 포인트 값을 받아오기
function userPointInfoRequest() {
  fetch('/myprofile/userPointProc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({

    })
  })
  .then(response => response.json())
  .then(data => {
    // console.log('data:', data);
    userPoint = data['point'];
    eventPoint = data['eventPoint'];
    pointSignupStatus = data['signupStatus'];
    console.log('eventPoint:',eventPoint);
    // console.log(`pointSignupStatus:${pointSignupStatus}`);
    const pointUsages = data['pointUsages'];
    // console.log('pointUsages:',pointUsages);
    const pointAmount = document.querySelector('.pointAmount');
    pointAmount.textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
    // console.log(`userPoint:${userPoint}`);
    // console.log(`pointUsages:${pointUsages[0].matchingUser}`);

    // 포인트 Usages에 있는 내용 지우기
    while(pointUsages_container.firstChild) {
      pointUsages_container.removeChild(pointUsages_container.firstChild);
    }

    for(let i=0; i<pointUsages.length; i++) {
      const pointUsageContainer = createPointUsageContainer(pointUsages[i]);
      pointUsages_container.appendChild(pointUsageContainer);
    } 

    showMoreBtnHandler();

  })
  .catch(error => {
    console.log(`이용자 포인트 정보 불러오기 Error : ${error}`);
  });
}

// 포인트 사용 내역 컨테이너 생성
function createPointUsageContainer(pointUsages) {
  const pointUsageTotal_container = document.createElement('div');
  pointUsageTotal_container.classList.add('pointUsageTotal_container');

  const pointUsage_container = document.createElement('div');
  pointUsage_container.classList.add('pointUsage_container');
  pointUsageTotal_container.appendChild(pointUsage_container);

  const pointUsageTitle = document.createElement('div');
  pointUsageTitle.classList.add('pointUsageTitle');
  pointUsageTitle.textContent = pointUsages.type;
  pointUsage_container.appendChild(pointUsageTitle);

  const pointUsageContent_container = document.createElement('div');
  pointUsageContent_container.classList.add('pointUsageContent_container');
  pointUsage_container.appendChild(pointUsageContent_container);

  const pointUsage = document.createElement('div');
  pointUsage.classList.add('pointUsage');
  if(pointUsages.type === '사용' || pointUsages.type === '환불') {
    pointUsage.textContent = '- ' + pointUsages.usagePoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P'
  } else {
    pointUsage.textContent = pointUsages.usagePoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P'
  }
  pointUsageContent_container.appendChild(pointUsage);

  const pointUsageDetail_container = document.createElement('div');
  pointUsageDetail_container.classList.add('pointUsageDetail_container');
  pointUsageContent_container.appendChild(pointUsageDetail_container);

  const pointUsageNumber = document.createElement('span');
  pointUsageNumber.classList.add('pointUsageNumber');
  pointUsageNumber.textContent = `이용번호 : ${pointUsages.SN}, `;

  const pointUsageDate = document.createElement('span');
  pointUsageDate.classList.add('pointUsageDate');
  const userDate = new Date(pointUsages.date);
  const formattedDate = formatDate(userDate);
  pointUsageDate.textContent = `일자 : ${formattedDate}, `;

  pointUsageDetail_container.appendChild(pointUsageNumber);
  pointUsageDetail_container.appendChild(pointUsageDate);

  if (pointUsages.type !== '충전') {

      if(pointUsages.type === '사용') {
        pointUsageTitle.classList.add('use');
        pointUsage.classList.add('use');
        pointUsageDetail_container.classList.add('use');
      } else if(pointUsages.type === '환급') {
        pointUsageTitle.classList.add('refund');
        pointUsage.classList.add('refund');
        pointUsageDetail_container.classList.add('refund');
      } else if(pointUsages.type === '환불') {
        pointUsageTitle.classList.add('fullRefund');
        pointUsage.classList.add('fullRefund');
        pointUsageDetail_container.classList.add('fullRefund');        
      }

      const pointUsageMethod = document.createElement('span');
      pointUsageMethod.classList.add('pointUsageMethod');
      pointUsageMethod.textContent = `${pointUsages.method}, `;

      const pointUsagePerson = document.createElement('span');
      pointUsagePerson.classList.add('pointUsagePerson');
      pointUsagePerson.textContent = pointUsages.matchingUser;

      pointUsageDetail_container.appendChild(pointUsageMethod);
      pointUsageDetail_container.appendChild(pointUsagePerson);
  } else {
    pointUsageTitle.classList.add('recharge');
    pointUsage.classList.add('recharge');
    pointUsageDetail_container.classList.add('recharge');
  }

  return pointUsageTotal_container;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

////// 더보기 버튼 구현하기 //////
function showMoreBtnHandler() {
  // JavaScript 코드에서 먼저 숨기고 보여줄 개수와 현재 보이는 개수를 추적하는 변수를 만듭니다.
  let itemsToShow = 10; // 한 번에 표시할 개수
  let visibleItems = itemsToShow;

  // "더보기" 버튼을 가져옵니다.
  const showMoreBtn = document.getElementById('showMoreBtn');

  // 모든 pointUsages_container의 모든 요소를 가져옵니다.
  const pointUsageTotalContainers = document.querySelectorAll('.pointUsages_container .pointUsageTotal_container');

  // 처음에는 더보기 버튼을 숨깁니다.
  showMoreBtn.style.display = 'none';

  // 초기에 보여줄 개수만큼 요소를 보이게 합니다.
  pointUsageTotalContainers.forEach((item, index) => {
    if (index < visibleItems) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });

  // 더보기 버튼 클릭 시 실행될 함수를 만듭니다.
  showMoreBtn.addEventListener('click', () => {
    console.log('더보기 버튼 클릭!');
    visibleItems += itemsToShow;

    // 모든 요소를 숨깁니다.
    pointUsageTotalContainers.forEach((item) => {
      item.style.display = 'none';
    });

    // 현재 보여줄 개수만큼 요소를 보이게 합니다.
    pointUsageTotalContainers.forEach((item, index) => {
      if (index < visibleItems) {
        item.style.display = 'block';
      }
    });

    // 더 보일 요소가 남아있지 않으면 더보기 버튼을 숨깁니다.
    if (visibleItems >= pointUsageTotalContainers.length) {
      showMoreBtn.style.display = 'none';
    }
  });

  // 처음에 더보기 버튼을 표시해야 하는 경우만 표시합니다.
  if (pointUsageTotalContainers.length > itemsToShow) {
    showMoreBtn.style.display = 'block';
  }
}



////// 충전하기 버튼 구현하기 //////
const pointRechargeBtn = document.querySelector('#pointRechargeBtn');
pointRechargeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('충전하기 버튼 클릭!');

  let selectedPointAmount;
  let totalPointAmount;

  if(pointSignupStatus === 'CONFIRM') {
  
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

      console.log('pointRechargeInfo:',pointRechargeInfo);
      console.log('userPoint:',userPoint);

      const pointRechargeTotalPoint = document.querySelector('#pointRechargeTotalPoint');
      pointRechargeTotalPoint.textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
    
      const pointRechargePopupContainer = document.querySelector('#pointRechargePopupContainer');
      popupOpenHandler(pointRechargePopupContainer);

      const pointRechargeUsagePoint = document.querySelector('#pointRechargeUsagePoint');
      pointRechargeUsagePoint.textContent = '+ 0P';
    
      const pointRechargeUserPoint = document.querySelector('#pointRechargeUserPoint');
      pointRechargeUserPoint.textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
  
      // 토글에 적용시키기
      const packagesArray = [];
      // package_x 프로퍼티를 순회하며 배열에 추가
      for (let i = 1; pointRechargeInfo[0]['package_' + i] !== undefined; i++) {
        packagesArray.push(pointRechargeInfo[0]['package_' + i]);
      }
      // console.log('packagesArray: ', packagesArray);
  
      // 동적으로 생성할 부모 요소를 선택합니다.
      const pointRechargeToggle_container = document.querySelector('#pointRechargeToggle_container');
  
      // 토글 컨테이너의 요소를 모두 지우기
      while(pointRechargeToggle_container.firstChild) {
          pointRechargeToggle_container.removeChild(pointRechargeToggle_container.firstChild);
      }
  
      // contentsArray 배열의 각 요소에 대해 반복합니다.
      packagesArray.forEach((content, index) => {
        // 새로운 요소를 생성합니다.
        const toggleContentContainer = document.createElement('div');
        toggleContentContainer.classList.add('toggleContent_container');
  
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
        pointRechargeToggle_container.appendChild(toggleContentContainer);      
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
              // console.log('selectedPointAmount:', selectedPointAmount); // 숫자만 출력 
              
              // 선택한 포인트에 따라서 값 변동하기
              const pointRechargeUsagePoint = document.querySelector('#pointRechargeUsagePoint');
              pointRechargeUsagePoint.textContent = '+ ' + selectedPointAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';
  
              totalPointAmount = userPoint + selectedPointAmount;
  
              const pointRechargeTotalPoint = document.querySelector('#pointRechargeTotalPoint');
              pointRechargeTotalPoint.textContent = totalPointAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';

              console.log(`===========`);
              console.log('selectedPointAmount:',selectedPointAmount);
              console.log('totalPointAmount:',totalPointAmount);
            }
        });
      });
    })
    .catch(error => {
        console.log(`포인트 충전 정보 불러오기 Error : ${error}`);
    });
  
    // 충전하기 팝업 완료 버튼 클릭 시
    const rechargeConfirmBtn = document.querySelector('#pointRechargeConfirmBtn');
    rechargeConfirmBtn.addEventListener('click', (e) => {
      console.log('충전하기 팝업 완료 버튼 클릭!');

      console.log(`===========`);
      console.log('selectedPointAmount:',selectedPointAmount);
      console.log('totalPointAmount:',totalPointAmount);
  
      const confirmMSG = '포인트 충전하시겠습니까?';
      if (window.confirm(confirmMSG)) {
        // 포인트 충전하기
        fetch(`/pointRechargeProC`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            selectedPointAmount: selectedPointAmount,
            totalPointAmount: totalPointAmount,
          })
        })
        .then(response => response.json())
        .then(data => {
          if(data['result'] === 'SUCCESS') {
            alert('포인트 충전이 완료되었습니다.');
            window.location.href = `${hostURL}myprofile/point`;
          } else {
            alert('포인트 충전에 실패했습니다.');
          }
        })
        .catch(error => {
          console.log(`포인트 충전하기 Error : ${error}`);
        });
      }
    });
  } else {
    alert('회원 상태를 확인해주세요');
    window.location.href = `${hostURL}myprofile/profile`;
  }
});

// 충전하기 팝업 X버튼 클릭 시
const pointRechargeXBtn = document.querySelector('#pointRechargeXBtn');
pointRechargeXBtn.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('충전하기 팝업 X버튼 클릭!');
  const pointRechargePopupContainer = document.querySelector('#pointRechargePopupContainer');
  popUpXBtnClickHandler(pointRechargePopupContainer);
});

// 환불하기 버튼 클릭 시
const pointRefundBtn = document.querySelector('#pointRefundBtn');
pointRefundBtn.addEventListener('click', (e) => {
  console.log('환불하기 버튼 클릭!');
  const pointRefundPopupContainer = document.querySelector('#pointRefundPopupContainer');
  popupOpenHandler(pointRefundPopupContainer);

  document.querySelector('.bankInput').value = '';
  document.querySelector('.accountNumber').value = '';
  
  const pointRefundUserPoint = document.querySelector('#pointRefundUserPoint');
  pointRefundUserPoint.textContent = userPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';

  const getEventPoint = document.querySelector('#eventPoint');
  getEventPoint.textContent = '- '+ eventPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';

  const refundPoint = userPoint - eventPoint;
  const finalRefundPoint = document.querySelector('#refundPoint');
  finalRefundPoint.textContent = refundPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'P';

  // 환불하기 완료 버튼 클릭 시
  const pointRefundConfirmBtn = document.querySelector('#pointRefundConfirmBtn');
  pointRefundConfirmBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('환불하기 완료 버튼 클릭!');
    const bankName = document.querySelector('.bankInput').value;
    const accountNumber = document.querySelector('.accountNumber').value;

    console.log(`refundPoint:${refundPoint}`);

    // 입력한 값이 없을 경우
    if(bankName === '' || accountNumber === '') {
      const pointRefundErrorMsg = document.querySelector('#pointRefundErrorMsg');
      pointRefundErrorMsg.style.display = 'block';
      pointRefundErrorMsg.textContent = '은행명 or 계좌번호를 입력해주세요';
    } 
    // point가 없을 경우
    else if(refundPoint <= 0) {
      const pointRefundErrorMsg = document.querySelector('#pointRefundErrorMsg');
      pointRefundErrorMsg.style.display = 'block';
      pointRefundErrorMsg.textContent = '환불할 포인트가 없습니다';
    } 
    else {
      // 서버에 환불 내용 전달하기
      const confirmMSG = '모든 포인트를 환불하시겠습니까?';
      if (window.confirm(confirmMSG)) {
        // 포인트 충전하기
        fetch(`/pointRefundProC`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bankName: bankName,
            accountNumber: accountNumber,
            userPoint: refundPoint,
          })
        })
        .then(response => response.json())
        .then(data => {
          if(data['result'] === 'SUCCESS') {
            alert('포인트 환불 신청이 완료되었습니다.');
            window.location.href = `${hostURL}myprofile/point`;
          } else {
            alert('포인트 환불 신청에 실패했습니다. 다시 시도해주세요.');
          }
        })
        .catch(error => {
          console.log(`포인트 환불하기 Error : ${error}`);
        });
      }
    }
  });
});

// 환불하기 팝업 X버튼 클릭 시
const pointRefundXBtn = document.querySelector('#pointRefundXBtn');
pointRefundXBtn.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('환불하기 팝업 X버튼 클릭!');
  const pointRefundPopupContainer = document.querySelector('#pointRefundPopupContainer');
  popUpXBtnClickHandler(pointRefundPopupContainer);
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
