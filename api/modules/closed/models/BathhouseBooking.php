<?php

namespace api\modules\closed\models;

use common\components\ApiHelpers;
use common\components\OrdrHelper;
use Yii;
use yii\helpers\ArrayHelper;


class BathhouseBooking extends \yii\db\ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse_booking';
    }

    public function fields()
    {
        switch (yii::$app->controller->action->id) {
            case 'index': {
                return [
                    'id'            => 'id',
                    'bathhouseId'   => 'bathhouse_id',
                    'roomId'        => 'room_id',
                    'startDate'     => 'start_date',
                    'endDate'       => 'end_date',
                    'startPeriod'   => 'start_period',
                    'endPeriod'     => 'end_period',
                    'services'      => 'services',
                    'guests'        => 'guests',
                    'statusId'      => 'status_id',
                    'userId'        => 'user_id',
                    'managerId'     => 'manager_id',
                    'costPeriod'    => 'cost_period',
                    'costServices'  => 'cost_services',
                    'costGuests'    => 'cost_guests',
                    'total'         => 'total',
                    'comment'       => 'comment',
                    'created'       => 'created',
                ];
            }
        }
    }

    public function rules()
    {
        return [
            [['room_id', 'start_date', 'end_date', 'start_period', 'end_period'], 'required'],
            [['bathhouse_id'],  'checkOrderUnique'],
            [['bathhouse_id'],  'checkBathhouseRoom'],
            [['end_date'],      'checkDates'],
            [['start_period'],  'checkPeriods'],
            [['cost_period'],   'checkCostPeriod'],
            [['cost_services'], 'checkCostServices'],
            [['cost_guests'],   'checkCostGuests'],
            [['total'],         'checkTotal'],
            [['start_period','end_period'], 'in', 'range' => range(ApiHelpers::FIRST_TIME_ID, ApiHelpers::LAST_TIME_ID)],
            [['bathhouse_id', 'room_id', 'start_period', 'end_period', 'guests', 'status_id', 'user_id', 'manager_id'], 'integer'],
            [['start_date', 'end_date', 'start_period', 'end_period',
                'cost_period', 'cost_services','cost_guests','total',
                'comment'], 'safe'],
            [['services', 'comment'], 'string'],
            ['cost_period', 'default', 'value' => 0,'on' => 'insert'],
            ['cost_services', 'default', 'value' => 0,'on' => 'insert'],
            ['cost_guests', 'default', 'value' => 0,'on' => 'insert'],
            ['total', 'default', 'value' => 0,'on' => 'insert'],
            ['guests', 'default', 'value' => 1,'on' => 'insert'],
            ['services', 'default', 'value' => json_encode(array())],
            ['user_id', 'default', 'value' => 0],
            ['manager_id', 'default', 'value' => (Yii::$app->user->identity->id) ? : 0],
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
        if($this->id == null)
        {
            if (BathhouseBooking::findOne([
                    'bathhouse_id' => $this->bathhouse_id,
                    'room_id' => $this->room_id,
                    'start_date' => $this->start_date,
                    'end_date' => $this->end_date,
                    'start_period' => $this->start_period,
                    'end_period' => $this->end_period
                ]) != null
            )
                $this->addError('bathhouse_id', 'Order already exist');
        }
    }

    public function checkBathhouseRoom()
    {
        if(BathhouseRoom::findOne(['bathhouse_id' => $this->bathhouse_id, 'id' => $this->room_id]) == null)
            $this->addError('bathhouse_id', 'Bathhouse - room mismatch');
    }

    public function checkDates()
    {
        if($this->start_date != $this->end_date and $this->end_date != date('Y-m-d',strtotime("+1 day", strtotime($this->start_date))))
            $this->addError('end_date', 'End_date should be next day of start_day');
    }

    public function checkTotal()
    {
        if((float)$this->total != (float)($this->cost_period + $this->cost_services + $this->cost_guests))
            $this->addError('total', 'Total sum is incorrect');
    }

    public function checkCostPeriod()
    {
        $prices = BathhouseRoom::findOne($this->room_id)->getPrices();

        if($this->start_date == $this->end_date)
            $day_time[$this->start_date] = [$this->start_period, $this->end_period];
        else
        {
            $day_time[$this->start_date]    = [$this->start_period, ApiHelpers::LAST_TIME_ID];
            $day_time[$this->end_date]      = [ApiHelpers::FIRST_TIME_ID, $this->end_period];
        }

        $sum = OrdrHelper::getSumBathOrder($day_time, $prices);

        if((float)array_sum($sum) != (float)$this->cost_period)
            $this->addError('cost_period', 'Cost_period sum is incorrect');

    }

    public function checkCostServices()
    {
        $services = json_decode(($this->services), true);
        if(!empty($services))
        {
            $services_prices = ArrayHelper::map(BathhouseService::findAll(['id'=>$services]), 'id', 'price');
            if((float)$this->cost_services != (float)array_sum($services_prices))
                $this->addError('cost_services', 'Cost_services sum is incorrect');
        }
        else
            if($this->cost_services != 0)
                $this->addError('cost_services', 'Cost_services sum is incorrect');
    }

    public function checkCostGuests()
    {
        if($this->cost_guests != 0)
            $this->addError('cost_guests', 'Cost_guests sum is incorrect');
    }

    public function checkPeriods()
    {
        if($this->end_period < $this->start_period and $this->start_date == $this->end_date)
            $this->addError('end_period','When end_period is less than start_period, start and end dates should be different');
    }

    public function getBathhouse()
    {
        return $this->hasOne(Bathhouse::className(), ['id' => 'bathhouse_id']);
    }

    public function getRoom()
    {
        return $this->hasOne(BathhouseRoom::className(), ['id' => 'room_id']);
    }

}
