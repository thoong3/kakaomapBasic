// 전역 변수 선언
// controlMap 변수를 제거하고 기존의 map 객체를 사용합니다.
var map;

// 지도와 관련된 타입을 저장하는 객체
var mapTypes = {
    terrain: kakao.maps.MapTypeId.TERRAIN,    
    traffic: kakao.maps.MapTypeId.TRAFFIC,
    skyview: kakao.maps.MapTypeId.SKYVIEW, // 스카이뷰 타입 추가
    useDistrict: kakao.maps.MapTypeId.USE_DISTRICT
};

// 새로운 initMap 함수는 필요하지 않습니다. map.js에서 생성된 map 객체를 그대로 사용합니다.

// 체크박스 클릭 시 호출되는 함수입니다
function setOverlayMapTypeId() {
    // 체크박스 요소를 가져옵니다
    var chkTerrain = document.getElementById('chkTerrain');  
    var chkTraffic = document.getElementById('chkTraffic');
    var chkSkyview = document.getElementById('chkSkyview');
    var chkUseDistrict = document.getElementById('chkUseDistrict');
    
    // 지도에서 모든 오버레이 타입을 제거합니다
    for (var type in mapTypes) {
        map.removeOverlayMapTypeId(mapTypes[type]);    
    }

    // 지적편집도 정보 체크박스가 체크되어있으면 지도에 지적편집도 정보 지도타입을 추가합니다
    if (chkUseDistrict.checked) {
        map.addOverlayMapTypeId(mapTypes.useDistrict);    
    }
    
    // 지형정보 체크박스가 체크되어있으면 지도에 지형정보 지도타입을 추가합니다
    if (chkTerrain.checked) {
        map.addOverlayMapTypeId(mapTypes.terrain);    
    }
    
    // 교통정보 체크박스가 체크되어있으면 지도에 교통정보 지도타입을 추가합니다
    if (chkTraffic.checked) {
        map.addOverlayMapTypeId(mapTypes.traffic);    
    }
    
    // 스카이뷰 체크박스가 체크되어있으면 지도에 스카이뷰 지도타입을 추가합니다
    if (chkSkyview.checked) {
        map.addOverlayMapTypeId(mapTypes.skyview);    
    }
}

// initMap 함수가 필요 없으므로 window.onload 이벤트 핸들러도 제거할 수 있습니다.
