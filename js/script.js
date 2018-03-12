//global variable
var map;

 // list of locations
var locations = [
    {
           title: 'Gharb Seheil',
           location: {lat: 24.058751, lng: 32.863688},
           venueID:'a34a1f11d23329669a7cc5'
         },
          {
           title: 'High Dam',
           location: {lat: 23.970883, lng: 32.877270},
           venueID:'c79f447794e224b456c6728'
         },
          {
           title: 'Porto Sono Restaurant',
           location: {lat: 24.127199, lng: 32.894669},
           venueID:'4e7e567e9a528d2b1cf68395'
         },
          {
           title: 'Tombs of the Nobles',
           location: {lat: 25.730751, lng: 32.6093407},
           venueID:'4e79dbc8483b1d4edb624001'
         },
          {
            title: 'Old Cataract Aswan', 
            location: {lat: 24.082280, lng: 32.887721},
            venueID:'50940c6490e72e1a77650fb1'

          },
          {
            title: 'Nubian Museum', 
            location: {lat: 24.079425, lng: 32.889175},
            venueID:'cab34ea44a8224bf5c52b40'

          },
          {
            title: 'Abu Simbel Temple', 
            location: {lat: 22.337232, lng: 31.625799},
            venueID:'cc0ff6667a3b1f7651bc60e'

          }
];


// Google Maps
function gmap() {
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: {lat: 24.088938, lng:32.899829},
    });
}

var Locat = function(data) {
    this.title = data.title;
    this.location = data.location;
    this.venueID = data.venueID;
    this.marker = null;
};

var View = function() {

    var self = this;
    var infowindow = new google.maps.InfoWindow({
        maxWidth: 350,
    });

    self.place = [];

    locations.forEach(function(item) {    
        self.place.push(new Locat(item));
    });

    // Making markers for locaqtions
    self.place.forEach(function(item) {
        
        item.marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            position: item.location,
        });

        // Getting place info fromFourSquare
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + item.venueID +
            '?client_id=V1K5XTXP0Q2AFTXIHGHNQIHOV0LL2XA2JBILCZM2ASOED2C5&client_secret=K3JTSPXIUFYNGXHG5NJAPQ0KP5V2MKOVJMZU1KZGS0TQTRF0',
            dataType: "json"
        }).done(function (data) {

            // helpers: shortener and confirm valid json responses
            var venueDetails = data.response.venue;

            var openingHours = venueDetails.hasOwnProperty("hours") ? venueDetails.hours.status : "No info available";

            var address = venueDetails.location.hasOwnProperty("formattedAddress") ? venueDetails.location.formattedAddress : "No info available";

            var rating = venueDetails.hasOwnProperty("rating") ? venueDetails.rating  : "No rating available";


            // info in the showinfo window
            item.content = '<div class="infowindow">' +
                '<div>' +
                    '<h2>' + item.title+ '</h2>' +
                    '<p>Opening hours: ' + openingHours + '</p>' +
                    '<p>Location: ' + address + '</p>' +
                    '<p>Rating: ' + rating + '</p>' +
                '</div>' +  
                '</div>'; 

            item.infowindow = new google.maps.InfoWindow({
                content: item.content
            });

        // Foursquare error
        }).fail(function() {
            document.getElementById('FSError').innerHTML = 'Error!';
        });

        
        google.maps.event.addListener(item.marker, 'click', function() {
            bounceMarker(this);
            infowindow.open(map, item.marker);
            infowindow.setContent(item.content);
        });


    });

    this.showInfo = function(item) {
        var marker = item.marker;
        bounceMarker(marker);
        infowindow.open(map, item.marker);
        infowindow.setContent(item.content);
    };

    function bounceMarker(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1500);  
        }
    }

    // search and filter data

    
    self.filteredLocations = ko.observableArray();

    self.place.forEach(function(item) {
        self.filteredLocations.push(item);
    });

    
    self.filter = ko.observable('');

    self.locationsFilter = function() {
        var searchFilter = self.filter().toLowerCase();
        self.filteredLocations.removeAll();
        self.place.forEach(function(item) {
            item.marker.setVisible(false);
            if(item.title.toUpperCase().indexOf(searchFilter) !== -1) {
                self.filteredLocations.push(item);
            }
        });
        self.filteredLocations().forEach(function(item) {
            item.marker.setVisible(true);
        });
    };

   
};

var initMap = function() {
    gmap();
    ko.applyBindings(new View());
};