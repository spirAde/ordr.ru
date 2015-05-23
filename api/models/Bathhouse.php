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
        switch($this->scenario)
        {
            case 'index':
            {
                return  [
                    'bathhouse_id'=>'bathhouse.id',
                    'name',
                    'slug',
                    'address',
                    'description',
                    'contacts',
                    'options',
                    'city_id',
                    'distance',
                    'latitude',
                    'longitude',
                    'rating_items'
                ];
            }
        }
    }

    public function extraFields()
    {
        return [
            'min_price'=>function()
                {

                },
            'rooms' => function()
                {
                    $rooms = $this->rooms;
                    $result = [];
                    foreach($rooms as $room)
                        $result[$room->id] = [
                            'options'=>''
                            'types'=>''
                            'rating'=>''
                            'popularity'=>''
                            'reviews'=>''
                            'price'=>''
                            'min_duration'=>''
                            'prepayment'=>''
                            'schedule'=>''
                            'services'=>''
                            'services'=>''
                            'guests'=>''
                            'show'=>''
                            'active'=>''
                        ];
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
