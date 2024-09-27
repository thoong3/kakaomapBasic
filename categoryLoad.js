let overlays = []; // 이 부분은 여전히 필요합니다.


// 카테고리 선택을 위한 모달 표시 (객체용)
function showObjectCategorySelection() {
    const userId = getCurrentUserId();
    const categoryDropdown = document.getElementById('selectObjectCategoryDropdown');
    categoryDropdown.innerHTML = ''; // 초기화

    // 커스텀마커 리스트를 숨기거나 초기화
    const customMarkerListDiv = document.getElementById('customMarkerList');
    customMarkerListDiv.innerHTML = ''; // 커스텀마커 리스트 제거

    // Firebase에서 객체 카테고리 목록 가져오기 (커스텀마커 제외)
    const listRef = storage.ref(`userFiles/${userId}`);
    listRef.listAll().then((result) => {
        result.prefixes.forEach((categoryFolder) => {
            if (categoryFolder.name !== '커스텀마커') {
                const option = document.createElement('option');
                option.value = categoryFolder.name;
                option.text = categoryFolder.name;
                categoryDropdown.appendChild(option);
            }
        });
        document.getElementById('selectObjectCategoryModal').style.display = 'block';
    }).catch((error) => {
        console.error('카테고리 목록 불러오기 실패:', error);
    });
}

function closeObjectCategoryModal() {
    document.getElementById('selectObjectCategoryModal').style.display = 'none';
}

// 카테고리 선택 (객체용)
function selectObjectCategory() {
    const categoryDropdown = document.getElementById('selectObjectCategoryDropdown');
    selectedCategory = categoryDropdown.value;
    document.getElementById('selectObjectCategoryModal').style.display = 'none';
    
    // 객체 리스트 보여주기
    const savedDataList = document.getElementById('savedDataList');
    savedDataList.style.display = 'block';  // 리스트 표시
    const customMarkerList = document.getElementById('customMarkerList');
    customMarkerList.style.display = 'none'; // 커스텀마커 리스트 숨기기

    // 객체용 데이터 리스트 표시
    displaySavedDataList(); 
}

// 저장된 데이터 리스트를 표시하는 함수 (객체 카테고리용)
async function displaySavedDataList() {
    const savedDataListDiv = document.getElementById('savedDataList');
    savedDataListDiv.innerHTML = ''; // 객체용 리스트
    const userId = getCurrentUserId();

    if (!userId) {
        alert('사용자 정보가 없습니다. 로그인 후 다시 시도하세요.');
        return;
    }

    // 사용자 전용 폴더에서 선택된 카테고리 파일 목록 가져오기
    const listRef = storage.ref(`userFiles/${userId}/${selectedCategory}`);
    try {
        const result = await listRef.listAll();
        if (result.items.length === 0) {
            savedDataListDiv.innerHTML = '<p>저장된 데이터가 없습니다.</p>';
            return;
        }

        const ul = document.createElement('ul');
        result.items.forEach((itemRef) => {
            const fileName = itemRef.name;
            const li = document.createElement('li');
            li.textContent = fileName;

            const loadButton = document.createElement('button');
            loadButton.textContent = '불러오기';
            loadButton.onclick = () => loadSelectedOverlayData(itemRef.fullPath);
            loadButton.classList.add('load-delete-btn'); // CSS 클래스 추가

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '삭제';
            deleteButton.onclick = () => deleteSavedData(itemRef.fullPath);
            deleteButton.classList.add('load-delete-btn'); // CSS 클래스 추가

            li.appendChild(loadButton);
            li.appendChild(deleteButton);
            ul.appendChild(li);
        });

        savedDataListDiv.appendChild(ul);
    } catch (error) {
        console.error('데이터 리스트 표시 실패:', error);
        alert('데이터 리스트를 불러오는데 실패했습니다.');
    }
}

