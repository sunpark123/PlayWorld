import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import "./Map.css";

function Map() {
  const [mapObj, setMapObj] = useState(null); // 지도 객체
  const [rvObj, setRvObj] = useState(null);   // 로드뷰 객체
  const [geocoder, setGeocoder] = useState(null); // 주소 검색 객체
  const [searchAddr, setSearchAddr] = useState(""); // 검색어
  const [autocompleteList, setAutocompleteList] = useState([]); // 자동완성 결과

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_API_KEY}&autoload=false&libraries=services,places`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const mapContainer = document.getElementById("map");
        const rvContainer = document.getElementById("roadview");
        if (!mapContainer || !rvContainer) return;

        // 지도 생성
        const map = new window.kakao.maps.Map(mapContainer, {
          center: new window.kakao.maps.LatLng(37.5667, 126.8400),
          level: 3,
        });

        // 로드뷰 생성
        const rv = new window.kakao.maps.Roadview(rvContainer);
        const rvClient = new window.kakao.maps.RoadviewClient();
        const position = new window.kakao.maps.LatLng(37.5667, 126.8400);

        rvClient.getNearestPanoId(position, 50, (panoId) => {
          rv.setPanoId(panoId, position);

          // 지도 마커
          const mapMarker = new window.kakao.maps.Marker({ position, map });

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

  // 검색 버튼용
  const handleSearch = () => {
    if (!geocoder || !mapObj || !rvObj || searchAddr.trim() === "") return;

    geocoder.addressSearch(searchAddr, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const { y, x } = result[0];
        const newPos = new window.kakao.maps.LatLng(y, x);

        mapObj.setCenter(newPos);

        const rvClient = new window.kakao.maps.RoadviewClient();
        rvClient.getNearestPanoId(newPos, 50, (panoId) => {
          rvObj.setPanoId(panoId, newPos);
        });
      } else {
        alert("주소를 찾을 수 없습니다.");
      }
    });
  };

  // 자동완성
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchAddr(query);

    if (!query.trim() || !window.kakao) {
      setAutocompleteList([]);
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(query, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setAutocompleteList(data);
      } else {
        setAutocompleteList([]);
      }
    });
  };

  // 자동완성 선택
  const handleSelect = (place) => {
    const newPos = new window.kakao.maps.LatLng(place.y, place.x);
    mapObj.setCenter(newPos);

    const rvClient = new window.kakao.maps.RoadviewClient();
    rvClient.getNearestPanoId(newPos, 50, (panoId) => {
      rvObj.setPanoId(panoId, newPos);
    });

    setSearchAddr(place.place_name);
    setAutocompleteList([]);
  };

  return (
    <>
      <Header />
      <div className="map-wrapper">
        <div className="map-area">
          <input
            type="text"
            placeholder="주소 입력"
            value={searchAddr}
            onChange={handleInputChange}
          />
          <button onClick={handleSearch}>검색</button>

          {autocompleteList.length > 0 && (
            <ul className="autocomplete-list">
              {autocompleteList.map((place) => (
                <li
                  key={place.id || place.place_name}
                  onClick={() => handleSelect(place)}
                >
                  {place.place_name}
                </li>
              ))}
            </ul>
          )}

          <div id="map" className="map-view"></div>
        </div>

        <div className="roadview-area">
          <div id="roadview" className="roadview-view"></div>
        </div>
      </div>
    </>
  );
}

export default Map;
