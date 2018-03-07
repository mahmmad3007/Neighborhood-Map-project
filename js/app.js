//create places that i worked in, 

var workingPlaces=[
{
	city:'Yanbu',
	position:{lat:23.9764031,lng:38.1914559}
},
{
	city:'Dammam',
	position:{lat:26.3550636,lng:49.7124935}
},
{
	city:'Al Zilfi',
	position:{lat:26.2887564,lng:44.7680823}
},
{
	city:'Najran',
	position:{lat:17.5376873,lng:44.1231638}
},
{
	city:'Riyadh',
	position:{lat:24.7253981,lng:46.2620133}
}];


var map;

var markers=[];

function initMap() {
  var locations;
  var mapOptions = {
   	disableDefaultUI: true,
    center: {lat: 25.8826989,lng: 46.9751056},
    zoom: 4
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  var locInfoWindow = new google.maps.InfoWindow();

  for (var i = 0; i< workingPlaces.length; i++){
    var position = workingPlaces[i].position;
    var city = workingPlaces[i].city;

    // marker is an object with additional data about the pin for a single location
    var marker = new google.maps.Marker({
        map: map,
        position:position,
        city:city,
        animation: google.maps.Animation.DROP
    });

    workingPlaces[i].marker=marker;
    markers.push(marker);

    marker.addListener('click',catchingClick);
  }
  function catchingClick(){
    markerBounce(this);
    requestDataFromWikipidia(this,locInfoWindow);
  }
  function markerBounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){
    marker.setAnimation(null);
  	},700);
  }
   ko.applyBindings(new viewModel());
}

  function catchError(){
 alert ("Sorry, try again. your map is not loadded. Check your connection to the internet.");
};


  function requestDataFromWikipidia (marker, infowindow){
    var cityInfo;
    var URL;

    infowindow.setContent(null);

    var wikipidiaURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+ marker.city +'&format=json&callback=wikiCallback';

    $.ajax({
      url:wikipidiaURL,
      dataType:'jsonp'
    })

    .done(function(response){
      cityInfo= response[2][0];
      url = 'http://en.wikipedia.org/wiki/'+ marker.city;
      
      //if ( cityInfo !== null || cityInfo !== undefined || cityInfo !==''){
        infowindow.setContent(marker.city +' '+ cityInfo);
     // }
    // else
   //  {
    //  alert("Sorry we can't get information from wikipedia");
    // }
  
    });

    .fail(function(){
     alert("Sorry we can't get information from wikipedia");
    })
  
// this is to open windows
  infowindow.open(map,marker);
  infowindow.addListener('closeclick', function(){
    infowindow.marker=marker;
  });
// this is to colse the windows
  google.maps.event.addListener(map,'click', function(){
    infowindow.close();
  });
}//end of requesting data from wikipidia
 
  var location = function(data){
    this.city = data.city;
    this.marker = data.marker;
  };

// viewModel funcation 
  var viewModel=function(){
  	var self=this;
  	this.citiesList = ko.observableArray([]);
  	workingPlaces.forEach(function(city){
  		self.citiesList.push(new location(city));
  	});
  	self.filter = ko.observable('');

    self.filterCities = ko.computed(function(){
      var filter = self.filter().toLowerCase();
      if (!filter){ 
        ko.utils.arrayForEach(self.citiesList(), function(item){
          item.marker.setVisible(true); 
          // all cities should be seen
        });
        return self.citiesList();
      }
      else {
        return ko.utils.arrayFilter(self.citiesList(), function(item){

          var result = (item.city.toLowerCase().search(filter) >=0);
          item.marker.setVisible(result);
          return result;
        });
      }
    });
     //Event to select a city from sidemune
  self.selectCity = function(select){
    google.maps.event.trigger(select.marker,'click');
  };
};
