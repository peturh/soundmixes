var app = angular.module('soundMixes', ['ngRoute','angularFileUpload','cgBusy','infinite-scroll'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'parts/listposts.tpl.html',
                controller: 'PostCtrl'
            })
            .when('/newpost', {
                templateUrl: 'parts/newpost.tpl.html',
                controller: 'PublishCtrl'
            });
    });

app.filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
}).config(function($sceProvider){
    $sceProvider.enabled(false);

});
;/**
 * Created by petur on 2015-02-18.
 */
app.controller('MainCtrl',['$scope','$location', 'QueryService',
    function($scope, $location, QueryService){

        $scope.name = "Sound mixes";

        $scope.isActive = function(viewLocation){
            return viewLocation == $location.path();
        };

        $scope.publishPost = function(){
            console.log("Denna körs");
            QueryService.putPost("hej servern");
        };


        $scope.posts = [];

    }]);;app.controller('PostCtrl',['$scope','QueryService', function($scope,QueryService){

    $scope.posts = [];

    $scope.limit = 3;


    $scope.loadMore = function() {
        $scope.limit = $scope.limit+1;
    };

    $scope.run = function() {
        QueryService.getPosts().then(function(data){
            $scope.posts = data.data;
        });
    };

    $scope.getDate = function(date){
        return moment().format("MM/DD/YY",date);
    };


    $scope.deletePost = function(post,password){
        theRequest = {
            "password" : password,
            "_id" : post._id
        };

        QueryService.deletePost(theRequest).then(function(data){
            $scope.run();
            window.alert("Song successfully deleted");
            console.log(data);
        },function(err){
            window.alert("You are doing something you shouldn't aren't you?");
        });
    };
}]);
;app.controller('PublishCtrl',['$scope','QueryService','$upload', function($scope, QueryService,$upload){

    var theServerIp = "http://192.168.0.6:9099";
    $scope.pushed = false;
    $scope.progressPercentage = 0;
    $scope.newPost = {
        "fileName" : "",
        "title" : "",
        "description" : "",
        "date" :"",
        "password" : ""
    };

    $scope.mySong = "";

    $scope.publishPost = function() {
        console.log("file",$scope.file);
        if(typeof $scope.file !== "undefined"){
            $scope.newPost.fileName = theServerIp+"/music/"+$scope.newPost.title+".mp3";
            $scope.pushed =! $scope.pushed;
         /*   QueryService.uploadFile($scope.file,$scope.newPost).then(function(data){
                console.log(data);
            });*/

            $upload.upload({

                url: 'uploadfile',
                data: {myObj: $scope.newPost},
                file: $scope.file
            }).progress(function(evt) {
                $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function(data, status, headers, config) {
                $scope.progressPercentage = 0;

                window.alert("Upload successfull!");
                $scope.newPost = {
                    "fileName" : "",
                    "title" : "",
                    "description" : "",
                    "date" :"",
                    "password" : ""
                };
                $scope.file = "";

            }).error(function(data,status,headers,config){
                $scope.progressPercentage = 0;
                window.alert("Wrong password or the server fucked up, whad'ya know?");
            });
        }
        else{
            window.alert("No file selected!");
        }
    };




    $scope.getPercentage = function() {
        if ($scope.progressPercentage === 0) {
            return "Submit";
        }
        else{
            return $scope.progressPercentage + "%";
        }
    };
}]);
;app.controller('WaveSurferController', ['$scope', function ($scope) {

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

}]);;/**!
 * AngularJS file upload/drop directive and service with progress and abort
 * @author  Danial  <danial.farid@gmail.com>
 * @version 2.2.2
 */
(function() {

    function patchXHR(fnName, newFn) {
        window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
    }

    if (window.XMLHttpRequest && !window.XMLHttpRequest.__isFileAPIShim) {
        patchXHR('setRequestHeader', function(orig) {
            return function(header, value) {
                if (header === '__setXHR_') {
                    var val = value(this);
                    // fix for angular < 1.2.0
                    if (val instanceof Function) {
                        val(this);
                    }
                } else {
                    orig.apply(this, arguments);
                }
            }
        });
    }

    var angularFileUpload = angular.module('angularFileUpload', []);
    angularFileUpload.version = '2.2.2';
    angularFileUpload.service('$upload', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
        function sendHttp(config) {
            config.method = config.method || 'POST';
            config.headers = config.headers || {};
            config.transformRequest = config.transformRequest || function(data, headersGetter) {
                if (window.ArrayBuffer && data instanceof window.ArrayBuffer) {
                    return data;
                }
                return $http.defaults.transformRequest[0](data, headersGetter);
            };
            var deferred = $q.defer();
            var promise = deferred.promise;

            config.headers['__setXHR_'] = function() {
                return function(xhr) {
                    if (!xhr) return;
                    config.__XHR = xhr;
                    config.xhrFn && config.xhrFn(xhr);
                    xhr.upload.addEventListener('progress', function(e) {
                        e.config = config;
                        deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function(){promise.progress_fn(e)});
                    }, false);
                    //fix for firefox not firing upload progress end, also IE8-9
                    xhr.upload.addEventListener('load', function(e) {
                        if (e.lengthComputable) {
                            e.config = config;
                            deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function(){promise.progress_fn(e)});
                        }
                    }, false);
                };
            };

            $http(config).then(function(r){deferred.resolve(r)}, function(e){deferred.reject(e)}, function(n){deferred.notify(n)});

            promise.success = function(fn) {
                promise.then(function(response) {
                    fn(response.data, response.status, response.headers, config);
                });
                return promise;
            };

            promise.error = function(fn) {
                promise.then(null, function(response) {
                    fn(response.data, response.status, response.headers, config);
                });
                return promise;
            };

            promise.progress = function(fn) {
                promise.progress_fn = fn;
                promise.then(null, null, function(update) {
                    fn(update);
                });
                return promise;
            };
            promise.abort = function() {
                if (config.__XHR) {
                    $timeout(function() {
                        config.__XHR.abort();
                    });
                }
                return promise;
            };
            promise.xhr = function(fn) {
                config.xhrFn = (function(origXhrFn) {
                    return function() {
                        origXhrFn && origXhrFn.apply(promise, arguments);
                        fn.apply(promise, arguments);
                    }
                })(config.xhrFn);
                return promise;
            };

            return promise;
        }

        this.upload = function(config) {
            config.headers = config.headers || {};
            config.headers['Content-Type'] = undefined;
            config.transformRequest = config.transformRequest || $http.defaults.transformRequest;
            var formData = new FormData();
            var origTransformRequest = config.transformRequest;
            var origData = config.data;
            config.transformRequest = function(formData, headerGetter) {
                function transform(data) {
                    if (typeof origTransformRequest == 'function') {
                        data = origTransformRequest(data, headerGetter);
                    } else {
                        for (var i = 0; i < origTransformRequest.length; i++) {
                            if (typeof origTransformRequest[i] == 'function') {
                                data = origTransformRequest[i](data, headerGetter);
                            }
                        }
                    }
                    return data
                }
                if (origData) {
                    if (config.formDataAppender) {
                        for (var key in origData) {
                            var val = origData[key];
                            config.formDataAppender(formData, key, val);
                        }
                    } else if (config.sendDataAsJson) {
                        origData = transform(origData);
                        formData.append('data', new Blob([origData], { type: 'application/json' }));
                    } else {
                        for (var key in origData) {
                            var val = transform(origData[key]);
                            if (val !== undefined) {
                                if (config.sendObjectAsJson && typeof val === 'object' &&
                                    Object.prototype.toString.call(fileFormName) !== '[object String]') {
                                    formData.append(key, new Blob(val), { type: 'application/json' });
                                } else {
                                    formData.append(key, val);
                                }
                            }
                        }
                    }
                }

                if (config.file != null) {
                    var fileFormName = config.fileFormDataName || 'file';

                    if (Object.prototype.toString.call(config.file) === '[object Array]') {
                        var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]';
                        for (var i = 0; i < config.file.length; i++) {
                            formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i],
                                (config.fileName && config.fileName[i]) || config.file[i].name);
                        }
                    } else {
                        formData.append(fileFormName, config.file, config.fileName || config.file.name);
                    }
                }
                return formData;
            };

            config.data = formData;

            return sendHttp(config);
        };

        this.http = function(config) {
            return sendHttp(config);
        };
    }]);

    angularFileUpload.directive('ngFileSelect', [ '$parse', '$timeout', '$compile', function($parse, $timeout, $compile) { return {
        restrict: 'AEC',
        require:'?ngModel',
        link: function(scope, elem, attr, ngModel) {
            handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile);
        }
    }}]);

    function handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile) {
        if (attr.ngMultiple && $parse(attr.ngMultiple)(scope)) {
            elem.attr('multiple', 'true');
            attr['multiple'] = 'true';
        }
        var accept = attr.ngAccept && $parse(attr.ngAccept)(scope);
        if (accept) {
            elem.attr('accept', accept);
            attr['accept'] = accept;
        }
        var capture = attr.ngCapture && $parse(attr.ngCapture)(scope)
        if (capture) {
            elem.attr('capture', capture);
            attr['capture'] = capture;
        }
        if (elem[0].tagName.toLowerCase() !== 'input' || (elem.attr('type') && elem.attr('type').toLowerCase()) !== 'file') {
            var id = '--ng-file-upload-' + Math.random();
            var fileElem = angular.element('<input type="file" id="' + id + '">')
            if (attr['multiple']) fileElem.attr('multiple', attr['multiple']);
            if (attr['accept']) fileElem.attr('accept', attr['accept']);
            if (attr['capture']) fileElem.attr('capture', attr['capture']);
            for (var key in attr) {
                if (key.indexOf('inputFile') == 0) {
                    var name = key.substring('inputFile'.length);
                    name = name[0].toLowerCase() + name.substring(1);
                    fileElem.attr(name, attr[key]);
                }
            }

            fileElem.css('width', '0px').css('height', '0px').css('position', 'absolute').css('padding', 0).css('margin', 0)
                .css('overflow', 'hidden').attr('tabindex', '-1').css('opacity', 0).attr('ng-file-generated-elem--', true);
            elem.parent()[0].insertBefore(fileElem[0], elem[0])
            elem.attr('onclick', 'document.getElementById("' + id + '").click()')
//		elem.__afu_fileClickDelegate__ = function() {
//			fileElem[0].click();
//		};
//		elem.bind('click', elem.__afu_fileClickDelegate__);
            elem.css('overflow', 'hidden');
            elem.attr('id', 'e' + id);
            var origElem = elem;
            elem = fileElem;
        }
        if (attr['ngFileSelect'] != '') {
            attr.ngFileChange = attr.ngFileSelect;
        }
        if ($parse(attr.resetOnClick)(scope) != false) {
            if (navigator.appVersion.indexOf("MSIE 10") !== -1) {
                // fix for IE10 cannot set the value of the input to null programmatically by replacing input
                var replaceElem = function(evt) {
                    var inputFile = elem.clone();
                    inputFile.val('');
                    elem.replaceWith(inputFile);
                    $compile(inputFile)(scope);
                    fileElem = inputFile;
                    elem = inputFile;
                    elem.bind('change', onChangeFn);
                    elem.unbind('click');
                    elem[0].click();
                    elem.bind('click', replaceElem);
                    evt.preventDefault();
                    evt.stopPropagation();
                };
                elem.bind('click', replaceElem);
            } else {
                elem.bind('click', function(evt) {
                    elem[0].value = null;
                });
            }
        }
        var onChangeFn = function(evt) {
            var files = [], fileList, i;
            fileList = evt.__files_ || evt.target.files;
            updateModel(fileList, attr, ngModel, scope, evt);
        };
        elem.bind('change', onChangeFn);

        function updateModel(fileList, attr, ngModel, scope, evt) {
            var files = [];
            for (var i = 0; i < fileList.length; i++) {
                files.push(fileList.item(i));
            }
            if (ngModel) {
                $timeout(function() {
                    scope[attr.ngModel] ? scope[attr.ngModel].value = files : scope[attr.ngModel] = files;
                    ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
                });
            }
            if (attr.ngFileChange && attr.ngFileChange != "") {
                $timeout(function() {
                    $parse(attr.ngFileChange)(scope, {
                        $files : files,
                        $event : evt
                    });
                });
            }
        }
    }

    angularFileUpload.directive('ngFileDrop', [ '$parse', '$timeout', '$location', function($parse, $timeout, $location) { return {
        restrict: 'AEC',
        require:'?ngModel',
        link: function(scope, elem, attr, ngModel) {
            handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location);
        }
    }}]);

    angularFileUpload.directive('ngNoFileDrop', function() {
        return function(scope, elem, attr) {
            if (dropAvailable()) elem.css('display', 'none')
        }
    });

