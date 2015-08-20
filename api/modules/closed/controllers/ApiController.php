<?php
namespace api\modules\closed\controllers;

use api\modules\closed\models\BathhouseBooking;
use Yii;
use common\components\JWT;
use common\components\ArrayHelper;
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
use yii\web\NotFoundHttpException;

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

        if (!parent::beforeAction($action)) {
            return false;
        }

        if ($action->controller->id === 'login' or Yii::$app->request->getMethod() == 'OPTIONS')
            return true;

        $authHeader = yii::$app->getRequest()->getHeaders()->get('Authorization');

        if ($authHeader !== null && preg_match("/^Bearer\\s+(.*?)$/", $authHeader, $matches))
        {

            $secret = \Yii::$app->params['secret'];
            $user = JWT::decode($matches[1], $secret);

            if ($user) {
                if (isset($user->tokenLifetime) and !empty($user->tokenLifetime) and ($user->tokenLifetime - time()) > 0) {
                    $manager = Managers::findIdentity($user->id);

                    if ($manager == null)
                        throw new UnauthorizedHttpException('Undefined user');
                    else {
                        Yii::$app->user->login($manager);

                        return true;
                    }
                } else
                    throw new UnauthorizedHttpException('Token expired');
            } else
                throw new UnauthorizedHttpException('Undefined user');
        }

        throw new BadRequestHttpException('Bad request');
    }

    public function afterAction($action, $result)
    {
        Yii::$app->user->logout();

        return parent::afterAction($action, $result);
    }

    public function actions()
    {
        return ArrayHelper::merge(parent::actions(), [
            'index' => [
                'class' => 'api\components\actions\FilterIndexAction',
                'modelClass' => $this->modelClass,
            ],
            'options' => [
                'class' => 'api\components\actions\FixedOptionsAction',
            ],
        ]);
    }

    public function findModel($id)
    {
        $modelClass = $this->modelClass;
        $keys = $modelClass::primaryKey();
        if(count($keys) > 1)
        {
            $values = explode(',', $id);
            if (count($keys) === count($values))
                $model = $modelClass::findOne(array_combine($keys, $values));
        }
        elseif($id !== null)
            $model = $modelClass::findOne($id);

        if (isset($model))
            return $model;
        else
        {
            if($modelClass instanceof BathhouseBooking)
                Yii::info('Fail to load model, id = '.$id,'order');
            throw new NotFoundHttpException("Object not found: $id");
        }
    }
}