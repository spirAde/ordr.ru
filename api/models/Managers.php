<?php

namespace api\models;

use Yii;

class Managers extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'managers';
    }

    /**
     * @inheritdoc
     */
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

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'username' => 'Username',
            'password' => 'Password',
            'type' => 'Type',
            'full_name' => 'Full Name',
            'organization_id' => 'Organization ID',
            'phone' => 'Phone',
            'token' => 'Token',
            'expiry_date' => 'Expiry Date',
        ];
    }
}
