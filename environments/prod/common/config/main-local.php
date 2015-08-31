<?php
return [
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:host=localhost;dbname=ordrDB',
            'username' => 'root',
            'password' => 'dpeJHM~7l',
            'charset' => 'utf8',
        ],
        'mailer' => [
            'class' => 'yii\swiftmailer\Mailer',
            'viewPath' => '@common/mail',
        ],
        'cache' => [
            'class' => 'yii\caching\FileCache',
        ],
    ],
];
