<?php
namespace api\controllers;

use yii\rest\ActiveController;

class ApiController extends ActiveController
{
    public function actions()
    {
        return [
            'index' => [
                'class' => 'api\components\actions\FilterIndexAction',
                'modelClass' => $this->modelClass,
                'checkAccess' => [$this, 'checkAccess'],
            ]
        ];
    }
}