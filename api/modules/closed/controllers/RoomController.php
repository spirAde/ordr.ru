<?php
namespace api\modules\closed\controllers;

use Yii;

class RoomController extends ApiController
{

    public $modelClass = 'api\modules\closed\models\BathhouseRoom';
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