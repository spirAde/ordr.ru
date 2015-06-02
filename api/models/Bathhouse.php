<?php

namespace api\models;

use common\models\City;
use Yii;
use yii\db\ActiveRecord;

class Bathhouse extends ActiveRecord
{

    public $additional_data;
    public $rating_items = [1, 2, 3, 4, 5];

    public static function tableName()
    {
        return 'bathhouse';
    }

    public function fields()
    {
        switch(yii::$app->controller->action->id)
        {
            case 'index':
            {
                return  [
                    'bathhouseId'   =>'id',
                    'name',
                    'slug',
                    'address',
                    'description',
                    'contacts',
                    'options'       =>function()
                    {
                        $result = [];
                        $options = json_decode($this->options,true);

                        if(is_array($options))
                            foreach($options as $item)
                                if(array_key_exists((int)$item,yii::$app->params['bathhouse_options']))
                                    $result[] = yii::$app->params['bathhouse_options'][$item];

                        return $result;
                    },
                    'cityId'        =>'city_id',
                    'distance',
                    'latitude',
                    'longitude',
                ];
            };
            case 'view':
            {
                return  [
                    'bathhouseId'   => 'id',
                    'name',
                    'slug',
                    'address',
                    'description',
                    'contacts',
                    'options'       =>function()
                    {
                        $result = [];
                        $options = json_decode($this->options,true);

                        if(is_array($options))
                            foreach($options as $item)
                                if(array_key_exists((int)$item,yii::$app->params['bathhouse_options']))
                                    $result[] = yii::$app->params['bathhouse_options'][$item];

                        return $result;
                    },
                    'cityId'        => 'city_id',
                    'distance',
                    'latitude',
                    'longitude',
                    'rating_items'
                ];
            };
            case 'geo':
            {
                return  [
                    'bathhouseId'   => 'id',
                    'name',
                    'slug',
                    'address',
                    'latitude',
                    'longitude',
                ];
            }
        }
    }

    public function extraFields()
    {
        switch(yii::$app->controller->action->id) {
            case 'view': {
                $this->additional_data = BathhouseRoomPrice::find()
                    ->select(
                        'MIN(bathhouse_room_price.price) as minPrice,
                             bathhouse_room.bathhouse_id,
                             bathhouse_room_price.room_id')
                    ->joinWith(['bathhouseRoom'], false)
                    ->indexBy('room_id')
                    ->where([
                        'bathhouse_room.bathhouse_id' => $this->id,
                    ])
                    ->asArray()
                    ->one();

                return [
                    'minPrice' => function ()
                    {
                        return $this->additional_data['minPrice'];
                    },
                    'rooms' => function ()
                    {
                        $rooms = $this->bathhouseRoom;
                        $result = [];
                        foreach ($rooms as $room)
                        {
                            $room_settings = $room->bathhouseRoomSettings;
                            $options_former = function($room_options)
                            {
                                $result = [];
                                $options = json_decode($room_options,true);

                                if(is_array($options))
                                    foreach($options as $item)
                                        if(array_key_exists((int)$item,yii::$app->params['bathhouse_room_options']))
                                            $result[] = yii::$app->params['bathhouse_room_options'][$item];

                                return $result;
                            };
                            $result[$room->id] = [
                                'roomId'            => $room->id,
                                'roomName'          => $room->name,
                                'roomDescription'   => $room->description,
                                'options'           => $options_former($room->options),
                                'types'             => $room->types,
                                'rating'            => floatval($room->rating),
                                'popularity'        => floatval($room->popularity),
                                'reviews'           => $room->bathhouseRoomReview,
                                'price'             => $this->additional_data['minPrice'],
                                'minDuration'       => $room_settings->min_duration,
                                'prepayment'        => $room_settings->prepayment,
                                'schedule'          => [],
                                'services'          => [],
                                'guests'            => [],
                                'show'              => true,
                                'active'            => false,
                            ];
                        }
                        return $result;
                    }
                ];
            };
            case 'geo':
            {
                return [
                    'rooms' => function ()
                    {
                        $day_index = date('w', strtotime('now'));
                        $rooms = BathhouseRoom::find()
                            ->select(
                                'bathhouse_room.id,
                                bathhouse_room.name,
                                MIN(bathhouse_room_price.price) as min_price,
                                bathhouse_room_setting.guest_limit')
                            ->joinWith(['bathhouseRoomPrice','bathhouseRoomSettings'], false)
                            ->indexBy('room_id')
                            ->where([
                                'bathhouse_room.bathhouse_id' => $this->id,
                            ])
                            ->andWhere('bathhouse_room_price.day_id = :day_index', [':day_index' => $day_index])
                            ->groupBy('bathhouse_room.id')
                            ->indexBy('id')
                            ->asArray()
                            ->all();

                        foreach ($rooms as $room_id => $room)
                        {
                            $rooms[$room_id]['available'] = true;
                        }

                        return $rooms;
                    },
                ];
            }
        }
    }

    public function rules()
    {
        return [
            [['name', 'address', 'description', 'site', 'time_from', 'time_to', 'director_full_name', 'email', 'city_id', 'distance', 'latitude', 'longitude', 'rating'], 'required'],
            [['description'], 'string'],
            [['time_from', 'time_to', 'city_id', 'is_active'], 'integer'],
            [['distance', 'latitude', 'longitude', 'rating'], 'number'],
            [['name', 'address', 'site', 'schedule', 'director_full_name', 'email'], 'string', 'max' => 255]
        ];
    }

    public function attributeLabels()
    {
        return [
            'id'            => 'ID',
            'name'          => 'Name',
            'address'       => 'Address',
            'description'   => 'Description',
            'site'          => 'Site',
            'schedule'      => 'Schedule',
            'time_from'     => 'Time From',
            'time_to'       => 'Time To',
            'email'         => 'Email',
            'city_id'       => 'City ID',
            'distance'      => 'Distance',
            'latitude'      => 'Latitude',
            'longitude'     => 'Longitude',
            'rating'        => 'Rating',
            'is_active'     => 'Is Active',
        ];
    }

    public function getBathhouseRoom()
    {
        return $this->hasMany(BathhouseRoom::className(), ['bathhouse_id' => 'id']);
    }

}
