<?php $this->beginPage() ?>

    <!doctype html>
    <html lang="ru" ng-app="controlApp">
    <head>

        <base href="/" />

        <meta charset="utf-8" />

        <title>control.ordr.ru</title>

        <?php $this->head() ?>

    </head>

    <body>

    <?php $this->beginBody() ?>

    <div ui-view></div>

    <?php $this->endBody() ?>

    <script src="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle-libs.js"></script>
    <script src="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle.js"></script>
    <script src="<?php echo \Yii::$app->request->baseUrl; ?>/build/templates.js"></script>

    </body>

    </html>

<?php $this->endPage() ?>