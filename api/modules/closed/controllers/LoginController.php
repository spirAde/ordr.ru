<?php
namespace api\modules\closed\controllers;

use common\components\ApiHelpers;
use Yii;
use common\components\JWT;
use yii\rest\ActiveController;
use yii\web\UnauthorizedHttpException;
use api\modules\closed\models\Managers;
use yii\rest\Controller;
use yii\filters\Cors;
use common\components\ArrayHelper;

class LoginController extends \yii\web\Controller
{

    public function actionIndex()
    {
        if(Yii::$app->request->getMethod() === 'OPTIONS')
        {
            Yii::$app->getResponse()->getHeaders()->set('Access-Control-Allow-Headers', 'accept, content-Type, authorization');
        }
        else
        {

            $data = \Yii::$app->request->post();

            if (empty($data['username']) || empty($data['password'])) {
                throw new UnauthorizedHttpException('Username and password is required field for this type of request');
            }
            $manager = Managers::find()
                ->select('id, username, type, full_name, organization_id, phone')
                ->where('username = :username', [':username' => (string)$data['username']])
                ->andWhere('password = :password', [':password' => Managers::makeHash($data['password'])])
                ->one();

            if (empty($manager)) throw new UnauthorizedHttpException('Wrong username or password');

            $token_lifetime = strtotime('now', strtotime('+' . Yii::$app->params['manager_token_lifetime'] . ' days'));

            if ($manager->type == 'bath') {
                $bathhouse = $manager->bathhouse;
                $manager_result['id'] = $manager->id;
                $manager_result['username'] = $manager->username;
                $manager_result['type'] = $manager->type;
                $manager_result['fullName'] = $manager->full_name;
                $manager_result['phone'] = $manager->phone;
                $manager_result['organizationId'] = $manager->organization_id;
                $manager_result['organizationName'] = $bathhouse->name;
                $manager_result['cityId'] = $bathhouse->city_id;
                $manager_result['tokenLifetime'] = $token_lifetime;
            }

            $token = JWT::encode($manager_result, Yii::$app->params['secret']);

            $manager->token = $token;
            $manager->expiry_date = $token_lifetime;
            $manager->save();

            Yii::$app->user->login($manager);

            return ['token' => $token];
        }
    }

}