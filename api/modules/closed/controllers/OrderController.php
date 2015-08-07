<?php
namespace api\modules\closed\controllers;

use Yii;
use common\components\ApiHelpers;
use yii\helpers\ArrayHelper;
use yii\helpers\Json;
use yii\helpers\OrdrHelper;
use yii\helpers\Url;
use api\modules\closed\models\BathhouseBooking;
use yii\web\BadRequestHttpException;
use yii\web\ServerErrorHttpException;
use yii\web\HttpException;
use yii\web\UnauthorizedHttpException;

class OrderController extends ApiController
{

    public $modelClass = 'api\modules\closed\models\BathhouseBooking';
    public $serializer = [
        'class' => 'yii\rest\Serializer',
        'collectionEnvelope' => 'items',
    ];

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['create'],$actions['index'],$actions['delete']);
        return $actions;
    }

    public function beforeAction($action)
    {
        \Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return parent::beforeAction($action);
    }

    public function actionIndex()
    {
        $filter = yii::$app->request->get();
        $model = new BathhouseBooking();

        $limit  = (isset($filter['limit'])) ? $filter['limit'] : 100;
        $page   = (isset($filter['page'])) ? $filter['page'] : 1;
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

                unset($filter[$key]);
                $date_filters[$key] = $value;
                continue;
            }

            if (!$model->hasAttribute(ApiHelpers::decamelize($key)))
            {
                throw new HttpException(404, 'Invalid query param: ' . $key);
            }
            elseif(ApiHelpers::decamelize($key) != $key)
            {
                unset($filter[$key]);
                $filter[ApiHelpers::decamelize($key)] = $value;
            }
            else
            {
                $filter[$key] = $value;
            }

        }
        try
        {

            $query = $model::find();

            $query->andWhere('bathhouse_id = :bathhouse_id', [':bathhouse_id' => yii::$app->user->identity->organization_id]);

            foreach($filter as $key => $item)
                $query->andWhere($key . '=' . $item);
            $is_active_date_filters = (!empty($date_filters) and is_array($date_filters) and isset($date_filters['end']) !== false and strtotime($date_filters['end']) !== false);
            if($is_active_date_filters)
            {
                if(!isset($date_filters['start']) or strtotime($date_filters['start']) === false)
                    $date_filters['start'] = date('Y-m-d');

                $query->andWhere('start_date BETWEEN STR_TO_DATE(:start, "%Y-%m-%d")
                            AND STR_TO_DATE(:end, "%Y-%m-%d")',
                    [
                    ':start'    => date('Y-m-d',strtotime("-1 day",strtotime($date_filters['start']))),
                    ':end'      => date('Y-m-d',strtotime("+1 day",strtotime($date_filters['end']))),
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
                    'id'                => (int)$order['id'],
                    'startDate'         => $order['start_date'],
                    'endDate'           => ($oneDay) ? $order['end_date'] : $order['start_date'],
                    'startPeriod'       => (int)$order['start_period'],
                    'endPeriod'         => ($oneDay) ? (int)$order['end_period'] : (int)OrdrHelper::LAST_TIME_ID,
                    'services'          => $order['services'],
                    'guests'            => (int)$order['guests'],
                    'comment'           => $order['comment'],
                    'costPeriod'        => (float)$order['cost_period'],
                    'costServices'      => (float)$order['cost_services'],
                    'costGuests'        => (float)$order['cost_guests'],
                    'total'             => (float)$order['total'],
                    'statusId'          => (int)$order['status_id'],
                    'roomId'            => (int)$order['room_id'],
                    'bathhouseId'       => (int)$order['bathhouse_id'],
                    'oneDay'            => (boolean)$oneDay,
                    'throughService'    => (boolean)($order['manager_id'] > 0)
                ];
                if(!$oneDay)
                {
                    //исключаем появление переходящей заявки с ($date_filters['end'] + 1) дня
                    if($is_active_date_filters AND $order['start_date'] == date('Y-m-d',strtotime("+1 day",strtotime($date_filters['end']))))
                        continue;

                    $orders_sorted[$order['end_date']][] = [
                        'id'            => (int)$order['id'],
                        'startDate'     => $order['end_date'],
                        'endDate'       => $order['end_date'],
                        'startPeriod'   => (int)OrdrHelper::FIRST_TIME_ID,
                        'endPeriod'     => (int)$order['end_period'],
                        'services'      => $order['services'],
                        'guests'        => (int)$order['guests'],
                        'comment'       => $order['comment'],
                        'costPeriod'    => (float)$order['cost_period'],
                        'costServices'  => (float)$order['cost_services'],
                        'costGuests'    => (float)$order['cost_guests'],
                        'total'         => (float)$order['total'],
                        'statusId'      => (int)$order['status_id'],
                        'roomId'        => (int)$order['room_id'],
                        'bathhouseId'   => (int)$order['bathhouse_id'],
                        'oneDay'        => (boolean)$oneDay,
                        'throughService'=> (boolean)($order['manager_id'] > 0)
                    ];
                }
            }
            if($is_active_date_filters)
                unset(
                    $orders_sorted[date('Y-m-d',strtotime("-1 day",strtotime($date_filters['start'])))],
                    $orders_sorted[date('Y-m-d',strtotime("+1 day",strtotime($date_filters['end'])))]
                );

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
        $params = Yii::$app->getRequest()->getBodyParams();
        foreach($params as $id => $value)
            if($model->isAttributeSafe(ApiHelpers::decamelize($id)))
                $model->setAttribute(ApiHelpers::decamelize($id),$value);

        $model->bathhouse_id = yii::$app->user->identity->organization_id;

        if(!$model->validate())
            return [
                'result' => 'fail',
                'data'  => array_merge([],
                    $model->getErrors()
                ),
                'name' => 'Data Validation Failed',
                'code' => 0,
                'status' => 422,
                'type'  => '',
            ];

        if(ApiHelpers::checkTimeIsFree($model, $model->room->bathhouseRoomSettings->min_duration))
        {
            $transaction = BathhouseBooking::getDb()->beginTransaction();
            $model->manager_id      = Yii::$app->user->identity->id;
            $model->bathhouse_id    = Yii::$app->user->identity->organization_id;

            if ($model->save(false))
            {
                $response = Yii::$app->getResponse();
                $response->setStatusCode(201);
            }
            elseif (!$model->hasErrors())
            {
                throw new ServerErrorHttpException('Failed to create the object for unknown reason.');
            }
            else
            {
                return $model;
            }
            if(ApiHelpers::reformScheduleForDay($model->room_id, $model->start_date, $model->end_date))
            {
                $transaction->commit();

                return [
                    'result' => 'success',
                    'data'  => [
                        'id'                => (int)$model->id,
                        'startPeriod'       => $model->start_period,
                        'endPeriod'         => $model->end_period,
                        'services'          => $model->services,
                        'guests'            => (int)$model->guests,
                        'comment'           => $model->comment,
                        'costPeriod'        => (float)$model->cost_period,
                        'costServices'      => (float)$model->cost_services,
                        'costGuests'        => (float)$model->cost_guests,
                        'total'             => (float)$model->total,
                        'statusId'          => (int)$model->status_id,
                        'roomId'            => (int)$model->room_id,
                        'bathhouseId'       => (int)$model->bathhouse_id,
                        'oneDay'            => (boolean)($model->start_date == $model->end_date),
                        'throughService'    => (boolean)($model->manager_id > 0)
                    ],
                    'name' => 'Success operation',
                    'code' => 0,
                    'status' => 201,
                    'type'  => '',
                ];
            }
            else
            {
                $transaction->rollBack();
                throw new ServerErrorHttpException('Schedule forming error. Order not saved');
            }
        }
        else
            throw new BadRequestHttpException('Order time is busy');
    }

    public function actionDelete($id)
    {
        $model = $this->findModel($id);
        if($model->bathhouse_id != yii::$app->user->identity->organization_id or $model->manager_id == 0)
        {
            throw new UnauthorizedHttpException('Unauthorized request');
        }
        if ($model->delete() === false) {
            throw new ServerErrorHttpException('Failed to delete the object for unknown reason.');
        }

        Yii::$app->getResponse()->setStatusCode(204);
        return [
            'result' => 'success',
            'data'  => [],
            'name' => 'Success operation',
            'code' => 0,
            'status' => 204,
            'type'  => '',
        ];
    }

}