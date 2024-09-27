// 마커 이미지 URL 배열
var markerImages = [
    "https://img.icons8.com/?size=100&id=DF9jQXiVLJbD&format=png&color=000000",
    "https://img.icons8.com/?size=100&id=0KC50DBcygL7&format=png&color=000000",
    "https://img.icons8.com/?size=100&id=GhcVHD3WHYjb&format=png&color=000000",
    "https://img.icons8.com/?size=100&id=URPAED9mdtgZ&format=png&color=000000",
    "https://img.icons8.com/?size=100&id=nUCbOkCxF5mf&format=png&color=000000",
    "https://img.icons8.com/?size=100&id=e1UP26K1mVvA&format=png&color=000000",
    "https://img.icons8.com/?size=100&id=FFJTLx4DC9zA&format=png&color=000000",
    "https://img.icons8.com/?size=100&id=9361&format=png&color=000000",
    "https://img.icons8.com/?size=100&id=DKG5EanykiIZ&format=png&color=000000",
    "https://img.icons8.com/?size=100&id=53373&format=png&color=000000"
];

// 현재 선택된 마커 이미지의 인덱스
var currentImageIndex = 0;

// 현재 마커 생성 가능 여부를 저장하는 변수
var isMarkerCreationActive = false;


// 커스텀 마커를 생성하는 함수
function customMarker() {
    // 이미 마커 생성이 활성화되어 있다면 새로운 요청을 무시합니다.
    if (isMarkerCreationActive) return;

    // 마커 생성 활성화
    isMarkerCreationActive = true;

    // Geocoder 기능 비활성화 (예: 검색 기능을 잠시 끄기)
    isGeocoderActive = false;

    // 커스텀 마커 버튼 텍스트를 빨간색으로 변경
    document.getElementById("customMarker").style.color = "red";

    // 기존의 이벤트 리스너를 제거하여 중복 추가를 방지합니다.
    kakao.maps.event.removeListener(map, 'click', onMapClick);

    // 지도를 클릭했을 때 호출되는 함수 정의
    function onMapClick(mouseEvent) {
        // 마커에 표시할 내용을 입력받습니다.
        const content = prompt('마커의 내용을 입력하세요:');
        if (!content) {
            alert('내용이 입력되지 않았습니다.');
            return;
        }

        // 클릭한 위치의 좌표를 가져옵니다.
        var clickPosition = mouseEvent.latLng;

        // 현재 선택된 이미지로 마커를 생성합니다.
        var imageSrc = markerImages[currentImageIndex], 
            imageSize = new kakao.maps.Size(40, 40), // 마커 이미지의 크기
            imageOption = { offset: new kakao.maps.Point(20, 40) }; // 마커 이미지의 옵션

        // 마커의 이미지 정보를 가지고 있는 마커 이미지를 생성합니다
        var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

        // 마커를 생성합니다
        var marker = new kakao.maps.Marker({
            position: clickPosition, 
            image: markerImage, // 마커 이미지 설정
            draggable: true,
            title: content // 입력받은 내용을 마커의 title로 설정
        });

        // 새로 생성된 마커를 지도 위에 표시합니다
        marker.setMap(map);

        // 마커 위에 타이틀을 항상 표시하기 위한 InfoWindow 생성
        var infoWindow = new kakao.maps.InfoWindow({
            content: '<div style="padding:10px; z-index:1; background:#fff; border-radius:10px; box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5); text-align:center; font-weight:bold; color:#333;">' 
                     + content + '</div>', // 표시할 내용
            removable: true // 닫기 버튼을 표시하지 않음
        });

        // InfoWindow를 마커 위에 표시합니다
        infoWindow.open(map, marker);

        // 저장 기능을 위한 내용 저장
        saveCustomMarker(marker, imageSrc, content);

        // 마커 오른쪽 클릭 시 삭제를 처리하는 이벤트 리스너를 추가합니다.
        kakao.maps.event.addListener(marker, 'rightclick', function() {
            // 마커와 InfoWindow를 삭제합니다
            marker.setMap(null);
            infoWindow.close();
            console.log("Marker removed at:", clickPosition);
        });

        console.log("Custom marker added at:", clickPosition);

        // 마커가 생성된 후 클릭 이벤트 리스너를 제거하여 추가적인 마커 생성 방지
        kakao.maps.event.removeListener(map, 'click', onMapClick);

        // 마커 생성이 끝났으므로 마커 버튼의 텍스트 색상을 다시 흰색으로 복구
        document.getElementById("customMarker").style.color = "white";

        // 마커가 생성되었으므로 마커 생성 비활성화
        isMarkerCreationActive = false;

        // 기능 종료 후 Geocoder 기능 다시 활성화
        isGeocoderActive = true;
    }

    // 지도를 클릭했을 때 위의 onMapClick 함수를 호출하도록 이벤트를 등록합니다.
    kakao.maps.event.addListener(map, 'click', onMapClick);
}


