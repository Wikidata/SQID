//////// Module Definition ////////////
define([
	'util/util.module',
	'jquery-ui',
	'openLayers'
], function() {
///////////////////////////////////////

angular.module('util').directive('osmMap', function(){
	var link = function (scope, element, attrs) {
		element.css({
			width: '200px',
			height: '200px'
		});
		map = new OpenLayers.Map(element[0].id);
		map.addLayer(new OpenLayers.Layer.OSM());

		var lonLat = new OpenLayers.LonLat(parseFloat(attrs.longitude), parseFloat(attrs.latitude))
		    .transform(
		      new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
		      map.getProjectionObject() // to Spherical Mercator Projection
		    );
		    
		var zoom=4;

		var markers = new OpenLayers.Layer.Markers( "Markers" );
		map.addLayer(markers);

		markers.addMarker(new OpenLayers.Marker(lonLat));

		map.setCenter (lonLat, zoom);
	};
	
	return {
		restrict: 'A',
		link: link
	};
});


return {}; }); // module definition end
