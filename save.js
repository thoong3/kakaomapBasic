// Firebase Storage 사용을 위한 설정
const storage = firebase.storage();
let selectedCategory = ''; // 선택된 카테고리

// 사용자 id를 가져오는 함수
function getCurrentUserId() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo ? userInfo.id : null;
}

// 카테고리 선택을 위한 모달 표시
async function showCategorySelection() {
    const userId = getCurrentUserId();
    const categoryDropdown = document.getElementById('selectCategoryDropdown');
    categoryDropdown.innerHTML = '';

    // Firebase에서 카테고리 목록 가져오기
    const listRef = storage.ref(`userFiles/${userId}`);
    try {
        const result = await listRef.listAll();
        result.prefixes.forEach((categoryFolder) => {
            const option = document.createElement('option');
            option.value = categoryFolder.name;
            option.text = categoryFolder.name;
            categoryDropdown.appendChild(option);
        });
        document.getElementById('selectCategoryModal').style.display = 'block';
    } catch (error) {
        console.error('카테고리 목록 불러오기 실패:', error);
    }
}

// 카테고리 선택
function selectCategory() {
    const categoryDropdown = document.getElementById('selectCategoryDropdown');
    selectedCategory = categoryDropdown.value;
    document.getElementById('selectCategoryModal').style.display = 'none';
    // 불러오기 시에 리스트를 표시하기 위해 이벤트를 생성
    document.dispatchEvent(new CustomEvent('categorySelected'));
}

// 카테고리 모달 닫기
function closeCategoryModal() {
    document.getElementById('selectCategoryModal').style.display = 'none';
}

// 지도에 그려진 모든 오버레이를 제거하는 함수
function deleteSelectedOverlayData() {
    overlays.forEach(overlay => overlay.setMap(null)); // 모든 오버레이를 지도에서 제거
    overlays = []; // 오버레이 배열 초기화
    alert('모든 오버레이가 삭제되었습니다.');
}

// Firebase Storage에 오버레이 데이터를 저장하는 함수
async function saveOverlayData() {
    const userId = getCurrentUserId();
    if (!userId) {
        alert('사용자 정보가 없습니다. 로그인 후 다시 시도하세요.');
        return;
    }

    // 현재 카테고리 목록을 가져옵니다.
    let categoryList = [];
    const listRef = storage.ref(`userFiles/${userId}`);
    try {
        const result = await listRef.listAll();
        result.prefixes.forEach((categoryFolder) => {
            categoryList.push(categoryFolder.name);
        });
    } catch (error) {
        console.error('카테고리 목록 불러오기 실패:', error);
    }

    // 카테고리 목록을 텍스트로 변환합니다.
    const categoryListText = categoryList.length > 0 ? '\n현재 카테고리 목록: ' + categoryList.join(', ') : '\n현재 저장된 카테고리가 없습니다.';

    // 카테고리 입력을 위한 메시지 창
    let category = '';
    while (!category || category.toLowerCase() === '커스텀마커') {
        category = prompt('카테고리를 입력하세요.(신규입력가능) \n ' + categoryListText);
        if (!category) {
            alert('카테고리가 입력되지 않았습니다.');
            return;
        }
        if (category.toLowerCase() === '커스텀마커') {
            alert('커스텀마커에는 객체 저장 불가');
        }
    }

    // 내용 입력을 위한 메시지 창
    const content = prompt('내용을 입력하세요:');
    if (!content) {
        alert('내용이 입력되지 않았습니다.');
        return;
    }

    // DrawingManager에서 각 오버레이 타입의 데이터를 가져옴
    const markerData = manager.getData(kakao.maps.drawing.OverlayType.MARKER);
    const arrowData = manager.getData(kakao.maps.drawing.OverlayType.ARROW);
    const polylineData = manager.getData(kakao.maps.drawing.OverlayType.POLYLINE);
    const rectangleData = manager.getData(kakao.maps.drawing.OverlayType.RECTANGLE);
    const circleData = manager.getData(kakao.maps.drawing.OverlayType.CIRCLE);
    const polygonData = manager.getData(kakao.maps.drawing.OverlayType.POLYGON);

    // 각 데이터를 배열에 추가
    const allOverlayData = {
        markers: markerData,
        arrows: arrowData,
        polylines: polylineData,
        rectangles: rectangleData,
        circles: circleData,
        polygons: polygonData
    };

    // JSON 문자열로 변환하여 저장
    const data = JSON.stringify(allOverlayData);
    console.log("저장할 오버레이 데이터:", data);
    const timestamp = new Date().toLocaleString();
    const fileName = `${content}_${timestamp}.json`;

    // 입력된 카테고리와 내용을 기반으로 폴더 구조 생성
    const fileRef = storage.ref(`userFiles/${userId}/${category}/${fileName}`);

    try {
        await fileRef.putString(data);
        alert('데이터가 성공적으로 저장되었습니다.');
        // 저장 후 이벤트를 발생시켜 리스트를 업데이트
        document.dispatchEvent(new CustomEvent('overlayDataSaved'));
    } catch (error) {
        console.error('데이터 저장 실패:', error);
        alert('데이터 저장에 실패했습니다.');
    }
}

