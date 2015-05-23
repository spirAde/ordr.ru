<?php

namespace common\models;

use Yii;

class BathhouseRoomSettings extends \yii\db\ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse_room_setting';
    }


    public function rules()
    {
        return [
            [['room_id', 'cleaning_time', 'min_duration', 'guest_limit', 'guest_threshold', 'guest_price'], 'required'],
            [['room_id', 'cleaning_time', 'min_duration', 'guest_limit', 'guest_threshold', 'prepayment', 'free_span'], 'integer'],
            [['guest_price', 'prepayment_persent'], 'number']
        ];
    }


    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'room_id' => 'Room ID',
            'cleaning_time' => 'Cleaning Time',
            'min_duration' => 'Min Duration',
            'guest_limit' => 'Guest Limit',
            'guest_threshold' => 'Guest Threshold',
            'guest_price' => 'Guest Price',
            'prepayment' => 'Prepayment',
            'free_span' => 'Free Span',
            'prepayment_persent' => 'Prepayment Persent',
        ];
    }
    public function getBathhouseRoom()
    {
        return $this->hasOne(BathhouseRoom::className(), ['id' => 'room_id']);
    }
}
