<?php

namespace common\models;

use Yii;

class BathhouseSchedule extends \yii\db\ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse_schedule';
    }

    public function rules()
    {
        return [];
    }

    public function attributeLabels()
    {
        return [];
    }

    public static function saveScheduleForDate($room_id, $day, $schedule)
    {
        if(empty($room_id) or empty($day) or empty($schedule))
            return false;
        yii::$app->db->createCommand()
            ->update('bathhouse_schedule', [
                'schedule' => json_encode($schedule)],
                'date = "' . $day . '" AND room_id = ' . (int)$room_id)
            ->execute();
        return true;
    }

    public static function getScheduleForDate($room_id, $date)
    {
        return self::findOne(['room_id' => $room_id, 'date' => $date]);
    }

}
