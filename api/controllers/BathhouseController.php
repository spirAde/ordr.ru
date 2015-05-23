<?php
namespace api\controllers;


class BathhouseController extends ApiController
{
    public $modelClass = 'api\models\Bathhouse';

    public function actionGeo()
    {
        return ['hi'=>'hi'];
    }
}