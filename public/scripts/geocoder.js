var isGeocoderActive = true; // 기본적으로 Geocoder 기능 활성화

// Geocoder 객체를 생성합니다.
var geocoder = new kakao.maps.services.Geocoder();

// 마지막으로 표시된 오버레이를 저장할 변수입니다.
var lastOverlay = null;

// 지도에 클릭 이벤트를 등록합니다.
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
    // Geocoder 기능이 비활성화된 상태라면, 아무 작업도 하지 않습니다.
    if (!isGeocoderActive) {
        return;
    }
    
    var latlng = mouseEvent.latLng; // 클릭한 위치의 좌표를 가져옵니다.
    
    // 이전에 표시된 오버레이가 있으면 제거합니다.
    if (lastOverlay) {
        lastOverlay.setMap(null); // 기존 오버레이를 지도에서 제거합니다.
    }

    // 좌표로 주소를 검색합니다.
    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            // 주소를 성공적으로 가져왔다면, 정보 창을 표시합니다.
            var detailAddr = result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;
            
            var content = '<div class="bAddr">' +
                          '<span class="title">주소</span>' + 
                          detailAddr + 
                          '</div>';

            // 커스텀 오버레이를 생성하여 지도에 표시합니다.
            lastOverlay = new kakao.maps.CustomOverlay({
                content: content,
                map: map,
                position: latlng
            });

            lastOverlay.setMap(map); // 새로운 오버레이를 지도에 표시합니다.
        }
    });
});
