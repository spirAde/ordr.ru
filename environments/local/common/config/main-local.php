<?php
return [
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:host=localhost;dbname=ordrDB',
            'username' => 'root',
            'password' => 'root',
            'charset' => 'utf8',
        ],
        'mailer' => [
            'class' => 'yii\swiftmailer\Mailer',
            'viewPath' => '@common/mail',
            'useFileTransport' => true,
        ],
        'cache' => [
            'class' => 'yii\caching\DummyCache',
        ],
        /*       'cache' => [
           'class' => 'yii\caching\MemCache',
           'servers' => [
               [
                   'host' => 'server1',
                   'port' => 11211,
                   'weight' => 100,
               ],
               [
                   'host' => 'server2',
                   'port' => 11211,
                   'weight' => 50,
               ],
           ],
       ],*/
    ],
];