//for backward compatibility
    angularFileUpload.directive('ngFileDropAvailable', [ '$parse', '$timeout', function($parse, $timeout) {
        return function(scope, elem, attr) {
            if (dropAvailable()) {
                var fn = $parse(attr['ngFileDropAvailable']);
                $timeout(function() {
                    fn(scope);
                });
            }
        }
    }]);

    function handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location) {
        var available = dropAvailable();
        if (attr['dropAvailable']) {
            $timeout(function() {
                scope.dropAvailable ? scope.dropAvailable.value = available : scope.dropAvailable = available;
            });
        }
        if (!available) {
            if ($parse(attr.hideOnDropNotAvailable)(scope) != false) {
                elem.css('display', 'none');
            }
            return;
        }
        var leaveTimeout = null;
        var stopPropagation = $parse(attr.stopPropagation)(scope);
        var dragOverDelay = 1;
        var accept = $parse(attr.ngAccept)(scope) || attr.accept;
        var regexp = accept ? new RegExp(globStringToRegex(accept)) : null;
        var actualDragOverClass;
        elem[0].addEventListener('dragover', function(evt) {
            evt.preventDefault();
            if (stopPropagation) evt.stopPropagation();
            $timeout.cancel(leaveTimeout);
            if (!scope.actualDragOverClass) {
                actualDragOverClass = calculateDragOverClass(scope, attr, evt);
            }
            elem.addClass(actualDragOverClass);
        }, false);
        elem[0].addEventListener('dragenter', function(evt) {
            evt.preventDefault();
            if (stopPropagation) evt.stopPropagation();
        }, false);
        elem[0].addEventListener('dragleave', function(evt) {
            leaveTimeout = $timeout(function() {
                elem.removeClass(actualDragOverClass);
                actualDragOverClass = null;
            }, dragOverDelay || 1);
        }, false);
        if (attr['ngFileDrop'] != '') {
            attr.ngFileChange = scope.ngFileDrop;
        }
        elem[0].addEventListener('drop', function(evt) {
            evt.preventDefault();
            if (stopPropagation) evt.stopPropagation();
            elem.removeClass(actualDragOverClass);
            actualDragOverClass = null;
            extractFiles(evt, function(files, rejFiles) {
                if (ngModel) {
                    scope[attr.ngModel] ? scope[attr.ngModel].value = files : scope[attr.ngModel] = files;
                    ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
                }
                if (attr['ngFileRejectedModel']) {
                    scope[attr.ngFileRejectedModel] ? scope[attr.ngFileRejectedModel].value = rejFiles :
                        scope[attr.ngFileRejectedModel] = rejFiles;
                }

                $timeout(function() {
                    $parse(attr.ngFileChange)(scope, {
                        $files : files,
                        $rejectedFiles: rejFiles,
                        $event : evt
                    });
                });
            }, $parse(attr.allowDir)(scope) != false, attr.multiple || $parse(attr.ngMultiple)(scope));
        }, false);

        function calculateDragOverClass(scope, attr, evt) {
            var valid = true;
            if (regexp) {
                var items = evt.dataTransfer.items;
                if (items != null) {
                    for (var i = 0 ; i < items.length && valid; i++) {
                        valid = valid && (items[i].kind == 'file' || items[i].kind == '') &&
                        (items[i].type.match(regexp) != null || (items[i].name != null && items[i].name.match(regexp) != null));
                    }
                }
            }
            var clazz = $parse(attr.dragOverClass)(scope, {$event : evt});
            if (clazz) {
                if (clazz.delay) dragOverDelay = clazz.delay;
                if (clazz.accept) clazz = valid ? clazz.accept : clazz.reject;
            }
            return clazz || attr['dragOverClass'] || 'dragover';
        }

        function extractFiles(evt, callback, allowDir, multiple) {
            var files = [], rejFiles = [], items = evt.dataTransfer.items, processing = 0;

            function addFile(file) {
                if (!regexp || file.type.match(regexp) || (file.name != null && file.name.match(regexp))) {
                    files.push(file);
                } else {
                    rejFiles.push(file);
                }
            }

            if (items && items.length > 0 && $location.protocol() != 'file') {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
                        var entry = items[i].webkitGetAsEntry();
                        if (entry.isDirectory && !allowDir) {
                            continue;
                        }
                        if (entry != null) {
                            //fix for chrome bug https://code.google.com/p/chromium/issues/detail?id=149735
                            if (isASCII(entry.name)) {
                                traverseFileTree(files, entry);
                            } else if (!items[i].webkitGetAsEntry().isDirectory) {
                                addFile(items[i].getAsFile());
                            }
                        }
                    } else {
                        var f = items[i].getAsFile();
                        if (f != null) addFile(f);
                    }
                    if (!multiple && files.length > 0) break;
                }
            } else {
                var fileList = evt.dataTransfer.files;
                if (fileList != null) {
                    for (var i = 0; i < fileList.length; i++) {
                        addFile(fileList.item(i));
                        if (!multiple && files.length > 0) break;
                    }
                }
            }
            var delays = 0;
            (function waitForProcess(delay) {
                $timeout(function() {
                    if (!processing) {
                        if (!multiple && files.length > 1) {
                            var i = 0;
                            while (files[i].type == 'directory') i++;
                            files = [files[i]];
                        }
                        callback(files, rejFiles);
                    } else {
                        if (delays++ * 10 < 20 * 1000) {
                            waitForProcess(10);
                        }
                    }
                }, delay || 0)
            })();

            function traverseFileTree(files, entry, path) {
                if (entry != null) {
                    if (entry.isDirectory) {
                        var filePath = (path || '') + entry.name;
                        addFile({name: entry.name, type: 'directory', path: filePath});
                        var dirReader = entry.createReader();
                        var entries = [];
                        processing++;
                        var readEntries = function() {
                            dirReader.readEntries(function(results) {
                                try {
                                    if (!results.length) {
                                        for (var i = 0; i < entries.length; i++) {
                                            traverseFileTree(files, entries[i], (path ? path : '') + entry.name + '/');
                                        }
                                        processing--;
                                    } else {
                                        entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                                        readEntries();
                                    }
                                } catch (e) {
                                    processing--;
                                    console.error(e);
                                }
                            }, function() {
                                processing--;
                            });
                        };
                        readEntries();
                    } else {
                        processing++;
                        entry.file(function(file) {
                            try {
                                processing--;
                                file.path = (path ? path : '') + file.name;
                                addFile(file);
                            } catch (e) {
                                processing--;
                                console.error(e);
                            }
                        }, function(e) {
                            processing--;
                        });
                    }
                }
            }
        }
    }

    function dropAvailable() {
        var div = document.createElement('div');
        return ('draggable' in div) && ('ondrop' in div);
    }

    function isASCII(str) {
        return /^[\000-\177]*$/.test(str);
    }

    function globStringToRegex(str) {
        if (str.length > 2 && str[0] === '/' && str[str.length -1] === '/') {
            return str.substring(1, str.length - 1);
        }
        var split = str.split(','), result = '';
        if (split.length > 1) {
            for (var i = 0; i < split.length; i++) {
                result += '(' + globStringToRegex(split[i]) + ')';
                if (i < split.length - 1) {
                    result += '|'
                }
            }
        } else {
            result = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&') + '$';
            result = result.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
        }
        return result;
    }

})();

/**!
 * AngularJS file upload/drop directive and service with progress and abort
 * FileAPI Flash shim for old browsers not supporting FormData
 * @author  Danial  <danial.farid@gmail.com>
 * @version 2.2.2
 */

