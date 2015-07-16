<?php

namespace api\models;

use Yii;

class BathhouseBooking extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'bathhouse_booking';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['bathhouse_id', 'room_id', 'start_date', 'end_date', 'start_period', 'end_period', 'services', 'guests', 'status_id', 'cost_period', 'cost_services', 'cost_guests', 'total', 'comment', 'created'], 'required'],
            [['bathhouse_id', 'room_id', 'start_period', 'end_period', 'guests', 'status_id', 'user_id', 'manager_id'], 'integer'],
            [['start_date', 'end_date', 'created'], 'safe'],
            [['services', 'comment'], 'string'],
            [['cost_period', 'cost_services', 'cost_guests', 'total'], 'number']
        ];
    }

    /**
     * @inheritdoc
     */
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
}
