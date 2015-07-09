<?php

namespace backend\models;

use Yii;
use yii\db\ActiveRecord;

class Managers extends ActiveRecord
{
    public $organization_name = '';
    public $city_id = '';

    public static function tableName()
    {
        return 'managers';
    }

    public function rules()
    {
        return [
            [['username', 'password', 'type', 'full_name', 'organization_id', 'token'], 'required'],
            [['organization_id'], 'integer'],
            [['expiry_date'], 'safe'],
            [['username', 'password', 'full_name', 'token'], 'string', 'max' => 255],
            [['type'], 'string', 'max' => 20],
            [['phone'], 'string', 'max' => 200]
        ];
    }

    public function attributeLabels()
    {
        return [
            'id'                => 'ID',
            'username'          => 'Username',
            'password'          => 'Password',
            'type'              => 'Type',
            'full_name'         => 'Full Name',
            'organization_id'   => 'Organization ID',
            'phone'             => 'Phone',
            'token'             => 'Token',
            'expiry_date'       => 'Expiry Date',
        ];
    }

    public function getBathhouse()
    {
        return $this->hasOne(Bathhouse::className(), ['id' => 'organization_id']);
    }

    public static function makeHash($password)
    {
        //todo salt or smth complicated
        return md5($password);
    }

}
