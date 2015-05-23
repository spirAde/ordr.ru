<?php

namespace common\models;

use Yii;
use yii\db\ActiveRecord;

class City extends ActiveRecord
{

    public static function tableName()
    {
        return 'city';
    }

    public function rules()
    {
        return [
            [['city', 'slug', 'latitude', 'longitude', 'time_zone'], 'required'],
            [['latitude', 'longitude'], 'number'],
            [['city', 'time_zone'], 'string', 'max' => 255],
            [['slug'], 'string', 'max' => 4],
            [['slug'], 'unique']
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'city' => 'City',
            'slug' => 'Slug',
            'latitude' => 'Latitude',
            'longitude' => 'Longitude',
            'time_zone' => 'Time Zone',
        ];
    }
}
