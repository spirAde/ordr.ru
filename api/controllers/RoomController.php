<?php
namespace api\controllers;

use Yii;

class RoomController extends ApiController
{

    public $modelClass = 'api\models\BathhouseRoom';
    public $serializer = [
        'class' => 'yii\rest\Serializer',
        'collectionEnvelope' => 'items',
    ];

    public function beforeAction($action)
    {
        \Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return parent::beforeAction($action);
    }

}