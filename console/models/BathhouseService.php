<?php

namespace console\models;

use Yii;

class BathhouseService extends \yii\db\ActiveRecord
{

    public static function tableName()
    {
        return 'bathhouse_service';
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
