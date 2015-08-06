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
use yii\web\HttpException;

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
        unset($actions['create']);
        return $actions;
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
                    'id'                => (int)$order['id'],
                    'startDate'         => $order['start_date'],
                    'endDate'           => ($oneDay) ? $order['end_date'] : $order['start_date'],
                    'startPeriod'       => (int)$order['start_period'],
                    'endPeriod'         => (int)($oneDay) ? $order['end_period'] : OrdrHelper::LAST_TIME_ID,
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
            if($model->hasAttribute(ApiHelpers::decamelize($id)) and $model->isAttributeSafe(ApiHelpers::decamelize($id)))
                $model->setAttribute(ApiHelpers::decamelize($id),$value);

        $model->bathhouse_id = yii::$app->user->identity->organization_id;

        if(!$model->validate())
            return $model;

        if(ApiHelpers::checkOrder($model, $model->room->bathhouseRoomSettings->min_duration))
        {
            $transaction = BathhouseBooking::getDb()->beginTransaction();

            if ($model->save(false))
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
            else
            {
                return $model;
            }
            if(ApiHelpers::reformScheduleForDay($model->room_id, $model->start_date, $model->end_date))
            {
                $transaction->commit();
                return $model;
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
}