<?php

namespace console\models;

use Yii;

class User extends \yii\db\ActiveRecord
{

    public static function tableName()
    {
        return 'user';
    }

    public function rules()
    {
        return [
            [['phone', 'last_order_date'], 'required'],
            [['is_ban'], 'integer'],
            [['last_order_date'], 'safe'],
            [['phone'], 'string', 'max' => 12]
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'phone' => 'Phone',
            'is_ban' => 'Is Ban',
            'last_order_date' => 'Last Order Date',
        ];
    }
}
