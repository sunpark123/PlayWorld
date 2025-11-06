import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import "./Map.css";

function Map() {
  const [mapObj, setMapObj] = useState(null); // 지도 객체
  const [rvObj, setRvObj] = useState(null);   // 로드뷰 객체
  const [geocoder, setGeocoder] = useState(null); // 주소 검색 객체
  const [searchAddr, setSearchAddr] = useState(""); // 검색어
  

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_API_KEY}&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const mapContainer = document.getElementById("map");
        const mapOption = {
          center: new window.kakao.maps.LatLng(37.5667, 126.8400),
          level: 3,
        };
        const map = new window.kakao.maps.Map(mapContainer, mapOption);

        const rvContainer = document.getElementById("roadview");
        const rv = new window.kakao.maps.Roadview(rvContainer);
        const rvClient = new window.kakao.maps.RoadviewClient();
        const position = new window.kakao.maps.LatLng(37.5667, 126.8400);

        rvClient.getNearestPanoId(position, 50, (panoId) => {
          rv.setPanoId(panoId, position);

          const mapMarker = new window.kakao.maps.Marker({
            position,
            map,
          });

          const person = document.createElement("div");
          person.className = "person-marker";
          person.style.background = "url(/map_icon.png) no-repeat center/contain";
          rvContainer.appendChild(person);

          window.kakao.maps.event.addListener(rv, "position_changed", () => {
            const rvPos = rv.getPosition();
            mapMarker.setPosition(rvPos);
            map.setCenter(rvPos);
          });
        });

        setMapObj(map);
        setRvObj(rv);
        setGeocoder(new window.kakao.maps.services.Geocoder());
      });
    };

    document.head.appendChild(script);
  }, []);

  // 주소 검색 핸들러
  const [autoCompleteList, setAutoCompleteList] = useState([]); // 자동완성 리스트

  const handleSearch = (addr = searchAddr) => {
    if (!geocoder || !mapObj || !rvObj || !addr.trim()) return;

    geocoder.addressSearch(addr, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const { y, x } = result[0];
        const newPos = new window.kakao.maps.LatLng(y, x);

        // 지도 이동
        mapObj.setCenter(newPos);

        // 로드뷰 이동
        const rvClient = new window.kakao.maps.RoadviewClient();
        rvClient.getNearestPanoId(newPos, 50, (panoId) => {
          if (panoId) {
            rvObj.setPanoId(panoId, newPos);
          } else {
            alert("근처에 로드뷰가 없습니다.");
          }
        });

        // 자동완성 리스트 초기화
        setAutoCompleteList([]);
      } else {
        alert("주소를 찾을 수 없습니다.");
    }
  });
};

// 입력값 변경 시 자동완성 호출
const handleInputChange = (e) => {
  const value = e.target.value;
  setSearchAddr(value);

  if (!value.trim()) {
    setAutoCompleteList([]);
    return;
  }

  const ps = new window.kakao.maps.services.Places();
  ps.keywordSearch(value, (data, status) => {
    if (status === window.kakao.maps.services.Status.OK) {
      // 주소 이름만 리스트로 저장
      setAutoCompleteList(data.map(item => item.address_name));
    }
  });
};

// 자동완성 아이템 클릭 시
const handleAutoCompleteClick = (addr) => {
  setSearchAddr(addr);
  setAutoCompleteList([]);
  handleSearch(addr); // 선택 즉시 검색
};

const [isMapVisible, setIsMapVisible] = useState(true);

const toggleMap = () => {
  setIsMapVisible((prev) => !prev);
};

  return (
    <>
      <Header />
      <div className="map-wrapper">
      <div className={`map-area ${isMapVisible ? 'visible' : 'hidden'}`}>
        <input
          type="text"
          placeholder="주소 입력"
          value={searchAddr}
          onChange={handleInputChange}
        />
        <button onClick={() => handleSearch()}>검색</button>

        <div className="autocomplete-list">
          {autoCompleteList.map((addr, idx) => (
            <div
              key={idx}
              className="autocomplete-item"
              onClick={() => handleAutoCompleteClick(addr)}
            >
              {addr}
            </div>
          ))}
        </div>

        <div id="map" className="map-view"></div>
        </div>

        <div className="toggle-btn" onClick={toggleMap}>
          <span className={`arrow ${isMapVisible ? '' : 'rotated'}`}>➤</span>
        </div>

        <div className="roadview-area">
          <div id="roadview" className="roadview-view"></div>
        </div>
      </div>
    </>
  );
}

export default Map;
