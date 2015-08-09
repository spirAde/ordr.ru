<?php
namespace api\modules\closed\controllers;

use api\modules\closed\models\Bathhouse;
use yii\data\ActiveDataProvider;
use Yii;
use yii\web\UnauthorizedHttpException;

class BathhouseController extends ApiController
{

    public $modelClass = 'api\modules\closed\models\Bathhouse';
    public $serializer = [
        'class' => 'yii\rest\Serializer',
        'collectionEnvelope' => 'items',
    ];

    public function checkAccess($action, $model = null, $params = [])
    {
        if($action == 'view')
            if($model->id !== Yii::$app->user->identity->organization_id)
                throw new UnauthorizedHttpException('Unauthorized request');
    }

}