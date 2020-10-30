var markers = [];
var markersCoords = [];
var lats = [];
var longs = [];
var latAvg, longAvg, centerMarker, newMarker, newLat, newLong;
var rangeDurs = 999999;
    var max, min;
    var counter = 0;
    var maxIndex = 0;

function resultReady() {
    console.log("callback");
}
var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: {
            lat: -34.397,
            lng: 150.644
        }
    });
    var geocoder = new google.maps.Geocoder();
    centerMarker = new google.maps.Marker({
        map: map,
        position: {
            lat: 42.397,
            lng: -87.644
        }
    });
    centerMarker.setLabel("avg");
    newMarker = new google.maps.Marker({
        map: map,
        position: {
            lat: 0,
            lng: 0
        }
    });
    //newMarker.setPosition({
    //    lat: latAvg,
    //    lng: longAvg
    //});
    newMarker.setLabel("f");
    document.getElementById('submit').addEventListener('click', function () {
        geocodeAddress(geocoder, map);
    });
    document.getElementById('submit2').addEventListener('click', function () {
        findIdealSpot();
    });
}

function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('address').value;
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
            markers.push(marker);
            lats.push(marker.getPosition().lat());
            longs.push(marker.getPosition().lng());
            latAvg = calcAvgs(lats);
            longAvg = calcAvgs(longs);
            centerMarker.setPosition({
                lat: latAvg,
                lng: longAvg
            });
            newLat = latAvg;
            newLong = longAvg;
            //calcDistances(markers);
            //findIdealSpot();
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function calcAvgs(list1) {
    var sum = 0;

    //if(list1.length <= 1){
    //return list1[0];
    //}

    for (var i = 0; i < list1.length; i++) {
        sum += list1[i];

    }

    return sum / list1.length;
}

function processData(data) {
    var rangeDurs = 999999;
    var max, min;
    var counter = 0;
    var maxIndex = 0;
    //var latStep, longStep;
    console.log("Done calculating distances and durations.");
    while (rangeDurs > Math.floor(data[1][maxIndex] / 3) && counter < 50) {
        counter++;
        console.log("rangeDurs" + rangeDurs);
        max = data[1][0];
        min = data[1][0];
        maxIndex = 0;
        for (var i = 1; i < data[1].length; i++) {
            if (data[1][i] > max) {
                max = data[1][i];
                maxIndex = i;
            }
            if (data[1][i] < min) {
                min = data[1][i];
            }
        }
        rangeDurs = max - min;

        //  latStep = abs(latAvg - toLatLng(markers)[maxIndex].lat)/5;
        //  longStep = abs(longAvg - toLatLng(markers)[maxIndex].lng)/5;
        console.log("newMarker latitude:" + newMarker.getPosition().lat() + (markers[maxIndex].lat - newMarker.getPosition().lat() / 5));
        newMarker.setPosition({
            lat: newMarker.getPosition().lat() + (markers[maxIndex].lat - newMarker.getPosition().lat() / 5),
            lng: newMarker.getPosition().lng() + (markers[maxIndex].lng - newMarker.getPosition().lng() / 5)
        });
    }
}





function calcDistances(markers) {
    var dists = []; // values are always meters
    var durs = []; // values are always minutes
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: [new google.maps.LatLng(latAvg, longAvg)],
            destinations: toLatLng(markers),
            travelMode: 'BICYCLING',
            avoidHighways: true,
            avoidTolls: true,
        }, function (response, status) {
            if (status !== 'OK') {
                alert('Error was: ' + status);
            };


            for (var i = 0; i < markers.length; i++) {
                var result = response.rows[0].elements[i];
                dists.push(result.duration.value);
                durs.push(result.distance.value);

            }

            var twoDArr = [];
            for (var i = 0; i < dists.length; i++) {
                twoDArr.push([dists[i], durs[i]]);
            }
            processData(twoDArr);
        }
    );

}

function toLatLng(markers2) {
    for (var i = 0; i < lats.length; i++) {
        markers2[i] = { lat: lats[i], lng: longs[i] };
        //console.log(markers);
        // console.log(markers[i]);
    }
    return markers2;
}
//each latitude is 111,111 metres
function findIdealSpot() {
    rangeDurs = 999999;
    counter = 0;
    maxIndex = 0;
    calcDistances2(markers);
}

function calcDistances2(markers) {
    var dists = []; // values are always meters
    var durs = []; // values are always minutes
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: [new google.maps.LatLng(newLat, newLong)],
            destinations: toLatLng(markers),
            travelMode: document.getElementById('transit').value,
            avoidHighways: true,
            avoidTolls: true,
        }, function (response, status) {
            if (status !== 'OK') {
                alert('Error was: ' + status);
            };


            for (var i = 0; i < markers.length; i++) {
                var result = response.rows[0].elements[i];
                console.log(result);
                dists.push(result.distance.value);
                durs.push(result.duration.value);

            }

            var data = [];
            for (var i = 0; i < dists.length; i++) {
                data.push([dists[i], durs[i]]);
            }
            ///////////// processing code rangeDurs > Math.floor(data[1][maxIndex] / 6) && 
            //var latStep, longStep;
            console.log("Done calculating distances and durations.");
            if (counter < 55) {
                counter++;
                console.log("rangeDurs" + rangeDurs);
                console.log("data" + data)
                console.log("newMarker coords:" + newMarker.getPosition().lat() + ", " + newMarker.getPosition().lng());
                max = data[0][1];
                min = data[0][1];
                maxIndex = 0;
                for (var i = 0; i < data.length; i++) {
                    if (data[i][1] > max) {
                        max = data[i][1];
                        maxIndex = i;
                    }
                    if (data[i][1] < min) {
                        min = data[i][1];
                    }
                }
                rangeDurs = max - min;
                console.log("MaxIndex:" + maxIndex);
                //  latStep = abs(latAvg - toLatLng(markers)[maxIndex].lat)/5;
                //  longStep = abs(longAvg - toLatLng(markers)[maxIndex].lng)/5;
                //newMarker.setPosition({
                //    lat: newMarker.getPosition().lat() + ((markers[maxIndex].lat - newMarker.getPosition().lat()) / 10),
                //    lng: newMarker.getPosition().lng() + ((markers[maxIndex].lng - newMarker.getPosition().lng()) / 10)
                //});
                newLat = newLat + ((markers[maxIndex].lat - newLat) / 30);
                newLong = newLong + ((markers[maxIndex].lng - newLong) / 30);
                newMarker.setPosition({
                    lat: newLat,
                    lng: newLong
                });
                console.log(newLat + " , " + newLong)
                calcDistances2(markers);
            } else { 
                newMarker.setPosition({
                    lat: newLat,
                    lng: newLong
                });
            }
        }
    );

}

//AIzaSyDi4k5d8bTOAkikVn4awyR5AZLdFEHYQCs //mine
//AIzaSyCkUOdZ5y7hMm0yrcCQoCvLwzdM6M8s5qk working
//&callback=initMap