<?php
namespace backend\controllers;

use Yii;
use yii\web\Controller;


class SiteController extends Controller
{
    //here we will making preload for manager panel

    public function actionIndex()
    {
        return $this->render('index');
    }

}
