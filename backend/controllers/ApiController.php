<?php
namespace backend\controllers;

use Yii;
use yii\helpers\JWT;
use yii\helpers\ArrayHelper;
use yii\rest\ActiveController;

use yii\filters\auth\CompositeAuth;
use yii\filters\ContentNegotiator;
use yii\filters\RateLimiter;
use yii\web\Response;
use yii\filters\VerbFilter;
use yii\helpers\VarDumper;
use yii\web\BadRequestHttpException;
use yii\web\UnauthorizedHttpException;

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

    public function beforeAction($action)
    {

        if (!parent::beforeAction($action))
        {
            return false;
        }

        if ($action->controller->id === 'login' && $action->id === 'index')
            return true;

        $authHeader = yii::$app->getRequest()->getHeaders()->get('Authorization');

        if ($authHeader !== null && preg_match("/^Bearer\\s+(.*?)$/", $authHeader, $matches))
        {

            $secret = \Yii::$app->params['secret'];
            $user = JWT::decode($matches[1], $secret);
            die(var_dump($user));
            if ($user)
                return true;
            else
                throw new UnauthorizedHttpException('Undefined user');
        }
        throw new UnauthorizedHttpException('Undefined user');
    }

}