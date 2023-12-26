// 이용자 리뷰 정보 받아오기
userMannerReviewHandler();
function userMannerReviewHandler() {
    // 서버로 부터 정보를 받아오기
    fetch(`/mannerReivewProc`, {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: null,
        })
    })
    .then(response => response.json())
    .then(data => {
        const reviewList = data['reviewList'];
        const countReviewContents = data['countReviewContents'];

        console.log('Review List:', reviewList);
        console.log('countReviewContents:', countReviewContents);

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