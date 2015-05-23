<?php
namespace api\modules\control\controllers;

use api\controllers\ApiController;
use yii\helpers\ArrayHelper;
use yii\db\Query;
use yii\helpers\OrdrHelper;
use yii\helpers\JWT;
use yii\helpers\VarDumper;
use yii\web\UnauthorizedHttpException;
use yii\web\BadRequestHttpException;

class BathhouseController extends ApiController
{
    public function beforeAction($action)
    {
        return parent::beforeAction($action);
    }

    public function actionIndex()
    {
        $api_query = \Yii::$app->request->get();

        if ($this->user['role'] === 'manager') {

            $bathhouse = (new Query())
                ->select('
                        bathhouse_detail.id as bathhouse_id, bathhouse_detail.name')
                ->from('bathhouse_detail')
                ->where('bathhouse_detail.id = :bathhouse_id', [':bathhouse_id' => $this->user['organization_id']])
                ->one();

            $bathhouse['rooms'] = [];
            $bathhouse['services'] = [];

            if (isset($api_query['rooms'])) {

                $rooms = (new Query())
                    ->select('
                        bathhouse_room.id as room_id, bathhouse_room.name as room_name')
                    ->from('bathhouse_room')
                    ->where('bathhouse_room.bathhouse_id = :bathhouse_id', [':bathhouse_id' => $this->user['organization_id']])
                    ->all();

                foreach ($rooms as $idx => $room) {

                    $settings = (new Query())
                        ->select('bathhouse_room_setting.min_duration')
                        ->from('bathhouse_room_setting')
                        ->where('bathhouse_room_setting.room_id = :room_id', [':room_id' => $room['room_id']])
                        ->one();

                    $types = (new Query())
                        ->select('bathhouse_room_type_list.type')
                        ->from('bathhouse_room_type_list')
                        ->innerJoin('bathhouse_room_type', 'bathhouse_room_type.type_id = bathhouse_room_type_list.id')
                        ->where('bathhouse_room_type.room_id = :room_id', [':room_id' => $room['room_id']])
                        ->all();

                    $rooms[$idx]['types'] = ArrayHelper::getColumn($types, 'type');
                    $rooms[$idx]['min_duration'] = $settings['min_duration'];
                }

                $bathhouse['rooms'] = $rooms;
            }

            if (isset($api_query['services'])) {

                $categories = (new Query())
                    ->select('bathhouse_service_category.id, bathhouse_service_category.name, bathhouse_service_category.slug')
                    ->from('bathhouse_service_category')
                    ->all();

                foreach ($categories as $category)
                {
                    $items = (new Query())
                        ->select('
                            bathhouse_service.id, bathhouse_service.name,
                            bathhouse_service.price')
                        ->from('bathhouse_service')
                        ->where('bathhouse_service.category_id = :category_id', [':category_id' => $category['id']])
                        ->andWhere('bathhouse_service.bathhouse_id = :bathhouse_id',
                            [':bathhouse_id' => $this->user['organization_id']])
                        ->all();

                    $bathhouse['services'][$category['id']]['name'] = $category['name'];
                    $bathhouse['services'][$category['id']]['services'] = $items;
                }
            }
        }
        else if ($this->user['role'] === 'admin') {
            $bathhouses = (new Query())
                ->select('
                    bathhouse_detail.id as bathhouse_id, bathhouse_detail.name, bathhouse_detail.address,
                    bathhouse_detail.distance,
                    bathhouse_detail.latitude, bathhouse_detail.longitude,
                    bathhouse_room.id as room_id, bathhouse_room.name as room_name, bathhouse_room.type_id,
                    bathhouse_room.rating, bathhouse_room.popularity,
                    bathhouse_room_setting.guest_limit, bathhouse_room_setting.guest_threshold,
                    bathhouse_room_setting.extra_guest_price, bathhouse_room_setting.hold_time,
                    bathhouse_room_setting.min_duration,
                    bathhouse_room.description')
                ->from('bathhouse_detail')
                ->innerJoin('bathhouse_room', 'bathhouse_room.bathhouse_id = bathhouse_detail.id')
                ->innerJoin('bathhouse_room_setting', 'bathhouse_room_setting.room_id = bathhouse_room.id');
        }

        return $bathhouse;
    }

    public function actionView() {

        //
    }
}
