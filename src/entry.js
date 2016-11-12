// Vendor code
$ = jQuery = require('jquery');
var angular = require('angular');
var ngUIRouter = require('angular-ui-router');
require('moment');

//app
var app = require('app');

//Configs
require('configs/routes');
// Controllers
require('controllers/MainCtrl');
require('controllers/PostCtrl');
require('controllers/PublishCtrl');
require('controllers/WaveSurferController');
// Directives

require('directives/angular-upload');
require('directives/wavesurfer');

//Services
require('services/QueryService');
// Templates

require('listposts.html');
require('newpost.html');
require('stylesheets.less');

// Vendors

require('vendors/cg-busy.js');
require('vendors/infinite-scroll.js')
require('moment');