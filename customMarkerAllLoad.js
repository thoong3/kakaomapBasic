// 마커 데이터를 불러오는 함수
async function markerLoadData() {
    const userId = getCurrentUserId();
    if (!userId) {
        alert('사용자 정보가 없습니다. 로그인 후 다시 시도하세요.');
        return;
    }

    // Firebase Storage의 해당 사용자의 '커스텀마커' 폴더 데이터를 가져옵니다.
    const listRef = storage.ref(`userFiles/${userId}/커스텀마커`);
    try {
        const result = await listRef.listAll();

        // '커스텀마커' 폴더 내의 모든 하위 폴더 및 파일을 가져옵니다.
        for (const folder of result.prefixes) {
            const folderRef = storage.ref(folder.fullPath);
            const folderResult = await folderRef.listAll();

            // 각 폴더 내의 모든 파일을 불러옵니다.
            for (const itemRef of folderResult.items) {
                await loadCustomMarkerFromFile(itemRef.fullPath);
            }
        }
        alert('모든 커스텀 마커 데이터를 성공적으로 불러왔습니다.');
    } catch (error) {
        console.error('마커 데이터 불러오기 실패:', error);
        alert('마커 데이터 불러오기에 실패했습니다.');
    }
}

// 파일 경로를 통해 커스텀 마커 데이터를 불러오는 함수
async function loadCustomMarkerFromFile(filePath) {
    const fileRef = storage.ref(filePath);

    try {
        const dataUrl = await fileRef.getDownloadURL();
        const response = await fetch(dataUrl);
        const markerData = await response.json();

        // 커스텀 마커를 지도에 표시합니다.
        addMarkerToMap(markerData);
    } catch (error) {
        console.error('커스텀 마커 데이터 로드 실패:', error);
        alert('커스텀 마커 데이터를 불러오는데 실패했습니다.');
    }
}

// 커스텀 마커를 지도에 추가하는 함수
function addMarkerToMap(markerData) {
    // markerData와 position 속성을 확인합니다.
    if (!markerData || !markerData.position) {
        console.error('마커 데이터 또는 위치 정보가 유효하지 않습니다:', markerData);
        return;
    }

    // 마커의 좌표를 가져옵니다.
    var position = new kakao.maps.LatLng(markerData.position.lat, markerData.position.lng);

    // 마커의 이미지를 가져옵니다.
    var imageSrc = markerData.imageUrl,
        imageSize = new kakao.maps.Size(40, 40), // 마커 이미지의 크기
        imageOption = { offset: new kakao.maps.Point(20, 40) }; // 마커 이미지의 옵션

    // 마커의 이미지 정보를 가지고 있는 마커 이미지를 생성합니다
    var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({
        position: position, 
        image: markerImage, // 마커 이미지 설정
        draggable: true,
        title: markerData.content || '제목 없음'
    });

    // 새로 생성된 마커를 지도 위에 표시합니다
    marker.setMap(map);

    // 마커 위에 타이틀을 항상 표시하기 위한 InfoWindow 생성
    var infoWindow = new kakao.maps.InfoWindow({
        content: '<div style="padding:10px; z-index:1; background:#fff; border-radius:10px; box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5); text-align:center; font-weight:bold; color:#333;">' 
                 + (markerData.content || '제목 없음') + '</div>', // 표시할 내용
        removable: true // 닫기 버튼을 표시하지 않음
    });

    // InfoWindow를 마커 위에 표시합니다
    infoWindow.open(map, marker);

    // 마커 오른쪽 클릭 시 삭제를 처리하는 이벤트 리스너를 추가합니다.
    kakao.maps.event.addListener(marker, 'rightclick', function() {
        // 마커와 InfoWindow를 삭제합니다
        marker.setMap(null);
        infoWindow.close();
        console.log("Marker removed at:", position);
    });

    console.log("Custom marker added to map at:", position);
}
