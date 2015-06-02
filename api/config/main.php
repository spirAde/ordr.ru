<?php
$params = array_merge(
    require(__DIR__ . '/../../common/config/params.php'),
    require(__DIR__ . '/../../common/config/params-local.php'),
    require(__DIR__ . '/params.php'),
    require(__DIR__ . '/params-local.php')
);

return [
    'id' => 'app-api',
    'basePath' => dirname(__DIR__),
    'controllerNamespace' => 'api\controllers',
    'bootstrap' => ['log'],
    'modules' => [
    ],
    'components' => [
        /*'controllerMap' => [
            'api' => [
                'class' => 'api\controllers\ApiController'
            ]
        ],*/
        'response' => [
            'class' => 'yii\web\Response',
            'format' => yii\web\Response::FORMAT_JSON,
            'charset' => 'UTF-8',
            /*'on beforeSend' => function($event) {

                // Вынужденная мера для работы angular && cors && Yii2
                if (\Yii::$app->request->getMethod() === 'OPTIONS') {
                    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']) &&
                        ($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'] === 'GET' ||
                        $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'] === 'POST' ||
                        $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'] === 'DELETE')) {
                        header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Authorization');
                    }
                    exit;
                }
            }*/
        ],
        'user' => [
            'identityClass' => 'common\models\User',
            'enableSession' => false,
            'enableAutoLogin' => false,
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        /*'errorHandler' => [
            'class' => 'api\components\ApiErrorHandler',
            'errorAction' => 'site/error'
        ],*/
        'request' => [
            'class' => '\yii\web\Request',
            'enableCookieValidation' => false,
            'enableCsrfValidation' => false,
            'enableCsrfCookie' => false,
            'on beforeRequest' => function($event) {
            },
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ]
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'enableStrictParsing' => true,
            'showScriptName' => false,
            'rules' => [
                [
                    'class' => 'yii\rest\UrlRule',
                    'except' => ['delete', 'update', 'create', 'options'],
                    'controller' => 'bathhouse',
                    'patterns' => [
                        'GET'                   => 'index',
                        'GET <id:\d+>'          => 'view',
                        'GET geo/<city_id:\d+>' => 'geo'
                    ]
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'room',
                    'patterns' => [
                        'GET'                   => 'index',
                        'GET <id:\d+>'          => 'view',
                    ]
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'order',
                    'patterns' => [
                        'POST'                  => 'check',
                    ]
                ],
            ],
        ]
    ],
    'params' => $params,
];