<?php
return [
    'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
    'components' => [
        'cache' => [
            'class' => 'yii\caching\FileCache',
        ],
        /*'authManager' => [
            'class' => 'yii\rbac\PhpManager',
            'defaultRoles' => ['admin', 'manager', 'guest'],
            'itemFile' => '@console/data/items.php',
            'assignmentFile' => '@console/data/assignments.php',
            'ruleFile' => '@console/data/rules.php'
        ],*/
    ],
];

