<?php $this->beginPage() ?>

<!doctype html>
<html lang="ru" ng-app="controlApp">

<head>

    <base href="/" />

    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale = 1.0, user-scalable = no" />

    <title>control.ordr.ru</title>

    <?php $this->head() ?>

    <script>

        function loadCSS(e,n,o,t){"use strict";var d=window.document.createElement("link"),i=n||window.document.getElementsByTagName("script")[0],r=window.document.styleSheets;return d.rel="stylesheet",d.href=e,d.media="only x",t&&(d.onload=t),i.parentNode.insertBefore(d,i),d.onloadcssdefined=function(e){for(var n,o=0;o<r.length;o++)r[o].href&&r[o].href===d.href&&(n=!0);n?e():setTimeout(function(){d.onloadcssdefined(e)})},d.onloadcssdefined(function(){d.media=o||"all"}),d}
        loadCSS('build/bundle-uncritical.css');
    </script>

    <noscript><link href="build/bundle-uncritical.css" rel="stylesheet"></noscript>

    <link rel="stylesheet" type="text/css" href="build/bundle.css" />
    <link rel="icon" type="image/png" href="build/images/icons/logo.png">

</head>

<body>

    <?php $this->beginBody() ?>

    <div ui-view></div>

    <?php $this->endBody() ?>

    <script src="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle-libs.js"></script>
    <script async defer src="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle.js"></script>
    <script async defer src="<?php echo \Yii::$app->request->baseUrl; ?>/build/templates.js"></script>

</body>

</html>

<?php $this->endPage() ?>