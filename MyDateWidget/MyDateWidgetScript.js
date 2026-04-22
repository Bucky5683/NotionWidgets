const LS_KEY = 'myDateWidget_markers';
let map;
const markerObjects = {};

window.onload = function () {
    map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(37.5665, 126.978),
        zoom: 12,
    });
    loadMarkers();
};

function getSavedMarkers() {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
}

function saveMarkers(data) {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function placeMarker({ id, title, lat, lng, desc }) {
    const position = new naver.maps.LatLng(lat, lng);
    const marker = new naver.maps.Marker({ position, map, title });
    const infoWindow = new naver.maps.InfoWindow({
        content: `<div style="padding:12px;min-width:160px;font-family:sans-serif;line-height:1.5">
            <strong>${escapeHtml(title)}</strong>
            ${desc ? `<p style="margin:6px 0 8px;color:#555;font-size:0.85em">${escapeHtml(desc)}</p>` : '<br>'}
            <button onclick="deleteMarker('${id}')" style="color:#e03070;background:none;border:none;cursor:pointer;font-size:0.82em;padding:0">🗑 삭제</button>
        </div>`,
    });
    naver.maps.Event.addListener(marker, 'click', () => {
        Object.values(markerObjects).forEach(m => m.infoWindow.close());
        infoWindow.open(map, marker);
    });
    markerObjects[id] = { marker, infoWindow };
}

function loadMarkers() {
    getSavedMarkers().forEach(m => placeMarker(m));
}

window.deleteMarker = function (id) {
    if (!confirm('이 장소를 삭제할까요?')) return;
    markerObjects[id].marker.setMap(null);
    markerObjects[id].infoWindow.close();
    delete markerObjects[id];
    saveMarkers(getSavedMarkers().filter(m => m.id !== id));
};

function showPopup() {
    document.getElementById('popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('title').value = '';
    document.getElementById('address').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('lat').value = '';
    document.getElementById('lng').value = '';
}

function lookupAddress() {
    const address = document.getElementById('address').value.trim();
    if (!address) return;

    const btn = document.querySelector('.btn-search');
    btn.textContent = '...';
    btn.disabled = true;

    axios
        .get('https://maps.apigw.ntruss.com/map-geocode/v2/geocode', {
            params: { query: address },
            headers: {
                'X-NCP-APIGW-API-KEY-ID': NAVER_MAP_ID,
                'X-NCP-APIGW-API-KEY': NAVER_MAP_KEY,
            },
        })
        .then((res) => {
            const addr = res.data.addresses[0];
            if (addr) {
                document.getElementById('lat').value = addr.y;
                document.getElementById('lng').value = addr.x;
                map.setCenter(new naver.maps.LatLng(parseFloat(addr.y), parseFloat(addr.x)));
            } else {
                alert('주소를 찾을 수 없습니다.');
            }
        })
        .catch((err) => {
            console.error(err);
            alert('주소 조회 중 오류가 발생했습니다.');
        })
        .finally(() => {
            btn.textContent = '검색';
            btn.disabled = false;
        });
}

function addMarkerAndClose() {
    const title = document.getElementById('title').value.trim();
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const desc = document.getElementById('desc').value.trim();

    if (!title || isNaN(lat) || isNaN(lng)) {
        alert('장소 이름과 주소를 입력해주세요.');
        return;
    }

    const id = Date.now().toString();
    const markerData = { id, title, lat, lng, desc };
    const data = getSavedMarkers();
    data.push(markerData);
    saveMarkers(data);
    placeMarker(markerData);
    map.setCenter(new naver.maps.LatLng(lat, lng));
    closePopup();
}
