<?php
namespace common\components;

use Yii;
use yii\helpers\ArrayHelper;

class ApiHelpers
{
    const FIRST_TIME_ID = 0;
    const LAST_TIME_ID = 144;
    const STEP = 3;

    public static function checkOrder($model)
    {
        return true;
    }

    public static function reformScheduleForDay($room_id, $start_date, $end_date)
    {
        return true;
    }

    // Возвращает свободные промежутки времени для записи, исходя из занятых периодов и
    // минимально возможного времени на запись
    public static function getFreeTime($busy_periods = [], $min_interval = 0, $time_format = false)
    {
        $free_periods = [];
        $result = [];

        // Первый и последний time_id
        $time_periods = [self::FIRST_TIME_ID, self::LAST_TIME_ID];

        if (!empty($busy_periods)) {

            $first_key = array_keys($busy_periods)[0];
            $last_key = array_reverse(array_keys($busy_periods))[0];

            if (sizeof($busy_periods) === 1) {
                $free_periods = [
                    0 => [$time_periods[0], $busy_periods[0][0]],
                    1 => [$busy_periods[0][1], $time_periods[1]]
                ];
            }
            else {
                // Прогоняем для поиска свободных интервалов
                foreach ($busy_periods as $idx => $period) {
                    if ($first_key == $idx) {
                        $free_periods[] =[$time_periods[0], $period[0]];
                    }
                    elseif ($last_key == $idx) {
                        $free_periods[] = [$busy_periods[$idx - 1][1], $period[0]];
                        $free_periods[] = [$period[1], $time_periods[1]];
                    }
                    else {
                        $free_periods[] = [$busy_periods[$idx - 1][1], $period[0]];
                    }
                }
            }

            // Фильтруем на случай, если свободные интервалы получились меньше минимального времени на заказ
            foreach ($free_periods as $idx => $period) {
                if (($period[1] - $period[0]) >= $min_interval) {
                    $result[] = $period;
                }
            }
        }
        else {
            $result[] = $time_periods;
        }

        if ($time_format) {
            foreach ($result as $idx => $period) {
                $result[$idx] = array_map('self::getTime', $period);
            }
        }

        return $result;
    }

    public static function writeFreeTime($periods)
    {
        return json_encode($periods);
    }

    public static function readFreeTime($periods)
    {
        return json_decode($periods,true);
    }

    public static function getTime($time_id)
    {
        $periods = \Yii::$app->params['time_periods'];

        return is_numeric($time_id) ? $periods[$time_id] : $time_id;
    }

    public static function getTimeId($time)
    {
        $periods = \Yii::$app->params['time_periods'];

        return array_search($time, $periods);
    }

    public static function getDuration($interval)
    {
        ($interval[0] < $interval[1]) ? $duration = $interval[1] - $interval[0] :
            $duration = (self::LAST_TIME_ID - $interval[0]) + $interval[1];

        return $duration;
    }

    public static function oneDayFilter($period)
    {
        return ($period[0] >= self::FIRST_TIME_ID && $period[1] <= self::LAST_TIME_ID);
    }

    public static function twoDayFilter($period)
    {
        return ($period[0] < self::LAST_TIME_ID && $period[1] > self::FIRST_TIME_ID);
    }

    public static function oneDaySearch($free_periods_dates = [], $selected_period)
    {
        $result = [];
        $count_id_in_hour = 6;

        foreach ($free_periods_dates as $date => $periods) {
            foreach ($periods as $idx => $period) {
                if ($period[0] <= $selected_period[0] && $selected_period[1] <= $period[1]) {
//                    ($period[1] - $selected_period[1]) >= $count_id_in_hour  ?
//                        $selected_period['extension_to'] = true : $selected_period['extension_to'] = false;
                    $selected_period['is_night'] = false;
                    $result[$date][] = $selected_period;
                }
            }
        }

        return $result;
    }

