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
        'open' => [
            'basePath' => '@api/modules/open',
            'class' => 'api\modules\open\Open'
        ],
        'closed' => [
            'basePath' => '@api/modules/closed',
            'class' => 'api\modules\closed\Closed'
        ]
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
                //open api routes
                'GET bathhouses'            => 'open/bathhouse/index',
                'GET bathhouses/<id:\d+>'   => 'open/bathhouse/view',

                'GET rooms'                 => 'open/room/index',
                'GET rooms/<id:\d+>'        => 'open/room/view',

                // end open api routes
                // closed api routes
                'closed/login'  => 'closed/login/index',
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'closed/room',
                    'patterns' => [
                        'GET '                   => 'index',
                        'GET <id:\d+>'           => 'index',
                    ]
                ],
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'closed/order',
                    'patterns' => [
                        'GET'                   => 'index',
                        'POST'                  => 'create',
                        'DELETE <id:\d+>'       => 'delete',
                    ]
                ],
                // end closed api routes
            ],
        ]
    ],
    'params' => $params,
];