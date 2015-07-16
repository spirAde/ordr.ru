<?php
namespace backend\controllers;

use Yii;
use common\components\ApiHelpers;
use yii\helpers\ArrayHelper;
use yii\helpers\Url;
use backend\models\BathhouseBooking;
use yii\web\BadRequestHttpException;
use yii\web\ServerErrorHttpException;

class OrderController extends ApiController
{

    public $modelClass = 'backend\models\BathhouseBooking';
    public $serializer = [
        'class' => 'yii\rest\Serializer',
        'collectionEnvelope' => 'items',
    ];

    public function actions()
    {
        return ArrayHelper::merge(parent::actions(),[
            'create' => [],
        ]);
    }

    public function beforeAction($action)
    {
        \Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return parent::beforeAction($action);
    }

    public function actionCreate()
    {

        $model = new BathhouseBooking();
        $model->load(Yii::$app->getRequest()->getBodyParams(), '');

        if(ApiHelpers::checkOrder($model))
        {
            //$transaction = BathhouseBooking::getDb()->beginTransaction();
            if ($model->save())
            {
                $model->manager_id = Yii::$app->user->identity->id;
                $model->bathhouse_id = Yii::$app->user->identity->organization_id;
                $response = Yii::$app->getResponse();
                $response->setStatusCode(201);
                $id = implode(',', array_values($model->getPrimaryKey(true)));
                //$response->getHeaders()->set('Location', Url::toRoute([$this->viewAction, 'id' => $id], true));
            }
            elseif (!$model->hasErrors())
            {
                throw new ServerErrorHttpException('Failed to create the object for unknown reason.');
            }
            if(ApiHelpers::reformScheduleForDay($model->room_id, $model->start_date, $model->end_date))
            {
               // $transaction->commit();
                return $model;
            }
            else
            {
                //$transaction->rollBack();
                throw new ServerErrorHttpException('Schedule forming error. Order not saved');
            }
        }
        else
            throw new BadRequestHttpException('Order time is busy');
    }
}