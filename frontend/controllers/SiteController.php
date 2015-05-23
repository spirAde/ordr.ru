<?php
namespace frontend\controllers;

use common\models\City;
use common\models\BathhouseRoom;
use common\models\BathhouseRoomPrice;
use Yii;
use yii\helpers\VarDumper;
use yii\web\Controller;
use yii\helpers\Json;

class SiteController extends Controller
{
    public function actionIndex()
    {

        $results = yii::$app->cache->get(md5('frontend_preloader'));

        if (yii::$app->params['enable_cache'] && !$results) {

            $periods = yii::$app->params['time_periods'];
            $rooms_count = [];

            $cities = City::find()->asArray()->all();

            foreach($cities as $city) {
                $rooms_count[$city['id']] = [
                    'room_count' => 0,
                    'city_id' => $city['id'],
                ];
            }

            $city_ids = array_column($cities, 'id');

            $rooms_count_array = BathhouseRoom::find()
                ->select('count(*) as room_count, bathhouse_room.city_id')
                ->joinWith('bathhouse', false)
                ->where(['bathhouse.is_active' => 1, 'bathhouse_room.city_id' => $city_ids])
                ->groupBy('bathhouse_room.city_id')
                ->indexBy('city_id')
                ->asArray()
                ->all();

            foreach($rooms_count_array as $rooms_count_item) {

                $rooms_count[$rooms_count_item['city_id']] = $rooms_count_item;
            }

            $filters = BathhouseRoomPrice::find()
                ->select(
                    'MIN(bathhouse_room_price.price) as minPrice,
                     MAX(bathhouse_room_price.price)as maxPrice,
                     MIN(bathhouse.distance) as minDistance,
                     MAX(bathhouse.distance) as maxDistance,
                     MAX(bathhouse_room_setting.guest_threshold) as maxFreeGuests,
                     MAX(bathhouse_room_setting.guest_limit) as maxExtraGuests,
                     bathhouse_room.city_id'
                )
                ->joinWith(['bathhouseRoom', 'bathhouseRoom.bathhouse', 'bathhouseRoom.settings'], false)
                ->where([
                    'bathhouse.is_active'    => 1,
                    'bathhouse_room.city_id' => $city_ids])
                ->groupBy(['bathhouse_room.city_id'])
                ->indexBy('city_id')
                ->asArray()
                ->all();

            $results = [
                'city'                  => $cities,
                'periods'               => $periods,
                'invert'                => array_flip($periods),
                'organizations_type'    => yii::$app->params['organization_type'],
                'bathhouse_type'        => yii::$app->params['bathhouse_type'],
                'options'               => [
                    'bathhouse_options'         => yii::$app->params['bathhouse_options'],
                    'bathhouse_room_options'    => yii::$app->params['bathhouse_room_options'],
                ],
                'rooms_count'           => $rooms_count,
                'filters'               => $filters
            ];

            $results = Json::encode($results);

            yii::$app->cache->set(md5('frontend_preloader'), $results, yii::$app->params['preloader_cache_duration']);
        }

        return $this->render('index', [
            'preload' => $results
        ]);
    }
}
