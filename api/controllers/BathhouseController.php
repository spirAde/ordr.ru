<?php
namespace api\controllers;

use api\models\Bathhouse;
use yii\data\ActiveDataProvider;

class BathhouseController extends ApiController
{

    public $modelClass = 'api\models\Bathhouse';
    public $serializer = [
        'class' => 'yii\rest\Serializer',
        'collectionEnvelope' => 'items',
    ];

    public function actionGeo()
    {
        $api_city_id = \Yii::$app->request->get('city_id');

        return new ActiveDataProvider([
            'query' => Bathhouse::find()->andWhere('city_id = :city_id',[':city_id'=>$api_city_id]),
        ]);
    }

}