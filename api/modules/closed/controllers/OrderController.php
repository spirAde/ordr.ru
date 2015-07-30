<?php
namespace api\modules\closed\controllers;

use Yii;
use common\components\ApiHelpers;
use yii\helpers\ArrayHelper;
use yii\helpers\OrdrHelper;
use yii\helpers\Url;
use api\modules\closed\models\BathhouseBooking;
use yii\web\BadRequestHttpException;
use yii\web\ServerErrorHttpException;

class OrderController extends ApiController
{

    public $modelClass = 'api\modules\closed\models\BathhouseBooking';
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

    public function actionSorted()
    {
        $filter = yii::$app->request->get();
        $model = new BathhouseBooking();

        $limit = (isset($filter['limit'])) ? $filter['limit'] : 100;
        $page = (isset($filter['page'])) ? $filter['page'] : 1;
        $offset = $limit * $page - $limit;
        $date_filters = [];
        foreach ($filter as $key => $value)
        {
            if(in_array($key, $this->pattern))
            {
                unset($filter[$key]);
                continue;
            }
            if($key === 'start' or $key === 'end')
            {
                $date_filters[$key] = $value;
                unset($filter[$key]);
            }
        }
        try
        {

            $query = $model::find();

            $query->andWhere('bathhouse_id = :bathhouse_id', [':bathhouse_id' => yii::$app->user->identity->organization_id]);

            foreach($filter as $key => $item)
                $query->andWhere($key . '=' . $item);

            if(!empty($date_filters) and is_array($date_filters) and isset($date_filters['start']) and isset($date_filters['end'])
                and strtotime($date_filters['start']) !== false and strtotime($date_filters['end']) !== false)
            {
                $query->andWhere('start_date BETWEEN STR_TO_DATE(:start, "%Y-%m-%d")
                            AND STR_TO_DATE(:end, "%Y-%m-%d")',
                    [
                    ':start'    => date('Y-m-d',strtotime($date_filters['start'])),
                    ':end'      => date('Y-m-d',strtotime($date_filters['end'])),
                    ]
                );
            }
            $query->limit = $limit;
            $query->offset = $offset;
            $orders = $query->indexBy('id')->asArray()->all();

            $orders_sorted = [];
            foreach($orders as $order)
            {
                $oneDay = $order['start_date'] === $order['end_date'];
                $orders_sorted[$order['start_date']][] = [
                    'id'                => $order['id'],
                    'startDate'         => $order['start_date'],
                    'endDate'           => ($oneDay) ? $order['end_date'] : $order['start_date'],
                    'startPeriod'       => $order['start_period'],
                    'endPeriod'         => ($oneDay) ? $order['end_period'] : OrdrHelper::LAST_TIME_ID,
                    'services'          => $order['services'],
                    'guests'            => $order['guests'],
                    'comment'           => $order['comment'],
                    'costPeriod'        => $order['cost_period'],
                    'costServices'      => $order['cost_services'],
                    'costGuests'        => $order['cost_guests'],
                    'total'             => $order['total'],
                    'statusId'          => $order['status_id'],
                    'roomId'            => $order['room_id'],
                    'bathhouseId'       => $order['bathhouse_id'],
                    'oneDay'            => $oneDay
                ];
                if(!$oneDay)
                {
                    $orders_sorted[$order['end_date']][] = [
                        'id'            => $order['id'],
                        'startDate'     => $order['end_date'],
                        'endDate'       => $order['end_date'],
                        'startPeriod'   => OrdrHelper::FIRST_TIME_ID,
                        'endPeriod'     => $order['end_period'],
                        'services'      => $order['services'],
                        'guests'        => $order['guests'],
                        'comment'       => $order['comment'],
                        'costPeriod'    => $order['cost_period'],
                        'costServices'  => $order['cost_services'],
                        'costGuests'    => $order['cost_guests'],
                        'total'         => $order['total'],
                        'statusId'      => $order['status_id'],
                        'roomId'        => $order['room_id'],
                        'bathhouseId'   => $order['bathhouse_id'],
                        'oneDay'        => $oneDay
                    ];
                }
            }
            return $orders_sorted;


        }
        catch (Exception $ex)
        {
            throw new HttpException(500, 'Internal server error');
        }
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