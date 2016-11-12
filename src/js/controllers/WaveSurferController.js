
var app = require('app');
app.controller('WaveSurferController', ['$scope', function ($scope) {

    var volume = 1;
    var volumeShift = 0.25;
    $scope.volumeLevel = volume;

    $scope.playing = false;
    $scope.started = false;


    $scope.start = function(){
        $scope.$apply(function(){
                $scope.started = true;
            }
        );
    };

    $scope.playSong = function(){
        $scope.wavesurfer.play();
        $scope.playing = true;
    };

    $scope.pauseSong = function(){
        $scope.wavesurfer.pause();
        $scope.playing = false;
    };

    $scope.stopSong = function(){
        $scope.wavesurfer.stop();
    };

    $scope.volumeUp = function(){
        if($scope.volumeLevel !== 1){
            $scope.wavesurfer.setVolume($scope.volumeLevel+volumeShift);
            $scope.volumeLevel = $scope.volumeLevel + volumeShift;
        }
    };

    $scope.volumeDown = function(){
        if($scope.volumeLevel !== 0){
            $scope.wavesurfer.setVolume($scope.volumeLevel-volumeShift);
            $scope.volumeLevel = $scope.volumeLevel - volumeShift;
        }
    };

    $scope.volumeOff = function(){
        $scope.volumeLevel = 0;
        $scope.wavesurfer.setVolume(0);
    };

    $scope.getVolume = function(){
        return $scope.volumeLevel*100;
    };

}]);