<?php
namespace api\modules\control\controllers;

use api\controllers\ApiController;
use yii\base\InvalidParamException;
use yii\web\BadRequestHttpException;
use yii\db\Query;
use yii\helpers\OrdrHelper;
use yii\helpers\VarDumper;
use yii\helpers\ArrayHelper;

class OrderController extends ApiController
{
    public function beforeAction($action) {
        return parent::beforeAction($action);
    }

    public function actionIndex() {

        $api_query = \Yii::$app->request->get();

        if (!isset($api_query['room_id']) || empty($api_query['room_id']))
            throw new BadRequestHttpException('Room ID is required field for this type of request');

        $date_from = (isset($api_query['start_date']) && !empty($api_query['start_date'])) ?
            $api_query['start_date'] : date('Y-m-d', strtotime('now'));

        $date_to = (isset($api_query['end_date']) && !empty($api_query['end_date'])) ?
            $api_query['end_date'] : date('Y-m-d', strtotime('+1 day', strtotime($date_from)));

        $orders = (new Query())
            ->select('
                    bathhouse_booking.id, bathhouse_booking.through_site,
                    bathhouse_booking.date_from, bathhouse_booking.date_to,
                    bathhouse_booking.time_from, bathhouse_booking.time_to,
                    bathhouse_booking.services, bathhouse_booking.guests, bathhouse_booking.comment,
                    bathhouse_booking.cost_per_time, bathhouse_booking.cost_extra_guests, bathhouse_booking.cost_services,
                    bathhouse_booking.summ')
            ->from('bathhouse_booking')
            ->where('bathhouse_booking.room_id = :room_id')
            ->andWhere('bathhouse_booking.date_from >= :date_from')
            ->andWhere('bathhouse_booking.date_to <= :date_to')
            ->addParams([':room_id' => $api_query['room_id'], ':date_from' => $date_from, ':date_to' => $date_to])
            ->orderBy(['bathhouse_booking.date_from' => SORT_ASC, 'bathhouse_booking.time_from' => SORT_ASC])
            ->all();

        $orders_by_dates = [];

        foreach ($orders as $order) {
            if ($order['date_from'] === $order['date_to']) {
                $orders_by_dates[$order['date_from']][] = [
                    'id'                => $order['id'],
                    'date_from'         => $order['date_from'],
                    'date_to'           => $order['date_to'],
                    'time_from'         => $order['time_from'],
                    'time_to'           => $order['time_to'],
                    'services'          => unserialize($order['services']),
                    'guests'            => $order['guests'],
                    'comment'           => $order['comment'],
                    'cost_per_time'     => $order['cost_per_time'],
                    'cost_services'     => $order['cost_services'],
                    'cost_extra_guests' => $order['cost_extra_guests'],
                    'summ'              => $order['summ'],
                    'through_site'      => boolval($order['through_site']),
                    'one_day'           => true
                ];
            }
            else {

                $orders_by_dates[$order['date_from']][] = [
                    'id'                => $order['id'],
                    'date_from'         => $order['date_from'],
                    'date_to'           => $order['date_from'],
                    'time_from'         => $order['time_from'],
                    'time_to'           => OrdrHelper::LAST_TIME_ID,
                    'services'          => unserialize($order['services']),
                    'guests'            => $order['guests'],
                    'comment'           => $order['comment'],
                    'cost_per_time'     => $order['cost_per_time'],
                    'cost_services'     => $order['cost_services'],
                    'cost_extra_guests' => $order['cost_extra_guests'],
                    'summ'              => $order['summ'],
                    'through_site'      => boolval($order['through_site']),
                    'one_day'           => false
                ];

                $orders_by_dates[$order['date_to']][] = [
                    'id'                => $order['id'],
                    'date_from'         => $order['date_to'],
                    'date_to'           => $order['date_to'],
                    'time_from'         => OrdrHelper::FIRST_TIME_ID,
                    'time_to'           => $order['time_to'],
                    'services'          => unserialize($order['services']),
                    'guests'            => $order['guests'],
                    'comment'           => $order['comment'],
                    'cost_per_time'     => $order['cost_per_time'],
                    'cost_services'     => $order['cost_services'],
                    'cost_extra_guests' => $order['cost_extra_guests'],
                    'summ'              => $order['summ'],
                    'through_site'      => boolval($order['through_site']),
                    'one_day'           => false
                ];
            }
        }

        $result = [];
        $dates_range = OrdrHelper::datesRange($date_from, $date_to);

        foreach ($dates_range as $date) {
            $result[$date] = isset($orders_by_dates[$date]) ? $orders_by_dates[$date] : [];
        }

        $prev_date = date('Y-m-d', strtotime('-1 day', strtotime($date_from)));
        $next_date = date('Y-m-d', strtotime('+1 day', strtotime($date_to)));

        $prev_date_orders = (new Query())
            ->select('
                bathhouse_booking.id, bathhouse_booking.through_site,
                bathhouse_booking.date_from, bathhouse_booking.date_to,
                bathhouse_booking.time_from, bathhouse_booking.time_to,
                bathhouse_booking.services, bathhouse_booking.guests, bathhouse_booking.comment,
                bathhouse_booking.cost_per_time, bathhouse_booking.cost_extra_guests, bathhouse_booking.cost_services,
                bathhouse_booking.summ')
            ->from('bathhouse_booking')
            ->where('bathhouse_booking.room_id = :room_id')
            ->andWhere(['and', 'bathhouse_booking.date_from = :prev_date', 'bathhouse_booking.date_to = :date_from'])
            ->addParams([':room_id' => $api_query['room_id'], ':date_from' => $date_from, ':prev_date' => $prev_date])
            ->one();

        $next_date_orders = (new Query())
            ->select('
                bathhouse_booking.id, bathhouse_booking.through_site,
                bathhouse_booking.date_from, bathhouse_booking.date_to,
                bathhouse_booking.time_from, bathhouse_booking.time_to,
                bathhouse_booking.services, bathhouse_booking.guests, bathhouse_booking.comment,
                bathhouse_booking.cost_per_time, bathhouse_booking.cost_extra_guests, bathhouse_booking.cost_services,
                bathhouse_booking.summ')
            ->from('bathhouse_booking')
            ->where('bathhouse_booking.room_id = :room_id')
            ->andWhere(['and', 'bathhouse_booking.date_from = :date_to', 'bathhouse_booking.date_to = :next_date'])
            ->addParams([':room_id' => $api_query['room_id'], ':date_to' => $date_to, ':next_date' => $next_date])
            ->one();

        if (!empty($prev_date_orders)) {
            array_unshift($result[$date_from], [
                'id'                => $prev_date_orders['id'],
                'date_from'         => $prev_date_orders['date_to'],
                'date_to'           => $prev_date_orders['date_to'],
                'time_from'         => OrdrHelper::FIRST_TIME_ID,
                'time_to'           => $prev_date_orders['time_to'],
                'services'          => unserialize($prev_date_orders['services']),
                'guests'            => $prev_date_orders['guests'],
                'comment'           => $prev_date_orders['comment'],
                'cost_per_time'     => $prev_date_orders['cost_per_time'],
                'cost_services'     => $prev_date_orders['cost_services'],
                'cost_extra_guests' => $prev_date_orders['cost_extra_guests'],
                'summ'              => $prev_date_orders['summ'],
                'through_site'      => boolval($prev_date_orders['through_site']),
                'one_day'           => false
            ]);
        }

        if (!empty($next_date_orders)) {
            $result[$date_to][] = [
                'id'                => $next_date_orders['id'],
                'date_from'         => $next_date_orders['date_from'],
                'date_to'           => $next_date_orders['date_from'],
                'time_from'         => $next_date_orders['time_from'],
                'time_to'           => OrdrHelper::LAST_TIME_ID,
                'services'          => unserialize($next_date_orders['services']),
                'guests'            => $next_date_orders['guests'],
                'comment'           => $next_date_orders['comment'],
                'cost_per_time'     => $next_date_orders['cost_per_time'],
                'cost_services'     => $next_date_orders['cost_services'],
                'cost_extra_guests' => $next_date_orders['cost_extra_guests'],
                'summ'              => $next_date_orders['summ'],
                'through_site'      => boolval($next_date_orders['through_site']),
                'one_day'           => false
            ];
        }

        return $result;
    }

    public function actionView() {

    }

    public function actionCreate() {
        
        $api_query = \Yii::$app->request->post();

        if (!isset($api_query['roomId']) || empty($api_query['roomId']))
            throw new BadRequestHttpException('Room ID is required field for this type of request');

        $room_id = $api_query['roomId'];

        if (!isset($api_query['startDate']) || empty($api_query['startDate'])
            || !isset($api_query['endDate']) || empty($api_query['endDate'])
            || !isset($api_query['startPeriodId']) || $api_query['startPeriodId'] === ''
            || !isset($api_query['endPeriodId']) || $api_query['endPeriodId'] === '') {

            throw new BadRequestHttpException('Order parameters are required field for this type of request');
        }

        $free_time = (new Query())
            ->select('bathhouse_free_time.free_time, bathhouse_free_time.date')
            ->from('bathhouse_free_time')
            ->where('bathhouse_free_time.date >= :date_from', [':date_from' => $api_query['startDate']])
            ->andWhere('bathhouse_free_time.date <= :date_to', [':date_to' => $api_query['endDate']])
            ->andWhere('bathhouse_free_time.room_id = :room_id', [':room_id' => $room_id])
            ->all();

        // Проверяем чтобы время заказа было свободное
        // Разложим заказ в удобный вид
        if ($api_query['startDate'] === $api_query['endDate']) {
            $order[$api_query['startDate']] = [$api_query['startPeriodId'], $api_query['endPeriodId']];
        }
        else {
            $order[$api_query['startDate']] = [$api_query['startPeriodId'], OrdrHelper::LAST_TIME_ID];
            $order[$api_query['endDate']] = [OrdrHelper::FIRST_TIME_ID, $api_query['endPeriodId']];
        }

        $check = [];

        foreach ($free_time as $time) {
            $free_periods = OrdrHelper::readFreeTime($time['free_time']);

            $date = $time['date'];

            foreach ($free_periods as $period) {
                /*VarDumper::dump($period);
                VarDumper::dump($order[$date]);

                VarDumper::dump('-----------');*/
                if ($period[0] <= $order[$date][0] && $order[$date][1] <= $period[1]) $check[] = $period;
            }
        }

        /*VarDumper::dump($check);*/
        // не проходит ни в один свободный интервал
        if (empty($check)) {
            throw new InvalidParamException('These parameters are invalid');
        }

        // Проверяем сумму заказа
        $room_prices = (new Query())
            ->select('
                bathhouse_room_price.time_from, bathhouse_room_price.time_to, bathhouse_room_price.price,
                bathhouse_room_price.day_id')
            ->from('bathhouse_room_price')
            ->where('bathhouse_room_price.room_id = :room_id', [':room_id' => $room_id])
            ->all();

        $tmp_prices = [];
        $tmp_periods = [];

        foreach ($room_prices as $room_price)
        {
            $tmp_prices[$room_price['day_id']][] = [
                'period' => [$room_price['time_from'], $room_price['time_to']],
                'price'  => $room_price['price']
            ];
        }

        if ($api_query['startDate'] === $api_query['endDate']) {
            $tmp_periods = [
                $api_query['startDate'] => [$api_query['startPeriodId'], $api_query['endPeriodId']]
            ];
        }
        else {
            $tmp_periods = [
                $api_query['startDate'] => [$api_query['startPeriodId'], OrdrHelper::LAST_TIME_ID],
                $api_query['endDate'] => [OrdrHelper::FIRST_TIME_ID, $api_query['endPeriodId']]
            ];
        }

        $summ = array_sum(OrdrHelper::getSumBathOrder($tmp_periods, $tmp_prices));

        if (floatval($summ) !== floatval($api_query['summTime'])) {
            throw new InvalidParamException('These parameters are invalid');
        }

        $order = [
            'bathhouse_id'      => $this->user['organization_id'],
            'room_id'           => $room_id,
            'date_from'         => $api_query['startDate'],
            'date_to'           => $api_query['endDate'],
            'time_from'         => $api_query['startPeriodId'],
            'time_to'           => $api_query['endPeriodId'],
            'services'          => serialize($api_query['services']),
            'guests'            => $api_query['guests'],
            'comment'           => $api_query['comment'],
            'status_id'         => 1,
            'user_id'           => $this->user['id'],
            'cost_per_time'     => $api_query['summTime'],
            'cost_services'     => $api_query['summServices'],
            'cost_extra_guests' => $api_query['summGuests'],
            'summ'              => $api_query['summ'],
            'through_site'      => 0
        ];

        (new Query())->createCommand()->insert('bathhouse_booking', $order)->execute();

        $order['id'] = \Yii::$app->db->getLastInsertID();

        // Забираем все заявки за день чтобы пересчитать free_time
        $room_orders = (new Query())
            ->select('
                bathhouse_booking.date_from, bathhouse_booking.date_to,
                bathhouse_booking.time_from, bathhouse_booking.time_to')
            ->from('bathhouse_booking')
            ->where('bathhouse_booking.date_from >= :date_from', [':date_from' => $api_query['startDate']])
            ->andWhere('bathhouse_booking.date_to <= :date_to', [':date_to' => $api_query['endDate']])
            ->andWhere('bathhouse_booking.room_id = :room_id', [':room_id' => $room_id])
            ->all();

        $busy_periods = array();

        foreach ($room_orders as $room_order) {
            if ($room_order['date_from'] === $room_order['date_to']) {
                $busy_periods[$room_order['date_from']][] = [$room_order['time_from'], $room_order['time_to']];
            }
            else {
                $busy_periods[$room_order['date_from']][] = [$room_order['time_from'], OrdrHelper::LAST_TIME_ID];
                $busy_periods[$room_order['date_to']][] = [OrdrHelper::FIRST_TIME_ID, $room_order['time_to']];
            }
        }

        foreach ($busy_periods as $date => $periods) {
            $free_time = OrdrHelper::writeFreeTime(OrdrHelper::getFreeTime($periods, 6));

            (new Query())->createCommand()->update('bathhouse_free_time', [
                'free_time' => $free_time
            ], 'room_id = :room_id AND date = :date', [':room_id' => $room_id, ':date' => $date])->execute();
        }

        return $order;
    }

    public function actionDelete() {
        $api_query = \Yii::$app->request->get();

        $order_data = (new Query())
            ->select('bathhouse_booking.room_id, bathhouse_booking.date_from, bathhouse_booking.date_to')
            ->from('bathhouse_booking')
            ->where('bathhouse_booking.id >= :order_id', [':order_id' => $api_query['id']])
            ->one();

        (new Query())->createCommand()->delete('bathhouse_booking', 'id = :order_id',
            [':order_id' => $api_query['id']])->execute();

        $room_orders = (new Query())
            ->select('
                bathhouse_booking.date_from, bathhouse_booking.date_to,
                bathhouse_booking.time_from, bathhouse_booking.time_to')
            ->from('bathhouse_booking')
            ->where('bathhouse_booking.date_from >= :date_from', [':date_from' => $order_data['date_from']])
            ->andWhere('bathhouse_booking.date_to <= :date_to', [':date_to' => $order_data['date_to']])
            ->andWhere('bathhouse_booking.room_id = :room_id', [':room_id' => $order_data['room_id']])
            ->all();

        $busy_periods = array();

        foreach ($room_orders as $room_order) {
            if ($room_order['date_from'] === $room_order['date_to']) {
                $busy_periods[$room_order['date_from']][] = [$room_order['time_from'], $room_order['time_to']];
            }
            else {
                $busy_periods[$room_order['date_from']][] = [$room_order['time_from'], OrdrHelper::LAST_TIME_ID];
                $busy_periods[$room_order['date_to']][] = [OrdrHelper::FIRST_TIME_ID, $room_order['time_to']];
            }
        }

        // После удаления заявки может получиться ситуация, что на вторую дату это была единственная заявка, но она удалена,
        // то есть free_time для 2ой даты все равно надо пересчитать
        if (empty($busy_periods[$order_data['date_from']])) $busy_periods[$order_data['date_from']] = [];
        if (empty($busy_periods[$order_data['date_to']])) $busy_periods[$order_data['date_to']] = [];

        foreach ($busy_periods as $date => $periods) {
            $free_time = OrdrHelper::writeFreeTime(OrdrHelper::getFreeTime($periods, 6));

            (new Query())->createCommand()->update('bathhouse_free_time', [
                'free_time' => $free_time
            ], 'room_id = :room_id AND date = :date', [':room_id' => $order_data['room_id'], ':date' => $date])->execute();
        }
    }

    public function actionLog() {
        if (\Yii::$app->request->isPost) {
            VarDumper::dump('post');
        }
        else if (\Yii::$app->request->isGet) {
            VarDumper::dump('get');
        }
    }
}