<?php

namespace console\models;

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

}
