<?php
namespace api\modules\closed\models;

use yii\db\ActiveRecord;
use yii\helpers\VarDumper;
use yii\web\IdentityInterface;

class User extends ActiveRecord implements IdentityInterface
{
    public static function findIdentityByAccessToken($token, $type = null)
    {
        VarDumper::dump(1);
        //return static::findOne(['access_token' => $token]);
    }
}