<?php
namespace api\controllers;

use yii\helpers\ArrayHelper;
use yii\rest\ActiveController;
use Yii;
use yii\filters\auth\CompositeAuth;
use yii\filters\ContentNegotiator;
use yii\filters\RateLimiter;
use yii\web\Response;
use yii\filters\VerbFilter;

class ApiController extends ActiveController
{

    public function behaviors()
    {
        return [
            'contentNegotiator' => [
                'class' => ContentNegotiator::className(),
                'formats' => [
                    'application/json' => Response::FORMAT_JSON,
                ],
            ],
            'verbFilter' => [
                'class' => VerbFilter::className(),
                'actions' => $this->verbs(),
            ],
            'authenticator' => [
                'class' => CompositeAuth::className(),
            ],
            'rateLimiter' => [
                'class' => RateLimiter::className(),
            ],
        ];
    }

    public function actions()
    {
        return ArrayHelper::merge(parent::actions(),[
            'index' => [
                'class' => 'api\components\actions\FilterIndexAction',
                'modelClass' => $this->modelClass,
            ]
        ]);
    }

}