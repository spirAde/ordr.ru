<?php $this->beginPage() ?>

<!doctype html>
<html lang="ru" ng-app="app">

<head>

    <base href="/" />

    <meta charset="utf-8" />
    <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />

    <title>ordr.ru</title>

    <?php $this->head() ?>

    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/images/icons/apple-touch-icon-144-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/images/icons/apple-touch-icon-114-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/images/icons/apple-touch-icon-72-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/images/icons/apple-touch-icon-57-precomposed.png" />
    <link rel="icon" type="image/png" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/images/icons/favicon.png">

    <link rel="stylesheet" type="text/css" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle.css" />
    <link href='https://api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.css' rel='stylesheet' />
</head>

<body>

    <?php $this->beginBody() ?>

    <div ui-view></div>

    <script>var _PRELOAD = <?php echo $content?>;</script>

    <script src="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle-libs.js"></script>
    <script async src="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle.js"></script>
    <script async src="<?php echo \Yii::$app->request->baseUrl; ?>/build/templates.js"></script>

    <script async src='https://api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.js'></script>

    <?php $this->endBody() ?>

</body>

</html>

<?php $this->endPage() ?>