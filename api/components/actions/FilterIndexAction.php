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
            $limit = (isset($filter['limit'])) ? $filter['limit'] : 10;

            $modelClass = $this->modelClass;
            $cache_key = md5(json_encode($filter).$modelClass);

            $result = Yii::$app->cache->get($cache_key);

            if($result === false)
            {
                $model = new $this->modelClass();

                $page = (isset($filter['page'])) ? $filter['page'] : 1;
                $offset = $limit * $page - $limit;


                foreach ($filter as $key => $value) {
                    $separator = '=';
                    if ($value === '') {
                        foreach ($this->separators as $separator_item)
                            if (stripos($key, $separator_item) !== false) {
                                unset($filter[$key]);
                                $separator = $separator_item;
                                list($key, $value) = explode($separator, $key);

                                break;
                            }
                    }

                    if (in_array($key, $this->pattern)) {
                        unset($filter[$key]);
                        continue;
                    }

                    if (!$model->hasAttribute(ApiHelpers::decamelize($key))) {
                        throw new HttpException(404, 'Invalid query param:' . $key);
                    } elseif (ApiHelpers::decamelize($key) != $key) {
                        unset($filter[$key]);
                        $filter[ApiHelpers::decamelize($key)] = [
                            'value' => $value,
                            'separator' => $separator
                        ];
                    } else {
                        $filter[$key] = [
                            'value' => $value,
                            'separator' => $separator
                        ];
                    }
                }
                try {

                    $query = $modelClass::find();
                    foreach ($filter as $key => $item)
                        $query->andWhere($key . $item['separator'] . $item['value']);

                    $query->limit = $limit;
                    $query->offset = $offset;

                    if (yii::$app->controller->module->id == 'closed')
                        $query->andWhere('bathhouse_id = :bathhouse_id', [':bathhouse_id' => yii::$app->user->identity->organization_id]);

                    $result = $query->all();
                    Yii::$app->cache->set($cache_key,$result,Yii::$app->params['cache_duration']);

                } catch (Exception $ex) {
                    throw new HttpException(500, 'Internal server error');
                }
            }
            return new ArrayDataProvider([
                'allModels' => $result,
                'pagination' => [
                    'pageSize' => $limit,
                ],
            ]);

        };
        return parent::run();
    }
}