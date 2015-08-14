<?php $this->beginPage() ?>

<!doctype html>
<html lang="ru" ng-app="controlApp">

<head>

    <base href="/" />

    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale = 1.0, user-scalable = no" />

    <title>control.ordr.ru</title>

    <?php $this->head() ?>

    <link rel="stylesheet" type="text/css" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle.css" />
    <link rel="icon" type="image/png" href="<?php echo \Yii::$app->request->baseUrl; ?>/build/images/icons/logo.png">

</head>

<body>

    <?php $this->beginBody() ?>

    <div ui-view></div>

    <?php $this->endBody() ?>

    <script src="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle.js"></script>
    <script async src="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle-libs.js"></script>
    <script async src="<?php echo \Yii::$app->request->baseUrl; ?>/build/templates.js"></script>

</body>

</html>

<?php $this->endPage() ?>