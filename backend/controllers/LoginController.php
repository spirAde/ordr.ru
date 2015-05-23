<?php
namespace api\modules\control\controllers;

use api\controllers\ApiController;
use yii\db\Query;
use yii\helpers\JWT;
use yii\web\UnauthorizedHttpException;

class LoginController extends ApiController
{
    public function actionIndex()
    {
        $data = \Yii::$app->request->post();

        if (empty($data['username']) || empty($data['password'])) {
            throw new UnauthorizedHttpException('Username and password is required field for this type of request');
        }

        $user = (new Query())
            ->select('
                user.id, user.organization_id, user.first_name, user.last_name,
                user.role, user.token, bathhouse_detail.name as organization_name, city.slug as city')
            ->from('user')
            ->innerJoin('bathhouse_detail', 'bathhouse_detail.id = user.organization_id')
            ->innerJoin('city', 'bathhouse_detail.city_id = city.id')
            ->where('user.username = :username', [':username' => $data['username']])
            ->andWhere('user.password = :password', [':password' => $data['password']])
            ->one();

        if (empty($user)) throw new UnauthorizedHttpException('Wrong username or password');

        $key = \Yii::$app->params['secret'];

        $token = JWT::encode($user, $key);

        return ['token' => $token];
    }
}