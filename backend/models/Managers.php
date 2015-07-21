<?php

namespace backend\models;

use Yii;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;

class Managers extends ActiveRecord implements IdentityInterface
{
    public $organization_name = '';
    public $city_id = '';

    public static function tableName()
    {
        return 'manager';
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

    public static function findIdentity($id)
    {
        return static::findOne($id);
    }

    public static function findIdentityByAccessToken($token, $type = null)
    {
        return static::findOne(['token' => $token]);
    }

    public function getId()
    {
        return $this->id;
    }


    public function getAuthKey()
    {
        return $this->token;
    }

    public function validateAuthKey($authKey)
    {
        return $this->getAuthKey() === $authKey;
    }

}
