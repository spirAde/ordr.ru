<?php

namespace api\modules\closed\models;

use Yii;
use yii\db\ActiveRecord;

class Bathhouse extends ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse';
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

}
