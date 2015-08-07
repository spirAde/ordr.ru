<?php

namespace api\components\actions;

use Yii;
use yii\rest\OptionsAction;

class FixedOptionsAction extends OptionsAction
{

    public $collectionOptions = ['GET', 'POST', 'HEAD', 'OPTIONS'];
    public $resourceOptions = ['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

    
    public function run($id = null)
    {
        if (Yii::$app->getRequest()->getMethod() !== 'OPTIONS') {
            Yii::$app->getResponse()->setStatusCode(405);
        }
        $options = $id === null ? $this->collectionOptions : $this->resourceOptions;
        Yii::$app->getResponse()->getHeaders()->set('Access-Control-Allow-Headers', 'accept, content-Type, authorization');
        Yii::$app->getResponse()->getHeaders()->set('Allow', implode(', ', $options));
    }
}
