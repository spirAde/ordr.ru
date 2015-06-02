<?php

namespace api\models;

use Yii;
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
                    'roomId'                        => 'id',
                    'roomName'                      => 'name',
                    'types'                         => 'types',
                    'cityId'                        => 'city_id',
                    'rating',
                    'popularity',
                    'description',
                ];
                break;
            }

            default: return parent::fields();
        }
    }

    public function extraFields()
    {
        return [
            'settings' => function() {

                $settings = $this->settings;

                return [
                    'cleaningTime'         => $settings->cleaning_time,
                    'minDuration'          => $settings->min_duration,
                    'guestLimit'           => $settings->guest_limit,
                    'guestThreshold'       => $settings->guest_threshold,
                    'guestPrice'           => $settings->guest_price,
                    'prepayment'           => $settings->prepayment,
                    'freeSpan'             => $settings->free_span,
                    'prepaymentPercent'    => $settings->prepayment_percent,
                ];
            },
            'bathinfo' => function() {

                $bath = $this->bathhouse;

                return [
                    'bathhouseId'          => $bath->id,
                    'bathhouseName'        => $bath->name,
                    'bathhouseAddress'     => $bath->address,
                    'bathhouseDistance'    => $bath->distance,
                    'bathhouseLatitude'    => $bath->latitude,
                    'bathhouseLongitude'   => $bath->longitude,
                ];
            }
        ];
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
            'id' => 'ID',
            'bathhouse_id' => 'Bathhouse ID',
            'name' => 'Name',
            'description' => 'Description',
            'options' => 'Options',
            'types' => 'Types',
            'rating' => 'Rating',
            'popularity' => 'Popularity',
            'created' => 'Created',
        ];
    }

    public function getSettings()
    {
        return $this->hasOne(BathhouseRoomSettings::className(), ['room_id' => 'id']);
    }

    public function getBathhouse()
    {
        return $this->hasOne(Bathhouse::className(), ['id' => 'bathhouse_id']);
    }
}
