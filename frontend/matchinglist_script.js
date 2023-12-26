"use strict"

const pointColor = "#DB7C8D";
const frequencyColor = "#D9D9D9";
const selectBtnColor = "#F9F2F2";
const subBtnColor = '#767373';

let signupData;
let areaData;
let categoryBtns;
let isAnyCategorySelected;

let selectedCategoryBtn = null;
let selectedCategoryDetailBtns = [];
let ageCategoryBtn = [];
let heightCategoryBtn = [];
let regionCategoryBtn = [];
let mbtiCategoryBtn = [];
let styleCategoryBtn = [];
let bodyTypeCategoryBtn = [];
let personalityCategoryBtn = [];
let drinkingCategoryBtn = [];
let hobbyCategoryBtn = [];
let smokingCategoryBtn = [];
let categoryBtnRecog = false;
let whichCategoryBtnRecog = '';
let loginStatus = false;
let matchingListSingupStats;

// 카테고리 세부 목록
let categories = {
    "age" : [],
    "height" : [],
    "region" : [],
    "mbti" : [],
    "style" : [],
    "bodyType" : [],
    "personality" : [],
    "drinking" : [],
    "hobby" : [],
    "smoking" : [],
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

            signupData.forEach((item) => {
                const category = item.category;

                if (categories.hasOwnProperty(category)) {
                    const values = Object.entries(item).map(([key, val]) => {
                        if (typeof val === 'string' && key.startsWith('content_')) {
                            return val;
                        } else {
                            return null;
                        }
                    }).filter(val => val !== null);

                    categories[category] = categories[category].concat(values);
                }
            });

            // console.log('categories:',categories);

            areaData.forEach((item) => {
                const city = item.city;
                categories['region'].push(city);
            });

            resolve(); // resolve를 호출하여 완료를 알립니다.
        })
        .catch(error => {
            console.error('회원 가입 정보 서버 통신 Error:', error);
            reject(error); // 에러가 발생하면 reject를 호출하여 에러를 알립니다.
        });
    });
}

let mobileSelectedCategories = {
    "나이" : [],
    "키" : [],
    "사는곳" : [],
    "MBTI" : [],
    "스타일" : [],
    "체형" : [],
    "성격" : [],
    "음주" : [],
    "취미" : [],
    "흡연" : [],
};