    // Поиск свободного времени для комнаты, исходя из выбранного пользователем времени и свободных часов
    // Предыдущая версия
    /*public static function search_free_time($free_periods_dates = array(), $selected_period = array(), $shift_time = 0, $time_format = false)
    {
        $result = array();
        $selected_periods = array();

        $count_id_in_hour = 6;

        if (!empty($shift_time))
        {
            $shift_times = range($count_id_in_hour, $shift_time * $count_id_in_hour, $count_id_in_hour);

            $selected_periods[] = $selected_period;

            foreach ($shift_times as $shift)
            {
                $selected_periods[] = array($selected_period[0] - $shift, $selected_period[1] - $shift);
                $selected_periods[] = array($selected_period[0] + $shift, $selected_period[1] + $shift);
            }
        }
        else
        {
            $selected_periods[] = $selected_period;
        }

        // Убираем дни у которых нету ниодного свободного промежутка в дате
        $free_periods_dates = array_filter($free_periods_dates);

        if (empty($free_periods_dates)) return false;

        $first_date = array_shift(array_keys($free_periods_dates));

        // Пустой selected_period может быть только, если поиск происходил по названию бани, и пользователя сразу кидает
        // на страницу деталей бани
        if (!empty($selected_period))
        {
            // Речь идет о заявке днем
            if ($selected_period[1] > $selected_period[0])
            {
                $tmp = array();

                // Фильтруем на случай, если из-за смещения по времени выпадает другой день
                $selected_periods = array_filter($selected_periods, 'self::one_day_filter');

                foreach ($selected_periods as $interval)
                {
                    $intervals = self::one_day_search($free_periods_dates, $interval);
                    if (!empty($intervals)) $tmp = array_merge($tmp, $intervals[$first_date]);
                }

                $result[$first_date] = $tmp;
            }
            // Ночная заявка, то есть задействуются 2 даты
            elseif ($selected_period[1] <= $selected_period[0])
            {
                $time_periods = array(self::FIRST_TIME_ID, self::LAST_TIME_ID);

                $last_date = end(array_keys($free_periods_dates));

                // Фильтруем на случай, если из-за смещения по времени выбранный пользователем период
                // перешел в категорию однодневной заявки
                $two_days_periods = array_filter($selected_periods, 'self::two_day_filter');

                // Находим промежутки, которые перешли в категорию однодневной заявки
                $one_day_periods = array_diff_key($selected_periods, $two_days_periods);

                foreach ($two_days_periods as $interval)
                {
                    // Переопределяем selected_period под вид ((t1, последний time_id),(первый time_id, t2))
                    // Добавляем флаг is_night, чтобы пояснить что заявка охватывает 2 даты
                    $new_selected_period = array(
                        0 => array($interval[0], $time_periods[1], 'is_night' => true),
                        1 => array($time_periods[0], $interval[1], 'is_night' => true),
                    );

                    foreach ($free_periods_dates as $date => $periods)
                    {
                        if ($date !== $last_date)
                        {
                            $next_day = date('Y-m-d', strtotime('+1 day', strtotime($date)));

                            // Последний свободный период текущего дня и первый период следующего дня
                            $last_period = end($periods);
                            $first_period = $free_periods_dates[$next_day][0];

                            // Проверяем, чтобы заявка умещалась в каждом из 2х дней
                            if (($last_period[0] <= $new_selected_period[0][0] && $new_selected_period[0][1] == $last_period[1]) &&
                                ($first_period[0] == $new_selected_period[1][0] && $new_selected_period[1][1] <= $first_period[1]))
                            {
//                                ($first_period[1] - $new_selected_period[1][1]) >= $count_id_in_hour  ?
//                                    $new_selected_period[1]['extension_to'] = true : $new_selected_period[1]['extension_to'] = false;
                                $result[$date][] = $new_selected_period[0];
                                $result[$next_day][] = $new_selected_period[1];
                            }
                        }
                    }
                }

                // Чистим полученные данные, ибо из-за смещения времени, периоды могут иметь отрицательные конечные
                // точки, или наоборот больше максимального time_id и тп
                // В конце обрабатываем полученные отрезки как однодневные заявки и упаковываем в result
                foreach ($one_day_periods as $idx => $one_day_period)
                {
                    $tmp = array();
                    $free_periods = array();

                    if ($one_day_period[0] >= self::LAST_TIME_ID)
                    {
                        $one_day_periods[$idx][0] -= self::LAST_TIME_ID;
                        $tmp[$last_date] = $free_periods_dates[$last_date];
                        $free_periods = self::one_day_search($tmp, $one_day_periods[$idx]);
                        $current_day = $last_date;
                    }
                    elseif ($one_day_period[1] <= self::FIRST_TIME_ID)
                    {
                        $one_day_periods[$idx][1] += self::LAST_TIME_ID;
                        $tmp[$first_date] = $free_periods_dates[$first_date];
                        $free_periods = self::one_day_search($tmp, $one_day_periods[$idx]);
                        $current_day = $first_date;
                    }

                    if (!empty($free_periods) && !empty($result[$current_day])) {
                        $result[$current_day] = array_merge($result[$current_day], $free_periods[$current_day]);
                    }
                }

            }
        }
        else
        {
            $result = $free_periods_dates;
        }

        // Если нету свободных интервалов
        if (empty($result)) return false;

        if ($time_format)
        {
            foreach ($result as $date => $periods)
            {
                foreach ($periods as $idx => $period)
                {
                    $result[$date][$idx] = array_map('self::get_time', $period);
                }
            }
        }

        return $result;
    }*/

