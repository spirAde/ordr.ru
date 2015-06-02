<?php
namespace api\components;

use Yii;

class ApiHelpers
{
    public static function decamelize($word) {
        return $word = preg_replace_callback(
            '/(^|[a-z])([A-Z])/',
            function($match) { return strtolower(strlen($match[1]) ? '$match[1]$match[2]' : '$match[2]'); },
            $word
        );
    }

    public static function camelize($word) {
        return $word = preg_replace_callback(
            '/(^|_)([a-z])/',
            function($match) { return strtoupper('$match[2]'); },
            $word
        );
    }
}