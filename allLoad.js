// 전체 데이터를 불러오는 함수
async function loadAllOverlayData() {
    const userId = getCurrentUserId(); // save.js에서 이미 선언된 함수 사용
    if (!userId) {
        alert('사용자 정보가 없습니다. 로그인 후 다시 시도하세요.');
        return;
    }

    try {
        // 사용자 전용 폴더에서 모든 카테고리 파일 목록 가져오기
        const listRef = storage.ref(`userFiles/${userId}`);
        const result = await listRef.listAll();

        // 모든 오버레이를 지도에서 제거
        removeOverlays();

        // 각 카테고리별로 데이터 불러오기
        for (const categoryFolder of result.prefixes) {
            const categoryRef = storage.ref(categoryFolder.fullPath);
            const categoryResult = await categoryRef.listAll();

            for (const itemRef of categoryResult.items) {
                await loadOverlayDataFromFile(itemRef.fullPath);
            }
        }
        alert('모든 데이터를 성공적으로 불러왔습니다.');
    } catch (error) {
        console.error('전체 데이터 불러오기 실패:', error);
        alert('전체 데이터를 불러오는데 실패했습니다.');
    }
}

// 파일 경로를 통해 오버레이 데이터를 불러오는 함수
async function loadOverlayDataFromFile(filePath) {
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
