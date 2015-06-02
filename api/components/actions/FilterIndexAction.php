<?php

namespace api\components\actions;

use Yii;
use yii\rest\IndexAction;
use yii\data\ActiveDataProvider;
use api\components\ApiHelpers;
use yii\web\HttpException;

class FilterIndexAction extends IndexAction
{
    private $pattern = ['page', 'fields', 'order', 'limit', 'expand'];

    public function run()
    {
        $this->prepareDataProvider = function($action)
        {
            $filter = yii::$app->request->get();
            $modelClass = $this->modelClass;
            $model = new $this->modelClass();

            foreach ($filter as $key => $value)
            {
                if(in_array($key, $this->pattern))
                {
                    unset($filter[$key]);
                    continue;
                }

                if (!$model->hasAttribute(ApiHelpers::decamelize($key)))
                {
                    throw new HttpException(404, 'Invalid query param:' . $key);
                }

                elseif(ApiHelpers::decamelize($key) != $key)
                {
                    $filter[ApiHelpers::decamelize($key)] = $value;
                    unset($filter[$key]);
                }
            }

            try
            {
                if($filter)
                {
                    return new ActiveDataProvider([
                        'query' => $modelClass::find()->where($filter),
                    ]);
                }

                else
                {
                    return new ActiveDataProvider([
                        'query' => $modelClass::find(),
                    ]);
                }
            }
            catch (Exception $ex)
            {
                throw new HttpException(500, 'Internal server error');
            }

        };
        return parent::run();
    }
}