// 선택한 오버레이 데이터를 불러오는 함수
async function loadSelectedOverlayData(filePath) {
    const userId = getCurrentUserId(); // save.js에서 이미 선언된 함수 사용
    if (!userId) {
        alert('사용자 정보가 없습니다. 로그인 후 다시 시도하세요.');
        return;
    }

    removeOverlays();

    const fileRef = storage.ref(filePath);

    try {
        const dataUrl = await fileRef.getDownloadURL();
        const response = await fetch(dataUrl);
        const allOverlayData = await response.json();

        // 각 오버레이 타입별 데이터를 지도에 그립니다
        if (allOverlayData.markers) {
            drawOverlay(allOverlayData.markers, kakao.maps.drawing.OverlayType.MARKER, drawMarker);
        }
        if (allOverlayData.arrows) {
            drawOverlay(allOverlayData.arrows, kakao.maps.drawing.OverlayType.ARROW, drawArrow);
        }
        if (allOverlayData.polylines) {
            drawOverlay(allOverlayData.polylines, kakao.maps.drawing.OverlayType.POLYLINE, drawPolyline);
        }
        if (allOverlayData.rectangles) {
            drawOverlay(allOverlayData.rectangles, kakao.maps.drawing.OverlayType.RECTANGLE, drawRectangle);
        }
        if (allOverlayData.circles) {
            drawOverlay(allOverlayData.circles, kakao.maps.drawing.OverlayType.CIRCLE, drawCircle);
        }
        if (allOverlayData.polygons) {
            drawOverlay(allOverlayData.polygons, kakao.maps.drawing.OverlayType.POLYGON, drawPolygon);
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        alert('데이터를 불러오는데 실패했습니다.');
    }
}

// Firebase Storage에서 선택한 데이터를 삭제하는 함수
async function deleteSavedData(filePath) {
    const userId = getCurrentUserId(); // save.js에서 이미 선언된 함수 사용
    if (!userId) {
        alert('사용자 정보가 없습니다. 로그인 후 다시 시도하세요.');
        return;
    }

    const fileRef = storage.ref(filePath);

    try {
        await fileRef.delete();
        alert('데이터가 성공적으로 삭제되었습니다.');
        displaySavedDataList();  // 삭제 후 리스트 업데이트
    } catch (error) {
        console.error('데이터 삭제 실패:', error);
        alert('데이터 삭제에 실패했습니다.');
    }
}

// 지도에 그려진 모든 오버레이를 제거하는 함수
function removeOverlays() {
    overlays.forEach(overlay => overlay.setMap(null));
    overlays = [];
}

// 특정 타입의 오버레이를 그리는 함수
function drawOverlay(data, type, drawFunction) {
    if (data[type]) drawFunction(data[type]);
}

// 마커를 그리는 함수
function drawMarker(markers) {
    markers.forEach(markerData => {
        const marker = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(markerData.y, markerData.x),
            zIndex: markerData.zIndex,
            draggable: true,
            clickable: true
        });
        overlays.push(marker);
    });
}

// 화살표를 그리는 함수
function drawArrow(arrows) {
    arrows.forEach(arrowData => {
        const path = pointsToPath(arrowData.points);
        const style = arrowData.options;
        const arrow = new kakao.maps.Polyline({
            map: map,
            path: path,
            strokeColor: style.strokeColor,
            strokeOpacity: style.strokeOpacity,
            strokeStyle: 'solid',
            strokeWeight: style.strokeWeight,
            zIndex: arrowData.zIndex,
            draggable: true,
            editable: true
        });
        overlays.push(arrow);
    });
}

// 선을 그리는 함수
function drawPolyline(polylines) {
    polylines.forEach(lineData => {
        const path = pointsToPath(lineData.points);
        const style = lineData.options;
        const polyline = new kakao.maps.Polyline({
            map: map,
            path: path,
            strokeColor: style.strokeColor,
            strokeOpacity: style.strokeOpacity,
            strokeStyle: style.strokeStyle,
            strokeWeight: style.strokeWeight,
            zIndex: lineData.zIndex,
            draggable: true,
            editable: true
        });
        overlays.push(polyline);
    });
}

