<?php

namespace api\models;

use Yii;

class BathhouseRoom extends \yii\db\ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse_room';
    }
    public function fields()
    {
        switch($this->scenario)
        {
            case 'index':
            {
                return [
                    'room_id'=>'bathhouse_room.id',
                    'room_name'=>'bathhouse_room.name',
                    'type_id'=>'bathhouse_room.type_id',
                    'bathhouse_room.rating',
                    'bathhouse_room.popularity',
                    'bathhouse_room.description',
                ]; break;
            }
            default : return parent::fields();
        }
    }
    public function extraFields()
    {
        return [
            'settings' => function()
                {

                    $settings = $this->settings;

                    return [
                        'cleaning_time'         => $settings->cleaning_time,
                        'min_duration'          => $settings->min_duration,
                        'guest_limit'           => $settings->guest_limit,
                        'guest_threshold'       => $settings->guest_threshold,
                        'guest_price'           => $settings->guest_price,
                        'prepayment'            => $settings->prepayment,
                        'free_span'             => $settings->free_span,
                        'prepayment_persent'    => $settings->prepayment_persent,
                    ];
                },
            'bathinfo' => function()
                {
                    $bath = $this->bathhouse;
                    return [
                        'bathhouse_id'          => $bath->id,
                        'bathhouse_name'        => $bath->name,
                        'bathhouse_address'     => $bath->address,
                        'bathhouse_distance'    => $bath->distance,
                        'bathhouse_latitude'    => $bath->latitude,
                        'bathhouse_longitude'   => $bath->longitude,
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
