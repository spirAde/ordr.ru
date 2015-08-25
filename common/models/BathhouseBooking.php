<?php

namespace common\models;

use Yii;

class BathhouseBooking extends \yii\db\ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse_booking';
    }

    public function rules()
    {
        return [];
    }

    public function attributeLabels()
    {
        return [];
    }

    public static function getAllBookingsForDate($room_id, $date)
    {
        return self::find()
            ->select('id, start_period,end_period,start_date,end_date, room_id')
            ->where('
            ((start_date = :start_date AND end_date = :end_date)
            OR (start_date = :prev_start_date AND end_date = :prev_end_date)
            OR (start_date = :next_start_date AND end_date = :next_end_date))
            AND room_id = :room_id', [
                ':start_date' => $date,
                ':end_date' => $date,
                ':prev_start_date' => date('Y-m-d', strtotime('-1 day', strtotime($date))),
                ':prev_end_date' => $date,
                ':next_start_date' => $date,
                ':next_end_date' => date('Y-m-d', strtotime('+1 day', strtotime($date))),
                ':room_id' => (int)$room_id,
            ])
            ->orderBy('start_period')
            ->all();
    }

}