requestSignupData().then(()=> {

    function loginStatusCheck() {
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
            // console.log(data.result); // 데이터를 처리
    
            if(data.result === 'Not Logged in'){
                loginStatus = false; //로그인 된 상태
            } 
            else {
                if(data){
                    loginStatus = true; //로그인 된 상태
                    matchingListSingupStats = data[0].signupStatus;
                    // console.log(`matchingListSingupStats:${matchingListSingupStats}`);
                }  
            }
        })
        .catch(error => {
            console.error(error); // 오류 처리
        });
    }
    
    loginStatusCheck(); // 로그인 상태 체크 실행
    
    const totalBtn = document.querySelector('.totalBtn');
    const favoriteBtn = document.querySelector('.favoriteBtn');
    let totalFavoriteRecog = 'total';
    
    totalFavoriteRecogHandler(totalFavoriteRecog);
    
    // 전체 버튼 클릭 시
    totalBtn.addEventListener('click', (event) => {
        event.preventDefault();
    
        totalFavoriteRecog = 'total';
        totalFavoriteRecogHandler(totalFavoriteRecog);
    
        settingRest(); // 세팅 초기화
    
    });
    
    // 찜한 사람 클릭 시
    favoriteBtn.addEventListener('click', (event) => {
        event.preventDefault();
    
        // 비회원일 경우
        if(loginStatus === false) {
            window.location.href = `${hostURL}login`;
        }
        // 회원일 경우 
        else if(loginStatus === true) {
            totalFavoriteRecog = 'favorite';
            totalFavoriteRecogHandler(totalFavoriteRecog);
            settingRest(); // 세팅 초기화 (여기 안에 userlist불러오기 있음)

            // 필터 적용
            categoryBtns = [ageCategoryBtn, heightCategoryBtn, regionCategoryBtn, mbtiCategoryBtn, styleCategoryBtn, bodyTypeCategoryBtn, personalityCategoryBtn, drinkingCategoryBtn, hobbyCategoryBtn];
            isAnyCategorySelected = categoryBtns.some(categoryBtn => categoryBtn.length > 0);

            // 선택하게 있는 경우
            if(isAnyCategorySelected) {
                const filterIcon = document.querySelector('#filter');
                if (filterIcon) {
                    // 아이콘 클래스 변경
                    filterIcon.className = 'fa-solid fa-filter';
                    // 아이콘 색상 변경 (선택한 색상으로 변경)
                    filterIcon.style.color = '#FF0059';
                }
            } else {
                const filterIcon = document.querySelector('#filter');
                if (filterIcon) {
                    // 아이콘 클래스 변경
                    filterIcon.className = 'fa-solid fa-filter-circle-xmark';
                    // 아이콘 색상 변경 (선택한 색상으로 변경)
                    filterIcon.style.color = '#524747';
                }
            }
        }
    });
    
    // 기본 = 전체 버튼 선택
    function totalFavoriteRecogHandler(text) {
        if(text === 'total') {
            totalBtn.classList.add('active');
            favoriteBtn.classList.remove('active');
        } else if(text === 'favorite') {
            favoriteBtn.classList.add('active');
            totalBtn.classList.remove('active');
        }
    }
    
    // categoryDetailSelect_container의 너비 설정하기 (전체 버튼 크기를 기준으로)
    const categoryDetailSelect_container = document.querySelector('.categoryDetailSelect_container');
    
    const totalBtnWidth = totalBtn.offsetWidth;
    categoryDetailSelect_container.style.width = `${(totalBtnWidth*2)}px`;
    
    // 클릭한 버튼의 데이터 속성 값을 가져오는 함수
    function getCategoryFromButton(button) {
        return button.getAttribute('data-category');
    }
    
    // upcategoryselectBtn_container의 버튼 클릭 이벤트 리스너
    document.querySelectorAll('.upcategoryselectBtn_container button').forEach(button => {
        button.addEventListener('click', () => {
            handleCategoryButtonClick(button);
        });
    });
    
    // downcategoryselectBtn_container의 버튼 클릭 이벤트 리스너
    document.querySelectorAll('.downcategoryselectBtn_container button').forEach(button => {
        button.addEventListener('click', () => {
            handleCategoryButtonClick(button);
        });
    });
    
    let isMobileSize = window.innerWidth < 768;
    
    window.addEventListener('resize', function () {

        if(selectedCategoryBtn) {
            positionCategoryDetailSelect(selectedCategoryBtn.getBoundingClientRect());
        }

        categoryBtns = [ageCategoryBtn, heightCategoryBtn, regionCategoryBtn, mbtiCategoryBtn, styleCategoryBtn, bodyTypeCategoryBtn, personalityCategoryBtn, drinkingCategoryBtn, hobbyCategoryBtn, smokingCategoryBtn];
        // 상세 카테고리 나타내기(단, 무언가 선택이 되어있을 경우)
        isAnyCategorySelected = categoryBtns.some(categoryBtn => categoryBtn.length > 0);
    
        const windowWidth = window.innerWidth;
    
        if (isMobileSize && windowWidth >= 768) {
            // 모바일 크기에서 벗어나는 경우
            isMobileSize = false;
    
            const category_container = document.querySelector('.category_container');
    
            if (window.getComputedStyle(category_container).display === 'block') {
                // 'block'일 때 실행할 코드
                // console.log('block');
            } 
    
            if (isAnyCategorySelected) {
                const categorySelect_container = document.querySelector('.categorySelect_container');
                categorySelect_container.style.display = 'block';
                categorySelect_container.style.opacity = '1';
                createSelectedCategoryBtns();
            }
    
            categoryBtnActiveHandler(ageCategoryBtn, 'age');
            categoryBtnActiveHandler(heightCategoryBtn, 'height');
            categoryBtnActiveHandler(regionCategoryBtn, 'region');
            categoryBtnActiveHandler(mbtiCategoryBtn, 'mbti');
            categoryBtnActiveHandler(styleCategoryBtn, 'style');
            categoryBtnActiveHandler(bodyTypeCategoryBtn, 'bodyType');
            categoryBtnActiveHandler(personalityCategoryBtn, 'personality');
            categoryBtnActiveHandler(drinkingCategoryBtn, 'drinking');
            categoryBtnActiveHandler(hobbyCategoryBtn, 'hobby');
            categoryBtnActiveHandler(smokingCategoryBtn, 'smoking');

    
        } else if (!isMobileSize && windowWidth < 768) {
            // 모바일 크기로 변경되는 경우
            isMobileSize = true;

            // 선택하게 있는 경우
            if(isAnyCategorySelected) {
                const filterIcon = document.querySelector('#filter');
                if (filterIcon) {
                    // 아이콘 클래스 변경
                    filterIcon.className = 'fa-solid fa-filter';
                    // 아이콘 색상 변경 (선택한 색상으로 변경)
                    filterIcon.style.color = '#FF0059';
                }
            } else {
                const filterIcon = document.querySelector('#filter');
                if (filterIcon) {
                    // 아이콘 클래스 변경
                    filterIcon.className = 'fa-solid fa-filter-circle-xmark';
                    // 아이콘 색상 변경 (선택한 색상으로 변경)
                    filterIcon.style.color = '#524747';
                }
            }
    
            // 상세 카테고리 없애기
            const categorySelect_container = document.querySelector('.categorySelect_container');
            categorySelect_container.style.display = 'none';
        }
    });
    
    function categoryBtnActiveHandler(categoryBtn, text) {
        const btn = document.querySelector(`.${text}Btn`);
        // console.log('btn:',btn);
        if(categoryBtn.length > 0) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
    
    // categoryDetailSelect_container의 위치를 조절하는 함수
    function positionCategoryDetailSelect(buttonRect) {
        // categoryDetailSelect_container 요소를 가져옵니다.
        const categoryDetailSelectContainer = document.querySelector('.categoryDetailSelect_container');
    
        // categoryDetailSelectContainer의 스타일을 조절하여 버튼 아래에 위치시킵니다.
        categoryDetailSelectContainer.style.position = 'absolute';
        categoryDetailSelectContainer.style.left = `${buttonRect.left}px`; // 왼쪽 위치는 버튼의 왼쪽 위치와 일치
        categoryDetailSelectContainer.style.top = `${buttonRect.bottom}px`; // 위쪽 위치는 버튼의 아래쪽 위치와 일치
    
        // CSS 트랜지션을 사용하여 부드럽게 나타나도록 합니다.
        categoryDetailSelectContainer.style.transition = 'none'; // 트랜지션을 비활성화합니다.
        categoryDetailSelectContainer.style.opacity = 0; // 초기 투명도를 0으로 설정
        categoryDetailSelectContainer.style.display = 'block';
    
        // setTimeout을 사용하여 다음 프레임에서 트랜지션을 활성화합니다.
        setTimeout(() => {
            categoryDetailSelectContainer.style.transition = 'opacity 0.3s'; // 트랜지션을 활성화합니다.
            categoryDetailSelectContainer.style.opacity = 1; // opacity를 1로 설정하여 나타나도록 합니다.
        }, 0); // 다음 프레임에서 트랜지션을 활성화하므로 지연 없이 실행됩니다.
    }
    
    //////// 모바일 제어하기 ////////
    // 카테고리 필터 선택 시
    const filter = document.querySelector('#filter');
    filter.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('카테고리 필터 버튼 선택!');
    
        const mobileCategory_container = document.querySelector('.mobileCategory_container');
        mobileCategory_container.style.display = 'block';
    
        const mobileCategoriesContents_container = document.querySelector('.mobileCategoriesContents_container');
        while(mobileCategoriesContents_container.firstChild) {
            mobileCategoriesContents_container.removeChild(mobileCategoriesContents_container.firstChild);
        }
    
        mobileCategoriesContents_container.scrollTo({
            top: 0,
        });
    
        window.scrollTo({
            top: 0,
        });
    
        // categories 객체를 순회하며 동적으로 HTML 생성
        for (const key in categories) {
            if (categories.hasOwnProperty(key)) {
                createMobileCategory(key, categories[key]);
            }
        }
        
    });
    
    let mobileCategoryResetRecog = false;
    
    
    // categories 객체에서 키를 기반으로 동적으로 HTML 생성하는 함수
    function createMobileCategory(key, values) {
        // 부모 컨테이너
        const container = document.createElement('div');
        container.classList.add('mobileCategoryContent_container');
        container.id = `${key}_container`;
    
        // 카테고리 제목
        const title = document.createElement('p');
        title.classList.add('mobileCategoryTitle');
    
        mobileCategoryResetRecog = false;
    
        if(key === 'age') {
            key = '나이'
        } else if(key === 'height') {
            key = '키'
        } else if(key === 'region') {
            key = '사는곳'
        } else if(key === 'mbti') {
            key = 'MBTI'
        } else if(key === 'style') {
            key = '스타일'
        } else if(key === 'bodyType') {
            key = '체형'
        } else if(key === 'personality') {
            key = '성격'
        } else if(key === 'drinking') {
            key = '음주'
        } else if(key === 'hobby') {
            key = '취미'
        } else if(key === 'smoking') {
            key = '흡연'
        }
    
        title.textContent = key;
        // console.log('key:',key);
        container.appendChild(title);
    
        // 카테고리 버튼들을 담을 컨테이너
        const btnsContainer = document.createElement('div');
        btnsContainer.classList.add('MobileCategorhBtns_container');
        btnsContainer.id = `${key}CategorhBtns_container`;
    
        // 각 값에 대한 버튼 생성
        values.forEach(value => {
            // console.log('key:',key);
    
            const btn = document.createElement('button');
            btn.classList.add('mobilecategoryBtn');
            btn.textContent = value;
            btnsContainer.appendChild(btn);
    
            if(key === '나이') {
                // console.log('ageCategoryBtn:',ageCategoryBtn);
                ageCategoryBtn.forEach((btnText) => {
                    if(btnText ===  value) {
                        btn.classList.add('selected');
                        mobileSelectedCategories[key].push(value);
                    }
                });
            } else if(key === '키') {
                heightCategoryBtn.forEach((btnText) => {
                    if(btnText ===  value) {
                        btn.classList.add('selected');
                        mobileSelectedCategories[key].push(value);
    
                    }
                });
            } else if(key === '사는곳') {
                regionCategoryBtn.forEach((btnText) => {
                    if(btnText ===  value) {
                        btn.classList.add('selected');
                        mobileSelectedCategories[key].push(value);
                }
                });
            } else if(key === 'MBTI') {
                mbtiCategoryBtn.forEach((btnText) => {
                    if(btnText ===  value) {
                        btn.classList.add('selected');
                        mobileSelectedCategories[key].push(value);
                }
                });
            } else if(key === '스타일') {
                styleCategoryBtn.forEach((btnText) => {
                    if(btnText ===  value) {
                        btn.classList.add('selected');
                        mobileSelectedCategories[key].push(value);
                }
                });
            } else if(key === '체형') {
                bodyTypeCategoryBtn.forEach((btnText) => {
                    if(btnText ===  value) {
                        btn.classList.add('selected');
                        mobileSelectedCategories[key].push(value);
                }
                });
            } else if(key === '성격') {
                personalityCategoryBtn.forEach((btnText) => {
                    if(btnText ===  value) {
                        btn.classList.add('selected');
                        mobileSelectedCategories[key].push(value);
                }
                });
            } else if(key === '음주') {
                drinkingCategoryBtn.forEach((btnText) => {
                    if(btnText ===  value) {
                        btn.classList.add('selected');
                        mobileSelectedCategories[key].push(value);
                }
                });
            } else if(key === '취미') {
                hobbyCategoryBtn.forEach((btnText) => {
                    if(btnText ===  value) {
                        btn.classList.add('selected');
                        mobileSelectedCategories[key].push(value);
                }
                });
            } else if(key === '흡연') {
                smokingCategoryBtn.forEach((btnText) => {
                    if(btnText ===  value) {
                        btn.classList.add('selected');
                        mobileSelectedCategories[key].push(value);
                }
                });
            }
    
            // 모바일 카테고리 선택에서 버튼을 클릭했을 경우
            btn.addEventListener('click', (e) => {
                // console.log('key:',key);
                whichCategoryBtnRecog = key;
    
                // console.log('target:', e.target.textContent);
                const buttonText = e.target.textContent;
                console.log('buttonText:',buttonText);
    
                // 선택을 해지할 경우
                if(btn.classList.contains('selected')) {
                    btn.classList.remove('selected');
    
                    // 카테고리 종류에 따라서 배열에서 빼기
                    if(whichCategoryBtnRecog === '나이') {
                        const indexToRemove = mobileSelectedCategories[whichCategoryBtnRecog].indexOf(buttonText);
                        if (indexToRemove !== -1) {
                            mobileSelectedCategories[whichCategoryBtnRecog].splice(indexToRemove, 1);
                        }
                    } else if(whichCategoryBtnRecog === '키') {
                        const indexToRemove = mobileSelectedCategories[whichCategoryBtnRecog].indexOf(buttonText);
                        if (indexToRemove !== -1) {
                            mobileSelectedCategories[whichCategoryBtnRecog].splice(indexToRemove, 1);
                        }
                    } else if(whichCategoryBtnRecog === '사는곳') {
                        const indexToRemove = mobileSelectedCategories[whichCategoryBtnRecog].indexOf(buttonText);
                        if (indexToRemove !== -1) {
                            mobileSelectedCategories[whichCategoryBtnRecog].splice(indexToRemove, 1);
                        }
                    } else if(whichCategoryBtnRecog === '키') {
                        const indexToRemove = mobileSelectedCategories[whichCategoryBtnRecog].indexOf(buttonText);
                        if (indexToRemove !== -1) {
                            mobileSelectedCategories[whichCategoryBtnRecog].splice(indexToRemove, 1);
                        }
                    } else if(whichCategoryBtnRecog === 'MBTI') {
                        const indexToRemove = mobileSelectedCategories[whichCategoryBtnRecog].indexOf(buttonText);
                        if (indexToRemove !== -1) {
                            mobileSelectedCategories[whichCategoryBtnRecog].splice(indexToRemove, 1);
                        }
                    } else if(whichCategoryBtnRecog === '스타일') {
                        const indexToRemove = mobileSelectedCategories[whichCategoryBtnRecog].indexOf(buttonText);
                        if (indexToRemove !== -1) {
                            mobileSelectedCategories[whichCategoryBtnRecog].splice(indexToRemove, 1);
                        }
                    } else if(whichCategoryBtnRecog === '체형') {
                        const indexToRemove = mobileSelectedCategories[whichCategoryBtnRecog].indexOf(buttonText);
                        if (indexToRemove !== -1) {
                            mobileSelectedCategories[whichCategoryBtnRecog].splice(indexToRemove, 1);
                        }
                    } else if(whichCategoryBtnRecog === '성격') {
                        const indexToRemove = mobileSelectedCategories[whichCategoryBtnRecog].indexOf(buttonText);
                        if (indexToRemove !== -1) {
                            mobileSelectedCategories[whichCategoryBtnRecog].splice(indexToRemove, 1);
                        }
                    } else if(whichCategoryBtnRecog === '음주') {
                        const indexToRemove = mobileSelectedCategories[whichCategoryBtnRecog].indexOf(buttonText);
                        if (indexToRemove !== -1) {
                            mobileSelectedCategories[whichCategoryBtnRecog].splice(indexToRemove, 1);
                        }
                    } else if(whichCategoryBtnRecog === '취미') {
                        const indexToRemove = mobileSelectedCategories[whichCategoryBtnRecog].indexOf(buttonText);
                        if (indexToRemove !== -1) {
                            mobileSelectedCategories[whichCategoryBtnRecog].splice(indexToRemove, 1);
                        }
                    } else if(whichCategoryBtnRecog === '흡연') {
                        const indexToRemove = mobileSelectedCategories[whichCategoryBtnRecog].indexOf(buttonText);
                        if (indexToRemove !== -1) {
                            mobileSelectedCategories[whichCategoryBtnRecog].splice(indexToRemove, 1);
                        }
                    }
                } 
                // 선택했을 경우
                else {
                    btn.classList.add('selected');
    
                    // 카테고리 종류에 따라서 배열에 넣기
                    if(whichCategoryBtnRecog === '나이') {
                        mobileSelectedCategories[whichCategoryBtnRecog].push(buttonText);
                    } else if(whichCategoryBtnRecog === '키') {
                        mobileSelectedCategories[whichCategoryBtnRecog].push(buttonText);
                    } else if(whichCategoryBtnRecog === '사는곳') {
                        mobileSelectedCategories[whichCategoryBtnRecog].push(buttonText);
                    } else if(whichCategoryBtnRecog === 'MBTI') {
                        mobileSelectedCategories[whichCategoryBtnRecog].push(buttonText);
                    } else if(whichCategoryBtnRecog === '스타일') {
                        mobileSelectedCategories[whichCategoryBtnRecog].push(buttonText);
                    } else if(whichCategoryBtnRecog === '체형') {
                        mobileSelectedCategories[whichCategoryBtnRecog].push(buttonText);
                    } else if(whichCategoryBtnRecog === '성격') {
                        mobileSelectedCategories[whichCategoryBtnRecog].push(buttonText);
                    } else if(whichCategoryBtnRecog === '음주') {
                        mobileSelectedCategories[whichCategoryBtnRecog].push(buttonText);
                    } else if(whichCategoryBtnRecog === '취미') {
                        mobileSelectedCategories[whichCategoryBtnRecog].push(buttonText);
                    } else if(whichCategoryBtnRecog === '흡연') {
                        mobileSelectedCategories[whichCategoryBtnRecog].push(buttonText);
                    }
                }
    
                console.log('mobileSelectedCategories:',mobileSelectedCategories);
            })
        });
    
        // 부모 컨테이너에 버튼 컨테이너 추가
        container.appendChild(btnsContainer);
    
        // 생성된 요소를 body에 추가 또는 다른 원하는 위치에 추가
        const mobileCategoriesContents_container = document.querySelector('.mobileCategoriesContents_container');
        mobileCategoriesContents_container.appendChild(container);
    }
    
    // 모바일 카테고리 상세검색에서 '적용하기' 버튼 클릭 시
    const mobileCategoryConfirmBtn = document.querySelector('#mobileCategoryConfirmBtn');
    mobileCategoryConfirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('모바일 카테고리 상세검색 -> 적용하기 버튼 클릭!');
    
        addToCategoryBtn("나이", ageCategoryBtn);
        addToCategoryBtn("키", heightCategoryBtn);
        addToCategoryBtn("사는곳", regionCategoryBtn);
        addToCategoryBtn("MBTI", mbtiCategoryBtn);
        addToCategoryBtn("스타일", styleCategoryBtn);
        addToCategoryBtn("체형", bodyTypeCategoryBtn);
        addToCategoryBtn("성격", personalityCategoryBtn);
        addToCategoryBtn("음주", drinkingCategoryBtn);
        addToCategoryBtn("취미", hobbyCategoryBtn);
        addToCategoryBtn("흡연", smokingCategoryBtn);

        const mobileCategory_container = document.querySelector('.mobileCategory_container');
        mobileCategory_container.style.display = 'none';
        
        // 초기화를 누르고 적용을 눌렀을 경우 => 카테고리 선택된 버튼들 모두 삭제
        if(mobileCategoryResetRecog) {
            const selectedCategoryBtns = document.querySelectorAll('.selectedCategoryBtn_container button');
            selectedCategoryBtns.forEach((btn) => {
                btn.remove();
            });
        }
 
        categoryBtns = [ageCategoryBtn, heightCategoryBtn, regionCategoryBtn, mbtiCategoryBtn, styleCategoryBtn, bodyTypeCategoryBtn, personalityCategoryBtn, drinkingCategoryBtn, hobbyCategoryBtn, smokingCategoryBtn];
        // 상세 카테고리 나타내기(단, 무언가 선택이 되어있을 경우)
        isAnyCategorySelected = categoryBtns.some(categoryBtn => categoryBtn.length > 0);

        // 선택하게 있는 경우
        if(isAnyCategorySelected) {
            const filterIcon = document.querySelector('#filter');
            if (filterIcon) {
                // 아이콘 클래스 변경
                filterIcon.className = 'fa-solid fa-filter';
                // 아이콘 색상 변경 (선택한 색상으로 변경)
                filterIcon.style.color = '#FF0059';
            }
        } else {
            const filterIcon = document.querySelector('#filter');
            if (filterIcon) {
                // 아이콘 클래스 변경
                filterIcon.className = 'fa-solid fa-filter-circle-xmark';
                // 아이콘 색상 변경 (선택한 색상으로 변경)
                filterIcon.style.color = '#524747';
            }
        }
    
        // 서버에 유저 리스트 요청
        UserListRequest(); 
    
    });
    
    function addToCategoryBtn(sourceCategory, targetBtn) {
    
        targetBtn.length = 0; // 기존 배열 비우기
        mobileSelectedCategories[sourceCategory].forEach((category) => {
            targetBtn.push(category);
        });
        mobileSelectedCategories[sourceCategory].length = 0;
        // console.log('sourceCategory:',sourceCategory);
        // console.log('targetBtn:',targetBtn);
    }
    
    // 모바일 카테고리 상세검색에서 '초기화' 버튼 클릭 시
    const mobileCategoryResetBtn = document.querySelector('#mobileCategoryResetBtn');
    mobileCategoryResetBtn.addEventListener('click', (e) => {
        mobileCategoryResetRecog = true;
        e.preventDefault();
        console.log('모바일 카테고리 상세검색 -> 초기화 버튼 클릭!');
    
        const mobileCategoriesAllBtns = document.querySelectorAll('.mobileCategoriesContents_container button');
        mobileCategoriesAllBtns.forEach((btn) => {
            btn.classList.remove('selected');
        });
    
        // 모든 변수 초기화
        for (const category in mobileSelectedCategories) {
            if (mobileSelectedCategories.hasOwnProperty(category)) {
                mobileSelectedCategories[category] = [];
            }
        }
    });
    
    // 카테고리 필터 X버튼 선택 시
    const mobileCategoryXbtn = document.querySelector('#mobileCategoryXbtn');
    mobileCategoryXbtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('카테고리 필터 X버튼 선택!');
    
        const mobileCategory_container = document.querySelector('.mobileCategory_container');
        mobileCategory_container.style.display = 'none';
    });
    
    // 카테고리 버튼 클릭 했을 경우
    function handleCategoryButtonClick(button) {
    
        selectedCategoryDetailBtns = []; // 초기화
        const buttonRect = button.getBoundingClientRect();
        selectedCategoryBtn = button;
    
        // console.log(`================================================`);
        // console.log(`whichCategoryBtnRecog:${whichCategoryBtnRecog}`);
        // console.log(`selectedCategoryBtn.textContent:${selectedCategoryBtn.textContent}`);
        // console.log(`categoryBtnRecog:${categoryBtnRecog}`);
        // console.log(`================================================`);
    
        // 카테고리를 한 번 더 눌렀다는 것은 창을 끄겠다는 것을 의미
        if(categoryBtnRecog == true && whichCategoryBtnRecog === selectedCategoryBtn.textContent) {
            categoryDetailSelectContainerDisplayNone();
        } else {
    
            // 어떤 버튼을 선택했는지 알 수 있는 정보 (whichCategoryBtnRecog에 넣기)
            whichCategoryBtnRecog = selectedCategoryBtn.textContent;
    
            // console.log(`categoryBtnRecog:${categoryBtnRecog}`);
            // console.log(`whichCategoryBtnRecog:${whichCategoryBtnRecog}`);
    
            positionCategoryDetailSelect(buttonRect);
    
            const category = getCategoryFromButton(button);
            const values = categories[category];
    
            const selectBtnContainer = document.querySelector('.selectBtn_container');
            selectBtnContainer.innerHTML = '';
    
            if(whichCategoryBtnRecog === '나이') {
                ageCategoryBtn.forEach((value) => {
                    selectedCategoryDetailBtns.push(value);
                });
            } else if(whichCategoryBtnRecog === '키') {
                heightCategoryBtn.forEach((value) => {
                    selectedCategoryDetailBtns.push(value);
                });
            } else if(whichCategoryBtnRecog === '사는곳') {
                // console.log(`regionCategoryBtn:${regionCategoryBtn}`);
                regionCategoryBtn.forEach((value) => {
                    selectedCategoryDetailBtns.push(value);
                });
            } else if(whichCategoryBtnRecog === '키') {
                heightCategoryBtn.forEach((value) => {
                    selectedCategoryDetailBtns.push(value);
                });
            } else if(whichCategoryBtnRecog === 'MBTI') {
                mbtiCategoryBtn.forEach((value) => {
                    selectedCategoryDetailBtns.push(value);
                });
            } else if(whichCategoryBtnRecog === '스타일') {
                styleCategoryBtn.forEach((value) => {
                    selectedCategoryDetailBtns.push(value);
                });
            } else if(whichCategoryBtnRecog === '체형') {
                bodyTypeCategoryBtn.forEach((value) => {
                    selectedCategoryDetailBtns.push(value);
                });
            } else if(whichCategoryBtnRecog === '성격') {
                personalityCategoryBtn.forEach((value) => {
                    selectedCategoryDetailBtns.push(value);
                });
            } else if(whichCategoryBtnRecog === '음주') {
                drinkingCategoryBtn.forEach((value) => {
                    selectedCategoryDetailBtns.push(value);
                });
            } else if(whichCategoryBtnRecog === '취미') {
                hobbyCategoryBtn.forEach((value) => {
                    selectedCategoryDetailBtns.push(value);
                });
            } else if(whichCategoryBtnRecog === '흡연') {
                smokingCategoryBtn.forEach((value) => {
                    selectedCategoryDetailBtns.push(value);
                });
            }
    
            // console.log(`selectedCategoryDetailBtns:${selectedCategoryDetailBtns}`);
    
            values.forEach((value, index) => {
                const newButton = document.createElement('button');
                newButton.classList.add(`select_${index + 1}`);
    
                if(selectedCategoryDetailBtns.includes(value)) {
                    newButton.innerHTML = `<i class="fa-solid fa-square-check" style="color: rgb(0, 0, 0); opacity: 1;"></i><span>${value}</span>`;
                } else {
                    newButton.innerHTML = `<i class="fa-regular fa-square" style="color: #000000;"></i><span>${value}</span>`;
                }
                // newButton.innerHTML = `<i class="fa-regular fa-square" style="color: #000000;"></i><span>${value}</span>`;
                selectBtnContainer.appendChild(newButton);
            });
            categoryBtnRecog = true;
        }
    }
    
    // const categoryDetailSelectContainer = document.querySelector('.categoryDetailSelect_container');
    // console.log(`categoryDetailSelectContainer:${categoryDetailSelectContainer}`);
    
    const body = document.querySelector('body');
    body.addEventListener('click', (event)=> {
    
        const categoryDetailSelectContainer = document.querySelector('.categoryDetailSelect_container');
        const upcategoryselectBtn_container = document.querySelector('.upcategoryselectBtn_container');
        const downcategoryselectBtn_container = document.querySelector('.downcategoryselectBtn_container');
    
        // 카테고리 상세 컨테이너 외 부분을 클릭 했을 경우 사라지게 만들기
        if (!categoryDetailSelectContainer.contains(event.target) && !upcategoryselectBtn_container.contains(event.target) && !downcategoryselectBtn_container.contains(event.target)) {
            if(categoryBtnRecog) {
                categoryBtnRecog = false;
                categoryDetailSelectContainerDisplayNone();
            }
        }
    });
    
    function categoryDetailSelectContainerDisplayNone() {
        // console.log(`창 닫기!`);
    
        const categoryDetailSelectContainer = document.querySelector('.categoryDetailSelect_container');
        categoryDetailSelectContainer.style.display = 'none';
        selectedCategoryDetailBtns = [];
        categoryBtnRecog = false;
        whichCategoryBtnRecog = '';
        selectedCategoryBtn = null;
        // console.log(`selectedCategoryDetailBtns:${selectedCategoryDetailBtns}`);
    }
    
    // 카테고리 내에 상세 카테고리 버튼을 클릭 했을 경우
    document.addEventListener('click', function (event) {
        const button = event.target.closest('.selectBtn_container button');
        if (!button) return;
    
        // console.log('button:',button);
    
        // 클릭한 버튼 내의 span 요소의 텍스트를 읽습니다.
        const icon = button.querySelector('i');
    
        // 클릭 시 투명도를 조절하여 부드럽게 변경합니다.
        icon.style.opacity = 0;
        let isButtonSelected = false;
    
        // console.log(`-----------------------------------------`);
        // console.log(`selectedCategoryDetailBtns:${selectedCategoryDetailBtns}`);
    
        for (const btnText of selectedCategoryDetailBtns) {
            // console.log(`btnText:${btnText}`);
            // console.log(`button.textContent:${button.textContent}`);
        
            if (btnText === button.textContent) {
                isButtonSelected = true;
                break; // 조건이 충족되면 루프를 중단합니다.
            }
        }
    
        // console.log(`-----------------------------------------`);
    
        // 해당 버튼이 이미 선택되었는지 확인
        // console.log(`isButtonSelected:${isButtonSelected}`);
    
        // 아이콘 클래스와 스타일을 변경하는 함수
        const toggleIconStyle = (addSolid, addCheck) => {
            icon.classList.remove('fa-regular', 'fa-square', 'fa-solid', 'fa-square-check');
            if (addSolid) {
                icon.classList.add('fa-solid');
            } else {
                icon.classList.add('fa-regular');
            }
            if (addCheck) {
                icon.classList.add('fa-square-check');
            } else {
                icon.classList.add('fa-square');
            }
        };
    
        // 최초 클릭 했을 경우
        if (!isButtonSelected) {
            // 일정 시간 후에 아이콘 스타일을 변경하여 페이드 아웃 효과를 보여줍니다.
            setTimeout(() => {
                toggleIconStyle(true, true);
                icon.style.opacity = 1;
            }, 100);
            selectedCategoryDetailBtns.push(button.textContent);
            // console.log(`button.textContent:${button.textContent}`);
    
            // console.log(`최초 클릭!`);
        } else {
            // console.log(`선택된 것 클릭!`);
            // 선택 취소한 버튼을 selectedCategoryDetailBtns 배열에서 제거합니다.
            const indexToRemove = selectedCategoryDetailBtns.indexOf(button.textContent);
            if (indexToRemove !== -1) {
                selectedCategoryDetailBtns.splice(indexToRemove, 1);
            }
    
            // 일정 시간 후에 아이콘 스타일을 변경하여 페이드 아웃 효과를 보여줍니다.
            setTimeout(() => {
                toggleIconStyle(false, false);
                icon.style.opacity = 1;
            }, 50);
        }
    
    });
    
    const selectCancelBtn = document.querySelector('.selectCancelBtn');
    
    // 전체 선택해제 버튼을 클릭하는 이벤트 리스너 추가
    selectCancelBtn.addEventListener('click', () => {
    
        // console.log(`selectedCategoryDetailBtns:${selectedCategoryDetailBtns}`);
    
        // selectedCategoryDetailBtns 배열에 있는 모든 버튼을 선택 해제
        selectedCategoryDetailBtns.forEach(button => {
            toggleIconStyle(false, false); // 버튼을 toggleIconStyle 함수로 전달
        });
    
        // 배열을 비웁니다.
        selectedCategoryDetailBtns = [];
    
    });
    
    // 아이콘 클래스와 스타일을 변경하는 함수
    const toggleIconStyle = (addSolid, addCheck) => {
        const allIElements = document.querySelectorAll('.selectBtn_container i');
    
        allIElements.forEach(icon => {
            icon.classList.remove('fa-regular', 'fa-square', 'fa-solid', 'fa-square-check');
            if (addSolid) {
                icon.classList.add('fa-solid');
            } else {
                icon.classList.add('fa-regular');
            }
            if (addCheck) {
                icon.classList.add('fa-square-check');
            } else {
                icon.classList.add('fa-square');
            }
        });
    
        if(whichCategoryBtnRecog === '나이') {
            ageCategoryBtn = [];
        } else if(whichCategoryBtnRecog === '키') {
            heightCategoryBtn = [];
        } else if(whichCategoryBtnRecog === '사는곳') {
            regionCategoryBtn = [];
        } else if(whichCategoryBtnRecog === 'MBTI') {
            mbtiCategoryBtn = [];
        } else if(whichCategoryBtnRecog === '스타일') {
            styleCategoryBtn = [];
        } else if(whichCategoryBtnRecog === '체형') {
            bodyTypeCategoryBtn = [];
        } else if(whichCategoryBtnRecog === '성격') {
            personalityCategoryBtn = [];
        } else if(whichCategoryBtnRecog === '음주') {
            drinkingCategoryBtn = [];
        } else if(whichCategoryBtnRecog === '취미') {
            hobbyCategoryBtn = [];
        } else if(whichCategoryBtnRecog === '흡연') {
            smokingCategoryBtn = [];
        } 
    
    };
    
    
    const categoryConfirmBtn = document.querySelector('.categoryConfirmBtn');
    const categorySelect_container = document.querySelector('.categorySelect_container');
    const categoryDetailSelectContainer = document.querySelector('.categoryDetailSelect_container');
    const selectedCategoryBtn_container = document.querySelector('.selectedCategoryBtn_container');
    
    // 선택된 카테고리 컨테이너 Display 핸들러
    function categorySelectContainerDisplayHandler(text) {
        const categorySelect_container = document.querySelector('.categorySelect_container');
        // console.log(`categorySelect_container:${categorySelect_container.classList}`);
        // console.log(`text:${text}`);
    
        if(text === 'block') {
            // categorySelect_container.classList.add('show');
            categorySelect_container.style.transition = 'none'; // 트랜지션을 비활성화합니다.
            categorySelect_container.style.opacity = 0; // 초기 투명도를 0으로 설정
            categorySelect_container.style.display = 'block';
    
            setTimeout(() => {
                categorySelect_container.style.transition = 'opacity 0.3s'; // 트랜지션을 활성화합니다.
                categorySelect_container.style.opacity = 1; // opacity를 1로 설정하여 나타나도록 합니다.
            }, 0); // 다음 프레임에서 트랜지션을 활성화하므로 지연 없이 실행됩니다.
    
    
            // 버튼들 생성한다.
    
    
        } else if(text === 'none') {
    
            // 트랜지션 종료 후에 display를 'none'으로 변경합니다.
            if(categorySelect_container.style.display === 'block') {
                categorySelect_container.addEventListener('transitionend', () => {
                    categorySelect_container.style.display = 'none';
                }, { once: true }); // 이벤트 리스너는 한 번만 실행됩니다.
            }
            // 사라질 때도 높이를 변경하면서 투명도를 조절하여 부드러운 효과를 적용합니다.
            categorySelect_container.style.transition = 'opacity 0.3s'; // 트랜지션을 활성화합니다.
            categorySelect_container.style.opacity = 0; // opacity를 0으로 설정하여 사라지도록 합니다.
    
            // 버튼들 모두 지운다.
    
        }
    }
    
    // 적용하기 버튼 클릭했을 경우
    categoryConfirmBtn.addEventListener('click', (event) => {
        event.preventDefault();
    
        // console.log(`적용하기 버튼 클릭!`);
        // categorySelect_container.style.display = 'block';
        if(selectedCategoryDetailBtns.length > 0) {
            categorySelectContainerDisplayHandler('block');
        }
    
        // whichCategoryBtnRecog를 기준으로 selectedCategoryDetailBtns에 따라서 재배치한다.
        if(whichCategoryBtnRecog === '나이') {
            CategoryConfirmBtnHandler(ageCategoryBtn, 'age');
        } else if(whichCategoryBtnRecog === '키') {
            CategoryConfirmBtnHandler(heightCategoryBtn, 'height');
        } else if(whichCategoryBtnRecog === '사는곳') {
            CategoryConfirmBtnHandler(regionCategoryBtn, 'region');
        } else if(whichCategoryBtnRecog === 'MBTI') {
            CategoryConfirmBtnHandler(mbtiCategoryBtn, 'mbti');
        } else if(whichCategoryBtnRecog === '스타일') {
            CategoryConfirmBtnHandler(styleCategoryBtn, 'style');
        } else if(whichCategoryBtnRecog === '체형') {
            CategoryConfirmBtnHandler(bodyTypeCategoryBtn, 'bodyType');
        } else if(whichCategoryBtnRecog === '성격') {
            CategoryConfirmBtnHandler(personalityCategoryBtn, 'personality');
        } else if(whichCategoryBtnRecog === '음주') {
            CategoryConfirmBtnHandler(drinkingCategoryBtn, 'drinking');
        } else if(whichCategoryBtnRecog === '취미') {
            CategoryConfirmBtnHandler(hobbyCategoryBtn, 'hobby');
        } else if(whichCategoryBtnRecog === '흡연') {
            CategoryConfirmBtnHandler(smokingCategoryBtn, 'smoking');
        }
    
        selectedCategoryDetailBtns.forEach(() => {
    
            if(whichCategoryBtnRecog === '나이') {
                ageCategoryBtn = selectedCategoryDetailBtns.slice();
            } else if(whichCategoryBtnRecog === '키') {
                heightCategoryBtn = selectedCategoryDetailBtns.slice();
            } else if(whichCategoryBtnRecog === '사는곳') {
                regionCategoryBtn = selectedCategoryDetailBtns.slice();
            } else if(whichCategoryBtnRecog === 'MBTI') {
                mbtiCategoryBtn = selectedCategoryDetailBtns.slice();
            } else if(whichCategoryBtnRecog === '스타일') {
                styleCategoryBtn = selectedCategoryDetailBtns.slice();
            } else if(whichCategoryBtnRecog === '체형') {
                bodyTypeCategoryBtn = selectedCategoryDetailBtns.slice();
            } else if(whichCategoryBtnRecog === '성격') {
                personalityCategoryBtn = selectedCategoryDetailBtns.slice();
            } else if(whichCategoryBtnRecog === '음주') {
                drinkingCategoryBtn = selectedCategoryDetailBtns.slice();
            } else if(whichCategoryBtnRecog === '취미') {
                hobbyCategoryBtn = selectedCategoryDetailBtns.slice();
            } else if(whichCategoryBtnRecog === '흡연') {
                smokingCategoryBtn = selectedCategoryDetailBtns.slice();
            } 
        
    
            // console.log(`occupationCategoryBtn:${occupationCategoryBtn}`);
            // console.log(`======================================`);
        });
    
        // console.log('regionCategoryBtn:',regionCategoryBtn);
    
        // 서버에 유저 리스트 요청
        UserListRequest(); 
    
    
        categoryDetailSelectContainerDisplayNone();
    
        // selectBtn_container 내의 모든 i 엘리먼트 선택
        const selectedCategoryBtniconElements = document.querySelectorAll('.selectedCategoryBtn_container i');
        // console.log(`selectedCategoryBtniconElements:${selectedCategoryBtniconElements}`);
    
        // 각 X버튼 아이콘에 클릭 이벤트 리스너 추가
        selectedCategoryBtniconElements.forEach(icon => {
            icon.addEventListener('click', () => {
    
                // icon의 부모 button 엘리멘트를 찾자
                const parentButton = icon.closest('button');
    
                const selectedCategoryBtns = document.querySelectorAll('.selectedCategoryBtn_container button');
                // console.log(`selectedCategoryBtns:${selectedCategoryBtns.length}`);
    
                // 마지막 남은 선택된 카테고리를 취소할 때
                if(selectedCategoryBtns.length === 1) {
                    settingRest(); // 세팅 초기화
                }
    
                if(parentButton) {
                    const buttonText = parentButton.querySelector('span').textContent;
                    const buttonId = parentButton.getAttribute('id'); // ID 값을 가져옴
                    // console.log('클릭된 버튼의 텍스트:', buttonText);
                    // console.log('클릭된 버튼의 ID:', buttonId);
    
                    // 1. 클릭된 버튼은 제거하기
                    parentButton.remove();
    
                    // 2. 배열에서 해당 Text를 제거하기
                    if(buttonId === 'age') {
                        removeSelectedCategoryArray(ageCategoryBtn, buttonText);
                        if(ageCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'height') {
                        removeSelectedCategoryArray(heightCategoryBtn, buttonText);
                        if(heightCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'region') {
                        removeSelectedCategoryArray(regionCategoryBtn, buttonText);
                        if(regionCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'mbti') {
                        removeSelectedCategoryArray(mbtiCategoryBtn, buttonText);
                        if(mbtiCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        }
                    } else if(buttonId === 'style') {
                        removeSelectedCategoryArray(styleCategoryBtn, buttonText);
                        if(styleCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'bodyType') {
                        removeSelectedCategoryArray(bodyTypeCategoryBtn, buttonText);
                        if(bodyTypeCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        }
                    } else if(buttonId === 'personality') {
                        removeSelectedCategoryArray(personalityCategoryBtn, buttonText);
                        if(personalityCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'drinking') {
                        removeSelectedCategoryArray(drinkingCategoryBtn, buttonText);
                        if(drinkingCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'hobby') {
                        removeSelectedCategoryArray(hobbyCategoryBtn, buttonText);
                        if(hobbyCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'smoking') {
                        removeSelectedCategoryArray(smokingCategoryBtn, buttonText);
                        if(smokingCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    }
    
                    UserListRequest(); // 리스트 다시 불러오기
                }
            });
        });
    });
    
    // 선택된 카테고리 버튼을 생성하는 함수
    function createSelectedCategoryBtns() {
    
        // 한번 초기화 해주기
        const selectedCategoryBtns = document.querySelectorAll('.selectedCategoryBtn_container button');
        // console.log('selectedCategoryBtns:',selectedCategoryBtns);
        selectedCategoryBtns.forEach((btn) => {
            btn.remove();
        });
    
        AddBtnToSelectedDetailCategory(ageCategoryBtn, 'age');
        AddBtnToSelectedDetailCategory(heightCategoryBtn, 'height');
        AddBtnToSelectedDetailCategory(regionCategoryBtn, 'region');
        AddBtnToSelectedDetailCategory(mbtiCategoryBtn, 'mbti');
        AddBtnToSelectedDetailCategory(styleCategoryBtn, 'style');
        AddBtnToSelectedDetailCategory(bodyTypeCategoryBtn, 'bodyType');
        AddBtnToSelectedDetailCategory(personalityCategoryBtn, 'personality');
        AddBtnToSelectedDetailCategory(drinkingCategoryBtn, 'drinking');
        AddBtnToSelectedDetailCategory(hobbyCategoryBtn, 'hobby');
        AddBtnToSelectedDetailCategory(smokingCategoryBtn, 'smoking');

    
        // selectBtn_container 내의 모든 i 엘리먼트 선택
        const selectedCategoryBtniconElements = document.querySelectorAll('.selectedCategoryBtn_container i');
        // console.log(`selectedCategoryBtniconElements:${selectedCategoryBtniconElements}`);
    
        // 각 X버튼 아이콘에 클릭 이벤트 리스너 추가
        selectedCategoryBtniconElements.forEach(icon => {
            icon.addEventListener('click', () => {
                console.log('aaaaa');
                // icon의 부모 button 엘리멘트를 찾자
                const parentButton = icon.closest('button');
    
                const selectedCategoryBtns = document.querySelectorAll('.selectedCategoryBtn_container button');
                // console.log(`selectedCategoryBtns:${selectedCategoryBtns.length}`);
    
                // 마지막 남은 선택된 카테고리를 취소할 때
                if(selectedCategoryBtns.length === 1) {
                    settingRest(); // 세팅 초기화
                }
    
                if(parentButton) {
                    const buttonText = parentButton.querySelector('span').textContent;
                    const buttonId = parentButton.getAttribute('id'); // ID 값을 가져옴
                    // console.log('클릭된 버튼의 텍스트:', buttonText);
                    // console.log('클릭된 버튼의 ID:', buttonId);
    
                    // 1. 클릭된 버튼은 제거하기
                    parentButton.remove();
    
                    // 2. 배열에서 해당 Text를 제거하기
                    if(buttonId === 'age') {
                        removeSelectedCategoryArray(ageCategoryBtn, buttonText);
                        if(ageCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'height') {
                        removeSelectedCategoryArray(heightCategoryBtn, buttonText);
                        if(heightCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'region') {
                        removeSelectedCategoryArray(regionCategoryBtn, buttonText);
                        if(regionCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'mbti') {
                        removeSelectedCategoryArray(mbtiCategoryBtn, buttonText);
                        if(mbtiCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        }
                    } else if(buttonId === 'style') {
                        removeSelectedCategoryArray(styleCategoryBtn, buttonText);
                        if(styleCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'bodyType') {
                        removeSelectedCategoryArray(bodyTypeCategoryBtn, buttonText);
                        if(bodyTypeCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        }
                    } else if(buttonId === 'personality') {
                        removeSelectedCategoryArray(personalityCategoryBtn, buttonText);
                        if(personalityCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'drinking') {
                        removeSelectedCategoryArray(drinkingCategoryBtn, buttonText);
                        if(drinkingCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'hobby') {
                        removeSelectedCategoryArray(hobbyCategoryBtn, buttonText);
                        if(hobbyCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    } else if(buttonId === 'smoking') {
                        removeSelectedCategoryArray(smokingCategoryBtn, buttonText);
                        if(smokingCategoryBtn.length === 0) {
                            categorySeletedShowHandlier(buttonId, 'remove');
                        } 
                    }
    
                    UserListRequest(); // 리스트 다시 불러오기
                }
            });
        });
    }
    
    function AddBtnToSelectedDetailCategory(categoryBtn, text) {
        const selectedCategoryBtnContainer = document.querySelector('.selectedCategoryBtn_container');
    
    
        categoryBtn.forEach((value) => {
            const newButton = document.createElement('button');
            newButton.classList.add(`selectedBtn`);
            newButton.innerHTML = `<span>${value}</span><i class="fa-solid fa-xmark"></i>`;
            selectedCategoryBtnContainer.appendChild(newButton);
            newButton.setAttribute('id', text);
        });
    }
    
    function CategoryConfirmBtnHandler(categoryBtn, text) {
        
        const selectedCategoryBtnContainer = document.querySelector('.selectedCategoryBtn_container');
        const selectedCategorybuttons = selectedCategoryBtnContainer.querySelectorAll('button');
    
        // 선택된 버튼 표시 활성화
        // console.log(`text : ${text}`);
        categorySeletedShowHandlier(text, 'active');
        
        // 선택된게 아무 것도 없을때
        if(categoryBtn.length === 0) {
    
            // console.log(`카테고리 선택된거 없는데~`);
            
            // 선택해제
            if(selectedCategoryDetailBtns.length === 0) {
                console.log(`선택한 버튼이 없음!`);
                const Buttons = Array.from(selectedCategorybuttons).filter(button => button.id === text);    
                // 기존에 선택된 것을 다 지우자
                Buttons.forEach((button) => {
                    button.remove();
                });
    
                const selectedCategoryBtn_container = document.querySelector('.selectedCategoryBtn_container');
                const buttons = selectedCategoryBtn_container.querySelectorAll('button');
    
                // 만약에 선택된 카테고리가 하나도 없으면 창을 끄자
                if(buttons.length === 0) {
                    // const categorySelect_container = document.querySelector('.categorySelect_container');
                    // categorySelect_container.style.display = 'none';
                    categorySelectContainerDisplayHandler('none');
                }
    
                categorySeletedShowHandlier(text, 'remove');
            }
    
            // 그냥 추가하면 돼 (selectedCategoryDetailBtns을 기준으로)
            selectedCategoryDetailBtns.forEach((value) => {
                const newButton = document.createElement('button');
                newButton.classList.add(`selectedBtn`);
                newButton.innerHTML = `<span>${value}</span><i class="fa-solid fa-xmark"></i>`;
                selectedCategoryBtnContainer.appendChild(newButton);
    
                if(whichCategoryBtnRecog === '나이') {
                    newButton.setAttribute('id', 'age');
                } else if(whichCategoryBtnRecog === '키') {
                    newButton.setAttribute('id', 'height');
                } else if(whichCategoryBtnRecog === '사는곳') {
                    newButton.setAttribute('id', 'region');
                } else if(whichCategoryBtnRecog === 'MBTI') {
                    newButton.setAttribute('id', 'mbti');
                } else if(whichCategoryBtnRecog === '스타일') {
                    newButton.setAttribute('id', 'style');
                } else if(whichCategoryBtnRecog === '체형') {
                    newButton.setAttribute('id', 'bodyType');
                } else if(whichCategoryBtnRecog === '성격') {
                    newButton.setAttribute('id', 'personality');
                } else if(whichCategoryBtnRecog === '음주') {
                    newButton.setAttribute('id', 'drinking');
                } else if(whichCategoryBtnRecog === '취미') {
                    newButton.setAttribute('id', 'hobby');
                } else if(whichCategoryBtnRecog === '흡연') {
                    newButton.setAttribute('id', 'smoking');
                } 
            });
        } 
        // 선택된게 있을 때
        else {
        
            // console.log(`카테고리 선택된거 있네?`);
            // 1. 나이가 선택된 위치로 가서
            const Buttons = Array.from(selectedCategorybuttons).filter(button => button.id === text);    
            // const buttonTextArray = Array.from(selectedCategorybuttons).map(button => button.textContent); // 기존에 선택한 버튼
            // const newButtons = selectedCategoryDetailBtns.filter(value => !buttonTextArray.includes(value)); // 기존에 선택한 것을 제외한 새로운 버튼
    
            // 2. 기존에 선택된 것을 다 지우고
            Buttons.forEach((button) => {
                button.remove();
            });
    
            // console.log(`selectedCategoryDetailBtns:${selectedCategoryDetailBtns}`);
    
            // 선택한 것을 모두 없애고 적용을 눌렀을 경우 (선택해제 X)
            if(selectedCategoryDetailBtns.length === 0) {
                console.log(`선택한 버튼이 없음!`);
                const Buttons = Array.from(selectedCategorybuttons).filter(button => button.id === text);    
                // 기존에 선택된 것을 다 지우자
                Buttons.forEach((button) => {
                    button.remove();
                });
    
                const selectedCategoryBtn_container = document.querySelector('.selectedCategoryBtn_container');
                const buttons = selectedCategoryBtn_container.querySelectorAll('button');
    
                // 만약에 선택된 카테고리가 하나도 없으면 창을 끄자
                if(buttons.length === 0) {
                    // const categorySelect_container = document.querySelector('.categorySelect_container');
                    // categorySelect_container.style.display = 'none';
                    categorySelectContainerDisplayHandler('none');
                }
    
                categorySeletedShowHandlier(text, 'remove');
    
                // 관련된 카테고리 배열 초기화
                if(text === 'age') {
                    ageCategoryBtn = [];
                } else if(text === 'height') {
                    heightCategoryBtn = [];
                } else if(text === 'region') {
                    regionCategoryBtn = [];
                } else if(text === 'mbti') {
                    mbtiCategoryBtn = [];
                } else if(text === 'style') {
                    styleCategoryBtn = [];
                } else if(text === 'bodyType') {
                    bodyTypeCategoryBtn = [];
                } else if(text === 'personality') {
                    personalityCategoryBtn = [];
                } else if(text === 'drinking') {
                    drinkingCategoryBtn = [];
                } else if(text === 'hobby') {
                    hobbyCategoryBtn = [];
                } else if(text === 'smoking') {
                    smokingCategoryBtn = [];
                } 
            }
    
            // 3. selectedCategoryDetailBtns에 맞춰서 다시 생성한다.
            selectedCategoryDetailBtns.forEach((value) => {
                const newButton = document.createElement('button');
                newButton.classList.add(`selectedBtn`);
                newButton.innerHTML = `<span>${value}</span><i class="fa-solid fa-xmark"></i>`;
                selectedCategoryBtnContainer.appendChild(newButton);
    
                if(whichCategoryBtnRecog === '나이') {
                    newButton.setAttribute('id', 'age');
                } else if(whichCategoryBtnRecog === '키') {
                    newButton.setAttribute('id', 'height');
                } else if(whichCategoryBtnRecog === '사는곳') {
                    newButton.setAttribute('id', 'region');
                } else if(whichCategoryBtnRecog === 'MBTI') {
                    newButton.setAttribute('id', 'mbti');
                } else if(whichCategoryBtnRecog === '스타일') {
                    newButton.setAttribute('id', 'style');
                } else if(whichCategoryBtnRecog === '체형') {
                    newButton.setAttribute('id', 'bodyType');
                } else if(whichCategoryBtnRecog === '성격') {
                    newButton.setAttribute('id', 'personality');
                } else if(whichCategoryBtnRecog === '음주') {
                    newButton.setAttribute('id', 'drinking');
                } else if(whichCategoryBtnRecog === '취미') {
                    newButton.setAttribute('id', 'hobby');
                } else if(whichCategoryBtnRecog === '흡연') {
                    newButton.setAttribute('id', 'smoking');
                } 
            });
        }
    }
    
    function categorySeletedShowHandlier(text, action) {
    
        const ageBtn = document.querySelector('.ageBtn');
        const heightBtn = document.querySelector('.heightBtn');
        const regionBtn = document.querySelector('.regionBtn');
        const mbtiBtn = document.querySelector('.mbtiBtn');
        const styleBtn = document.querySelector('.styleBtn');
        const bodyTypeBtn = document.querySelector('.bodyTypeBtn');
        const personalityBtn = document.querySelector('.personalityBtn');
        const drikingBtn = document.querySelector('.drinkingBtn');
        const hobbyBtn = document.querySelector('.hobbyBtn');
        const smokingBtn = document.querySelector('.smokingBtn');

    
        if(text === null && action === 'reset') {
            ageBtn.classList.remove('active');
            heightBtn.classList.remove('active');
            regionBtn.classList.remove('active');
            smokingBtn.classList.remove('active');
            mbtiBtn.classList.remove('active');
            styleBtn.classList.remove('active');
            bodyTypeBtn.classList.remove('active');
            personalityBtn.classList.remove('active');
            drikingBtn.classList.remove('active');
            hobbyBtn.classList.remove('active');
        }
    
        if(action === 'active') {
            if(text === 'age') {
                ageBtn.classList.add('active');
            } else if(text === 'height') {
                heightBtn.classList.add('active');
            } else if(text === 'region') {
                regionBtn.classList.add('active');
            } else if(text === 'smoking') {
                smokingBtn.classList.add('active');
            } else if(text === 'mbti') {
                mbtiBtn.classList.add('active');
            } else if(text === 'style') {
                styleBtn.classList.add('active');
            } else if(text === 'bodyType') {
                bodyTypeBtn.classList.add('active');
            } else if(text === 'personality') {
                personalityBtn.classList.add('active');
            } else if(text === 'drinking') {
                drikingBtn.classList.add('active');
            } else if(text === 'hobby') {
                hobbyBtn.classList.add('active');
            } 
        } else if(action === 'remove') {
            if(text === 'age') {
                console.log(`age 효과 제거!`);
                ageBtn.classList.remove('active');
            } else if(text === 'height') {
                heightBtn.classList.remove('active');
            } else if(text === 'region') {
                regionBtn.classList.remove('active');
            } else if(text === 'smoking') {
                smokingBtn.classList.remove('active');
            } else if(text === 'mbti') {
                mbtiBtn.classList.remove('active');
            } else if(text === 'style') {
                styleBtn.classList.remove('active');
            } else if(text === 'bodyType') {
                bodyTypeBtn.classList.remove('active');
            } else if(text === 'personality') {
                personalityBtn.classList.remove('active');
            } else if(text === 'drinking') {
                drikingBtn.classList.remove('active');
            } else if(text === 'hobby') {
                hobbyBtn.classList.remove('active');
            } 
        }
    }
    
    function removeSelectedCategoryArray(btn, buttonText) {
        const indexToRemove = btn.indexOf(buttonText);
        if (indexToRemove !== -1) {
            btn.splice(indexToRemove, 1);
        }
    }
    
    const settingResetBtn = document.querySelector('.settingResetBtn');
    // 초기화 버튼 클릭 시
    settingResetBtn.addEventListener('click', (event)=> {
        event.preventDefault();
    
        // console.log(`초기화 버튼!`);
        settingRest(); // 세팅 초기화
    });
    
    // 세팅 초기화 function
    function settingRest() {
        const selectedCategoryBtnContainer = document.querySelector('.selectedCategoryBtn_container');
        selectedCategoryBtnContainer.innerHTML = ''; // 버튼을 모두 제거합니다.
    
        // const categorySelect_container = document.querySelector('.categorySelect_container');
        // categorySelect_container.style.display = 'none'; 
        categorySeletedShowHandlier(null, 'reset');
        categorySelectContainerDisplayHandler('none');
    
        ageCategoryBtn = [];
        heightCategoryBtn = [];
        regionCategoryBtn = [];
        mbtiCategoryBtn = [];
        styleCategoryBtn = [];
        bodyTypeCategoryBtn = [];
        personalityCategoryBtn = [];
        drinkingCategoryBtn = [];
        hobbyCategoryBtn = [];
        smokingCategoryBtn = [];
    
        UserListRequest(); // 리스트 다시 불러오기
    }
    
    
    ///// 이용자 목록 List 불러오기 /////
    
    const matchingList_container = document.querySelector('.matchingList_container');
    let userListData = []; 
    
    function UserListRequest() {
    
        // console.log(`UserListRequest!`);
    
        // 기존에 모든 요소 지우기
        while(matchingList_container.firstChild) {
            matchingList_container.removeChild(matchingList_container.firstChild);
        }
    
        // 페이지 넘김 버튼도 초기화하기
        const pagination = document.querySelector('.pagination');
        pagination.innerHTML = '';
    
        // 서버로 User LIst 요청
        fetch(`/userListProc`, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                totalFavoriteRecog: totalFavoriteRecog,
                ageCategoryBtn: ageCategoryBtn,
                heightCategoryBtn: heightCategoryBtn,
                regionCategoryBtn: regionCategoryBtn,
                mbtiCategoryBtn: mbtiCategoryBtn,
                styleCategoryBtn: styleCategoryBtn,
                bodyTypeCategoryBtn: bodyTypeCategoryBtn,
                personalityCategoryBtn: personalityCategoryBtn,
                drinkingCategoryBtn: drinkingCategoryBtn,
                hobbyCategoryBtn: hobbyCategoryBtn,
                smokingCategoryBtn: smokingCategoryBtn,
            })
        })
        .then(response => response.json())
        .then(data => {
            // 기본적으로 리셋
            userListData = [];
    
            const resultNotFound = document.querySelector('.resultNotFound');
            // 일치하는 User List가 없을 경우
            if(data['result'] == 'undifined') {
                resultNotFound.style.display = 'block'; // 결과가 없다는 container 나타내기
            }
            // 찜한 사람이 없을 경우 
            else if(data['result'] == 'no favorite list') {
                resultNotFound.style.display = 'block'; // 결과가 없다는 container 나타내기
            }
            else {
                resultNotFound.style.display = 'none'; // 결과가 없다는 container 사라지게 하기
                userListData.push(data);
                renderUserList(userListData);
            }
        })
        .catch(error => {
            console.log(`Error : ${error}`);
        });
    }
    
    // userList에 유저 컨테이너 정보를 랜더링
    function renderUserList(userListData) {
    
        const favoriteList = [];
    
        // 로그인 된 상태일 경우
        if(loginStatus === true) {
    
            // console.log('로그인 상태에서 이용자 리스트 불러오기 요청!');
    
            // 서버에서 생성된 List 중에 '추가 정보 열람 or 제외할 이용자가 없는지'를 확인
            fetch(`/additionalInfoUserListProC`, {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                })
            })
            .then(response => response.json())
            .then(data => {
    
                // 서버에서 전달한 데이터를 처리합니다.
                const openUserList = data.openUserList;
                const exceptUserList = data.exceptUserList;
    
                // 이제 openUserList와 exceptUserList 변수를 사용하여 작업을 수행할 수 있습니다.
                // console.log(openUserList);
                // console.log(exceptUserList);
    
                // 서버에 로그인한 id가 찜한 리스트에 아이디 값을 받아옴
                fetch(`/favoriteListProc`, {
                    method : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                    })
                })
                .then(response => response.json())
                .then(data => {
                    // 찜한 사람이 없을 경우
                    if(data['results'] === 'no list') {
                        // 이용자 List 생성
                        for(let i=0; i<userListData[0].length; i++) {
                            if(exceptUserList!=undefined) {
                                if(exceptUserList.includes(userListData[0][i].id)){
                                    continue;
                                }
                            }
                            const userContainer = createUserContainer(userListData[0][i], favoriteList, openUserList);
                            matchingList_container.appendChild(userContainer);
                        }
                        // 페이지 버튼 생성 및 관리
                        pageBtnHandler();
                    }
                    // 찜한 사람이 있을 경우
                    else {            
                        // 찜한 사람 목록을 favoriteList 배열에 넣기
                        data.forEach((data) => {
                            favoriteList.push(data.selectedId);
                        });
    
                        // 이용자 List 생성
                        for(let i=0; i<userListData[0].length; i++) {
                            if(exceptUserList!=undefined) {
                                if(exceptUserList.includes(userListData[0][i].id)){
                                    continue;
                                }
                            }
                            const userContainer = createUserContainer(userListData[0][i], favoriteList, openUserList);
                            matchingList_container.appendChild(userContainer);
                        }
                        // 페이지 버튼 생성 및 관리
                        pageBtnHandler();
                    }
                })
                .catch(error => {
                    console.log(`찜하기 Error : ${error}`);
                });
            })
            .catch(error => {
                console.log(`추가 정보 열람 List Error : ${error}`);
            });
    
        } 
        // 비로그인 상태일 경우
        else {
            // 이용자 List 생성
            for(let i=0; i<userListData[0].length; i++) {
                const userContainer = createUserContainer(userListData[0][i]);
                matchingList_container.appendChild(userContainer);
            }
            // 페이지 버튼 생성 및 관리
            pageBtnHandler();
        }
    }
    
    let heartIconHoverStatus = false;
    
    // user container 생성
    function createUserContainer(userData, favoriteList, openUserList) {
    
        // console.log(`userData:${userData.name}`);
    
        // 유저 컨테이너를 생성합니다.
        const userContainer = document.createElement('div');
        userContainer.classList.add('matchingPerson_container');
    
        // 프로필 이미지 컨테이너를 생성합니다.
        const profileImgContainer = document.createElement('div');
        profileImgContainer.classList.add('profileImg_container');
        
        const heartIcon = document.createElement('i');
    
        // 찜하기 버튼 클릭 시
        heartIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // 이벤트 전파를 중단하여 부모 요소로의 이벤트 전파 방지
            e.preventDefault();
    
            // console.log(`찜한 유저:${userData.id}`);
            
            // 비회원 일 경우
            if(loginStatus === false) {
                window.location.href = `${hostURL}login`;
            }
            // 회원 일 경우
            else if(loginStatus === true) {
    
                if(matchingListSingupStats === 'CONFIRM') {
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
                        // 찜하기 성공
                        if(data['result'] === 'insert') {
                            // 해당 찜하기 버튼(♡→♥) 변경
                            heartIcon.classList.remove('fa-regular');
                            heartIcon.classList.add('fa-solid');
                            heartIcon.style.color = '#d72828';
                        } 
                        // 이미 찜한 경우
                        else if(data['result'] === 'delete') {
                            // 해당 찜하기 버튼(♥→♡) 변경
                            heartIcon.classList.remove('fa-solid');
                            heartIcon.classList.add('fa-regular');
                            heartIcon.style.color = 'rgb(255, 255, 255)';
    
                            // '찜한 사람' 선택 중에 찜하기를 취소 했을 경우
                            if(totalFavoriteRecog === 'favorite') {
                                UserListRequest(); // 유저 리스트 다시 불러오기
                            }
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
    
        userContainer.addEventListener('click', (e) => {
            e.preventDefault();
    
            const personInfoURL = `${hostURL}personInfo?idinfo=${userData.idinfo}`;
            // 새로운 브라우저 창에서 URL 열기
            // window.open(personInfoURL, '_blank');
            window.location.href = personInfoURL;
        });
    
    
        // 비로그인일 경우
        if(favoriteList === undefined) {
            heartIcon.classList.add('fa-regular', 'fa-heart');
            heartIcon.style.color = '#ffffff';
        }
        // 로그인 상태일 경우
        else {
            // 찜한 사람이 없을 경우 경우
            if(favoriteList.length === 0) {
                heartIcon.classList.add('fa-regular', 'fa-heart');
                heartIcon.style.color = '#ffffff';
            }
            // 찜한 사람이 있을 경우
            else {
                for (const userId of favoriteList) {
                    // 찜한 사람의 경우
                    if (userId === userData.id) {
                        // console.log(`찜한 사람 : ${userData.id}`);
                        heartIcon.classList.add('fa-solid', 'fa-heart');
                        heartIcon.style.color = '#d72828';
                        break; // 조건에 맞으면 루프 중지
                    } 
                    // 찜하지 않은 사람의 경우
                    else {
                        // console.log(`찜하지 않은 사람!`);
                        heartIcon.classList.add('fa-regular', 'fa-heart');
                        heartIcon.style.color = 'rgb(255, 255, 255)';
                    }
                }
            }
        }
    
        // console.log(`userData.id:${userData.id}`);
    
        // 이미지 태그를 생성하고 속성을 설정합니다.
        const img = document.createElement('img');
        img.src = `../backend/uploads/${userData.id}/${userData.picture_1}`;
        img.alt = '';
    
        // 이미지 드래그 할 수 없도록 설정
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
    
        //추가 열람 정보를 진행한 이용자면 이미지의 blur처리를 제거한다.
        if(loginStatus === true) {
            if(openUserList != undefined) {
                for(let i = 0; i < openUserList.length; i++) {
                    // console.log(openUserList[i].matchingUser);
                    if(openUserList[i] === userData.id) {
                        img.style.filter = 'blur(0px)';
                    }
                }
            } 
        }
    
        // 프로필 지역 정보를 생성합니다.
        const regionInfo = document.createElement('p');
        regionInfo.classList.add('regionInfo');
        const regionText = userData.regionCity + " " + userData.regionGu
        regionInfo.textContent = regionText;
    
        // 프로필 정보 컨테이너를 생성합니다.
        const profileInfoContainer = document.createElement('div');
        profileInfoContainer.classList.add('profileInfo_container');
    
        // 각각의 프로필 정보를 생성합니다.
        const infoTitles = ['닉네임', '나이', '키', 'MBTI', '스타일', '체형', '성격', '음주', '흡연'];
        const infoValues = [userData.nickname, userData.age, userData.height, userData.mbti, userData.style, userData.bodyType, userData.personality, userData.drinking, userData.smoking];
    
        for (let i = 0; i < infoTitles.length; i++) {
            const infoTitle = document.createElement('span');
            infoTitle.classList.add('infoTitle');
            infoTitle.textContent = `${infoTitles[i]} : `;
    
            // if(infoTitles[i] === '나이' || infoTitles[i] === '키') {
            //     infoTitle.classList.add('emphasis');
            // }
    
            const infoText = document.createElement('span');
            infoText.classList.add('infoText');
            infoText.textContent = infoValues[i];
    
            // if(infoTitles[i] === '나이' || infoTitles[i] === '키' || infoTitles[i] === '직업') {
            //     infoText.classList.add('emphasis');
            // }
    
            const infoParagraph = document.createElement('p');
            infoParagraph.appendChild(infoTitle);
            infoParagraph.appendChild(infoText);
    
            profileInfoContainer.appendChild(infoParagraph);
        }
    
        // 취미 정보 컨테이너를 생성합니다.
        const profileHobbyInfoContainer = document.createElement('div');
        profileHobbyInfoContainer.classList.add('profileHobbyInfo_container');
    
        const hobbyArray = userData.hobby.split(',').map(item => item.trim());
    
        // 각각의 취미 정보를 생성합니다.
        hobbyArray.forEach((value) => {
            const hobbyInfo = document.createElement('div');
            // console.log(`hobby:${h}`);
            hobbyInfo.innerHTML = `<span>${value}</span>`;
            profileHobbyInfoContainer.appendChild(hobbyInfo);
        });
    
           
    
        // 생성한 요소들을 유저 컨테이너에 추가합니다.
        profileImgContainer.appendChild(heartIcon);
        profileImgContainer.appendChild(img);
    
        userContainer.appendChild(profileImgContainer);
        userContainer.appendChild(regionInfo);
        userContainer.appendChild(profileInfoContainer);
        userContainer.appendChild(profileHobbyInfoContainer);
    
        // 유저 컨테이너를 반환합니다.
        return userContainer;
    }
    
    UserListRequest();
    
    
    
    
    // 페이지 버튼 관리 function
    function pageBtnHandler() {
    
        // 한 페이지당 표시할 프로필 수
        const profilesPerPage = 20;
    
        // 현재 페이지를 추적합니다. 초기값은 1페이지입니다.
        let currentPage = 1;
    
        // 매칭 프로필 컨테이너와 페이지네이션 요소를 선택합니다.
        const pagination = document.querySelector('.pagination');
    
        // 페이지 수를 계산합니다.
        const totalPages = Math.ceil(matchingList_container.children.length / profilesPerPage);
        // console.log(`totalPages:${totalPages}`);
        // console.log(`matchingList_container.children.length:${matchingList_container.children.length}`);
    
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
            for (let i = 0; i < matchingList_container.children.length; i++) {
                const profile = matchingList_container.children[i];
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
    
            if(groupChangePageRecog === true) {
                if(prevNextPageBtnRecog === 'prev') {
                    activePageIndex = pagesPerGroup;
                } else if(prevNextPageBtnRecog === 'next') {
                    activePageIndex = relativePage;
                } else {
                    activePageIndex = relativePage;
                }
    
            } else if(groupChangePageRecog === false) {
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
            if(totalPageGroups > 1) {
                if(group > 1) {
                    const prevGroupButton = document.createElement('li');
                    prevGroupButton.classList.add('prevGroup');
                    prevGroupButton.textContent = '<<';
                    pagination.appendChild(prevGroupButton);
                }
            }
    
            // 현재 페이지 그룹의 시작 페이지와 끝 페이지를 계산합니다.
            const startPage = (group - 1) * pagesPerGroup + 1;
            const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
            
            if(prevNextPageBtnRecog === 'prev') {
                currentPage = endPage;
            } else if(prevNextPageBtnRecog === 'next') {
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
            if(totalPageGroups > 1) {
                if(!(totalPageGroups === group)) {
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
                        top: matchingList_container.offesetTop - targetHeight,
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
                        top: matchingList_container.offesetTop - targetHeight,
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
                    top: matchingList_container.offesetTop - targetHeight,
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
    
    // // 현재 상태를 세션 스토리지에 저장
    // function saveCurrentState(state) {
    //     console.log('aa');
    //     sessionStorage.setItem('currentPageState', JSON.stringify(state));
    // }
    
    // // 세션 스토리지에서 이전 상태를 가져와서 페이지 업데이트
    // function restorePreviousState() {
    //     console.log('bb');
    //     const storedState = sessionStorage.getItem('currentPageState');
    //     if (storedState) {
    //         const previousState = JSON.parse(storedState);
    //         // 이전 상태를 기반으로 페이지를 업데이트하는 함수 호출
    //         updatePage(previousState);
    //     }
    // }
    
    // // 뒤로가기 이벤트 감지
    // window.onpopstate = function () {
    //     // 세션 스토리지에서 이전 상태를 가져와서 페이지 업데이트
    //     console.log('cc');
    //     restorePreviousState();
    // };
    
    // window.onpopstate = function (event) {
    //     if (event.state) {
    //         // event.state에는 현재 페이지의 상태 정보가 있습니다.
    //         // 사용자가 뒤로가기 버튼을 클릭했을 때 여기에 진입됩니다.
    //         console.log("뒤로가기 이벤트 발생");
    //     } else {
    //         // event.state가 null인 경우에는 사용자가 앞으로 가기 버튼을 클릭했거나
    //         // 다른 방법으로 페이지 이동이 있었을 때 여기에 진입됩니다.
    //         console.log("뒤로가기 이외의 이동");
    //     }
    // };
});

