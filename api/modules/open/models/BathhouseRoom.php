<?php

namespace api\modules\open\models;

use Yii;
use common\components\ApiHelpers;
use yii\db\Query;
use yii\db\ActiveRecord;

class BathhouseRoom extends ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse_room';
    }

    public function fields()
    {
        switch(yii::$app->controller->action->id)
        {
            case 'index':
            {
                return [
                    'id'                            => 'id',
                    'name'                          => 'name',
                    'types'                         => function()
                    {
                        $result = [];
                        $types = json_decode($this->types,true);

                        if(is_array($types))
                            foreach($types as $item)
                                if(array_key_exists((int)$item,yii::$app->params['bathhouse_type']))
                                    $result[] = yii::$app->params['bathhouse_type'][$item];

                        return $result;
                    },
                    'cityId'                        => 'city_id',
                    'rating',
                    'popularity',
                    'description',
                    'options'       => function()
                    {
                        $result = [];
                        $options = json_decode($this->options,true);

                        if(is_array($options))
                            foreach($options as $item)
                                if(array_key_exists((int)$item,yii::$app->params['bathhouse_room_options']))
                                    $result[] = yii::$app->params['bathhouse_room_options'][$item];

                        return $result;
                    },
                ];
            }
            case 'view':
            {
                return [
                    'id'                            => 'id',
                ];
            }
        }
    }

    public function extraFields()
    {
        switch(yii::$app->controller->action->id)
        {
            case 'index':
            {
                return [
                    'settings'  => function ()
                    {
                        $settings = $this->bathhouseRoomSettings;

                        return [
                            'cleaningTime'          => $settings->cleaning_time,
                            'minDuration'           => $settings->min_duration,
                            'guestLimit'            => $settings->guest_limit,
                            'guestThreshold'        => $settings->guest_threshold,
                            'guestPrice'            => $settings->guest_price,
                            'prepayment'            => $settings->prepayment,
                            'freeSpan'              => $settings->free_span,
                            'prepaymentPercent'     => $settings->prepayment_persent,
                        ];
                    },
                    'bathhouse'  => function ()
                    {
                        $bath = $this->bathhouse;
                        $options_former = function($options)
                        {
                            $result = [];
                            $options = json_decode($options,true);

                            if(is_array($options))
                                foreach($options as $item)
                                    if(array_key_exists((int)$item,yii::$app->params['bathhouse_options']))
                                        $result[] = yii::$app->params['bathhouse_options'][$item];

                            return $result;
                        };
                        return [
                            'id'           => $bath->id,
                            'name'         => $bath->name,
                            'address'      => $bath->address,
                            'distance'     => $bath->distance,
                            'options'      => $options_former($bath->options),
                            'point'        => [
                                'latitude'  => $bath->latitude,
                                'longitude' => $bath->longitude
                            ],

                        ];
                    },
                    'schedule'  => function()
                    {
                        return $this->getSchedule();
                    },
                    'services'  => function()
                    {
                        return $this->getServices();
                    },
                    'guests'    => function()
                    {
                        $settings = $this->bathhouseRoomSettings;

                        return [
                            'guestLimit'            => $settings->guest_limit,
                            'guestThreshold'        => $settings->guest_threshold,
                            'guestPrice'            => $settings->guest_price,
                        ];
                    },
                ];
            };
            case 'view':
            {
                return [
                    'schedule'  => function()
                    {
                        return $this->getSchedule();
                    },
                    'services'  => function()
                    {
                        return $this->getServices();
                    },
                    'guests'    => function()
                    {
                        $settings = $this->bathhouseRoomSettings;

                        return [
                            'guestLimit'            => $settings->guest_limit,
                            'guestThreshold'        => $settings->guest_threshold,
                            'guestPrice'            => $settings->guest_price,
                        ];
                    },
                ];
            }
        }
    }

    public function rules()
    {
        return [
            [['bathhouse_id', 'name', 'description', 'options', 'types', 'created'], 'required'],
            [['bathhouse_id'], 'integer'],
            [['description', 'options', 'types'], 'string'],
            [['rating', 'popularity'], 'number'],
            [['created'], 'safe'],
            [['name'], 'string', 'max' => 255]
        ];
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

    public function getBathhouse()
    {
        return $this->hasOne(Bathhouse::className(), ['id' => 'bathhouse_id']);
    }

    public function getBathhouseRoomReview()
    {
        return $this->hasMany(BathhouseRoomReview::className(), ['room_id' => 'id']);
    }

    public function getBathhouseRoomPrice()
    {
        return $this->hasMany(BathhouseRoomPrice::className(), ['room_id' => 'id']);
    }

    public function getSchedule()
    {
        $schedule = [];
        list($date_from, $current_time) = explode(' ', date('Y-m-d H:i', strtotime('now')));
        $date_to = date('Y-m-d', strtotime('+1 month', strtotime($date_from)));

        $periods = (new Query())
            ->select('bathhouse_schedule.schedule, bathhouse_schedule.date')
            ->from('bathhouse_schedule')
            ->where('bathhouse_schedule.date >= :date_from', [':date_from' => $date_from])
            ->andWhere('bathhouse_schedule.date <= :date_to', [':date_to' => $date_to])
            ->andWhere('bathhouse_schedule.room_id = :room_id', [':room_id' => $this->id])
            ->all();

        foreach ($periods as $period)
        {
            $schedule[$period['date']] =
                ApiHelpers::getFreeTimeDecomposition(
                    ApiHelpers::readFreeTime($period['schedule']));
        }

        $prices = (new Query())
            ->select(
                'bathhouse_room_price.start_period,
                                bathhouse_room_price.end_period,
                                bathhouse_room_price.price,
                                bathhouse_room_price.day_id')
            ->from('bathhouse_room_price')
            ->where('bathhouse_room_price.room_id = :room_id', [':room_id' => $this->id])
            ->all();

        $prices_day_index = [];

        foreach ($prices as $price)
        {
            $prices_day_index[$price['day_id']][] = [
                'period' => [$price['start_period'], $price['end_period']],
                'price'  => $price['price']
            ];
        }

        // Добавляем к каждому диапазону цену и цено-временной период
        foreach ($schedule as $date => $periods)
        {
            $date_index = date('w', strtotime($date));
            $date_prices = $prices_day_index[$date_index];

            foreach ($periods as $time_id => $period)
            {
                foreach ($date_prices as $idx => $value)
                {
                    if ($value['period'][0] <= $time_id && $time_id <= $value['period'][1])
                    {
                        $schedule[$date][$time_id]['price'] = floatval($value['price']);
                        $schedule[$date][$time_id]['price_period'] = intval($idx);
                    }
                }
            }
        }
        return $schedule;
    }
    public function getServices()
    {
        $result = [];
        $services = BathhouseService::find()
            ->select(
                'bathhouse_service.id,
                                bathhouse_service.name,
                                bathhouse_service.category,
                                bathhouse_service.price')
            ->where('bathhouse_service.bathhouse_id = :bathhouse_id', [':bathhouse_id' => $this->id])
            ->asArray()
            ->all();

        foreach($services as $service_item)
        {
            $category = $service_item['category'];
            unset($service_item['category']);
            $result[$category][] = $service_item;
        }

        return $result;
    }
}