// 사각형을 그리는 함수
function drawRectangle(rectangles) {
    rectangles.forEach(rectData => {
        const style = rectData.options;
        const bounds = new kakao.maps.LatLngBounds(
            new kakao.maps.LatLng(rectData.sPoint.y, rectData.sPoint.x),
            new kakao.maps.LatLng(rectData.ePoint.y, rectData.ePoint.x)
        );
        const rectangle = new kakao.maps.Rectangle({
            map: map,
            bounds: bounds,
            strokeColor: style.strokeColor,
            strokeOpacity: style.strokeOpacity,
            strokeStyle: style.strokeStyle,
            strokeWeight: style.strokeWeight,
            fillColor: style.fillColor,
            fillOpacity: style.fillOpacity,
            zIndex: rectData.zIndex,
            draggable: true,
            editable: true
        });
        overlays.push(rectangle);
    });
}

// 원을 그리는 함수
function drawCircle(circles) {
    circles.forEach(circleData => {
        const style = circleData.options;
        const circle = new kakao.maps.Circle({
            map: map,
            center: new kakao.maps.LatLng(circleData.center.y, circleData.center.x),
            radius: circleData.radius,
            strokeColor: style.strokeColor,
            strokeOpacity: style.strokeOpacity,
            strokeStyle: style.strokeStyle,
            strokeWeight: style.strokeWeight,
            fillColor: style.fillColor,
            fillOpacity: style.fillOpacity,
            zIndex: circleData.zIndex,
            draggable: true,
            editable: true
        });
        overlays.push(circle);
    });
}

// 다각형을 그리는 함수
function drawPolygon(polygons) {
    polygons.forEach(polygonData => {
        const path = pointsToPath(polygonData.points);
        const style = polygonData.options;
        const polygon = new kakao.maps.Polygon({
            map: map,
            path: path,
            strokeColor: style.strokeColor,
            strokeOpacity: style.strokeOpacity,
            strokeStyle: style.strokeStyle,
            strokeWeight: style.strokeWeight,
            fillColor: style.fillColor,
            fillOpacity: style.fillOpacity,
            zIndex: polygonData.zIndex,
            draggable: true,
            editable: true
        });
        overlays.push(polygon);
    });
}

// 점 데이터를 LatLng 객체로 변환하는 함수
function pointsToPath(points) {
    if (!points) return [];
    return points.map(point => new kakao.maps.LatLng(point.y, point.x));
}

// DOMContentLoaded 시에 추가 작업을 등록
document.addEventListener("DOMContentLoaded", () => {
    // 카테고리 선택 시 이벤트를 처리하여 데이터 리스트를 표시
    document.addEventListener('categorySelected', () => {
        const categoryDropdown = document.getElementById('selectCategoryDropdown');

        // 커스텀마커 카테고리 옵션을 숨깁니다.
        for (let i = 0; i < categoryDropdown.options.length; i++) {
            if (categoryDropdown.options[i].value === '커스텀마커') {
                categoryDropdown.remove(i);
                break;
            }
        }

        // 데이터 리스트 표시
        displaySavedDataList();
    });

    // 모달이 열릴 때 카테고리 목록을 다시 확인하고, '커스텀마커' 카테고리를 필터링합니다.
    const observer = new MutationObserver(() => {
        const categoryDropdown = document.getElementById('selectCategoryDropdown');
        if (categoryDropdown) {
            // 커스텀마커 카테고리 옵션을 숨깁니다.
            for (let i = 0; i < categoryDropdown.options.length; i++) {
                if (categoryDropdown.options[i].value === '커스텀마커') {
                    categoryDropdown.remove(i);
                    break;
                }
            }
        }
    });

    // 모달이 열릴 때 변경사항을 감지하여 커스텀마커를 필터링합니다.
    const modal = document.getElementById('selectCategoryModal');
    if (modal) {
        observer.observe(modal, { childList: true, subtree: true });
    }

    // 오버레이 데이터가 저장되었을 때 리스트를 다시 표시
    document.addEventListener('overlayDataSaved', displaySavedDataList);
});

