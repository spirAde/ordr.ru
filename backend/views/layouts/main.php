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

        function loadCSS(href, before, media, callback) {
            'use strict';

            var ss = window.document.createElement('link');
            var ref = before || window.document.getElementsByTagName('script')[0];
            var sheets = window.document.styleSheets;

            ss.rel = 'stylesheet';
            ss.href = href;
            ss.media = 'only x';

            if(callback) {
                ss.onload = callback;
            }

            ref.parentNode.insertBefore(ss, ref);

            ss.onloadcssdefined = function(cb) {
                var defined;

                for (var i = 0; i < sheets.length; i++) {
                    if (sheets[i].href && sheets[i].href === ss.href) {
                        defined = true;
                    }
                }

                if (defined) {
                    cb();
                }
                else {
                    setTimeout(function() {
                        ss.onloadcssdefined(cb);
                    });
                }
            };
            ss.onloadcssdefined(function() {
                ss.media = media || 'all';
            });
            return ss;
        }

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
    <script src="<?php echo \Yii::$app->request->baseUrl; ?>/build/bundle.js"></script>
    <script async defer src="<?php echo \Yii::$app->request->baseUrl; ?>/build/templates.js"></script>

</body>

</html>

<?php $this->endPage() ?>