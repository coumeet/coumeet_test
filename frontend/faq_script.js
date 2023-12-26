// 서버에서 FAQ정보 받아와서 세팅하기
getFaqFromServer();

function getFaqFromServer() {
  fetch('/faqProc', {
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
    // console.log('data:', data);

    // 카테고리 별 FAQ 배열을 저장할 객체
    const faqsByCategory = {};

    // 데이터를 카테고리 별로 구분
    data.forEach(faq => {
      const category = faq.category;

      // 해당 카테고리가 처음 나오는 경우, 빈 배열로 초기화
      if (!faqsByCategory[category]) {
        faqsByCategory[category] = [];
      }

      // 해당 카테고리에 FAQ 추가
      faqsByCategory[category].push(faq);
    });

    // Object.values를 사용하여 배열로 변환
    const faqArrays = Object.values(faqsByCategory);

    // undefined인 배열을 제외하고 출력
    const validFaqsByCategory = faqArrays.filter(category => category.length > 0);
    // console.log('카테고리별 FAQ:', validFaqsByCategory);

    createFaqCategoryAndContent(validFaqsByCategory);

  })
  .catch((error) => {
    console.log(`FAQ 정보 불러오기 오류: ${error}`);
  });
}

function createFaqCategoryAndContent(validFaqsByCategory) {
    // const validFaqsByCategory = validFaqsByCategory;

    let categoryNamesArray = [];

    // 카테고리 버튼 만들기
    validFaqsByCategory.forEach((faqs) => {
        // console.log('faqs:',faqs[0].category);
        categoryNamesArray.push(faqs[0].category);
    });

    // console.log('categoryNamesArray:',categoryNamesArray);

    const faqCategoryBtns_cotainer = document.querySelector('.faqCategoryBtns_cotainer');
    while(faqCategoryBtns_cotainer.firstChild) {
      faqCategoryBtns_cotainer.removeChild(faqCategoryBtns_cotainer.firstChild);
    }

    console.log('validFaqsByCategory',validFaqsByCategory[0][0].category);

    categoryNamesArray.forEach((category, index) => {
      const button = document.createElement("button");
      button.classList.add("categoryBtn");
      button.textContent = category;
      faqCategoryBtns_cotainer.appendChild(button);

      // 처음 카테고리를 기본으로 선택하기
      if (index === 0) {
        button.classList.add('selected');
        const faqContent_container = document.querySelector('.faqContent_container');
        createFaqCategoryContent(validFaqsByCategory[0], button, faqContent_container);
      }

      // 해당 버튼 클릭 시
      button.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('버튼 클릭 :',e.target.textContent);

        const faqCategoryBtns = document.querySelectorAll('.faqCategoryBtns_cotainer button');
        faqCategoryBtns.forEach((btn) => {
          btn.classList.remove('selected');
        })

        e.target.classList.add('selected');
        
        const faqContent_container = document.querySelector('.faqContent_container');
        while(faqContent_container.firstChild) {
          faqContent_container.removeChild(faqContent_container.firstChild);
        }

        for(let i = 0; i<validFaqsByCategory.length; i++) {
          createFaqCategoryContent(validFaqsByCategory[i], e.target, faqContent_container);
        }
      });
    });
}

function createFaqCategoryContent(validFaqsByCategory, button, faqContent_container) {

  for(let j =0; j<validFaqsByCategory.length; j++) {
    if(validFaqsByCategory[j].category === button.textContent) {
      console.log(validFaqsByCategory[j].title);
      const faqDetailContentContainer = document.createElement('div');
      faqDetailContentContainer.classList.add('faqDetailContent_container');

      const faqContentTitleContainer = document.createElement('div');
      faqContentTitleContainer.classList.add('faqContentTitle_container');

      const angleRightIcon = document.createElement('i');
      angleRightIcon.classList.add('fa-solid', 'fa-angle-right', 'fa-rotate-90');
      angleRightIcon.style.color = '#DB7C8D';

      const faqContentTitle = document.createElement('span');
      faqContentTitle.classList.add('faqContentTitle');
      faqContentTitle.textContent = validFaqsByCategory[j].title;

      const faqContent = document.createElement('p');
      faqContent.classList.add('faqContent');
      faqContent.innerHTML = validFaqsByCategory[j].content; 

      faqContentTitleContainer.appendChild(angleRightIcon);
      faqContentTitleContainer.appendChild(faqContentTitle);

      faqDetailContentContainer.appendChild(faqContentTitleContainer);
      faqDetailContentContainer.appendChild(faqContent);

      faqContent_container.appendChild(faqDetailContentContainer);
    }
  }
}