    // Подсчет стоимости заявки исходя из дня недели, времени и цен
    public static function getSumBathOrder($days_time_order, $periods_price)
    {
        $count_id_in_hour = 6;

        $result = [];

        foreach ($days_time_order as $day => $time_period) {
            $day_index = date('w', strtotime($day));

            // Разбиваем на массивы цен и периодов
            $day_prices = ArrayHelper::path($periods_price[$day_index], '*.price');
            $day_periods = ArrayHelper::path($periods_price[$day_index], '*.period');

            $summ = 0;
            $price_period_indexes = [];

            foreach ($day_periods as $idx => $price_period) {
                // Ищем в каких ценовых промежутках находятся наши свободные промежутки времени
                if (($price_period[0] <= $time_period[0] && $time_period[0] < $price_period[1]) ||
                    ($price_period[0] < $time_period[1] && $time_period[1] <= $price_period[1])) {

                    $price_period_indexes[] = $idx;
                }
            }

            // Добавляем недостающие индексы ценовых промежутков, на случай если заявка покрывает более 2х интервалов
            $price_period_indexes = range(min($price_period_indexes), max($price_period_indexes));

            // В данном случае свободное время принадлежит одному ценовому промежутку
            if (sizeof($price_period_indexes) == 1) {
                $result[$day] = (($time_period[1] - $time_period[0]) * $day_prices[$price_period_indexes[0]]) / $count_id_in_hour;
            }
            else {
                foreach ($price_period_indexes as $price_period_index) {
                    if ($price_period_index == min($price_period_indexes)) {
                        $summ += ($day_periods[$price_period_index][1] - $time_period[0]) * $day_prices[$price_period_index];
                    }
                    elseif ($price_period_index == max($price_period_indexes)) {
                        $summ += ($time_period[1] - $day_periods[$price_period_index][0]) * $day_prices[$price_period_index];
                    }
                    else {
                        $summ += ($day_periods[$price_period_index][1] - $day_periods[$price_period_index][0]) * $day_prices[$price_period_index];
                    }
                }

                $result[$day] = $summ / $count_id_in_hour;
            }
        }

        return $result;
    }

    public static function getBathhouseType($type_id)
    {
        $types = \Yii::$app->params['bathhouse_type'];

        return $types[$type_id];
    }

    public static function getBathhouseTypeRus($type_id)
    {
        $types = \Yii::$app->params['bathhouse_type_rus'];

        return $types[$type_id];
    }