(function() {

    var hasFlash = function() {
        try {
            var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if (fo) return true;
        } catch(e) {
            if (navigator.mimeTypes['application/x-shockwave-flash'] != undefined) return true;
        }
        return false;
    }

    function patchXHR(fnName, newFn) {
        window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
    };

    if ((window.XMLHttpRequest && !window.FormData) || (window.FileAPI && FileAPI.forceLoad)) {
        var initializeUploadListener = function(xhr) {
            if (!xhr.__listeners) {
                if (!xhr.upload) xhr.upload = {};
                xhr.__listeners = [];
                var origAddEventListener = xhr.upload.addEventListener;
                xhr.upload.addEventListener = function(t, fn, b) {
                    xhr.__listeners[t] = fn;
                    origAddEventListener && origAddEventListener.apply(this, arguments);
                };
            }
        }

        patchXHR('open', function(orig) {
            return function(m, url, b) {
                initializeUploadListener(this);
                this.__url = url;
                try {
                    orig.apply(this, [m, url, b]);
                } catch (e) {
                    if (e.message.indexOf('Access is denied') > -1) {
                        orig.apply(this, [m, '_fix_for_ie_crossdomain__', b]);
                    }
                }
            }
        });

        patchXHR('getResponseHeader', function(orig) {
            return function(h) {
                return this.__fileApiXHR && this.__fileApiXHR.getResponseHeader ? this.__fileApiXHR.getResponseHeader(h) : (orig == null ? null : orig.apply(this, [h]));
            };
        });

        patchXHR('getAllResponseHeaders', function(orig) {
            return function() {
                return this.__fileApiXHR && this.__fileApiXHR.getAllResponseHeaders ? this.__fileApiXHR.getAllResponseHeaders() : (orig == null ? null : orig.apply(this));
            }
        });

        patchXHR('abort', function(orig) {
            return function() {
                return this.__fileApiXHR && this.__fileApiXHR.abort ? this.__fileApiXHR.abort() : (orig == null ? null : orig.apply(this));
            }
        });

        patchXHR('setRequestHeader', function(orig) {
            return function(header, value) {
                if (header === '__setXHR_') {
                    initializeUploadListener(this);
                    var val = value(this);
                    // fix for angular < 1.2.0
                    if (val instanceof Function) {
                        val(this);
                    }
                } else {
                    this.__requestHeaders = this.__requestHeaders || {};
                    this.__requestHeaders[header] = value;
                    orig.apply(this, arguments);
                }
            }
        });

        function redefineProp(xhr, prop, fn) {
            try {
                Object.defineProperty(xhr, prop, {get: fn});
            } catch (e) {/*ignore*/}
        }

        patchXHR('send', function(orig) {
            return function() {
                var xhr = this;
                if (arguments[0] && arguments[0].__isFileAPIShim) {
                    var formData = arguments[0];
                    var config = {
                        url: xhr.__url,
                        jsonp: false, //removes the callback form param
                        cache: true, //removes the ?fileapiXXX in the url
                        complete: function(err, fileApiXHR) {
                            xhr.__completed = true;
                            if (!err && xhr.__listeners['load'])
                                xhr.__listeners['load']({type: 'load', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
                            if (!err && xhr.__listeners['loadend'])
                                xhr.__listeners['loadend']({type: 'loadend', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
                            if (err === 'abort' && xhr.__listeners['abort'])
                                xhr.__listeners['abort']({type: 'abort', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
                            if (fileApiXHR.status !== undefined) redefineProp(xhr, 'status', function() {return (fileApiXHR.status == 0 && err && err !== 'abort') ? 500 : fileApiXHR.status});
                            if (fileApiXHR.statusText !== undefined) redefineProp(xhr, 'statusText', function() {return fileApiXHR.statusText});
                            redefineProp(xhr, 'readyState', function() {return 4});
                            if (fileApiXHR.response !== undefined) redefineProp(xhr, 'response', function() {return fileApiXHR.response});
                            var resp = fileApiXHR.responseText || (err && fileApiXHR.status == 0 && err !== 'abort' ? err : undefined);
                            redefineProp(xhr, 'responseText', function() {return resp});
                            redefineProp(xhr, 'response', function() {return resp});
                            if (err) redefineProp(xhr, 'err', function() {return err});
                            xhr.__fileApiXHR = fileApiXHR;
                            if (xhr.onreadystatechange) xhr.onreadystatechange();
                            if (xhr.onload) xhr.onload();
                        },
                        fileprogress: function(e) {
                            e.target = xhr;
                            xhr.__listeners['progress'] && xhr.__listeners['progress'](e);
                            xhr.__total = e.total;
                            xhr.__loaded = e.loaded;
                            if (e.total === e.loaded) {
                                // fix flash issue that doesn't call complete if there is no response text from the server
                                var _this = this
                                setTimeout(function() {
                                    if (!xhr.__completed) {
                                        xhr.getAllResponseHeaders = function(){};
                                        _this.complete(null, {status: 204, statusText: 'No Content'});
                                    }
                                }, 10000);
                            }
                        },
                        headers: xhr.__requestHeaders
                    }
                    config.data = {};
                    config.files = {}
                    for (var i = 0; i < formData.data.length; i++) {
                        var item = formData.data[i];
                        if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
                            config.files[item.key] = item.val;
                        } else {
                            config.data[item.key] = item.val;
                        }
                    }

                    setTimeout(function() {
                        if (!hasFlash()) {
                            throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
                        }
                        xhr.__fileApiXHR = FileAPI.upload(config);
                    }, 1);
                } else {
                    orig.apply(xhr, arguments);
                }
            }
        });
        window.XMLHttpRequest.__isFileAPIShim = true;

        var addFlash = function(elem) {
            if (!hasFlash()) {
                throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
            }
            var el = angular.element(elem);
            if (!el.attr('disabled')) {
                if (!el.hasClass('js-fileapi-wrapper') && (el.attr('ng-file-select') != null || el.attr('data-ng-file-select') != null ||
                    el.attr('ng-file-generated-elem--') != null)) {

                    el.addClass('js-fileapi-wrapper');
                    if (el.attr('ng-file-generated-elem--') != null) {
                        var ref = angular.element(document.getElementById('e' + el.attr('id')));
                        ref.bind('mouseover', function() {
                            if (el.parent().css('position') === '' || el.parent().css('position') === 'static') {
                                el.parent().css('position', 'relative');
                            }
                            el.css('position', 'absolute').css('top', ref[0].offsetTop + 'px').css('left', ref[0].offsetLeft + 'px')
                                .css('width', ref[0].offsetWidth + 'px').css('height', ref[0].offsetHeight + 'px')
                                .css('padding', ref.css('padding')).css('margin', ref.css('margin')).css('filter', 'alpha(opacity=0)');
                            ref.attr('onclick', '');
                            el.css('z-index', '1000');
                        });
                    }
                }
            }
        };
        var changeFnWrapper = function(fn) {
            return function(evt) {
                var files = FileAPI.getFiles(evt);
                //just a double check for #233
                for (var i = 0; i < files.length; i++) {
                    if (files[i].size === undefined) files[i].size = 0;
                    if (files[i].name === undefined) files[i].name = 'file';
                    if (files[i].type === undefined) files[i].type = 'undefined';
                }
                if (!evt.target) {
                    evt.target = {};
                }
                evt.target.files = files;
                // if evt.target.files is not writable use helper field
                if (evt.target.files != files) {
                    evt.__files_ = files;
                }
                (evt.__files_ || evt.target.files).item = function(i) {
                    return (evt.__files_ || evt.target.files)[i] || null;
                }
                if (fn) fn.apply(this, [evt]);
            };
        };
        var isFileChange = function(elem, e) {
            return (e.toLowerCase() === 'change' || e.toLowerCase() === 'onchange') && elem.getAttribute('type') == 'file';
        }
        if (HTMLInputElement.prototype.addEventListener) {
            HTMLInputElement.prototype.addEventListener = (function(origAddEventListener) {
                return function(e, fn, b, d) {
                    if (isFileChange(this, e)) {
                        addFlash(this);
                        origAddEventListener.apply(this, [e, changeFnWrapper(fn), b, d]);
                    } else {
                        origAddEventListener.apply(this, [e, fn, b, d]);
                    }
                }
            })(HTMLInputElement.prototype.addEventListener);
        }
        if (HTMLInputElement.prototype.attachEvent) {
            HTMLInputElement.prototype.attachEvent = (function(origAttachEvent) {
                return function(e, fn) {
                    if (isFileChange(this, e)) {
                        addFlash(this);
                        if (window.jQuery) {
                            // fix for #281 jQuery on IE8
                            angular.element(this).bind('change', changeFnWrapper(null));
                        } else {
                            origAttachEvent.apply(this, [e, changeFnWrapper(fn)]);
                        }
                    } else {
                        origAttachEvent.apply(this, [e, fn]);
                    }
                }
            })(HTMLInputElement.prototype.attachEvent);
        }

        window.FormData = FormData = function() {
            return {
                append: function(key, val, name) {
                    if (val.__isFileAPIBlobShim) {
                        val = val.data[0];
                    }
                    this.data.push({
                        key: key,
                        val: val,
                        name: name
                    });
                },
                data: [],
                __isFileAPIShim: true
            };
        };

        window.Blob = Blob = function(b) {
            return {
                data: b,
                __isFileAPIBlobShim: true
            };
        };

        (function () {
            //load FileAPI
            if (!window.FileAPI) {
                window.FileAPI = {};
            }
            if (FileAPI.forceLoad) {
                FileAPI.html5 = false;
            }

            if (!FileAPI.upload) {
                var jsUrl, basePath, script = document.createElement('script'), allScripts = document.getElementsByTagName('script'), i, index, src;
                if (window.FileAPI.jsUrl) {
                    jsUrl = window.FileAPI.jsUrl;
                } else if (window.FileAPI.jsPath) {
                    basePath = window.FileAPI.jsPath;
                } else {
                    for (i = 0; i < allScripts.length; i++) {
                        src = allScripts[i].src;
                        index = src.search(/\/angular\-file\-upload[\-a-zA-z0-9\.]*\.js/)
                        if (index > -1) {
                            basePath = src.substring(0, index + 1);
                            break;
                        }
                    }
                }

                if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
                script.setAttribute('src', jsUrl || basePath + 'FileAPI.min.js');
                document.getElementsByTagName('head')[0].appendChild(script);
                FileAPI.hasFlash = hasFlash();
            }
        })();
        FileAPI.disableFileInput = function(elem, disable) {
            if (disable) {
                elem.removeClass('js-fileapi-wrapper')
            } else {
                elem.addClass('js-fileapi-wrapper');
            }
        }
    }


    if (!window.FileReader) {
        window.FileReader = function() {
            var _this = this, loadStarted = false;
            this.listeners = {};
            this.addEventListener = function(type, fn) {
                _this.listeners[type] = _this.listeners[type] || [];
                _this.listeners[type].push(fn);
            };
            this.removeEventListener = function(type, fn) {
                _this.listeners[type] && _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
            };
            this.dispatchEvent = function(evt) {
                var list = _this.listeners[evt.type];
                if (list) {
                    for (var i = 0; i < list.length; i++) {
                        list[i].call(_this, evt);
                    }
                }
            };
            this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;

            var constructEvent = function(type, evt) {
                var e = {type: type, target: _this, loaded: evt.loaded, total: evt.total, error: evt.error};
                if (evt.result != null) e.target.result = evt.result;
                return e;
            };
            var listener = function(evt) {
                if (!loadStarted) {
                    loadStarted = true;
                    _this.onloadstart && this.onloadstart(constructEvent('loadstart', evt));
                }
                if (evt.type === 'load') {
                    _this.onloadend && _this.onloadend(constructEvent('loadend', evt));
                    var e = constructEvent('load', evt);
                    _this.onload && _this.onload(e);
                    _this.dispatchEvent(e);
                } else if (evt.type === 'progress') {
                    var e = constructEvent('progress', evt);
                    _this.onprogress && _this.onprogress(e);
                    _this.dispatchEvent(e);
                } else {
                    var e = constructEvent('error', evt);
                    _this.onerror && _this.onerror(e);
                    _this.dispatchEvent(e);
                }
            };
            this.readAsArrayBuffer = function(file) {
                FileAPI.readAsBinaryString(file, listener);
            }
            this.readAsBinaryString = function(file) {
                FileAPI.readAsBinaryString(file, listener);
            }
            this.readAsDataURL = function(file) {
                FileAPI.readAsDataURL(file, listener);
            }
            this.readAsText = function(file) {
                FileAPI.readAsText(file, listener);
            }
        }
    }
})();;/**
 * Created by petur on 2015-02-18.
 */
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

}]);;app.service('QueryService',['$http','$upload', function($http,$upload){

    var QueryService = {};


    QueryService.getPosts =function() {
        return $http.get("/posts")
            .success(function(data,status,headers,config){
                return data;
            }

        ).error(function(data,status,headers,config){
                console.log("Error",data);
            });
    };

    QueryService.deletePost =function(theObject) {
        return $http.post("/delete",theObject)
            .success(function(data,status,headers,config){
                return data;
            }
        ).error(function(data,status,headers,config){
                return data;
            });
    };

/*
    QueryService.uploadFile = function(file,post){
        console.log(post);
        return $upload.upload({
            url: 'uploadfile',
            data: {myObj: post},
            file: file
        }).progress(function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file);
        }).success(function(data, status, headers, config) {
            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            console.log("this runs")
        });
    };*/

    return QueryService;

}]);;angular.module("cgBusy",[]),angular.module("cgBusy").factory("_cgBusyTrackerFactory",["$timeout","$q",function(a,b){return function(){var c={};c.promises=[],c.delayPromise=null,c.durationPromise=null,c.delayJustFinished=!1,c.reset=function(b){c.minDuration=b.minDuration,c.promises=[],angular.forEach(b.promises,function(a){a&&!a.$cgBusyFulfilled&&d(a)}),0!==c.promises.length&&(c.delayJustFinished=!1,b.delay&&(c.delayPromise=a(function(){c.delayPromise=null,c.delayJustFinished=!0},parseInt(b.delay,10))),b.minDuration&&(c.durationPromise=a(function(){c.durationPromise=null},parseInt(b.minDuration,10)+(b.delay?parseInt(b.delay,10):0))))},c.isPromise=function(a){var b=a&&(a.then||a.$then||a.$promise&&a.$promise.then);return"undefined"!=typeof b},c.callThen=function(a,c,d){var e;a.then||a.$then?e=a:a.$promise?e=a.$promise:a.denodeify&&(e=b.when(a));var f=e.then||e.$then;f.call(e,c,d)};var d=function(a){if(!c.isPromise(a))throw new Error("cgBusy expects a promise (or something that has a .promise or .$promise");-1===c.promises.indexOf(a)&&(c.promises.push(a),c.callThen(a,function(){a.$cgBusyFulfilled=!0,-1!==c.promises.indexOf(a)&&c.promises.splice(c.promises.indexOf(a),1)},function(){a.$cgBusyFulfilled=!0,-1!==c.promises.indexOf(a)&&c.promises.splice(c.promises.indexOf(a),1)}))};return c.active=function(){return c.delayPromise?!1:c.delayJustFinished?(c.delayJustFinished=!1,c.promises.length>0):c.durationPromise?!0:c.promises.length>0},c}}]),angular.module("cgBusy").value("cgBusyDefaults",{}),angular.module("cgBusy").directive("cgBusy",["$compile","$templateCache","cgBusyDefaults","$http","_cgBusyTrackerFactory",function(a,b,c,d,e){return{restrict:"A",link:function(f,g,h){var i=g.css("position");("static"===i||""===i||"undefined"==typeof i)&&g.css("position","relative");var j,k,l,m,n,o=e(),p={templateUrl:"angular-busy.html",delay:0,minDuration:0,backdrop:!0,message:"Please Wait...",wrapperClass:"cg-busy cg-busy-animation"};angular.extend(p,c),f.$watchCollection(h.cgBusy,function(c){if(c||(c={promise:null}),angular.isString(c))throw new Error("Invalid value for cg-busy. cgBusy no longer accepts string ids to represent promises/trackers.");(angular.isArray(c)||o.isPromise(c))&&(c={promise:c}),c=angular.extend(angular.copy(p),c),c.templateUrl||(c.templateUrl=p.templateUrl),angular.isArray(c.promise)||(c.promise=[c.promise]),m||(m=f.$new()),m.$message=c.message,angular.equals(o.promises,c.promise)||o.reset({promises:c.promise,delay:c.delay,minDuration:c.minDuration}),m.$cgBusyIsActive=function(){return o.active()},j&&l===c.templateUrl&&n===c.backdrop||(j&&j.remove(),k&&k.remove(),l=c.templateUrl,n=c.backdrop,d.get(l,{cache:b}).success(function(b){if(c.backdrop="undefined"==typeof c.backdrop?!0:c.backdrop,c.backdrop){var d='<div class="cg-busy cg-busy-backdrop cg-busy-backdrop-animation ng-hide" ng-show="$cgBusyIsActive()"></div>';k=a(d)(m),g.append(k)}var e='<div class="'+c.wrapperClass+' ng-hide" ng-show="$cgBusyIsActive()">'+b+"</div>";j=a(e)(m),angular.element(j.children()[0]).css("position","absolute").css("top",0).css("left",0).css("right",0).css("bottom",0),g.append(j)}).error(function(a){throw new Error("Template specified for cgBusy ("+c.templateUrl+") could not be loaded. "+a)}))},!0)}}}]),angular.module("cgBusy").run(["$templateCache",function(a){"use strict";a.put("angular-busy.html",'<div class="cg-busy-default-wrapper">\r\n\r\n   <div class="cg-busy-default-sign">\r\n\r\n      <div class="cg-busy-default-spinner">\r\n         <div class="bar1"></div>\r\n         <div class="bar2"></div>\r\n         <div class="bar3"></div>\r\n         <div class="bar4"></div>\r\n         <div class="bar5"></div>\r\n         <div class="bar6"></div>\r\n         <div class="bar7"></div>\r\n         <div class="bar8"></div>\r\n         <div class="bar9"></div>\r\n         <div class="bar10"></div>\r\n         <div class="bar11"></div>\r\n         <div class="bar12"></div>\r\n      </div>\r\n\r\n      <div class="cg-busy-default-text">{{$message}}</div>\r\n\r\n   </div>\r\n\r\n</div>')}]);;/* ng-infinite-scroll - v1.0.0 - 2013-02-23 */
var mod;

mod = angular.module('infinite-scroll', []);

mod.directive('infiniteScroll', [
    '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
        return {
            link: function(scope, elem, attrs) {
                var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
                $window = angular.element($window);
                scrollDistance = 0;
                if (attrs.infiniteScrollDistance != null) {
                    scope.$watch(attrs.infiniteScrollDistance, function(value) {
                        return scrollDistance = parseInt(value, 10);
                    });
                }
                scrollEnabled = true;
                checkWhenEnabled = false;
                if (attrs.infiniteScrollDisabled != null) {
                    scope.$watch(attrs.infiniteScrollDisabled, function(value) {
                        scrollEnabled = !value;
                        if (scrollEnabled && checkWhenEnabled) {
                            checkWhenEnabled = false;
                            return handler();
                        }
                    });
                }
                handler = function() {
                    var elementBottom, remaining, shouldScroll, windowBottom;
                    windowBottom = $window.height() + $window.scrollTop();
                    elementBottom = elem.offset().top + elem.height();
                    remaining = elementBottom - windowBottom;
                    shouldScroll = remaining <= $window.height() * scrollDistance;
                    if (shouldScroll && scrollEnabled) {
                        if ($rootScope.$$phase) {
                            return scope.$eval(attrs.infiniteScroll);
                        } else {
                            return scope.$apply(attrs.infiniteScroll);
                        }
                    } else if (shouldScroll) {
                        return checkWhenEnabled = true;
                    }
                };
                $window.on('scroll', handler);
                scope.$on('$destroy', function() {
                    return $window.off('scroll', handler);
                });
                return $timeout((function() {
                    if (attrs.infiniteScrollImmediateCheck) {
                        if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                            return handler();
                        }
                    } else {
                        return handler();
                    }
                }), 0);
            }
        };
    }
]);;//! moment.js
//! version : 2.9.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {
    /************************************
     Constants
     ************************************/

    var moment,
        VERSION = '2.9.0',
    // the global-scope this is NOT the global object in Node.js
        globalScope = (typeof global !== 'undefined' && (typeof window === 'undefined' || window === global.window)) ? global : this,
        oldGlobalMoment,
        round = Math.round,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

    // internal storage for locale config files
        locales = {},

    // extra moment internal properties (plugins register props here)
        momentProperties = [],

    // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module && module.exports),

    // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

    // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,

    // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenOffsetMs = /[\+\-]?\d+/, // 1234567890123
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

    //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

    // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

    // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-', '15', '30']
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

    // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            Q : 'quarter',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

    // format function strings
        formatFunctions = {},

    // default relative time thresholds
        relativeTimeThresholds = {
            s: 45,  // seconds to minute
            m: 45,  // minutes to hour
            h: 22,  // hours to day
            d: 26,  // days to month
            M: 11   // months to year
        },

    // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.localeData().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.localeData().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.localeData().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.localeData().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.localeData().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = this.utcOffset(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = this.utcOffset(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            x    : function () {
                return this.valueOf();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        deprecations = {},

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'],

        updateInProgress = false;

    // Pick the first defined of two or three arguments. dfl comes from
    // default.
    function dfl(a, b, c) {
        switch (arguments.length) {
            case 2: return a != null ? a : b;
            case 3: return a != null ? a : b != null ? b : c;
            default: throw new Error('Implement me');
        }
    }

    function hasOwnProp(a, b) {
        return hasOwnProperty.call(a, b);
    }

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function printMsg(msg) {
        if (moment.suppressDeprecationWarnings === false &&
            typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function () {
            if (firstTime) {
                printMsg(msg);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            printMsg(msg);
            deprecations[name] = true;
        }
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.localeData().ordinal(func.call(this, a), period);
        };
    }

    function monthDiff(a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
        // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        return -(wholeMonthDiff + adjust);
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // thie is not supposed to happen
            return hour;
        }
    }

    /************************************
     Constructors
     ************************************/

    function Locale() {
    }

    // Moment prototype object
    function Moment(config, skipOverflow) {
        if (skipOverflow !== false) {
            checkOverflow(config);
        }
        copyConfig(this, config);
        this._d = new Date(+config._d);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            moment.updateOffset(this);
            updateInProgress = false;
        }
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
        seconds * 1e3 + // 1000
        minutes * 6e4 + // 1000 * 60
        hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
        weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
        quarters * 3 +
        years * 12;

        this._data = {};

        this._locale = moment.localeData();

        this._bubble();
    }

    /************************************
     Helpers
     ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = from._pf;
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
        (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = makeAs(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = moment.duration(val, period);
            addOrSubtractDurationFromMoment(this, dur, direction);
            return this;
        };
    }

    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return Object.prototype.toString.call(input) === '[object Date]' ||
            input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment._locale[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment._locale, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                    m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                        m._a[HOUR] < 0 || m._a[HOUR] > 24 ||
                        (m._a[HOUR] === 24 && (m._a[MINUTE] !== 0 ||
                        m._a[SECOND] !== 0 ||
                        m._a[MILLISECOND] !== 0)) ? HOUR :
                            m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                                    m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                                        -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
            m._pf.overflow < 0 &&
            !m._pf.empty &&
            !m._pf.invalidMonth &&
            !m._pf.nullInput &&
            !m._pf.invalidFormat &&
            !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                m._pf.charsLeftOver === 0 &&
                m._pf.unusedTokens.length === 0 &&
                m._pf.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && hasModule) {
            try {
                oldLocale = moment.locale();
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                moment.locale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // Return a moment from input, that is local/utc/utcOffset equivalent to
    // model.
    function makeAs(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (moment.isMoment(input) || isDate(input) ?
                +input : +moment(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            moment.updateOffset(res, false);
            return res;
        } else {
            return moment(input).local();
        }
    }

    /************************************
     Locale
     ************************************/


    extend(Locale.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _ordinalParseLenient.
            this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);
        },

        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName, format, strict) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = moment.utc([2000, i]);
                if (strict && !this._longMonthsParse[i]) {
                    this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                    this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
                }
                if (!strict && !this._monthsParse[i]) {
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                    return i;
                } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                    return i;
                } else if (!strict && this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LTS : 'h:mm:ss A',
            LT : 'h:mm A',
            L : 'MM/DD/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY LT',
            LLLL : 'dddd, MMMM D, YYYY LT'
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },


        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom, now) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom, [now]) : output;
        },

        _relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },

        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },

        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace('%d', number);
        },
        _ordinal : '%d',
        _ordinalParse : /\d{1,2}/,

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        firstDayOfWeek : function () {
            return this._week.dow;
        },

        firstDayOfYear : function () {
            return this._week.doy;
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    /************************************
     Formatting
     ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
     Parsing
     ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
            case 'Q':
                return parseTokenOneDigit;
            case 'DDDD':
                return parseTokenThreeDigits;
            case 'YYYY':
            case 'GGGG':
            case 'gggg':
                return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
            case 'Y':
            case 'G':
            case 'g':
                return parseTokenSignedNumber;
            case 'YYYYYY':
            case 'YYYYY':
            case 'GGGGG':
            case 'ggggg':
                return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
            case 'S':
                if (strict) {
                    return parseTokenOneDigit;
                }
            /* falls through */
            case 'SS':
                if (strict) {
                    return parseTokenTwoDigits;
                }
            /* falls through */
            case 'SSS':
                if (strict) {
                    return parseTokenThreeDigits;
                }
            /* falls through */
            case 'DDD':
                return parseTokenOneToThreeDigits;
            case 'MMM':
            case 'MMMM':
            case 'dd':
            case 'ddd':
            case 'dddd':
                return parseTokenWord;
            case 'a':
            case 'A':
                return config._locale._meridiemParse;
            case 'x':
                return parseTokenOffsetMs;
            case 'X':
                return parseTokenTimestampMs;
            case 'Z':
            case 'ZZ':
                return parseTokenTimezone;
            case 'T':
                return parseTokenT;
            case 'SSSS':
                return parseTokenDigits;
            case 'MM':
            case 'DD':
            case 'YY':
            case 'GG':
            case 'gg':
            case 'HH':
            case 'hh':
            case 'mm':
            case 'ss':
            case 'ww':
            case 'WW':
                return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
            case 'M':
            case 'D':
            case 'd':
            case 'H':
            case 'h':
            case 'm':
            case 's':
            case 'w':
            case 'W':
            case 'e':
            case 'E':
                return parseTokenOneOrTwoDigits;
            case 'Do':
                return strict ? config._locale._ordinalParse : config._locale._ordinalParseLenient;
            default :
                a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
                return a;
        }
    }

    function utcOffsetFromString(string) {
        string = string || '';
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
            // QUARTER
            case 'Q':
                if (input != null) {
                    datePartArray[MONTH] = (toInt(input) - 1) * 3;
                }
                break;
            // MONTH
            case 'M' : // fall through to MM
            case 'MM' :
                if (input != null) {
                    datePartArray[MONTH] = toInt(input) - 1;
                }
                break;
            case 'MMM' : // fall through to MMMM
            case 'MMMM' :
                a = config._locale.monthsParse(input, token, config._strict);
                // if we didn't find a month name, mark the date as invalid.
                if (a != null) {
                    datePartArray[MONTH] = a;
                } else {
                    config._pf.invalidMonth = input;
                }
                break;
            // DAY OF MONTH
            case 'D' : // fall through to DD
            case 'DD' :
                if (input != null) {
                    datePartArray[DATE] = toInt(input);
                }
                break;
            case 'Do' :
                if (input != null) {
                    datePartArray[DATE] = toInt(parseInt(
                        input.match(/\d{1,2}/)[0], 10));
                }
                break;
            // DAY OF YEAR
            case 'DDD' : // fall through to DDDD
            case 'DDDD' :
                if (input != null) {
                    config._dayOfYear = toInt(input);
                }

                break;
            // YEAR
            case 'YY' :
                datePartArray[YEAR] = moment.parseTwoDigitYear(input);
                break;
            case 'YYYY' :
            case 'YYYYY' :
            case 'YYYYYY' :
                datePartArray[YEAR] = toInt(input);
                break;
            // AM / PM
            case 'a' : // fall through to A
            case 'A' :
                config._meridiem = input;
                // config._isPm = config._locale.isPM(input);
                break;
            // HOUR
            case 'h' : // fall through to hh
            case 'hh' :
                config._pf.bigHour = true;
            /* falls through */
            case 'H' : // fall through to HH
            case 'HH' :
                datePartArray[HOUR] = toInt(input);
                break;
            // MINUTE
            case 'm' : // fall through to mm
            case 'mm' :
                datePartArray[MINUTE] = toInt(input);
                break;
            // SECOND
            case 's' : // fall through to ss
            case 'ss' :
                datePartArray[SECOND] = toInt(input);
                break;
            // MILLISECOND
            case 'S' :
            case 'SS' :
            case 'SSS' :
            case 'SSSS' :
                datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
                break;
            // UNIX OFFSET (MILLISECONDS)
            case 'x':
                config._d = new Date(toInt(input));
                break;
            // UNIX TIMESTAMP WITH MS
            case 'X':
                config._d = new Date(parseFloat(input) * 1000);
                break;
            // TIMEZONE
            case 'Z' : // fall through to ZZ
            case 'ZZ' :
                config._useUTC = true;
                config._tzm = utcOffsetFromString(input);
                break;
            // WEEKDAY - human
            case 'dd':
            case 'ddd':
            case 'dddd':
                a = config._locale.weekdaysParse(input);
                // if we didn't get a weekday name, mark the date as invalid
                if (a != null) {
                    config._w = config._w || {};
                    config._w['d'] = a;
                } else {
                    config._pf.invalidWeekday = input;
                }
                break;
            // WEEK, WEEK DAY - numeric
            case 'w':
            case 'ww':
            case 'W':
            case 'WW':
            case 'd':
            case 'e':
            case 'E':
                token = token.substr(0, 1);
            /* falls through */
            case 'gggg':
            case 'GGGG':
            case 'GGGGG':
                token = token.substr(0, 2);
                if (input) {
                    config._w = config._w || {};
                    config._w[token] = toInt(input);
                }
                break;
            case 'gg':
            case 'GG':
                config._w = config._w || {};
                config._w[token] = moment.parseTwoDigitYear(input);
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
            week = dfl(w.W, 1);
            weekday = dfl(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
            week = dfl(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
            config._a[MINUTE] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day || normalizedInput.date,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        if (config._f === moment.ISO_8601) {
            parseISO(config);
            return;
        }

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._pf.bigHour === true && config._a[HOUR] <= 12) {
            config._pf.bigHour = undefined;
        }
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR],
            config._meridiem);
        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function parseISO(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be 'T' or undefined
                    config._f = isoDates[i][0] + (match[6] || ' ');
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += 'Z';
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function makeDateFromString(config) {
        parseISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            moment.createFromInputFallback(config);
        }
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function makeDateFromInput(config) {
        var input = config._i, matched;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            dateFromConfig(config);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, locale) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = locale.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
     Relative Time
     ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(posNegDuration, withoutSuffix, locale) {
        var duration = moment.duration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            years = round(duration.as('y')),

            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < relativeTimeThresholds.h && ['hh', hours] ||
                days === 1 && ['d'] ||
                days < relativeTimeThresholds.d && ['dd', days] ||
                months === 1 && ['M'] ||
                months < relativeTimeThresholds.M && ['MM', months] ||
                years === 1 && ['y'] || ['yy', years];

        args[2] = withoutSuffix;
        args[3] = +posNegDuration > 0;
        args[4] = locale;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
     Week of Year
     ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        d = d === 0 ? 7 : d;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
     Top Level Functions
     ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f,
            res;

        config._locale = config._locale || moment.localeData(config._l);

        if (input === null || (format === undefined && input === '')) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (moment.isMoment(input)) {
            return new Moment(input, true);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        res = new Moment(config);
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    moment = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = locale;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    moment.suppressDeprecationWarnings = false;

    moment.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return moment();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    moment.min = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    };

    moment.max = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    };

    // creating with utc
    moment.utc = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
        // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso,
            diffRes;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' &&
            ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(moment(duration.from), moment(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // constant that refers to the ISO standard
    moment.ISO_8601 = function () {};

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    moment.momentProperties = momentProperties;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function allows you to set a threshold for relative time strings
    moment.relativeTimeThreshold = function (threshold, limit) {
        if (relativeTimeThresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return relativeTimeThresholds[threshold];
        }
        relativeTimeThresholds[threshold] = limit;
        return true;
    };

    moment.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        function (key, value) {
            return moment.locale(key, value);
        }
    );

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    moment.locale = function (key, values) {
        var data;
        if (key) {
            if (typeof(values) !== 'undefined') {
                data = moment.defineLocale(key, values);
            }
            else {
                data = moment.localeData(key);
            }

            if (data) {
                moment.duration._locale = moment._locale = data;
            }
        }

        return moment._locale._abbr;
    };

    moment.defineLocale = function (name, values) {
        if (values !== null) {
            values.abbr = name;
            if (!locales[name]) {
                locales[name] = new Locale();
            }
            locales[name].set(values);

            // backwards compat for now: also set the locale
            moment.locale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    };

    moment.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        function (key) {
            return moment.localeData(key);
        }
    );

    // returns locale data
    moment.localeData = function (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return moment._locale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null && hasOwnProp(obj, '_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function () {
        return moment.apply(null, arguments).parseZone();
    };

    moment.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    moment.isDate = isDate;

    /************************************
     Moment Prototype
     ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d - ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                if ('function' === typeof Date.prototype.toISOString) {
                    // native implementation is ~50x faster, use it when we can
                    return this.toDate().toISOString();
                } else {
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                }
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {
            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function (keepLocalTime) {
            return this.utcOffset(0, keepLocalTime);
        },

        local : function (keepLocalTime) {
            if (this._isUTC) {
                this.utcOffset(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.subtract(this._dateUtcOffset(), 'm');
                }
            }
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.localeData().postformat(output);
        },

        add : createAdder(1, 'add'),

        subtract : createAdder(-1, 'subtract'),

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (that.utcOffset() - this.utcOffset()) * 6e4,
                anchor, diff, output, daysAdjust;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month' || units === 'quarter') {
                output = monthDiff(this, that);
                if (units === 'quarter') {
                    output = output / 3;
                } else if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = this - that;
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                        units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                            units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                                units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function (time) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're locat/utc/offset
            // or not.
            var now = time || moment(),
                sod = makeAs(now, this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                        diff < 0 ? 'lastDay' :
                            diff < 1 ? 'sameDay' :
                                diff < 2 ? 'nextDay' :
                                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.localeData().calendar(format, this, moment(now)));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        },

        month : makeAccessor('Month', true),

        startOf : function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
                case 'year':
                    this.month(0);
                /* falls through */
                case 'quarter':
                case 'month':
                    this.date(1);
                /* falls through */
                case 'week':
                case 'isoWeek':
                case 'day':
                    this.hours(0);
                /* falls through */
                case 'hour':
                    this.minutes(0);
                /* falls through */
                case 'minute':
                    this.seconds(0);
                /* falls through */
                case 'second':
                    this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond') {
                return this;
            }
            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
        },

        isAfter: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this > +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return inputMs < +this.clone().startOf(units);
            }
        },

        isBefore: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this < +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return +this.clone().endOf(units) < inputMs;
            }
        },

        isBetween: function (from, to, units) {
            return this.isAfter(from, units) && this.isBefore(to, units);
        },

        isSame: function (input, units) {
            var inputMs;
            units = normalizeUnits(units || 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this === +input;
            } else {
                inputMs = +moment(input);
                return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
            }
        },

        min: deprecate(
            'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
            function (other) {
                other = moment.apply(null, arguments);
                return other < this ? this : other;
            }
        ),

        max: deprecate(
            'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
            function (other) {
                other = moment.apply(null, arguments);
                return other > this ? this : other;
            }
        ),

        zone : deprecate(
            'moment().zone is deprecated, use moment().utcOffset instead. ' +
            'https://github.com/moment/moment/issues/1779',
            function (input, keepLocalTime) {
                if (input != null) {
                    if (typeof input !== 'string') {
                        input = -input;
                    }

                    this.utcOffset(input, keepLocalTime);

                    return this;
                } else {
                    return -this.utcOffset();
                }
            }
        ),

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        utcOffset : function (input, keepLocalTime) {
            var offset = this._offset || 0,
                localAdjust;
            if (input != null) {
                if (typeof input === 'string') {
                    input = utcOffsetFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = this._dateUtcOffset();
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.add(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this,
                            moment.duration(input - offset, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }

                return this;
            } else {
                return this._isUTC ? offset : this._dateUtcOffset();
            }
        },

        isLocal : function () {
            return !this._isUTC;
        },

        isUtcOffset : function () {
            return this._isUTC;
        },

        isUtc : function () {
            return this._isUTC && this._offset === 0;
        },

        zoneAbbr : function () {
            return this._isUTC ? 'UTC' : '';
        },

        zoneName : function () {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        },

        parseZone : function () {
            if (this._tzm) {
                this.utcOffset(this._tzm);
            } else if (typeof this._i === 'string') {
                this.utcOffset(utcOffsetFromString(this._i));
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).utcOffset();
            }

            return (this.utcOffset() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
        },

        quarter : function (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        week : function (input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        isoWeeksInYear : function () {
            return weeksInYear(this.year(), 1, 4);
        },

        weeksInYear : function () {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            var unit;
            if (typeof units === 'object') {
                for (unit in units) {
                    this.set(unit, units[unit]);
                }
            }
            else {
                units = normalizeUnits(units);
                if (typeof this[units] === 'function') {
                    this[units](value);
                }
            }
            return this;
        },

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        locale : function (key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = moment.localeData(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        },

        lang : deprecate(
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        ),

        localeData : function () {
            return this._locale;
        },

        _dateUtcOffset : function () {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return -Math.round(this._d.getTimezoneOffset() / 15) * 15;
        }

    });

    function rawMonthSetter(mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(),
            daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function rawGetter(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function rawSetter(mom, unit, value) {
        if (unit === 'Month') {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function makeAccessor(unit, keepTime) {
        return function (value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }

    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
    // moment.fn.month is defined separately
    moment.fn.date = makeAccessor('Date', true);
    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
    moment.fn.year = makeAccessor('FullYear', true);
    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    // alias isUtc for dev-friendliness
    moment.fn.isUTC = moment.fn.isUtc;

    /************************************
     Duration Prototype
     ************************************/


    function daysToYears (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        return days * 400 / 146097;
    }

    function yearsToDays (years) {
        // years * 365 + absRound(years / 4) -
        //     absRound(years / 100) + absRound(years / 400);
        return years * 146097 / 400;
    }

    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years = 0;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);

            // Accurately convert days to years, assume start from year 0.
            years = absRound(daysToYears(days));
            days -= absRound(yearsToDays(years));

            // 30 days to a month
            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
            months += absRound(days / 30);
            days %= 30;

            // 12 months -> 1 year
            years += absRound(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;
        },

        abs : function () {
            this._milliseconds = Math.abs(this._milliseconds);
            this._days = Math.abs(this._days);
            this._months = Math.abs(this._months);

            this._data.milliseconds = Math.abs(this._data.milliseconds);
            this._data.seconds = Math.abs(this._data.seconds);
            this._data.minutes = Math.abs(this._data.minutes);
            this._data.hours = Math.abs(this._data.hours);
            this._data.months = Math.abs(this._data.months);
            this._data.years = Math.abs(this._data.years);

            return this;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
                this._days * 864e5 +
                (this._months % 12) * 2592e6 +
                toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var output = relativeTime(this, !withSuffix, this.localeData());

            if (withSuffix) {
                output = this.localeData().pastFuture(+this, output);
            }

            return this.localeData().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            var days, months;
            units = normalizeUnits(units);

            if (units === 'month' || units === 'year') {
                days = this._days + this._milliseconds / 864e5;
                months = this._months + daysToYears(days) * 12;
                return units === 'month' ? months : months / 12;
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(yearsToDays(this._months / 12));
                switch (units) {
                    case 'week': return days / 7 + this._milliseconds / 6048e5;
                    case 'day': return days + this._milliseconds / 864e5;
                    case 'hour': return days * 24 + this._milliseconds / 36e5;
                    case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;
                    case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
                    default: throw new Error('Unknown unit ' + units);
                }
            }
        },

        lang : moment.fn.lang,
        locale : moment.fn.locale,

        toIsoString : deprecate(
            'toIsoString() is deprecated. Please use toISOString() instead ' +
            '(notice the capitals)',
            function () {
                return this.toISOString();
            }
        ),

        toISOString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        },

        localeData : function () {
            return this._locale;
        },

        toJSON : function () {
            return this.toISOString();
        }
    });

    moment.duration.fn.toString = moment.duration.fn.toISOString;

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    for (i in unitMillisecondFactors) {
        if (hasOwnProp(unitMillisecondFactors, i)) {
            makeDurationGetter(i.toLowerCase());
        }
    }

    moment.duration.fn.asMilliseconds = function () {
        return this.as('ms');
    };
    moment.duration.fn.asSeconds = function () {
        return this.as('s');
    };
    moment.duration.fn.asMinutes = function () {
        return this.as('m');
    };
    moment.duration.fn.asHours = function () {
        return this.as('h');
    };
    moment.duration.fn.asDays = function () {
        return this.as('d');
    };
    moment.duration.fn.asWeeks = function () {
        return this.as('weeks');
    };
    moment.duration.fn.asMonths = function () {
        return this.as('M');
    };
    moment.duration.fn.asYears = function () {
        return this.as('y');
    };

    /************************************
     Default Locale
     ************************************/


        // Set default locale, other locale will inherit from English.
    moment.locale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                        (b === 2) ? 'nd' :
                            (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    /* EMBED_LOCALES */

    /************************************
     Exposing Moment
     ************************************/

    function makeGlobal(shouldDeprecate) {
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.moment = deprecate(
                'Accessing Moment through the global scope is ' +
                'deprecated, and will be removed in an upcoming ' +
                'release.',
                moment);
        } else {
            globalScope.moment = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === 'function' && define.amd) {
        define(function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                // release the global variable
                globalScope.moment = oldGlobalMoment;
            }

            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);;/* wavesurfer.js v 1.0.16 @license CC-BY 3.0 */
"use strict";var WaveSurfer={defaultParams:{height:128,waveColor:"#999",progressColor:"#555",cursorColor:"#333",cursorWidth:1,skipLength:2,minPxPerSec:20,pixelRatio:window.devicePixelRatio,fillParent:!0,scrollParent:!1,hideScrollbar:!1,normalize:!1,audioContext:null,container:null,dragSelection:!0,loopSelection:!0,audioRate:1,interact:!0,renderer:"Canvas",backend:"WebAudio",mediaType:"audio"},init:function(t){if(this.params=WaveSurfer.util.extend({},this.defaultParams,t),this.container="string"==typeof t.container?document.querySelector(this.params.container):this.params.container,!this.container)throw new Error("Container element not found");if(this.mediaContainer="undefined"==typeof this.params.mediaContainer?this.container:"string"==typeof this.params.mediaContainer?document.querySelector(this.params.mediaContainer):this.params.mediaContainer,!this.mediaContainer)throw new Error("Media Container element not found");this.savedVolume=0,this.isMuted=!1,this.createDrawer(),this.createBackend()},createDrawer:function(){var t=this;this.drawer=Object.create(WaveSurfer.Drawer[this.params.renderer]),this.drawer.init(this.container,this.params),this.drawer.on("redraw",function(){t.drawBuffer(),t.drawer.progress(t.backend.getPlayedPercents())}),this.drawer.on("click",function(e,i){setTimeout(function(){t.seekTo(i)},0)}),this.drawer.on("scroll",function(e){t.fireEvent("scroll",e)})},createBackend:function(){var t=this;this.backend&&this.backend.destroy(),"WebAudio"!=this.params.backend||WaveSurfer.WebAudio.supportsWebAudio()||(this.params.backend="AudioElement"),this.backend=Object.create(WaveSurfer[this.params.backend]),this.backend.init(this.params),this.backend.on("finish",function(){t.fireEvent("finish")}),this.backend.on("audioprocess",function(e){t.fireEvent("audioprocess",e)})},restartAnimationLoop:function(){var t=this,e=window.requestAnimationFrame||window.webkitRequestAnimationFrame,i=function(){t.backend.isPaused()||(t.drawer.progress(t.backend.getPlayedPercents()),e(i))};i()},getDuration:function(){return this.backend.getDuration()},getCurrentTime:function(){return this.backend.getCurrentTime()},play:function(t,e){this.backend.play(t,e),this.restartAnimationLoop(),this.fireEvent("play")},pause:function(){this.backend.pause(),this.fireEvent("pause")},playPause:function(){this.backend.isPaused()?this.play():this.pause()},skipBackward:function(t){this.skip(-t||-this.params.skipLength)},skipForward:function(t){this.skip(t||this.params.skipLength)},skip:function(t){var e=this.getCurrentTime()||0,i=this.getDuration()||1;e=Math.max(0,Math.min(i,e+(t||0))),this.seekAndCenter(e/i)},seekAndCenter:function(t){this.seekTo(t),this.drawer.recenter(t)},seekTo:function(t){var e=this.backend.isPaused(),i=this.params.scrollParent;e&&(this.params.scrollParent=!1),this.backend.seekTo(t*this.getDuration()),this.drawer.progress(this.backend.getPlayedPercents()),e||(this.backend.pause(),this.backend.play()),this.params.scrollParent=i,this.fireEvent("seek",t)},stop:function(){this.pause(),this.seekTo(0),this.drawer.progress(0)},setVolume:function(t){this.backend.setVolume(t)},setPlaybackRate:function(t){this.backend.setPlaybackRate(t)},toggleMute:function(){this.isMuted?(this.backend.setVolume(this.savedVolume),this.isMuted=!1):(this.savedVolume=this.backend.getVolume(),this.backend.setVolume(0),this.isMuted=!0)},toggleScroll:function(){this.params.scrollParent=!this.params.scrollParent,this.drawBuffer()},toggleInteraction:function(){this.params.interact=!this.params.interact},drawBuffer:function(){var t=Math.round(this.getDuration()*this.params.minPxPerSec*this.params.pixelRatio),e=this.drawer.getWidth(),i=t;this.params.fillParent&&(!this.params.scrollParent||e>t)&&(i=e);var r=this.backend.getPeaks(i);this.drawer.drawPeaks(r,i),this.fireEvent("redraw",r,i)},loadArrayBuffer:function(t){var e=this;this.backend.decodeArrayBuffer(t,function(t){e.loadDecodedBuffer(t)},function(){e.fireEvent("error","Error decoding audiobuffer")})},loadDecodedBuffer:function(t){this.empty(),this.backend.load(t),this.drawBuffer(),this.fireEvent("ready")},loadBlob:function(t){var e=this,i=new FileReader;i.addEventListener("progress",function(t){e.onProgress(t)}),i.addEventListener("load",function(t){e.empty(),e.loadArrayBuffer(t.target.result)}),i.addEventListener("error",function(){e.fireEvent("error","Error reading file")}),i.readAsArrayBuffer(t)},load:function(t,e){switch(this.params.backend){case"WebAudio":return this.loadBuffer(t);case"AudioElement":case"MediaElement":return this.loadMediaElement(t,e)}},loadBuffer:function(t){return this.empty(),this.downloadArrayBuffer(t,this.loadArrayBuffer.bind(this))},loadMediaElement:function(t,e){this.empty(),this.backend.load(t,this.mediaContainer,e),this.backend.once("canplay",function(){this.drawBuffer(),this.fireEvent("ready")}.bind(this)),this.backend.once("error",function(t){this.fireEvent("error",t)}.bind(this)),!e&&this.backend.supportsWebAudio()&&this.downloadArrayBuffer(t,function(t){this.backend.decodeArrayBuffer(t,function(t){this.backend.buffer=t,this.drawBuffer()}.bind(this))}.bind(this))},downloadArrayBuffer:function(t,e){var i=this,r=WaveSurfer.util.ajax({url:t,responseType:"arraybuffer"});return r.on("progress",function(t){i.onProgress(t)}),r.on("success",e),r.on("error",function(t){i.fireEvent("error","XHR error: "+t.target.statusText)}),r},onProgress:function(t){if(t.lengthComputable)var e=t.loaded/t.total;else e=t.loaded/(t.loaded+1e6);this.fireEvent("loading",Math.round(100*e),t.target)},exportPCM:function(t,e,i){t=t||1024,e=e||1e4,i=i||!1;var r=this.backend.getPeaks(t,e),s=[].map.call(r,function(t){return Math.round(t*e)/e}),a=JSON.stringify(s);return i||window.open("data:application/json;charset=utf-8,"+encodeURIComponent(a)),a},empty:function(){this.backend.isPaused()||(this.stop(),this.backend.disconnectSource()),this.drawer.progress(0),this.drawer.setWidth(0),this.drawer.drawPeaks({length:this.drawer.getWidth()},0)},destroy:function(){this.fireEvent("destroy"),this.unAll(),this.backend.destroy(),this.drawer.destroy()}};WaveSurfer.Observer={on:function(t,e){this.handlers||(this.handlers={});var i=this.handlers[t];i||(i=this.handlers[t]=[]),i.push(e)},un:function(t,e){if(this.handlers){var i=this.handlers[t];if(i)if(e)for(var r=i.length-1;r>=0;r--)i[r]==e&&i.splice(r,1);else i.length=0}},unAll:function(){this.handlers=null},once:function(t,e){var i=this,r=function(){e.apply(this,arguments),setTimeout(function(){i.un(t,r)},0)};this.on(t,r)},fireEvent:function(t){if(this.handlers){var e=this.handlers[t],i=Array.prototype.slice.call(arguments,1);e&&e.forEach(function(t){t.apply(null,i)})}}},WaveSurfer.util={extend:function(t){var e=Array.prototype.slice.call(arguments,1);return e.forEach(function(e){Object.keys(e).forEach(function(i){t[i]=e[i]})}),t},getId:function(){return"wavesurfer_"+Math.random().toString(32).substring(2)},max:function(t,e){for(var i=-1/0,r=0,s=t.length;s>r;r++){var a=t[r];null!=e&&(a=Math.abs(a-e)),a>i&&(i=a)}return i},ajax:function(t){var e=Object.create(WaveSurfer.Observer),i=new XMLHttpRequest,r=!1;return i.open(t.method||"GET",t.url,!0),i.responseType=t.responseType,i.addEventListener("progress",function(t){e.fireEvent("progress",t),t.lengthComputable&&t.loaded==t.total&&(r=!0)}),i.addEventListener("load",function(t){r||e.fireEvent("progress",t),e.fireEvent("load",t),200==i.status||206==i.status?e.fireEvent("success",i.response,t):e.fireEvent("error",t)}),i.addEventListener("error",function(t){e.fireEvent("error",t)}),i.send(),e.xhr=i,e}},WaveSurfer.util.extend(WaveSurfer,WaveSurfer.Observer),WaveSurfer.WebAudio={scriptBufferSize:256,fftSize:128,PLAYING_STATE:0,PAUSED_STATE:1,FINISHED_STATE:2,supportsWebAudio:function(){return!(!window.AudioContext&&!window.webkitAudioContext)},getAudioContext:function(){return WaveSurfer.WebAudio.audioContext||(WaveSurfer.WebAudio.audioContext=new(window.AudioContext||window.webkitAudioContext)),WaveSurfer.WebAudio.audioContext},getOfflineAudioContext:function(t){return WaveSurfer.WebAudio.offlineAudioContext||(WaveSurfer.WebAudio.offlineAudioContext=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,2,t)),WaveSurfer.WebAudio.offlineAudioContext},init:function(t){this.params=t,this.ac=t.audioContext||this.getAudioContext(),this.lastPlay=this.ac.currentTime,this.startPosition=0,this.states=[Object.create(WaveSurfer.WebAudio.state.playing),Object.create(WaveSurfer.WebAudio.state.paused),Object.create(WaveSurfer.WebAudio.state.finished)],this.setState(this.PAUSED_STATE),this.createVolumeNode(),this.createScriptNode(),this.createAnalyserNode(),this.setPlaybackRate(this.params.audioRate)},disconnectFilters:function(){this.filters&&(this.filters.forEach(function(t){t&&t.disconnect()}),this.filters=null)},setState:function(t){this.state!==this.states[t]&&(this.state=this.states[t],this.state.init.call(this))},setFilter:function(){this.setFilters([].slice.call(arguments))},setFilters:function(t){this.disconnectFilters(),t&&t.length?(this.filters=t,t.reduce(function(t,e){return t.connect(e),e},this.analyser).connect(this.gainNode)):this.analyser.connect(this.gainNode)},createScriptNode:function(){var t=this,e=this.scriptBufferSize;this.scriptNode=this.ac.createScriptProcessor?this.ac.createScriptProcessor(e):this.ac.createJavaScriptNode(e),this.scriptNode.connect(this.ac.destination),this.scriptNode.onaudioprocess=function(){var e=t.getCurrentTime();t.state===t.states[t.PLAYING_STATE]&&t.fireEvent("audioprocess",e),t.buffer&&e>t.getDuration()&&t.setState(t.FINISHED_STATE)}},createAnalyserNode:function(){this.analyser=this.ac.createAnalyser(),this.analyser.fftSize=this.fftSize,this.analyserData=new Uint8Array(this.analyser.frequencyBinCount),this.analyser.connect(this.gainNode)},createVolumeNode:function(){this.gainNode=this.ac.createGain?this.ac.createGain():this.ac.createGainNode(),this.gainNode.connect(this.ac.destination)},setVolume:function(t){this.gainNode.gain.value=t},getVolume:function(){return this.gainNode.gain.value},decodeArrayBuffer:function(t,e,i){this.offlineAc||(this.offlineAc=this.getOfflineAudioContext(this.ac?this.ac.sampleRate:44100)),this.offlineAc.decodeAudioData(t,function(t){e(t)}.bind(this),i)},getPeaks:function(t){for(var e=this.buffer,i=e.length/t,r=~~(i/10)||1,s=e.numberOfChannels,a=new Float32Array(t),n=0;s>n;n++)for(var o=e.getChannelData(n),h=0;t>h;h++){for(var u=~~(h*i),c=~~(u+i),d=0,l=u;c>l;l+=r){var f=o[l];f>d?d=f:-f>d&&(d=-f)}(0==n||d>a[h])&&(a[h]=d)}return a},getPlayedPercents:function(){return this.state.getPlayedPercents.call(this)},disconnectSource:function(){this.source&&this.source.disconnect()},waveform:function(){return this.analyser.getByteTimeDomainData(this.analyserData),this.analyserData},destroy:function(){this.isPaused()||this.pause(),this.unAll(),this.buffer=null,this.disconnectFilters(),this.disconnectSource(),this.gainNode.disconnect(),this.scriptNode.disconnect(),this.analyser.disconnect()},load:function(t){this.startPosition=0,this.lastPlay=this.ac.currentTime,this.buffer=t,this.createSource()},createSource:function(){this.disconnectSource(),this.source=this.ac.createBufferSource(),this.source.start=this.source.start||this.source.noteGrainOn,this.source.stop=this.source.stop||this.source.noteOff,this.source.playbackRate.value=this.playbackRate,this.source.buffer=this.buffer,this.source.connect(this.analyser)},isPaused:function(){return this.state!==this.states[this.PLAYING_STATE]},getDuration:function(){return void 0===this.buffer?0:this.buffer.duration},seekTo:function(t,e){return null==t&&(t=this.getCurrentTime(),t>=this.getDuration()&&(t=0)),null==e&&(e=this.getDuration()),this.startPosition=t,this.lastPlay=this.ac.currentTime,this.state===this.states[this.FINISHED_STATE]&&this.setState(this.PAUSED_STATE),{start:t,end:e}},getPlayedTime:function(){return(this.ac.currentTime-this.lastPlay)*this.playbackRate},play:function(t,e){this.createSource();var i=this.seekTo(t,e);t=i.start,e=i.end,this.source.start(0,t,e-t),this.setState(this.PLAYING_STATE)},pause:function(){this.startPosition+=this.getPlayedTime(),this.source&&this.source.stop(0),this.setState(this.PAUSED_STATE)},getCurrentTime:function(){return this.state.getCurrentTime.call(this)},setPlaybackRate:function(t){t=t||1,this.isPaused()?this.playbackRate=t:(this.pause(),this.playbackRate=t,this.play())}},WaveSurfer.WebAudio.state={},WaveSurfer.WebAudio.state.playing={init:function(){},getPlayedPercents:function(){var t=this.getDuration();return this.getCurrentTime()/t||0},getCurrentTime:function(){return this.startPosition+this.getPlayedTime()}},WaveSurfer.WebAudio.state.paused={init:function(){},getPlayedPercents:function(){var t=this.getDuration();return this.getCurrentTime()/t||0},getCurrentTime:function(){return this.startPosition}},WaveSurfer.WebAudio.state.finished={init:function(){this.fireEvent("finish")},getPlayedPercents:function(){return 1},getCurrentTime:function(){return this.getDuration()}},WaveSurfer.util.extend(WaveSurfer.WebAudio,WaveSurfer.Observer),WaveSurfer.MediaElement=Object.create(WaveSurfer.WebAudio),WaveSurfer.util.extend(WaveSurfer.MediaElement,{init:function(t){this.params=t,this.media={currentTime:0,duration:0,paused:!0,playbackRate:1,play:function(){},pause:function(){}},this.mediaType=t.mediaType.toLowerCase(),this.ac=t.audioContext||this.getAudioContext(),this.elementPosition=t.elementPosition},load:function(t,e,i){var r=this,s=document.createElement(this.mediaType);s.controls=!1,s.autoplay=!1,s.preload="auto",s.src=t,s.addEventListener("error",function(){r.fireEvent("error","Error loading media element")}),s.addEventListener("canplay",function(){r.fireEvent("canplay")}),s.addEventListener("ended",function(){r.fireEvent("finish")}),s.addEventListener("timeupdate",function(){r.fireEvent("audioprocess",r.getCurrentTime())});var a=e.querySelector(this.mediaType);a&&e.removeChild(a),e.appendChild(s),this.media=s,this.peaks=i,this.setPlaybackRate(this.playbackRate)},isPaused:function(){return this.media.paused},getDuration:function(){var t=this.media.duration;return t>=1/0&&(t=this.media.seekable.end()),t},getCurrentTime:function(){return this.media.currentTime},getPlayedPercents:function(){return this.getCurrentTime()/this.getDuration()||0},setPlaybackRate:function(t){this.playbackRate=t||1,this.media.playbackRate=this.playbackRate},seekTo:function(t){null!=t&&(this.media.currentTime=t)},play:function(t){this.seekTo(t),this.media.play()},pause:function(){this.media.pause()},getPeaks:function(t){return this.buffer?WaveSurfer.WebAudio.getPeaks.call(this,t):this.peaks||[]},getVolume:function(){return this.media.volume},setVolume:function(t){this.media.volume=t},destroy:function(){this.pause(),this.unAll(),this.media.parentNode&&this.media.parentNode.removeChild(this.media),this.media=null}}),WaveSurfer.AudioElement=WaveSurfer.MediaElement,WaveSurfer.Drawer={init:function(t,e){this.container=t,this.params=e,this.width=0,this.height=e.height*this.params.pixelRatio,this.lastPos=0,this.createWrapper(),this.createElements()},createWrapper:function(){this.wrapper=this.container.appendChild(document.createElement("wave")),this.style(this.wrapper,{display:"block",position:"relative",userSelect:"none",webkitUserSelect:"none",height:this.params.height+"px"}),(this.params.fillParent||this.params.scrollParent)&&this.style(this.wrapper,{width:"100%",overflowX:this.params.hideScrollbar?"hidden":"auto",overflowY:"hidden"}),this.setupWrapperEvents()},handleEvent:function(t){t.preventDefault();var e=this.wrapper.getBoundingClientRect();return(t.clientX-e.left+this.wrapper.scrollLeft)/this.wrapper.scrollWidth||0},setupWrapperEvents:function(){var t=this;this.wrapper.addEventListener("click",function(e){var i=t.wrapper.offsetHeight-t.wrapper.clientHeight;if(0!=i){var r=t.wrapper.getBoundingClientRect();if(e.clientY>=r.bottom-i)return}t.params.interact&&t.fireEvent("click",e,t.handleEvent(e))}),this.wrapper.addEventListener("scroll",function(e){t.fireEvent("scroll",e)})},drawPeaks:function(t,e){if(this.resetScroll(),this.setWidth(e),this.params.normalize)var i=WaveSurfer.util.max(t);else i=1;this.drawWave(t,i)},style:function(t,e){return Object.keys(e).forEach(function(i){t.style[i]!=e[i]&&(t.style[i]=e[i])}),t},resetScroll:function(){null!==this.wrapper&&(this.wrapper.scrollLeft=0)},recenter:function(t){var e=this.wrapper.scrollWidth*t;this.recenterOnPosition(e,!0)},recenterOnPosition:function(t,e){var i=this.wrapper.scrollLeft,r=~~(this.wrapper.clientWidth/2),s=t-r,a=s-i,n=this.wrapper.scrollWidth-this.wrapper.clientWidth;if(0!=n){if(!e&&a>=-r&&r>a){var o=5;a=Math.max(-o,Math.min(o,a)),s=i+a}s=Math.max(0,Math.min(n,s)),s!=i&&(this.wrapper.scrollLeft=s)}},getWidth:function(){return Math.round(this.container.clientWidth*this.params.pixelRatio)},setWidth:function(t){t!=this.width&&(this.width=t,this.params.fillParent||this.params.scrollParent?this.style(this.wrapper,{width:""}):this.style(this.wrapper,{width:~~(this.width/this.params.pixelRatio)+"px"}),this.updateWidth())},progress:function(t){var e=1/this.params.pixelRatio,i=Math.round(t*this.width)*e;if(i<this.lastPos||i-this.lastPos>=e){if(this.lastPos=i,this.params.scrollParent){var r=~~(this.wrapper.scrollWidth*t);this.recenterOnPosition(r)}this.updateProgress(t)}},destroy:function(){this.unAll(),this.container.removeChild(this.wrapper),this.wrapper=null},createElements:function(){},updateWidth:function(){},drawWave:function(){},clearWave:function(){},updateProgress:function(){}},WaveSurfer.util.extend(WaveSurfer.Drawer,WaveSurfer.Observer),WaveSurfer.Drawer.Canvas=Object.create(WaveSurfer.Drawer),WaveSurfer.util.extend(WaveSurfer.Drawer.Canvas,{createElements:function(){var t=this.wrapper.appendChild(this.style(document.createElement("canvas"),{position:"absolute",zIndex:1}));if(this.waveCc=t.getContext("2d"),this.progressWave=this.wrapper.appendChild(this.style(document.createElement("wave"),{position:"absolute",zIndex:2,overflow:"hidden",width:"0",height:this.params.height+"px",borderRightStyle:"solid",borderRightWidth:this.params.cursorWidth+"px",borderRightColor:this.params.cursorColor})),this.params.waveColor!=this.params.progressColor){var e=this.progressWave.appendChild(document.createElement("canvas"));this.progressCc=e.getContext("2d")}},updateWidth:function(){var t=Math.round(this.width/this.params.pixelRatio);this.waveCc.canvas.width=this.width,this.waveCc.canvas.height=this.height,this.style(this.waveCc.canvas,{width:t+"px"}),this.progressCc&&(this.progressCc.canvas.width=this.width,this.progressCc.canvas.height=this.height,this.style(this.progressCc.canvas,{width:t+"px"})),this.clearWave()},clearWave:function(){this.waveCc.clearRect(0,0,this.width,this.height),this.progressCc&&this.progressCc.clearRect(0,0,this.width,this.height)},drawWave:function(t,e){var i=.5/this.params.pixelRatio,r=this.height/2,s=r/e,a=t.length,n=1;this.params.fillParent&&this.width!=a&&(n=this.width/a),this.waveCc.fillStyle=this.params.waveColor,this.progressCc&&(this.progressCc.fillStyle=this.params.progressColor),[this.waveCc,this.progressCc].forEach(function(e){if(e){e.beginPath(),e.moveTo(i,r);for(var o=0;a>o;o++){var h=Math.round(t[o]*s);e.lineTo(o*n+i,r+h)}e.lineTo(this.width+i,r),e.moveTo(i,r);for(var o=0;a>o;o++){var h=Math.round(t[o]*s);e.lineTo(o*n+i,r-h)}e.lineTo(this.width+i,r),e.fill(),e.fillRect(0,r-i,this.width,i)}},this)},updateProgress:function(t){var e=Math.round(this.width*t)/this.params.pixelRatio;this.style(this.progressWave,{width:e+"px"})}});
//# sourceMappingURL=wavesurfer-js-map.json