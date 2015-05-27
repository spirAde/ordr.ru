<?php

namespace api\models;

use Yii;

class Bathhouse extends \yii\db\ActiveRecord
{

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
                    'bathhouseId'=>'bathhouse.id',
                    'name',
                    'slug',
                    'address',
                    'description',
                    'contacts',
                    'options',
                    'cityId'=>'city_id',
                    'distance',
                    'latitude',
                    'longitude',
                    'ratingItems'=>'rating_items'
                ];
            }
        }
    }

    public function extraFields()
    {
        $additional_data = BathhouseRoomPrice::find()
            ->select(
                    'MIN(bathhouse_room_price.price) as minPrice,
                     bathhouse_room.bathhouse_id'
            )
            ->joinWith(['bathhouseRoom'], false)
            ->where([
                'bathhouse.is_active'    => 1,
                'bathhouse_room.bathhouse_id'           => $this->id,
            ])
            ->asArray()
            ->all();

        return [
            'minPrice'=>$additional_data['minPrice'],

            'rooms' => function($additional_data)
                {
                    $rooms = $this->rooms;
                    $result = [];
                    foreach($rooms as $room)
                    {
                        $room_settings = $room->settings;
                        $result[$room->id] = [
                            'roomId'            => $room->id,
                            'roomName'          => $room->name,
                            'roomDescription'   => $room->description,
                            'options'           => $room->options,
                            'types'             => $room->types,
                            'rating'            => floatval($room->rating),
                            'popularity'        => floatval($room->popularity),
                            'reviews'           => $room->reviews->asArray(),
                            'price'             => $additional_data['minPrice'],
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
            'id' => 'ID',
            'name' => 'Name',
            'address' => 'Address',
            'description' => 'Description',
            'site' => 'Site',
            'schedule' => 'Schedule',
            'time_from' => 'Time From',
            'time_to' => 'Time To',
            'director_full_name' => 'Director Full Name',
            'email' => 'Email',
            'city_id' => 'City ID',
            'distance' => 'Distance',
            'latitude' => 'Latitude',
            'longitude' => 'Longitude',
            'rating' => 'Rating',
            'is_active' => 'Is Active',
        ];
    }
    public function getRooms()
    {
        return $this->hasMany(BathhouseRoom::className(), ['hotel_id' => 'id']);
    }
}
