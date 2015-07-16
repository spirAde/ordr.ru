<?php

namespace backend\models;

use Yii;


class BathhouseBooking extends \yii\db\ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse_booking';
    }

    public function rules()
    {
        return [
            [['room_id', 'start_date', 'end_date', 'start_period', 'end_period'], 'required'],
            [['bathhouse_id'], 'checkOrderUnique'],
            [['bathhouse_id', 'room_id', 'start_period', 'end_period', 'guests', 'status_id', 'user_id', 'manager_id'], 'integer'],
            [['start_date', 'end_date', 'created'], 'safe'],
            [['services', 'comment'], 'string'],
            ['cost_period', 'default', 'value' => 0,'on' => 'insert'],
            ['cost_services', 'default', 'value' => 0,'on' => 'insert'],
            ['cost_guests', 'default', 'value' => 0,'on' => 'insert'],
            ['total', 'default', 'value' => 0,'on' => 'insert'],
            ['guests', 'default', 'value' => 1,'on' => 'insert'],
            ['services', 'default', 'value' => json_encode(array())],
            ['user_id', 'default', 'value' => 0],
            ['manager_id', 'default', 'value' => (Yii::$app->user->identity->id) ? :null],
            ['status_id', 'default', 'value' => 1],
            ['created', 'default', 'value' => date('Y-m-d H:i:s'),'on' => 'insert'],
            [['cost_period', 'cost_services', 'cost_guests', 'total'], 'number']
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'bathhouse_id' => 'Bathhouse ID',
            'room_id' => 'Room ID',
            'start_date' => 'Start Date',
            'end_date' => 'End Date',
            'start_period' => 'Start Period',
            'end_period' => 'End Period',
            'services' => 'Services',
            'guests' => 'Guests',
            'status_id' => 'Status ID',
            'user_id' => 'User ID',
            'manager_id' => 'Manager ID',
            'cost_period' => 'Cost Period',
            'cost_services' => 'Cost Services',
            'cost_guests' => 'Cost Guests',
            'total' => 'Total',
            'comment' => 'Comment',
            'created' => 'Created',
        ];
    }

    public function checkOrderUnique()
    {
        return (BathhouseBooking::findOne('
                            bathhouse_id = :bathhouse_id
                            AND room_id = :room_id
                            AND start_date = :start_date
                            AND end_date = :end_date
                            AND start_period = :start_period
                            AND end_period = :end_period'
                ,[
                    ':bathhouse_id'     => $this->bathhouse_id,
                    ':room_id'          => $this->room_id,
                    ':start_date'       => $this->start_date,
                    ':end_date'         => $this->end_date,
                    ':start_period'     => $this->start_period,
                    ':end_period'       => $this->end_period
                ]) == null);
    }

}