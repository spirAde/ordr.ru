<?php
namespace backend\controllers;

use Yii;
use yii\helpers\JWT;
use yii\web\UnauthorizedHttpException;
use backend\models\Managers;
use yii\rest\Controller;

class LoginController extends Controller
{

    public function actionIndex()
    {
        $data = \Yii::$app->request->post();

        if (empty($data['username']) || empty($data['password']))
        {
            throw new UnauthorizedHttpException('Username and password is required field for this type of request');
        }
        $manager = Managers::find()
            ->select('id, username, type, full_name, organization_id, phone')
            ->where('username = :username',[':username' => (string)$data['username']])
            ->andWhere('password = :password',[':password' => Managers::makeHash($data['password'])])
            ->one();

        if (empty($manager)) throw new UnauthorizedHttpException('Wrong username or password');

        if($manager->type == 'bath')
        {
            $bathhouse = $manager->bathhouse;
            $manager_result['id'] = $manager->id;
            $manager_result['username'] = $manager->username;
            $manager_result['type'] = $manager->type;
            $manager_result['full_name'] = $manager->full_name;
            $manager_result['phone'] = $manager->phone;
            $manager_result['organization_id'] = $manager->organization_id;
            $manager_result['organization_name'] = $bathhouse->name;
            $manager_result['city_id'] = $bathhouse->city_id;
        }

        return ['token' => JWT::encode($manager_result, Yii::$app->params['secret'])];
    }

}