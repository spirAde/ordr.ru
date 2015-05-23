<?php
return [
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:host=127.0.0.1;dbname=ordrDB',
            'username' => 'root',
            'password' => 'root',
            'charset' => 'utf8',
        ]
    ],
];