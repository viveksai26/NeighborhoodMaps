var Location = function(data) {
    var self = this;
    self.title = data.title;
    self.location = data.location;
    self.showMe = ko.observable(true);
};


var ViewModel = function() {
    var self = this;
    self.showMapMessage = ko.observable(false);
    self.showErrorMessage = ko.observable(false);
    self.places = ko.observableArray(locations);
    self.query = ko.observable('');
    self.filteredLocations = ko.observableArray();

    for (var i = 0; i < locations.length; i++) {
        var place = new Location(locations[i]);
        self.filteredLocations.push(place);
    }
    self.filterFunction = ko.computed(function() {
        var value = self.query();
        for (var i = 0; i < self.filteredLocations().length; i++) {
            if (self.filteredLocations()[i].title.toLowerCase().indexOf(value) >= 0) {
                self.filteredLocations()[i].showMe(true);
                if (self.filteredLocations()[i].marker) {
                    self.filteredLocations()[i].marker.setVisible(true);
                }
            } else {
                self.filteredLocations()[i].showMe(false);
                if (self.filteredLocations()[i].marker) {
                    self.filteredLocations()[i].marker.setVisible(false);
                }
            }
        }
    });
    self.showInfo = function(locations) {
        google.maps.event.trigger(locations.marker, 'click');

    };


};




function populateInfoWindow(marker, infowindow) {
    console.log(marker);
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.setContent('loading');
        infowindow.open(map, marker);

        var client_id = '41BCGPRLOWAE33MC3BSRRUPSOQPR3O1YMSH3JPETUY2T3112',
            client_secret = 'M5QOFOWM1EYPUICQS2WCZU0LHZURP2YIAAOIKBNFSTILYYKB',
            query = "tourist",
            location,
            venue;

        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/search',
            dataType: 'json',
            data: {
                limit: '1',
                ll: '17.3850,78.4867',
                query: marker.title,
                client_id: client_id,
                client_secret: client_secret,
                v: '20170813'
            }
        }).done(function(data) {
            venue = data.response.hasOwnProperty("venues") ? data.response.venues[0] : '';
            location = venue.hasOwnProperty('location') ? venue.location : '';
            // if (location.hasOwnProperty('address')) {
            var address = location.address || '';


            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div><p>' + address + '</p>');
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });

        }).fail(function(e) {
            infowindow.setContent("data unavaliable");
            self.showErrorMessage(true);
        });


    }
}

var map;
var markers = [];

function initMap() {
    //Create a new map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 17.3850,
            lng: 78.4867
        },
        zoom: 13,
        mapTypeControl: false
    });

    var largeInfowindow = new google.maps.InfoWindow();
    // The following group uses the location array to create an array of markers on initialize.
    var x = vm.filteredLocations();
    x.forEach(function(x, index) {
        // Get the position from the location array.
        var position = x.location;
        var title = x.title;
        console.log(x.address);
        // Create a marker per location, and put into markers array.

        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            // id: i,
            map: map
        });
        x.marker = marker;
        marker.addListener('click', function() {
            //Add functionaility to animate markers
            var self = this;
            self.setIcon('http://maps.google.com/mapfiles/ms/icons/pink-dot.png');
            self.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                self.setAnimation(null);
                self.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
            }, 1400);
            populateInfoWindow(this, largeInfowindow);
        });
    });
}


function geoloc() {
    var geocoder = new google.maps.Geocoder();
    var address = vm.query();
    if (address == " ") {
        console.log("Please enter an address!");
    } else {
        geocoder.geocode({
            address: address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(8);
            } else {
                window.alert("Location could not be found, please try again.");
            }
        });
    }
}

var locations = [{
        title: 'charminar',
        location: {
            lat: 17.3616,
            lng: 78.4747
        }
    },
    {
        title: 'golkonda',
        location: {
            lat: 17.3833,
            lng: 78.4011
        }
    },
    {
        title: 'birla mandhir',
        location: {
            lat: 17.4062,
            lng: 78.4691
        }
    },
    {
        title: 'salar jung',
        location: {
            lat: 17.3715,
            lng: 78.4803
        }
    },
    {
        title: 'hussain sagar',
        location: {
            lat: 17.4239,
            lng: 78.4738
        }
    },
    {
        title: 'nehru zoological park',
        location: {
            lat: 17.3511,
            lng: 78.4489
        }
    }
];

var vm = new ViewModel();
ko.applyBindings(vm);

function googleError() {
    vm.showMapMessage(true);
    alert("google not loaded");
}
$('.list_element').click(function() {
    $('.container').toggleClass('open');
});