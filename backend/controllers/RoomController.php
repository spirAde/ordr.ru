<?php
namespace api\modules\control\controllers;

use api\controllers\ApiController;
use yii\db\Query;
use yii\helpers\OrdrHelper;
use yii\helpers\VarDumper;
use yii\helpers\ArrayHelper;

class RoomController extends ApiController
{
    public function beforeAction($action)
    {
        return parent::beforeAction($action);
    }

    public function actionIndex()
    {

        $result = [];
        $api_query = \Yii::$app->request->get();

        if ($this->user['role'] === 'manager') {

            $rooms = (new Query())
                ->select('
                    bathhouse_room.id as room_id, bathhouse_room.name as room_name')
                ->from('bathhouse_room')
                ->innerJoin('bathhouse_detail', 'bathhouse_detail.id = bathhouse_room.bathhouse_id')
                ->where('bathhouse_detail.id = :bathhouse_id', [':bathhouse_id' => $this->user['organization_id']])
                ->all();
        }
        else if ($this->user['role'] === 'admin') {
            //
        }

        foreach ($rooms as $idx => $room) {

            $settings = (new Query())
                ->select('
                    bathhouse_room_setting.min_duration')
                ->from('bathhouse_room_setting')
                ->where('bathhouse_room_setting.room_id = :room_id', [':room_id' => $room['room_id']])
                ->one();

            $result[] = [
                'id'            => intval($room['room_id']),
                'name'          => $room['room_name'],
                'min_duration'  => $settings['min_duration']
            ];
        }

        return $result;
    }

    public function actionView()
    {
        $api_query = \Yii::$app->request->get();

        $guests             = [];
        $prices_day_index   = [];

        if (isset($api_query['prices']))
        {
            $prices = (new Query())
                ->select('
                    bathhouse_room_price.time_from, bathhouse_room_price.time_to, bathhouse_room_price.price,
                    bathhouse_room_price.day_id')
                ->from('bathhouse_room_price')
                ->where('bathhouse_room_price.room_id = :room_id', [':room_id' => $api_query['id']])
                ->all();

            $prices_day_index = [];

            foreach ($prices as $price)
            {
                $prices_day_index[$price['day_id']][] = [
                    'period' => [$price['time_from'], $price['time_to']],
                    'price'  => $price['price']
                ];
            }
        }

        if (isset($api_query['guests']))
        {
            $guests_data = (new Query())
                ->select('
                    bathhouse_room_setting.guest_limit, bathhouse_room_setting.guest_threshold,
                    bathhouse_room_setting.extra_guest_price')
                ->from('bathhouse_room_setting')
                ->where('bathhouse_room_setting.room_id = :room_id', [':room_id' => $api_query['id']])
                ->one();

            $guests = $guests_data;
        }

        $result = [
            'room_id'   => intval($api_query['id']),
            'guests'    => $guests,
            'prices'    => $prices_day_index
        ];

        return $result;
    }

    public function actionScheduleOrder()
    {
        $api_query = \Yii::$app->request->get();

        if (!isset($api_query['room_id']) || empty($api_query['room_id']))
            throw new BadRequestHttpException('Room ID is required field for this type of request');

        $date_from = (isset($api_query['date_from']) || !empty($api_query['date_from'])) ?
            $api_query['date_from'] : date('Y-m-d H:i', strtotime('now'));

        $date_to = (isset($api_query['date_to']) || !empty($api_query['date_to'])) ?
            $api_query['date_to'] : date('Y-m-d', strtotime('+1 days', strtotime($date_from)));

        $room_id = $api_query['room_id'];

        $schedule = [];

        $periods = (new Query())
            ->select('bathhouse_free_time.free_time, bathhouse_free_time.date')
            ->from('bathhouse_free_time')
            ->where('bathhouse_free_time.date >= :date_from', [':date_from' => $date_from])
            ->andWhere('bathhouse_free_time.date <= :date_to', [':date_to' => $date_to])
            ->andWhere('bathhouse_free_time.room_id = :room_id', [':room_id' => $room_id])
            ->all();

        foreach ($periods as $period)
        {
            $schedule[$period['date']] =
                OrdrHelper::getFreeTimeDecomposition(
                    OrdrHelper::readFreeTime($period['free_time']));
        }

        // Ограничиваем свободные интервалы времени для сегодняшнего дня, исходя из текущего времени
        /*foreach ($schedule[$date_from] as $period_id => $period)
        {
            if ($period_id < $current_period_id)
                $schedule[$date_from][$period_id]['enable'] = false;
        }*/

        $prices = (new Query())
            ->select('
                    bathhouse_room_price.time_from, bathhouse_room_price.time_to, bathhouse_room_price.price,
                    bathhouse_room_price.day_id')
            ->from('bathhouse_room_price')
            ->where('bathhouse_room_price.room_id = :room_id', [':room_id' => $api_query['room_id']])
            ->all();

        $prices_day_index = [];

        foreach ($prices as $price)
        {
            $prices_day_index[$price['day_id']][] = [
                'period' => [$price['time_from'], $price['time_to']],
                'price'  => $price['price']
            ];
        }

        // Добавляем к каждому диапазону цену и цено-временной период
        foreach ($schedule as $date => $periods)
        {
            $date_index = date('w', strtotime($date));
            $date_prices = $prices_day_index[$date_index];

            foreach ($periods as $time_id => $period)
            {
                foreach ($date_prices as $idx => $value)
                {
                    if ($value['period'][0] <= $time_id && $time_id <= $value['period'][1])
                    {
                        $schedule[$date][$time_id]['price'] = floatval($value['price']);
                        $schedule[$date][$time_id]['price_period'] = intval($idx);
                    }
                }
            }
        }

        $room_orders = (new Query())
            ->select('
                bathhouse_booking.date_from, bathhouse_booking.date_to,
                bathhouse_booking.time_from, bathhouse_booking.time_to')
            ->from('bathhouse_booking')
            ->where('bathhouse_booking.date_from >= :date_from', [':date_from' => $date_from])
            ->andWhere('bathhouse_booking.date_to <= :date_to', [':date_to' => $date_to])
            ->andWhere('bathhouse_booking.room_id = :room_id', [':room_id' => $room_id])
            ->all();

        $busy_periods = array();

        foreach ($room_orders as $room_order) {
            if ($room_order['date_from'] === $room_order['date_to']) {
                $busy_periods[$room_order['date_from']][] = [
                    'time_from' => $room_order['time_from'],
                    'time_to' => $room_order['time_to'],
                    'one_day' => true
                ];
            }
            else {
                $busy_periods[$room_order['date_from']][] = [
                    'time_from' => $room_order['time_from'],
                    'time_to' => OrdrHelper::LAST_TIME_ID,
                    'one_day' => false
                ];

                $busy_periods[$room_order['date_from']][] = [
                    'time_from' => OrdrHelper::FIRST_TIME_ID,
                    'time_to' => $room_order['time_to'],
                    'one_day' => false
                ];
            }
        }

        foreach ($schedule as $date => $periods) {

        }

        return $schedule;
    }
}