<?php
namespace backend\controllers;

use Yii;
use yii\web\Controller;


class SiteController extends Controller
{

    public $layout = false;

    public function actionIndex()
    {
        $preload = '';
        return $this->render('//layouts/main', array(
            'preload' => $preload
        ));
    }

    public function actionManager()
    {
        $preload = '';
        return $this->render('//layouts/main', array(
            'preload' => $preload
        ));
    }

}
