/**
 * Created by petur on 2015-02-18.
 */
var app = require('app');
app.directive('waveSurfer', [function(){

    return {
        restrict: 'A',
        link: function(scope,element,attr){
            var el = element[0];
            var song = attr.src;
            scope.wavesurfer = Object.create(WaveSurfer);
            scope.wavesurfer.init({
                container: el,
                waveColor: '#eee',
                progressColor: '#000'
            });

            scope.wavesurfer.load(song);

           scope.wavesurfer.on('ready', function () {
                scope.start();
            });

        }
    };

}]);