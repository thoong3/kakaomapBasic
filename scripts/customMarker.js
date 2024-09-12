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

// 마커 이미지 변경 함수
function changeMarkerImage() {
    // 다음 이미지로 전환
    currentImageIndex = (currentImageIndex + 1) % markerImages.length;

    // 이미지 버튼의 src 속성 변경
    var markerImageButton = document.getElementById("markerImageButton").querySelector("img");
    markerImageButton.src = markerImages[currentImageIndex];
}

// 커스텀 마커를 생성하는 함수
function customMarker() {
    // 이미 마커 생성이 활성화되어 있다면 새로운 요청을 무시합니다.
    if (isMarkerCreationActive) return;

    // 마커 생성 활성화
    isMarkerCreationActive = true;

    // Geocoder 기능 비활성화 (예: 검색 기능을 잠시 끄기)
    isGeocoderActive = false;

    // 기존의 이벤트 리스너를 제거하여 중복 추가를 방지합니다.
    kakao.maps.event.removeListener(map, 'click', onMapClick);

    // 지도를 클릭했을 때 호출되는 함수 정의
    function onMapClick(mouseEvent) {
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
            title: '내용'
        });

        // 새로 생성된 마커를 지도 위에 표시합니다
        marker.setMap(map);

        // 마커 위에 타이틀을 항상 표시하기 위한 InfoWindow 생성
        var infoWindow = new kakao.maps.InfoWindow({
            content: '<div style="padding:10px; z-index:1; background:#fff; border-radius:10px; box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5); text-align:center; font-weight:bold; color:#333;">' 
                     + marker.getTitle() + '</div>', // 표시할 내용
            removable: false // 닫기 버튼을 표시하지 않음
        });

        // InfoWindow를 마커 위에 표시합니다
        infoWindow.open(map, marker);

        // 마커 오른쪽 클릭 시 삭제를 처리하는 이벤트 리스너를 추가합니다.
        kakao.maps.event.addListener(marker, 'rightclick', function() {
            // 마커와 InfoWindow를 삭제합니다
            marker.setMap(null);
            infoWindow.close();
            console.log("Marker removed at:", clickPosition);
        });

        // 마커 왼쪽 클릭 시 타이틀을 변경하는 창을 띄우는 이벤트 리스너 추가
        kakao.maps.event.addListener(marker, 'click', function() {
            var newTitle = prompt("마커내용:", marker.getTitle());
            if (newTitle !== null && newTitle.trim() !== "") {
                marker.setTitle(newTitle);
                infoWindow.setContent('<div style="padding:10px; z-index:1; background:#fff; border-radius:10px; box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5); text-align:center; font-weight:bold; color:#333;">' 
                                      + newTitle + '</div>');
                console.log("Marker title changed to:", newTitle);
            }
        });

        console.log("Custom marker added at:", clickPosition);

        // 마커가 생성된 후 클릭 이벤트 리스너를 제거하여 추가적인 마커 생성 방지
        kakao.maps.event.removeListener(map, 'click', onMapClick);

        // 마커가 생성되었으므로 마커 생성 비활성화
        isMarkerCreationActive = false;

        // 기능 종료 후 Geocoder 기능 다시 활성화
        isGeocoderActive = true;
    }

    // 지도를 클릭했을 때 위의 onMapClick 함수를 호출하도록 이벤트를 등록합니다.
    kakao.maps.event.addListener(map, 'click', onMapClick);
}
