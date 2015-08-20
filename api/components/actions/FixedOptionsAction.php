<?php

namespace api\components\actions;

use Yii;
use yii\rest\OptionsAction;

class FixedOptionsAction extends OptionsAction
{

    public function run($id = null)
    {
        if (Yii::$app->getRequest()->getMethod() !== 'OPTIONS') {
            Yii::$app->getResponse()->setStatusCode(405);
        }
        $options = ['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
        Yii::$app->getResponse()->getHeaders()->set('Access-Control-Allow-Headers', 'accept, content-Type, authorization');
        Yii::$app->getResponse()->getHeaders()->set('Access-Control-Allow-Methods', implode(', ', $options));
        Yii::$app->getResponse()->getHeaders()->set('Access-Control-Allow-Credentials', 'true');
        Yii::$app->getResponse()->getHeaders()->set('Access-Control-Max-Age','1728000');
    }
    
}