// 커스텀 마커를 Firebase에 저장하는 함수
async function saveCustomMarker(marker, imageUrl, content) {
    const userId = getCurrentUserId();
    if (!userId) {
        alert('사용자 정보가 없습니다. 로그인 후 다시 시도하세요.');
        return;
    }

    // 현재 커스텀마커 폴더 안의 카테고리 목록 가져오기
    let categoryList = [];
    const listRef = storage.ref(`userFiles/${userId}/커스텀마커`);
    try {
        const result = await listRef.listAll();
        result.prefixes.forEach((categoryFolder) => {
            categoryList.push(categoryFolder.name);
        });
    } catch (error) {
        console.error('커스텀마커 카테고리 목록 불러오기 실패:', error);
    }

    // 카테고리 목록을 텍스트로 변환합니다.
    const categoryListText = categoryList.length > 0 ? '\n현재 커스텀마커 카테고리 목록: ' + categoryList.join(', ') : '\n현재 저장된 커스텀마커 카테고리가 없습니다.';

    // 카테고리 입력을 위한 메시지 창
    let category = '';
    while (!category) {
        category = prompt('커스텀마커 카테고리를 입력하세요.(신규입력가능) \n ' + categoryListText);
        if (!category) {
            alert('카테고리가 입력되지 않았습니다.');
            return;
        }
    }

    // 커스텀 마커의 데이터를 JSON 형식으로 생성
    const customMarkerData = {
        position: {
            lat: marker.getPosition().getLat(),
            lng: marker.getPosition().getLng()
        },
        imageUrl: imageUrl,
        content: content // 입력받은 내용을 content로 설정
    };

    // JSON 문자열로 변환하여 저장
    const data = JSON.stringify(customMarkerData);
    console.log("저장할 커스텀 마커 데이터:", data);
    const timestamp = new Date().toLocaleString();
    const fileName = `${content}_${timestamp}.json`; // 파일명에 내용 포함

    // 입력된 카테고리와 내용을 기반으로 폴더 구조 생성
    const fileRef = storage.ref(`userFiles/${userId}/커스텀마커/${category}/${fileName}`);

    try {
        await fileRef.putString(data);
        alert('커스텀마커 카테고리에 성공적으로 저장되었습니다.');
    } catch (error) {
        console.error('커스텀 마커 저장 실패:', error);
        alert('커스텀 마커 저장에 실패했습니다.');
    }
}

/* 커스텀마커 이미지 선택 모달창 코드 ---------------------------------------------------------------------------------------*/ 
// 모달 창 열기
function openMarkerImageModal() {
    document.getElementById("markerImageModal").style.display = "block";
    populateMarkerImageOptions(); // 이미지 옵션 동적으로 추가
}

// 모달 창 닫기
function closeMarkerImageModal() {
    document.getElementById("markerImageModal").style.display = "none";
}

// 마커 이미지 선택
function selectMarkerImage(index) {
    currentImageIndex = index;
    var markerImageButton = document.getElementById("markerImageButton").querySelector("img");
    markerImageButton.src = markerImages[currentImageIndex];
    closeMarkerImageModal();
}

// 마커 이미지 옵션을 모달에 동적으로 추가
function populateMarkerImageOptions() {
    var markerImageOptions = document.getElementById("markerImageOptions");
    markerImageOptions.innerHTML = ''; // 기존 이미지를 비웁니다.

    markerImages.forEach(function(imageSrc, index) {
        var imgElement = document.createElement("img");
        imgElement.src = imageSrc;
        imgElement.style.width = "50px";
        imgElement.style.height = "50px";
        imgElement.onclick = function() {
            selectMarkerImage(index);
        };
        markerImageOptions.appendChild(imgElement);
    });
}

// 마커 이미지 선택 버튼에 모달 열기 기능 추가
document.getElementById("markerImageButton").addEventListener("click", openMarkerImageModal);

