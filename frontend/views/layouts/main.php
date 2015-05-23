<?php $this->beginPage() ?>

<!doctype html>
<html lang="ru">
<head>
    <base href="/" />
    <meta name="fragment" content="!" />
    <meta charset="utf-8" />

    <title>ordr.ru</title>

    <?php $this->head() ?>

    <!--<link rel="apple-touch-icon-precomposed" sizes="144x144" href="<?php /*echo \Yii::$app->request->baseUrl; */?>/images/icons/apple-touch-icon-144-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="<?php /*echo \Yii::$app->request->baseUrl; */?>/images/icons/apple-touch-icon-114-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?php /*echo \Yii::$app->request->baseUrl; */?>/images/icons/apple-touch-icon-72-precomposed.png" />
    <link rel="apple-touch-icon-precomposed" href="<?php /*echo \Yii::$app->request->baseUrl; */?>/images/icons/apple-touch-icon-57-precomposed.png" />
    <link rel="icon" type="image/png" href="<?php /*echo \Yii::$app->request->baseUrl; */?>/images/icons/favicon.png">-->

    <!--<link rel="stylesheet" type="text/css" href="/build/bundle.css" />-->

    <!--<title><?php /*echo \yii\helpers\Html::encode($this->pageTitle); */?></title>-->
    <!--<script>var _PRELOAD = <?php /*echo $preload*/?>;</script>-->
</head>

<body>

    <?php $this->beginBody() ?>

    <div ui-view></div>

    <script>var _PRELOAD = <?php echo $content?>;</script>

    <?php $this->endBody() ?>

</body>

</html>

<?php $this->endPage() ?>