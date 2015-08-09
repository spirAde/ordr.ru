<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace common\components;


use yii\helpers\BaseArrayHelper;

/**
 * ArrayHelper provides additional array functionality that you can use in your
 * application.
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class ArrayHelper extends BaseArrayHelper
{
    public static $delimiter = '.';

    public static function path($array, $path, $default = NULL, $delimiter = NULL)
    {
        if (!self::isArray($array)) {
            // This is not an array!
            return $default;
        }

        if (is_array($path)) {
            // The path has already been separated into keys
            $keys = $path;
        }
        else {
            if (array_key_exists($path, $array)) {
                // No need to do extra processing
                return $array[$path];
            }

            if ($delimiter === NULL) {
                // Use the default delimiter
                $delimiter = self::$delimiter;
            }

            // Remove starting delimiters and spaces
            $path = ltrim($path, "{$delimiter} ");

            // Remove ending delimiters, spaces, and wildcards
            $path = rtrim($path, "{$delimiter} *");

            // Split the keys by delimiter
            $keys = explode($delimiter, $path);
        }

        do {
            $key = array_shift($keys);

            if (ctype_digit($key)) {
                // Make the key an integer
                $key = (int) $key;
            }

            if (isset($array[$key])) {
                if ($keys) {
                    if (self::isArray($array[$key])) {
                        // Dig down into the next part of the path
                        $array = $array[$key];
                    }
                    else {
                        // Unable to dig deeper
                        break;
                    }
                }
                else {
                    // Found the path requested
                    return $array[$key];
                }
            }
            elseif ($key === '*') {
                // Handle wildcards

                $values = array();
                foreach ($array as $arr) {
                    //if ($value = self::path($arr, implode('.', $keys))) {
                        $values[] = self::path($arr, implode('.', $keys));
                    //}
                }

                if ($values) {
                    // Found the values requested
                    return $values;
                }
                else {
                    // Unable to dig deeper
                    break;
                }
            }
            else {
                // Unable to dig deeper
                break;
            }
        }
        while ($keys);

        // Unable to find the value requested
        return $default;
    }

    public static function isArray($value)
    {
        if (is_array($value)) {
            // Definitely an array
            return TRUE;
        }
        else {
            // Possibly a Traversable object, functionally the same as an array
            return (is_object($value) && $value instanceof Traversable);
        }
    }

    public static function flatten($array)
    {
        $is_assoc = self::isAssociative($array);

        $flat = array();
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $flat = array_merge($flat, self::flatten($value));
            }
            else {
                if ($is_assoc) {
                    $flat[$key] = $value;
                }
                else {
                    $flat[] = $value;
                }
            }
        }
        return $flat;
    }
}
