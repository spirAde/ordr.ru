<?php $this->beginPage() ?>

<!doctype html>
<html lang="ru" ng-app="app">
<head>

    <base href="/" />

    <meta charset="utf-8" />

    <title>ordr.ru</title>

    <?php $this->head() ?>

    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/images/icons/apple-touch-icon-144-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/images/icons/apple-touch-icon-114-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/images/icons/apple-touch-icon-72-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/images/icons/apple-touch-icon-57-precomposed.png" />
    <link rel="icon" type="image/png" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/images/icons/favicon.png">

    <link rel="stylesheet" type="text/css" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle.css" />
</head>

<body>

    <?php $this->beginBody() ?>

    <div ui-view ng-class="front"></div>

    <script>var _PRELOAD = <?php echo $content?>;</script>

    <script src="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle-libs.js"></script>
    <script src="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle.js"></script>
    <script src="<?php echo \Yii::$app->request->baseUrl; ?>/build/templates.js"></script>

    <?php $this->endBody() ?>

</body>

</html>

<?php $this->endPage() ?>