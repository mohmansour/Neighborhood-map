//global variable
var map;

 // list of locations
var locations = [
    {
           title: 'Zawya Art House Cinema',
           location: {lat: 30.050117, lng: 31.238919},
           venueID:'5320a3d3498e1a85cdc44768'
         },
         //error
          {
           title: 'Cairo Opera House',
           location: {lat: 30.042487, lng: 31.224457},
           venueID:'4c963c5303413704fd8982ef'
         },
         //error
          {
           title: 'Qasr al-Nil Bridge',
           location: {lat: 30.043768, lng: 31.229450},
           venueID:'4e69b9f445ddadf2d027e96e'
         },
         //error
          {
           title: 'Cairo Tower',
           location: {lat: 30.045915, lng: 31.224290},
           venueID:'4c3c3e06a9509c74150c395b'
         },
         //error
          {
           title: 'The Egyptian Museum',
           location: {lat: 30.047847, lng: 31.233649},
           venueID:'4b653727f964a5203ee92ae3'
         },
          {
           title: 'Tahrir Square',
           location: {lat: 30.044069, lng: 31.235512},
           venueID:'4cb48a7e1463a143dfb7bba9'
         },
          {
           title: 'The Museum of Islamic Art',
           location: {lat: 30.044362, lng: 31.252368},
           venueID:'4d41197000e8a35d0d3e01fb'
         }, 
         {
           title: 'Abdeen Palace',
           location: {lat: 30.043003, lng: 31.247780},
           venueID:'4f169cc8e4b0044a28561a2a'
         }
];


// Google Maps
function gmap() {
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {lat: 30.044420, lng:31.235712},
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
            '?client_id=V1K5XTXP0Q2AFTXIHGHNQIHOV0LL2XA2JBILCZM2ASOED2C5&client_secret=K3JTSPXIUFYNGXHG5NJAPQ0KP5V2MKOVJMZU1KZGS0TQTRF0&v=20180223',
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
            document.getElementById('Error').innerHTML = 'Error!';
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