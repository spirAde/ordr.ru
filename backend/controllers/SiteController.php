<?php
namespace backend\controllers;

use Yii;
use yii\web\Controller;


class SiteController extends Controller
{

    public $layout = false;

    public function actionIndex()
    {
        return $this->render('//layouts/main');
    }

}
