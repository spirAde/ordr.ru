<?php

namespace console\models;

use Yii;
use yii\db\ActiveRecord;

class BathhouseRoom extends ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse_room';
    }

    public function attributeLabels()
    {
        return [
            'id'            => 'ID',
            'bathhouse_id'  => 'Bathhouse ID',
            'name'          => 'Name',
            'description'   => 'Description',
            'options'       => 'Options',
            'types'         => 'Types',
            'rating'        => 'Rating',
            'popularity'    => 'Popularity',
            'created'       => 'Created',
        ];
    }
    public function getBathhouseRoomSettings()
    {
        return $this->hasOne(BathhouseRoomSettings::className(), ['room_id' => 'id']);
    }
}
