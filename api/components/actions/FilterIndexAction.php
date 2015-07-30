<?php

namespace api\components\actions;

use Yii;
use yii\helpers\VarDumper;
use yii\rest\IndexAction;
use yii\data\ArrayDataProvider;
use common\components\ApiHelpers;
use yii\web\HttpException;

class FilterIndexAction extends IndexAction
{
    private $pattern = ['page', 'fields', 'order', 'limit', 'expand'];
    private $separators = ['<>', '>', '<'];

    public function run()
    {
        $this->prepareDataProvider = function($action)
        {
            $filter = yii::$app->request->get();
            $modelClass = $this->modelClass;
            $model = new $this->modelClass();

            $limit = (isset($filter['limit'])) ? $filter['limit'] : 10;
            $page = (isset($filter['page'])) ? $filter['page'] : 1;
            $offset = $limit * $page - $limit;


            foreach ($filter as $key => $value)
            {
                $separator = '=';
                if($value === '')
                {
                    foreach($this->separators as $separator_item)
                        if (stripos($key, $separator_item) !== false)
                        {
                            unset($filter[$key]);
                            $separator = $separator_item;
                            list($key, $value) = explode($separator, $key);

                            break;
                        }
                }

                if(in_array($key, $this->pattern))
                {
                    unset($filter[$key]);
                    continue;
                }

                if (!$model->hasAttribute(ApiHelpers::decamelize($key)))
                {
                    //throw new HttpException(404, 'Invalid query param:' . $key);
                }
                elseif(ApiHelpers::decamelize($key) != $key)
                {
                    unset($filter[$key]);
                    $filter[ApiHelpers::decamelize($key)] = $value;
                }
                else
                {
                    $filter[$key] = $value;
                }
            }
            try
            {

                $query = $modelClass::find();
                foreach($filter as $key => $item)
                    $query->andWhere($key . $item['separator'] . $item['value']);

                $query->limit = $limit;
                $query->offset = $offset;

                return new ArrayDataProvider([
                    'allModels' => $query->all(),
                    'pagination' => [
                        'pageSize' => $limit,
                    ],
                ]);

            }
            catch (Exception $ex)
            {
                throw new HttpException(500, 'Internal server error');
            }

        };
        return parent::run();
    }
}