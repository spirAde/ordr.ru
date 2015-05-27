<?php
namespace api\controllers;

use Yii;
use yii\data\ActiveDataProvider;

class RoomController extends ApiController
{
    public $modelClass = 'api\models\BathhouseRoom';
    public $serializer = [
        'class' => 'yii\rest\Serializer',
        'collectionEnvelope' => 'items',
    ];

}