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
    public $layout = false;

    public function actionIndex()
    {

        $results = yii::$app->cache->get(md5('frontend_preloader'));

        if (!yii::$app->params['enable_cache'] || !$results) {

            $periods = yii::$app->params['time_periods'];
            $rooms_count = [];

            $cities = City::find()
                ->select('id, city, slug, latitude, longitude, time_zone as timeZone')
                ->asArray()
                ->all();

            foreach($cities as $city) {
                $rooms_count[$city['id']] = [
                    'roomCount' => 0,
                    'cityId' => $city['id'],
                ];
            }

            $city_ids = array_column($cities, 'id');

            $rooms_count_array = BathhouseRoom::find()
                ->select('count(*) as roomCount, bathhouse_room.city_id as cityId')
                ->joinWith('bathhouse', false)
                ->where(['bathhouse.is_active' => 1, 'bathhouse_room.city_id' => $city_ids])
                ->groupBy('bathhouse_room.city_id')
                ->indexBy('cityId')
                ->asArray()
                ->all();

            foreach($rooms_count_array as $rooms_count_item) {

                $rooms_count[$rooms_count_item['cityId']] = $rooms_count_item;
            }

            $filters = BathhouseRoomPrice::find()
                ->select(
                    'MIN(bathhouse_room_price.price) as minPrice,
                     MAX(bathhouse_room_price.price)as maxPrice,
                     MIN(bathhouse.distance) as minDistance,
                     MAX(bathhouse.distance) as maxDistance,
                     MAX(bathhouse_room_setting.guest_threshold) as maxFreeGuests,
                     MAX(bathhouse_room_setting.guest_limit) as maxExtraGuests,
                     bathhouse_room.city_id as cityId'
                )
                ->joinWith(['bathhouseRoom', 'bathhouseRoom.bathhouse', 'bathhouseRoom.bathhouseRoomSettings'], false)
                ->where([
                    'bathhouse.is_active'    => 1,
                    'bathhouse_room.city_id' => $city_ids])
                ->groupBy(['bathhouse_room.city_id'])
                ->indexBy('cityId')
                ->asArray()
                ->all();

            $results = [
                'city'                  => $cities,
                'periods'               => $periods,
                'invert'                => array_flip($periods),
                'organizationsType'     => yii::$app->params['organization_type'],
                'bathhouseType'         => yii::$app->params['bathhouse_type'],
                'options'               => [
                    'bathhouseOptions'      => yii::$app->params['bathhouse_options'],
                    'roomOptions'           => yii::$app->params['bathhouse_room_options'],
                ],
                'offers'                => $rooms_count,
                'filters'               => $filters
            ];

            $results = Json::encode($results);

            yii::$app->cache->set(md5('frontend_preloader'), $results, yii::$app->params['preloader_cache_duration']);
        }

        return $this->render('//layouts/main', [
            'content' => $results
        ]);
    }
}
