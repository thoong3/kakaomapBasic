// 마커를 저장할 배열을 초기화합니다.
var markers = [];

// 인포윈도우를 생성합니다.
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

// 사용자가 입력한 키워드로 장소를 검색하는 함수입니다.
function searchPlaces() {
    var keyword = document.getElementById('keyword').value; 
    var useCurrentLocation = document.getElementById('currentLocation').checked; // 체크박스 상태 확인

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }

    // 검색할 옵션을 초기화합니다.
    var options = {}; 

    if (useCurrentLocation) {
        // 현재 지도 중심의 위치와 줌 레벨을 가져옵니다.
        var center = map.getCenter(); 
        var zoomLevel = map.getLevel(); // 현재 지도 줌 레벨

        // 현재 지도 중심 위치와 줌 레벨을 기준으로 장소를 검색하도록 옵션 설정
        options = {
            location: new kakao.maps.LatLng(center.getLat(), center.getLng()), // 현재 지도 중심 위치
            radius: 5000 / Math.pow(2, (zoomLevel - 3)) // 줌 레벨에 따라 반경 조정
        };
        // 현위치 기준 장소 검색 실행
        ps.keywordSearch(keyword, placesSearchCB, options);
    } else {
            // 전체장소 검색 실행
        ps.keywordSearch(keyword, placesSearchCB);
    }

}


// 장소 검색 결과를 처리하는 콜백 함수입니다.
function placesSearchCB(data, status, pagination) {
    // 'menu_wrap'이라는 ID를 가진 요소를 가져옵니다.
    var menuEl = document.getElementById('menu_wrap'); 
    
    // 검색 상태가 성공적인 경우
    if (status === kakao.maps.services.Status.OK) {
        displayPlaces(data); // 검색된 장소들을 화면에 표시합니다.
        displayPagination(pagination); // 페이지 네비게이션을 화면에 표시합니다.
        menuEl.style.display = 'block'; // 검색 결과 메뉴를 보이게 합니다.
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) { 
        // 검색 결과가 없는 경우
        alert('검색 결과가 존재하지 않습니다.'); // 경고창을 띄웁니다.
        menuEl.style.display = 'none'; // 검색 결과 메뉴를 숨깁니다.
        return; // 함수를 종료합니다.
    } else if (status === kakao.maps.services.Status.ERROR) { 
        // 검색 중 오류가 발생한 경우
        alert('검색 결과 중 오류가 발생했습니다.'); // 경고창을 띄웁니다.
        menuEl.style.display = 'none'; // 검색 결과 메뉴를 숨깁니다.
        return; // 함수를 종료합니다.
    }
}

// 검색된 장소들을 화면에 표시하는 함수입니다.
function displayPlaces(places) {
    // 'placesList'라는 ID를 가진 요소를 가져옵니다.
    var listEl = document.getElementById('placesList'),
        menuEl = document.getElementById('menu_wrap'),
        fragment = document.createDocumentFragment(), // 여러 요소를 한 번에 추가하기 위한 문서 조각입니다.
        bounds = new kakao.maps.LatLngBounds(); // 장소들의 위치를 포함하는 지도의 범위를 설정합니다.
    
    removeAllChildNods(listEl); // 기존의 검색 결과를 제거합니다.
    removeMarker(); // 기존의 마커를 제거합니다.
    
    // 검색된 장소들을 반복하면서 처리합니다.
    for (var i = 0; i < places.length; i++) {
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x), // 장소의 좌표를 설정합니다.
            marker = addMarker(placePosition, i), // 마커를 추가합니다.
            itemEl = getListItem(i, places[i]); // 장소 정보를 담은 리스트 항목을 만듭니다.

        bounds.extend(placePosition); // 지도의 범위에 장소의 좌표를 추가합니다.

        // 마커와 장소 정보를 설정합니다.
        (function(marker, place) {
            kakao.maps.event.addListener(marker, 'click', function() {
                displayPlaceInfo2(place); // 마커를 클릭하면 장소 정보를 표시합니다.
            });

            itemEl.onmouseover = function () {
                displayInfowindow(marker, place.place_name); // 리스트 항목 위에 마우스를 올리면 정보 창을 표시합니다.
            };

            itemEl.onmouseout = function () {
                infowindow.close(); // 마우스가 벗어나면 정보 창을 닫습니다.
            };
        })(marker, places[i]);

        fragment.appendChild(itemEl); // 리스트 항목을 문서 조각에 추가합니다.
    }

    listEl.appendChild(fragment); // 문서 조각을 리스트에 추가합니다.
    menuEl.scrollTop = 0; // 메뉴의 스크롤을 맨 위로 이동합니다.
    map.setBounds(bounds); // 지도의 범위를 설정합니다.
}

