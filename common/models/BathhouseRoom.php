<?php

namespace common\models;

use Yii;
use \yii\db\ActiveRecord;

class BathhouseRoom extends ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse_room';
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
