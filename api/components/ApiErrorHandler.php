<?php
namespace api\components;

use Yii;
use yii\helpers\VarDumper;
use \yii\web\ErrorHandler;

class ApiErrorHandler extends ErrorHandler
{
    protected function renderException($exception)
    {
        if (Yii::$app->has('response')) {
            $response = Yii::$app->getResponse();
        } else {
            $response = new Response();
        }

        $response->data = $this->convertExceptionToArray($exception);
        $response->setStatusCode($exception->statusCode);

        $response->send();
    }

    protected function convertExceptionToArray($exception)
    {
        return [
            'meta' => [
                'status' => 'error',
                'errors' => [
                    'message' => $exception->getName(),
                    'code' => $exception->statusCode
                ]
            ]
        ];
    }
}