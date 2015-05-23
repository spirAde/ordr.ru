<?php
namespace backend\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\helpers\Json;
use yii\helpers\VarDumper;
use yii\web\Controller;
use common\models\LoginForm;
use yii\filters\VerbFilter;

/**
 * Site controller
 */
class SiteController extends Controller
{
    /**
     * @inheritdoc
     */

    public function actionIndex()
    {
        return $this->render('index');
    }

    public function actionSmth()
    {
        //VarDumper::dump(\Yii::$app->request->get());
        echo Json::encode('smth');
        Yii::$app->end();
    }
}
