<?php

namespace api\models;

use Yii;


class BathhouseRoomPrice extends \yii\db\ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse_room_price';
    }


    public function rules()
    {
        return [
            [['room_id', 'start_period', 'end_period', 'price', 'day_id'], 'required'],
            [['room_id', 'start_period', 'end_period', 'day_id'], 'integer'],
            [['price'], 'number']
        ];
    }


    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'room_id' => 'Room ID',
            'start_period' => 'Start Period',
            'end_period' => 'End Period',
            'price' => 'Price',
            'day_id' => 'Day ID',
        ];
    }
}
