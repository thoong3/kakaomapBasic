// Kakao 지도 API의 Places 객체를 초기화합니다.
var ps = new kakao.maps.services.Places();

// 카카오 지도에 표시할 오버레이를 생성합니다.
// 'zIndex'는 오버레이의 레이어 순서를 설정합니다 (1은 높은 레이어).
var placeOverlay = new kakao.maps.CustomOverlay({zIndex:1}), 

    // 오버레이에 들어갈 내용을 담을 'div' 요소를 생성합니다.
    contentNode = document.createElement('div'), 

    // 마커를 저장할 배열을 초기화합니다.
    markers2 = [], 

    // 현재 선택된 카테고리를 저장할 변수입니다.
    currCategory = ''; 

// 'contentNode'에 'placeinfo_wrap' 클래스를 추가합니다.
contentNode.className = 'placeinfo_wrap';

// 'placeOverlay'에 'contentNode'를 설정합니다.
placeOverlay.setContent(contentNode);  

// 장소 정보를 표시하는 함수입니다.
function displayPlaceInfo2(place) {
    // X 버튼을 오른쪽 하단에 위치하도록 추가하여 정보 창을 닫을 수 있도록 합니다.
    var content = '<div class="placeinfo">' +
                    '   <a class="title" href="' + place.place_url + '" target="_blank" title="' + place.place_name + '">' + place.place_name + '</a>'; 

    // 도로 주소가 있을 경우, 도로 주소와 지번 주소를 표시합니다.
    if (place.road_address_name) {
        content += '    <span title="' + place.road_address_name + '">' + place.road_address_name + '</span>' +
                    '  <span class="jibun" title="' + place.address_name + '">(지번 : ' + place.address_name + ')</span>';
    } else {
        // 도로 주소가 없을 경우, 지번 주소만 표시합니다.
        content += '    <span title="' + place.address_name + '">' + place.address_name + '</span>';
    }

    // 전화번호를 표시합니다.
    content += '    <span class="tel">' + place.phone + '</span>' +
                '   <button class="closeButton" onclick="closePlaceInfo()">X</button>' + // X 버튼을 추가하고 위치 설정
                '</div>' +
                '<div class="after"></div>';

    // 생성한 HTML 내용을 'contentNode'에 삽입합니다.
    contentNode.innerHTML = content;

    // 오버레이의 위치를 설정합니다.
    placeOverlay.setPosition(new kakao.maps.LatLng(place.y, place.x));

    // 오버레이를 지도에 추가합니다.
    placeOverlay.setMap(map);
}

// 정보 창을 닫는 함수입니다.
function closePlaceInfo() {
    // 오버레이를 지도에서 제거하여 정보 창을 닫습니다.
    placeOverlay.setMap(null);
}



// 카테고리 클릭 이벤트를 추가하는 함수입니다.
addCategoryClickEvent();

function addCategoryClickEvent() {
    // 'category' ID를 가진 요소를 가져옵니다.
    var category = document.getElementById('category'),
        children = category.children; // 자식 요소들을 가져옵니다.

    // 모든 자식 요소에 클릭 이벤트를 추가합니다.
    for (var i = 0; i < children.length; i++) {
        children[i].onclick = onClickCategory;
    }
}

// 카테고리 클릭 시 실행되는 함수입니다.
function onClickCategory() {
    var id = this.id, // 클릭된 카테고리의 ID를 가져옵니다.
        className = this.className; // 클릭된 카테고리의 클래스 이름을 가져옵니다.

    // 현재 오버레이를 지도에서 제거합니다.
    placeOverlay.setMap(null);

    // 클릭된 카테고리가 활성화된 상태면, 현재 카테고리를 초기화하고 마커를 제거합니다.
    if (className === 'on') {
        currCategory = '';
        changeCategoryClass();
        removeMarker2();
    } else {
        // 클릭된 카테고리가 비활성화된 상태면, 현재 카테고리를 업데이트하고 마커를 검색합니다.
        currCategory = id;
        changeCategoryClass(this);
        searchPlacesByCategory();
    }
}

// 카테고리의 활성화 상태를 변경하는 함수입니다.
function changeCategoryClass(el) {
    // 'category' ID를 가진 요소를 가져옵니다.
    var category = document.getElementById('category'),
        children = category.children,
        i;

    // 모든 자식 요소의 클래스 이름을 초기화합니다.
    for (i = 0; i < children.length; i++) {
        children[i].className = '';
    }

    // 특정 요소가 전달되면, 해당 요소의 클래스 이름을 'on'으로 설정합니다 (활성화 상태).
    if (el) {
        el.className = 'on';
    } 
}

// 현재 카테고리에 해당하는 장소를 검색하는 함수입니다.
function searchPlacesByCategory() {
    // 현재 카테고리가 없으면 함수 실행을 종료합니다.
    if (!currCategory) {
        return;
    }

    // 현재 오버레이를 지도에서 제거하고, 기존 마커를 제거합니다.
    placeOverlay.setMap(null);
    removeMarker2();

    // 카테고리에 맞는 장소를 검색합니다.
    ps.categorySearch(currCategory, placesSearchCB2, {bounds: map.getBounds()}); 
}

// 장소 검색 결과를 처리하는 콜백 함수입니다.
function placesSearchCB2(data, status, pagination) {
    // 검색이 성공하면 장소를 표시하는 함수를 호출합니다.
    if (status === kakao.maps.services.Status.OK) {
        displayPlaces2(data);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        // 검색 결과가 없으면 경고 메시지를 표시합니다.
        alert('검색 결과가 존재하지 않습니다.');
    } else if (status === kakao.maps.services.Status.ERROR) {
        // 검색 중 오류가 발생하면 경고 메시지를 표시합니다.
        alert('검색 결과 중 오류가 발생했습니다.');
    }
}

// 장소를 지도에 표시하는 함수입니다.
function displayPlaces2(places) {
    // 현재 카테고리의 'data-order' 속성 값을 가져옵니다.
    var order = document.getElementById(currCategory).getAttribute('data-order');

    // 장소 목록을 반복하며 마커를 추가합니다.
    for (var i = 0; i < places.length; i++) {
        var marker = addMarker2(new kakao.maps.LatLng(places[i].y, places[i].x), order);

        // 마커 클릭 시 장소 정보를 표시하도록 이벤트를 추가합니다.
        (function(marker, place) {
            kakao.maps.event.addListener(marker, 'click', function() {
                displayPlaceInfo2(place);
            });
        })(marker, places[i]);
    }
}

// 마커를 추가하는 함수입니다.
function addMarker2(position, order) {
    // 마커의 이미지를 설정합니다.
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_category.png', 
        imageSize = new kakao.maps.Size(27, 28),  
        imgOptions =  {
            spriteSize : new kakao.maps.Size(72, 208), 
            spriteOrigin : new kakao.maps.Point(46, (order * 36)),
            offset: new kakao.maps.Point(11, 28)
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
        marker = new kakao.maps.Marker({
            position: position,
            image: markerImage
        });

    // 마커를 지도에 추가합니다.
    marker.setMap(map);

    // 마커를 배열에 저장합니다.
    markers2.push(marker);

    return marker;
}

// 모든 마커를 제거하는 함수입니다.
function removeMarker2() {
    // 모든 마커를 지도에서 제거합니다.
    for (var i = 0; i < markers2.length; i++) {
        markers2[i].setMap(null);
    }   
    // 마커 배열을 초기화합니다.
    markers2 = [];
}
