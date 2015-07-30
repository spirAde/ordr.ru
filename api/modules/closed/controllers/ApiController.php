<?php
namespace api\modules\closed\controllers;

use Yii;
use yii\helpers\JWT;
use yii\helpers\ArrayHelper;
use yii\rest\ActiveController;
use api\modules\closed\models\Managers;

use yii\filters\auth\CompositeAuth;
use yii\filters\ContentNegotiator;
use yii\filters\RateLimiter;
use yii\web\HttpException;
use yii\web\Response;
use yii\filters\VerbFilter;
use yii\helpers\VarDumper;
use yii\web\BadRequestHttpException;
use yii\web\UnauthorizedHttpException;

class ApiController extends ActiveController
{
    protected $pattern = ['page', 'fields', 'order', 'limit', 'expand'];

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

            if ($user)
            {
                if(isset($user->tokenLifetime) and !empty($user->tokenLifetime) and ($user->tokenLifetime - time()) > 0)
                {
                    $manager = Managers::findIdentity($user->id);

                    if($manager == null)
                        throw new UnauthorizedHttpException('Undefined user');
                    else
                    {
                        Yii::$app->user->login($manager);

                        return true;
                    }
                }
                else
                    throw new UnauthorizedHttpException('Token expired');
            }
            else
                throw new UnauthorizedHttpException('Undefined user');
        }

        throw new BadRequestHttpException('Bad request');
    }

    public function afterAction($action, $result)
    {
        Yii::$app->user->logout();

        return parent::afterAction($action, $result);
    }

}