    //Малая погрешность в рамках города
    //60 - число минут в градусе
    //1.1515 - соотношение мили обычной к морской, морская миля длиной в 1 минуту на экваторе.
    //1.609344 - соотношение километров к миле
    public static function getDistance($first_coordinates = array(), $second_coordinates = array()) {

        $lat1 = $first_coordinates['latitude'];
        $lat2 = $second_coordinates['latitude'];
        $lon1 = $first_coordinates['longitude'];
        $lon2 = $second_coordinates['longitude'];

        $theta = $lon2 - $lon1;
        $length = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
        $angle = acos($length);

        $distance = round(rad2deg($angle) * 60 * 1.1515 * 1.609344, 1);

        return $distance;
    }

    public static function getRoundTime($time)
    {
        list($hour, $minute) = explode(':', $time);

        if (intval($minute) >= 0 && intval($minute) < 30) return $hour . ':30';
        elseif (intval($minute) >= 30 && intval($minute) <= 59) return date('H', strtotime('+1 hours', strtotime($time))) . ':00';
    }

    // Проверяет вписывается время заявки в свободное время или нет
    /*public static function checkFreeTime($free_periods, $order)
    {
        $check = [];

        if (sizeof($free_periods) === 1) {
            $periods_arr = self::readFreeTime($free_periods[0]['free_time']);

            foreach ($periods_arr as $period) {
                if ($period[0] <= $start_period && $end_period <= $period[1]) $check[] = $period;
            }
        }
        else {
            $start_date_free_periods = self::readFreeTime($free_periods[0]['free_time']);
            $end_date_free_periods = self::readFreeTime($free_periods[1]['free_time']);

            VarDumper::dump($start_date_free_periods);
            VarDumper::dump($end_date_free_periods);
        }

        return empty($check) ? false : true;
    }*/

    // Раскладывает свободные интервалы времени на определенные интервалы
    // step - по какие интервалы времени разбивать сутки(дефолтно 3 = 30мин)
    public static function getFreeTimeDecomposition($free_time = [], $step = 3)
    {
        $result = [];
        // Делим общий массив периодов по 30 минут, в дальнейшем добавим делитель, в зависимости от времени минимальной
        // заявки для разного типа организаций
        $divide_periods = range(self::FIRST_TIME_ID, self::LAST_TIME_ID, $step);

        $tmp = [];

        // Выстраиваем все времена, исходя из концевых для каждого периода свободного времени
        foreach ($free_time as $time)
        {
            $tmp[] = array_values(range($time[0], $time[1], self::STEP));
        }

        $tmp_flatten = ArrayHelper::flatten($tmp);

        // Находим диапазоны, которые заняты
        $diff = array_diff($divide_periods, $tmp_flatten);
        // Преобразуем в человекопонятный вид и указываем доступноть времени
        foreach ($tmp_flatten as $time_id) {
            $result[$time_id] = [
                'time' => self::getTime($time_id),
                'enable' => true,
            ];
        }

        foreach ($diff as $time_id) {
            $result[$time_id] = [
                'time' => self::getTime($time_id),
                'enable' => false
            ];
        }

        ksort($result);

        if (isset($result[self::LAST_TIME_ID])) unset($result[self::LAST_TIME_ID]);

        return $result;
    }

    // Проверяет, чтобы 2 временных периода не пересекались
    public static function checkOrderIntersection($first_period = [], $second_period = ъх)
    {
        $first_period = range($first_period[0], $first_period[1], self::STEP);
        $second_period = range($second_period[0], $second_period[1], self::STEP);

        $result = array_intersect($first_period, $second_period);

        return empty($result) ? true : false;
    }

    public static function datesRange($start_date, $end_date)
    {
        $dates = [];
        $current = strtotime($start_date);
        $last = strtotime($end_date);

        while ($current <= $last) {

            $dates[] = date('Y-m-d', $current);
            $current = strtotime('+1 day', $current);
        }

        return $dates;
    }

    public static function decamelize($word) {
        return $word = preg_replace_callback(
            "/(^|[a-z])([A-Z])/",
            function($m)
            {
                return strtolower(strlen($m[1]) ? "$m[1]_$m[2]" : "$m[2]");
            },
            $word
        );   
    }

    public static function camelize($word) {
        return $word = preg_replace_callback(
            "/(^|_)([a-z])/",
            function($m)
            {
                return strtoupper("$m[2]");
            },
            $word
        );

    }

}