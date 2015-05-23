<?php

namespace common\models;

use Yii;
use yii\db\ActiveRecord;

class Bathhouse extends ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse';
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

}
