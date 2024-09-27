

// 커스텀마커 카테고리를 불러오는 함수
function showCustomMarkerCategoryModal() {
    const userId = getCurrentUserId();
    const categoryDropdown = document.getElementById('selectCustomMarkerCategoryDropdown');
    categoryDropdown.innerHTML = ''; // 초기화

    // 객체 리스트를 숨기거나 초기화
    const savedDataListDiv = document.getElementById('savedDataList');
    savedDataListDiv.innerHTML = ''; // 객체 리스트 제거

    const listRef = storage.ref(`userFiles/${userId}/커스텀마커`);
    listRef.listAll().then((result) => {
        result.prefixes.forEach((categoryFolder) => {
            const option = document.createElement('option');
            option.value = categoryFolder.name;
            option.text = categoryFolder.name;
            categoryDropdown.appendChild(option);
        });
        document.getElementById('selectCustomMarkerCategoryModal').style.display = 'block';
    }).catch((error) => {
        console.error('커스텀마커 카테고리 목록 불러오기 실패:', error);
    });
}

// 커스텀마커 카테고리 모달창 닫기
function closeCustomMarkerCategoryModal() {
    document.getElementById('selectCustomMarkerCategoryModal').style.display = 'none';
}

// 커스텀마커 카테고리 선택
function selectCustomMarkerCategory() {
    const categoryDropdown = document.getElementById('selectCustomMarkerCategoryDropdown');
    selectedCategory = categoryDropdown.value;
    document.getElementById('selectCustomMarkerCategoryModal').style.display = 'none';

    // 커스텀마커 리스트 보여주기
    const customMarkerList = document.getElementById('customMarkerList');
    customMarkerList.style.display = 'block'; // 리스트 표시
    const savedDataList = document.getElementById('savedDataList');
    savedDataList.style.display = 'none'; // 객체 리스트 숨기기

    // 커스텀마커 리스트 표시
    displayCustomMarkerList(selectedCategory);
}


// 선택한 커스텀마커 카테고리 리스트 표시 함수
async function displayCustomMarkerList(selectedCategory) {
    const customMarkerListDiv = document.getElementById('customMarkerList');
    customMarkerListDiv.innerHTML = ''; // 커스텀마커용 리스트 초기화

    const userId = getCurrentUserId();

    if (!userId) {
        alert('사용자 정보가 없습니다. 로그인 후 다시 시도하세요.');
        return;
    }

    const listRef = storage.ref(`userFiles/${userId}/커스텀마커/${selectedCategory}`);
    try {
        const result = await listRef.listAll();
        if (result.items.length === 0) {
            customMarkerListDiv.innerHTML = '<p>저장된 마커가 없습니다.</p>';
            return;
        }

        const ul = document.createElement('ul');
        result.items.forEach((itemRef) => {
            const fileName = itemRef.name;

            const li = document.createElement('li');
            li.textContent = fileName;

            const loadButton = document.createElement('button');
            loadButton.textContent = '불러오기';
            loadButton.onclick = () => loadCustomMarkerData(itemRef.fullPath);
            loadButton.classList.add('load-delete-btn'); // CSS 클래스 추가

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '삭제';
            deleteButton.onclick = () => deleteCustomMarkerData(itemRef.fullPath);
            deleteButton.classList.add('load-delete-btn'); // CSS 클래스 추가

            li.appendChild(loadButton);
            li.appendChild(deleteButton);
            ul.appendChild(li);
        });

        customMarkerListDiv.appendChild(ul);
    } catch (error) {
        console.error('커스텀마커 리스트 표시 실패:', error);
        alert('커스텀마커 리스트를 불러오는데 실패했습니다.');
    }
}

// 선택한 커스텀마커 데이터를 불러오는 함수
async function loadCustomMarkerData(filePath) {
    const userId = getCurrentUserId();
    if (!userId) {
        alert('사용자 정보가 없습니다. 로그인 후 다시 시도하세요.');
        return;
    }

    const fileRef = storage.ref(filePath);

    try {
        const fileUrl = await fileRef.getDownloadURL();
        const response = await fetch(fileUrl);
        const markerData = await response.json();

        // 커스텀 마커를 지도에 표시합니다.
        addMarkerToMap(markerData);
    } catch (error) {
        console.error('커스텀마커 데이터 불러오기 실패:', error);
        alert('커스텀마커 데이터를 불러오는데 실패했습니다.');
    }
}

// Firebase Storage에서 선택한 커스텀마커 데이터를 삭제하는 함수
async function deleteCustomMarkerData(filePath) {
    const userId = getCurrentUserId();
    if (!userId) {
        alert('사용자 정보가 없습니다. 로그인 후 다시 시도하세요.');
        return;
    }

    const fileRef = storage.ref(filePath);

    try {
        await fileRef.delete();
        alert('커스텀마커가 성공적으로 삭제되었습니다.');
        displayCustomMarkerList(selectedCategory);  // 삭제 후 리스트 업데이트
    } catch (error) {
        console.error('커스텀마커 삭제 실패:', error);
        alert('커스텀마커 삭제에 실패했습니다.');
    }
}

// 지도에 커스텀마커를 추가하는 함수 (지도 표시용)
function addMarkerToMap(markerData) {
    if (!markerData || !markerData.position) {
        console.error('마커 데이터 또는 위치 정보가 유효하지 않습니다:', markerData);
        return;
    }

    const position = new kakao.maps.LatLng(markerData.position.lat, markerData.position.lng);
    const imageSrc = markerData.imageUrl;
    const imageSize = new kakao.maps.Size(40, 40);
    const imageOption = { offset: new kakao.maps.Point(20, 40) };

    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
    const marker = new kakao.maps.Marker({
        position: position,
        image: markerImage,
        draggable: true,
        title: markerData.content || '제목 없음'
    });

    marker.setMap(map);

    const infoWindow = new kakao.maps.InfoWindow({
        content: '<div style="padding:10px; background:#fff; border-radius:10px; box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5); text-align:center; font-weight:bold;">'
                 + (markerData.content || '제목 없음') + '</div>',
        removable: true
    });
    infoWindow.open(map, marker);

    kakao.maps.event.addListener(marker, 'rightclick', function() {
        marker.setMap(null);
        infoWindow.close();
        console.log("Marker removed at:", position);
    });

    console.log("Custom marker added to map at:", position);
}
