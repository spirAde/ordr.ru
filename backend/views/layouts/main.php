<!doctype html>
<html lang="ru" ng-app="ordrControlApp">
<head>
    <base href="/" />
    <meta charset="utf-8" />

    <title>control.ordr.ru</title>
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="<?php echo \Yii::$app->request->baseUrl; ?>/images/icons/apple-touch-icon-144-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="<?php echo \Yii::$app->request->baseUrl; ?>/images/icons/apple-touch-icon-114-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?php echo \Yii::$app->request->baseUrl; ?>/images/icons/apple-touch-icon-72-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" href="<?php echo \Yii::$app->request->baseUrl; ?>/images/icons/apple-touch-icon-57-precomposed.png" />
    <link rel="icon" type="image/png" href="<?php echo \Yii::$app->request->baseUrl; ?>/images/icons/favicon.png" />

    <script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/loadCSS/loadCSS.min.js"></script>
    <script>
        //loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/animate.css");
        //loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/bootstrap.css");
        //loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/font-awesome.min.css");
        //loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/simple-line-icons.css");
        //loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/font.css");
        //loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/style.css");

        //loadCSS("https://fontastic.s3.amazonaws.com/vqUUEo2akVTsMxx4EATUhZ/icons.css");
        loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/scroll.css");
        loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/icons.css");
        loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/carousel.css");
        loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/angular-debug-bar.css");
        //loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/bootstrap-datepaginator.css");
        loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/overlay.css");
        loadCSS("<?php echo \Yii::$app->request->baseUrl; ?>/css/admin.css");
    </script>
</head>

<body>

<?php
/*$free = [
    '2015-01-18' => [
        0 => []
    ],
    1 => [
        'free_time' => 'YToxOntpOjA7YToyOntpOjA7czoxOiI2IjtpOjE7aToxNDQ7fX0=',
        'date' => '2015-01-19'
    ]
];

\yii\helpers\VarDumper::dump(\yii\helpers\OrdrHelper::checkFreeTime($free, 138, 6));
*/?>

<div ui-view></div>

<angular-debug-bar></angular-debug-bar>

<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/jquery/jquery-2.1.1.min.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/lodash/lodash.min.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/lodash/mixins.js"></script>

<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/momentjs/moment-with-locales.min.js"></script>

<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/angular/angular.min.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/angular/angular-ui-router.min.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/angular-adaptive-detection/angular-adaptive-detection.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/angular-base64/angular-base64.js"></script>

<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/socket/socket.io.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/jquery.perfect-scrollbar/perfect-scrollbar.js"></script>

<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/controllers/manager/page.js"></script>

<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/services/authservice.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/services/orderservice.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/services/dataservice.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/services/socketservice.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/services/logservice.js"></script>

<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/directives/timeCalendarCarousel.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/directives/selectServices.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/directives/datepaginator.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/angular-dialog/ngDialog.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/angular-perfect-scrollbar/angular-perfect-scrollbar.js"></script>

<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/controllers/admin/adminPage.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/controllers/admin/header.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/controllers/admin/aside.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/controllers/admin/content.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/controllers/admin/footer.js"></script>

<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/jquery.owl.carousel.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/jquery.mousewheel.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/bootstrap.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/bootstrap-datepicker.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/bootstrap-datepaginator.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/libs/angular-debug-bar.js"></script>

<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/filters/periodToTime.js"></script>
<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/filters/timeToPeriod.js"></script>

<script src="<?php echo \Yii::$app->request->baseUrl; ?>/js/app.js"></script>

</body>
</html>