// 리스트 항목을 생성하는 함수입니다.
function getListItem(index, places) {
    // 새로운 리스트 항목을 생성합니다.
    var el = document.createElement('li'),
        // 마커의 번호에 맞게 스프라이트 이미지의 위치를 설정합니다.
        itemStr = '<span class="markerbg" style="background-position: 0 -' + (index * 46) + 'px;"></span>' +
                    '<div class="info">' +
                    '   <h5>' + places.place_name + '</h5>';

    // 주소가 도로명 주소가 있을 때와 없을 때의 표시 형식을 설정합니다.
    if (places.road_address_name) {
        itemStr += '    <span>' + places.road_address_name + '</span>' +
                    '   <span class="jibun gray">' + places.address_name + '</span>';
    } else {
        itemStr += '    <span>' + places.address_name + '</span>';
    }

    itemStr += '  <span class="tel">' + places.phone + '</span>' +
                '</div>';

    el.innerHTML = itemStr; // 생성한 항목의 HTML을 설정합니다.
    el.className = 'item'; // 리스트 항목에 'item' 클래스를 추가합니다.

    return el; // 생성한 리스트 항목을 반환합니다.
}



// 지도에 마커를 추가하는 함수입니다.
// 지도에 마커를 추가하는 함수입니다.
function addMarker(position, idx, title) {
    // 샘플 코드에서 사용한 마커 이미지 설정
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 URL
        imageSize = new kakao.maps.Size(36, 37),  // 마커 이미지의 크기
        imgOptions =  {
            spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin : new kakao.maps.Point(0, (idx * 46) + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions), // 마커 이미지 생성
        marker = new kakao.maps.Marker({
            position: position, // 마커의 위치 설정
            image: markerImage // 마커 이미지 설정
        });

    marker.setMap(map); // 마커를 지도에 표시합니다.
    markers.push(marker); // 생성한 마커를 마커 배열에 추가합니다.

    return marker; // 생성한 마커를 반환합니다.
}


// 지도에서 모든 마커를 제거하는 함수입니다.
function removeMarker() {
    // 모든 마커를 반복하면서 지도에서 제거합니다.
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }   
    markers = []; // 마커 배열을 초기화합니다.
}

// 페이지 네비게이션을 표시하는 함수입니다.
function displayPagination(pagination) {
    // 'pagination'이라는 ID를 가진 요소를 가져옵니다.
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(), // 페이지 링크들을 한 번에 추가하기 위한 문서 조각입니다.
        i; 

    // 기존의 페이지 링크들을 제거합니다.
    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild(paginationEl.lastChild);
    }

    // 모든 페이지에 대해 링크를 생성합니다.
    for (i = 1; i <= pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#"; // 링크의 href 속성 설정
        el.innerHTML = i; // 링크에 페이지 번호를 설정합니다.

        // 현재 페이지인 경우 스타일을 적용합니다.
        if (i === pagination.current) {
            el.className = 'on';
        } else {
            // 클릭 시 해당 페이지로 이동하는 함수를 설정합니다.
            el.onclick = (function(i) {
                return function() {
                    pagination.gotoPage(i);
                }
            })(i);
        }

        fragment.appendChild(el); // 링크를 문서 조각에 추가합니다.
    }
    paginationEl.appendChild(fragment); // 문서 조각을 페이지 네비게이션에 추가합니다.
}

// 마커를 클릭하면 표시될 정보 창을 설정하는 함수입니다.
function displayInfowindow(marker, title) {
    var content = '<div style="padding:5px;z-index:1;">' + title + '</div>'; // 정보 창에 표시될 내용 설정

    infowindow.setContent(content); // 정보 창의 내용을 설정합니다.
    infowindow.open(map, marker); // 정보 창을 지도에 표시합니다.
}

// 지정된 요소에서 모든 자식 노드를 제거하는 함수입니다.
function removeAllChildNods(el) {   
    // 요소가 자식 노드가 있는 동안 반복하면서 제거합니다.
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}

// 검색 결과를 초기화하는 함수입니다.
function clearSearchResults() {
    // 검색 결과 목록을 비웁니다.
    var listEl = document.getElementById('placesList');
    removeAllChildNods(listEl); // 기존의 검색 결과를 제거합니다.

    // 지도에 표시된 마커를 모두 제거합니다.
    removeMarker();

    // 페이지 네비게이션을 숨깁니다.
    var paginationEl = document.getElementById('pagination');
    removeAllChildNods(paginationEl); // 기존의 페이지 네비게이션을 제거합니다.

    // 검색 결과 메뉴를 숨깁니다.
    var menuEl = document.getElementById('menu_wrap');
    menuEl.style.display = 'none';
}
