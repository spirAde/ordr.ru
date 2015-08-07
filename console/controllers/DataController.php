<?php
namespace console\controllers;

use common\components\ApiHelpers;
use console\models\User;
use console\models\BathhouseService;
use console\models\BathhouseBooking;
use console\models\BathhouseRoom;
use Yii;
use yii\console\Controller;
use yii\helpers\ArrayHelper;
use yii\helpers\VarDumper;
use yii\helpers\OrdrHelper;
use yii\db\Query;

class DataController extends Controller {

    public $types = ['bathhouse', 'hammam', 'sauna'];

    public $cities = [
        1 => 'Магнитогорск',
        2 => 'Челябинск',
        3 => 'Екатеринбург'
    ];

    public $bathhouse_options = [
        1 => 'Интернет',
        2 => 'Парковка',
        3 => 'Бар/Ресторан',
        4 => 'Кухня',
        5 => 'Прорубь',
    ];

    public $room_options = [
        1 => 'Бассейн',
        2 => 'Бильярд',
        3 => 'Джакузи'
    ];

    public $service_categories = [
        1 => 'Парение',
        2 => 'Массаж',
        3 => 'Другое'
    ];

    public $period_lines = [
        0 => [
            0 => [30, 36, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78],
            1 => [99, 102, 105, 108, 111, 114]
        ],
        1 => [
            0 => [27, 30, 33, 36, 39, 42],
            1 => [63, 66, 69, 72, 75, 78],
            2 => [105, 108, 111, 114, 117]
        ],
        2 => [
            0 => [21, 24, 27, 30, 33],
            1 => [60, 63, 66, 69, 72],
            2 => [96, 99, 102],
            3 => [123, 126]
        ]
    ];

    public $day_indexes = [0, 1, 2, 3, 4, 5, 6];

    public $description = 'Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt, ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.';
    public $room_description = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    public $city_id = 1;

    public function actionIndex() {

        $bathhouses = [
            0 => [
                'name' => 'Московская баня',
                'address' => 'Московская 12',
                'latitude' => 53.429864,
                'longitude' => 58.960190,
                'services' => [
                    'steaming' => [
                        ['name' => 'По-муромски', 'price' => 1000],
                        ['name' => 'По-башкирски', 'price' => 1200],
                        ['name' => 'По-русски', 'price' => 1100],
                        ['name' => 'По-удмуртски', 'price' => 1150],
                    ],
                    'massage' => [
                        ['name' => 'Всего тела', 'price' => 1000],
                        ['name' => 'Головы', 'price' => 200],
                        ['name' => 'Ног', 'price' => 300],
                        ['name' => 'Рук', 'price' => 400],
                    ],
                    'other' => [
                        ['name' => 'Шашлычный набор', 'price' => 200],
                        ['name' => 'Карты', 'price' => 100],
                        ['name' => 'Гитара', 'price' => 200],
                        ['name' => 'Домино', 'price' => 100],
                    ]
                ],
                'rooms' => [
                    ['name' => 'Медвежья', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Суворовская', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Прелестная', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Нереальная', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Суперская', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Яужезапарилсяпридумыватьназвания', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Пропарься', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Вечный зов', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Барамир', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Атаман', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Казак', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Варяг', 'reviews' => ['smth1', 'smth2']]
                ]
            ],
            1 => [
                'name' => 'Питерская баня',
                'address' => 'Питерская 15',
                'latitude' => 53.421134,
                'longitude' => 58.963192,
                'services' => [
                    'steaming' => [
                        ['name' => 'Богатырское', 'price' => 1400],
                        ['name' => 'Муромское', 'price' => 1600],
                        ['name' => 'Русское', 'price' => 1800],
                        ['name' => 'Башкирское', 'price' => 1200],
                    ],
                    'other' => [
                        ['name' => 'Игральные наборы', 'price' => 100],
                        ['name' => 'Мангал', 'price' => 100],
                        ['name' => 'Кальян на вине', 'price' => 200],
                        ['name' => 'Кальян на молоке', 'price' => 150],
                    ]
                ],
                'rooms' => [
                    ['name' => 'Изба 1', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Изба 2', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Забыл название', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Финская', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Чувак', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Салют', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Безумие', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Ярость', 'reviews' => ['smth1', 'smth2']],
                ]
            ],
            2 => [
                'name' => 'Зодиак',
                'address' => 'Ленинградская 31',
                'latitude' => 53.422224,
                'longitude' => 58.968150,
                'services' => [
                    'massage' => [
                        ['name' => 'Антицеллюлитный', 'price' => 2000],
                        ['name' => 'Классический', 'price' => 1000],
                        ['name' => 'Спортивный', 'price' => 1500],
                        ['name' => 'Головы', 'price' => 500],
                    ],
                    'other' => [
                        ['name' => 'Караоке', 'price' => 200],
                        ['name' => 'Шашлычный набор', 'price' => 100],
                        ['name' => 'Дрова', 'price' => 100],
                        ['name' => 'Кольян', 'price' => 200],
                    ]
                ],
                'rooms' => [
                    ['name' => 'Овен', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Телец', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Близнецы', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Рак', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Лев', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Дева', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Весы', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Скорпион', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Стрелец', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Козерог', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Водолей', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Рыбы', 'reviews' => ['smth1', 'smth2']],
                ]
            ],
            3 => [
                'name' => 'Бани стран',
                'address' => 'Комсомольская 55',
                'latitude' => 53.423361,
                'longitude' => 58.976191,
                'services' => [
                    'steaming' => [
                        ['name' => 'По-царски', 'price' => 2000],
                        ['name' => 'По-муромски', 'price' => 1200],
                        ['name' => 'По-башкирски', 'price' => 800],
                        ['name' => 'По-волхоски', 'price' => 1200],
                    ]
                ],
                'rooms' => [
                    ['name' => 'Россия', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Япония', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Франция', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Финляндия', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Канада', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Англия', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Ирландия', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Китай', 'reviews' => ['smth1', 'smth2']],
                ]
            ],
            4 => [
                'name' => 'Тульские бани',
                'address' => 'Тульская 123',
                'latitude' => 53.424454,
                'longitude' => 58.982182,
                'services' => [
                    'steaming' => [
                        ['name' => 'По-суворовски', 'price' => 1200],
                        ['name' => 'По-пугачевски', 'price' => 1400]
                    ],
                    'massage' => [
                        ['name' => 'Царский', 'price' => 1500],
                        ['name' => 'Классический', 'price' => 1000],
                        ['name' => 'Тайский', 'price' => 2000],
                        ['name' => 'Грязевой', 'price' => 1200],
                    ],
                    'other' => [
                        ['name' => 'Кальян', 'price' => 100],
                        ['name' => 'Дрова', 'price' => 100],
                        ['name' => 'Веники', 'price' => 100],
                        ['name' => 'Шапки', 'price' => 100],
                    ]
                ],
                'rooms' => [
                    ['name' => 'Купечество', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Бытие', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Судорога', 'reviews' => ['smth1', 'smth2']],
                ]
            ],
            5 => [
                'name' => 'Пугачевские бани',
                'address' => 'Пугачева 222',
                'latitude' => 53.425524,
                'longitude' => 58.990120,
                'services' => [],
                'rooms' => [
                    ['name' => 'Екатерина', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Лось', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Заяц', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Волк', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Барьер', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Мустанг', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Кот', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Собака', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Лосось', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Лед', 'reviews' => ['smth1', 'smth2']],
                ]
            ],
            6 => [
                'name' => 'Атлант',
                'address' => 'Ушакова 1',
                'latitude' => 53.426634,
                'longitude' => 58.961130,
                'services' => [
                    'steaming' => [
                        ['name' => 'Камчатский', 'price' => 1200],
                        ['name' => 'Русский', 'price' => 1400],
                        ['name' => 'Деревенский', 'price' => 1200],
                        ['name' => 'Царский', 'price' => 1600],
                    ],
                    'massage' => [
                        ['name' => 'Классический', 'price' => 1000],
                        ['name' => 'Всего тела', 'price' => 1200],
                        ['name' => 'Головы', 'price' => 600],
                        ['name' => 'Тайский', 'price' => 1400],
                    ]
                ],
                'rooms' => [
                    ['name' => 'Небо', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Море', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Окена', 'reviews' => ['smth1', 'smth2']],
                ]
            ],
            7 => [
                'name' => 'Камчатские бани',
                'address' => 'Сталеваров 61',
                'latitude' => 53.431144,
                'longitude' => 58.958840,
                'services' => [],
                'rooms' => [
                    ['name' => 'Сибирь', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Казань', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Челябинск', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Магнитогорск', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Урал', 'reviews' => ['smth1', 'smth2']],
                ]
            ],
            8 => [
                'name' => 'Запорожские бани',
                'address' => 'Коммунистов 2',
                'latitude' => 53.429954,
                'longitude' => 58.957450,
                'services' => [],
                'rooms' => [
                    ['name' => 'Раздолье', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Гитара', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Баян', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Семь', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Восемь', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Два', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Три', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Один', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Пять', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Сто', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Стоодин', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Шайтан', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Яусталдумать', 'reviews' => ['smth1', 'smth2']]
                ]
            ],
            9 => [
                'name' => 'Древесные бани',
                'address' => 'Дубова 126',
                'latitude' => 53.432164,
                'longitude' => 58.960160,
                'services' => [],
                'rooms' => [
                    ['name' => 'Клен', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Дуб', 'reviews' => ['smth1', 'smth2']]
                ]
            ],
            10 => [
                'name' => 'Башкирские бани',
                'address' => 'Ульянова 90',
                'latitude' => 53.435274,
                'longitude' => 58.968170,
                'services' => [],
                'rooms' => [
                    ['name' => 'Гнездо', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Орел', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Акула', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Пляж', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Банка', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Бутылка', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Отче', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Божий жар', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Париться - это круто', 'reviews' => ['smth1', 'smth2']]
                ]
            ],
            11 => [
                'name' => 'Бани Москвы',
                'address' => 'Ручьева 98',
                'latitude' => 53.439184,
                'longitude' => 58.970280,
                'services' => [],
                'rooms' => [
                    ['name' => 'Дубай', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Олень', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Крейсер', 'reviews' => ['smth1', 'smth2']]
                ]
            ],
            12 => [
                'name' => 'У Петровича',
                'address' => 'Доменьщиков 18',
                'latitude' => 53.429894,
                'longitude' => 58.960199,
                'services' => [],
                'rooms' => [
                    ['name' => 'Парламент', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Кент', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Зевс', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Матильда', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Победа', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Ручная', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Приблуда', 'reviews' => ['smth1', 'smth2']],
                    ['name' => 'Пот', 'reviews' => ['smth1', 'smth2']],
                ]
            ]
        ];

        $connection = new \yii\db\Connection([
            'dsn' => 'mysql:host=127.0.0.1;dbname=ordrDB',
            'username' => 'root',
            'password' => 'root',
            'charset' => 'utf8'
        ]);

        foreach ($bathhouses as $bathhouse) {

            $connection->createCommand()
                ->insert('bathhouse', [
                    'name' => $bathhouse['name'],
                    'slug' => '',
                    'address' => $bathhouse['address'],
                    'description' => $this->description,
                    'contacts' => json_encode([
                        'phone' => ['22-22-22'],
                        'email' => ['smth@gmail.com'],
                    ]),
                    'options' => json_encode(array_rand($this->bathhouse_options, mt_rand(2, sizeof($this->bathhouse_options)))),
                    'city_id' => $this->city_id,
                    'distance' => mt_rand(1, 200) / 10,
                    'latitude' => $bathhouse['latitude'],
                    'longitude' => $bathhouse['longitude'],
                    'is_active' => 1])
                ->execute();

            $bathhouse_id = $connection->getLastInsertID();

            if (!empty($bathhouse['services'])) {

                foreach ($bathhouse['services'] as $category => $services) {

                    foreach ($services as $service) {
                        $connection->createCommand()
                            ->insert('bathhouse_service', [
                                'name' => $service['name'],
                                'category' => $category,
                                'bathhouse_id' => $bathhouse_id,
                                'price' => $service['price']])
                            ->execute();
                    }
                }
            }

            if (!empty($bathhouse['rooms'])) {

                foreach ($bathhouse['rooms'] as $room) {

                    $connection->createCommand()
                        ->insert('bathhouse_room', [
                            'bathhouse_id' => $bathhouse_id,
                            'name' => $room['name'],
                            'description' => $this->room_description,
                            'options' => json_encode(array_rand($this->room_options, mt_rand(2, sizeof($this->room_options)))),
                            'types' => json_encode(array_rand($this->types, mt_rand(1, sizeof($this->types)))),
                            'rating' => mt_rand(1, 100) / 10,
                            'popularity' => mt_rand(1, 100) / 10,
                            'city_id' => $this->city_id])
                        ->execute();

                    $room_id = $connection->getLastInsertID();

                    if (!empty($room['reviews'])) {

                        foreach ($room['reviews'] as $review) {

                            $connection->createCommand()
                                ->insert('bathhouse_room_review', [
                                    'text' => $review,
                                    'name' => 'Гость',
                                    'room_id' => $room_id,
                                    'datetime' => date('Y-m-d H:i:s', strtotime('-' . mt_rand(0, 30) . ' days')),
                                    'rating' => mt_rand(1, 100) / 10])
                                ->execute();
                        }
                    }

                    $periods = $this->period_lines[mt_rand(0, 2)];
                    $last_period_key = key(array_slice($periods, -1, 1, TRUE));

                    $prices = [
                        'workdays' => [],
                        'weekends' => []
                    ];

                    foreach ($periods as $period_id => $period) {

                        $workday_price = ceil(mt_rand(500, 2100) / 100) * 100;
                        $prices['workdays'][] = $workday_price;
                        $prices['weekends'][] = $workday_price + ceil(mt_rand(200, 500) / 100) * 100;

                        if ($period_id === $last_period_key) {
                            $prices['workdays'][] = $workday_price + ceil(mt_rand(100, 300) / 100) * 100;
                            $prices['weekends'][] = $workday_price + ceil(mt_rand(200, 500) / 100) * 100;
                        }
                    }

                    $finished_periods = [];

                    foreach ($periods as $period_id => $period) {
                        if ($period_id === 0) {
                            $finished_periods[] = [
                                'start' => 0,
                                'end' => $period[array_rand($period, 1)]
                            ];
                        }
                        else if ($period_id === $last_period_key) {
                            $prev = $finished_periods[$period_id - 1]['end'];
                            $curr = $period[array_rand($period, 1)];

                            $finished_periods[] = [
                                'start' => $prev,
                                'end' => $curr
                            ];

                            $finished_periods[] = [
                                'start' => $curr,
                                'end' => 144
                            ];
                        }
                        else {
                            $prev = $finished_periods[$period_id - 1]['end'];
                            $finished_periods[] = [
                                'start' => $prev,
                                'end' => $period[array_rand($period, 1)]
                            ];
                        }
                    }

                    foreach ($this->day_indexes as $day_index) {
                        foreach ($finished_periods as $idx => $period) {
                            $connection->createCommand()
                                ->insert('bathhouse_room_price', [
                                    'room_id' => $room_id,
                                    'start_period' => $period['start'],
                                    'end_period' => $period['end'],
                                    'price' => ($day_index === 0 || $day_index === 6) ? $prices['weekends'][$idx] : $prices['workdays'][$idx],
                                    'day_id' => $day_index
                                ])
                                ->execute();
                        }
                    }

                    $connection->createCommand()
                        ->insert('bathhouse_room_setting', [
                            'room_id' => $room_id,
                            'cleaning_time' => 3,
                            'min_duration' => mt_rand(2, 4) * 3,
                            'guest_limit' => mt_rand(7, 12),
                            'guest_threshold' => mt_rand(4, 8),
                            'guest_price' => 100,
                            'prepayment' => 0
                        ])
                        ->execute();
                }
            }
        }
    }

    public function actionTime() {

        $first_date = date('Y-m-d', strtotime('now'));
        $end_date = date('Y-m-d', strtotime('now', strtotime('+30 days')));

        $connection = new \yii\db\Connection([
            'dsn' => 'mysql:host=127.0.0.1;dbname=ordrDB',
            'username' => 'root',
            'password' => 'root',
            'charset' => 'utf8'
        ]);

        $rooms = (new Query())
            ->select('bathhouse_room.id')
            ->from('bathhouse_room')
            ->all();

        $periods = \Yii::$app->params['time_periods'];

        $dates_range = OrdrHelper::datesRange($first_date, $end_date);

        foreach ($rooms as $room)
        {
            $bathhouse = (new Query())
                ->select('bathhouse_room.bathhouse_id')
                ->from('bathhouse_room')
                ->where('bathhouse_room.id = :room_id', [':room_id' => $room['id']])
                ->one();

            $duration = (new Query())
                ->select('bathhouse_room_setting.min_duration as min')
                ->from('bathhouse_room_setting')
                ->where('bathhouse_room_setting.room_id = :room_id', [':room_id' => $room['id']])
                ->one();

            foreach ($dates_range as $date)
            {

                $full_free_time = json_encode(array(
                    0   => 0,
                    1   => 144
                ));
                $connection->createCommand()
                    ->insert('bathhouse_schedule', [
                        'room_id' => $room['id'],
                        'date' => $date,
                        'schedule' => $full_free_time
                    ])
                    ->execute();


            }
        }
    }

    public function actionOrders()
    {
        $order_samples = [
            [
                'start_date'    => 'current',
                'end_date'      => 'current',
                'start_period'  => 30,
                'end_period'    => 42,
                'services'      => '',
                'guests'        => mt_rand(1,6),
                'status'        => 0,
                'user'          =>
                    [
                        'id'                => 1,
                        'phone'             => '89009000000',
                        'is_ban'            => 0,
                        'last_order_date'   => date('Y:m:d'),
                    ],
                'manager_id'    => 0,
                'cost_period'   => mt_rand(1,9) * 1000,
                'cost_services' => mt_rand(1,9) * 1000,
                'cost_guests'   => mt_rand(1,9) * 1000,
                'total'         => mt_rand(1,9) * 1000 + mt_rand(1,9) * 1000 + mt_rand(1,9) * 1000,
                'comment'       => 'Vse pychkom'
            ],
            [
                'start_date'    => 'current',
                'end_date'      => 'current',
                'start_period'  => 90,
                'end_period'    => 114,
                'services'      => '',
                'guests'        => mt_rand(1,6),
                'status'        => 0,
                'user'          =>
                    [
                        'id'                => 2,
                        'phone'             => '89009000001',
                        'is_ban'            => 0,
                        'last_order_date'   => date('Y:m:d'),
                    ],
                'manager_id'    => 0,
                'cost_period'   => mt_rand(1,9) * 1000,
                'cost_services' => mt_rand(1,9) * 1000,
                'cost_guests'   => mt_rand(1,9) * 1000,
                'total'         => mt_rand(1,9) * 1000 + mt_rand(1,9) * 1000 + mt_rand(1,9) * 1000,
                'comment'       => 'Vse pychkom'
            ],
            [
                'start_date'    => 'current',
                'end_date'      => 'next',
                'start_period'  => 132,
                'end_period'    => 12,
                'services'      => '',
                'guests'        => mt_rand(1,6),
                'status'        => 0,
                'user'          =>
                    [
                        'id'                => 3,
                        'phone'             => '89009000002',
                        'is_ban'            => 0,
                        'last_order_date'   => date('Y:m:d'),
                    ],
                'manager_id'    => 0,
                'cost_period'   => mt_rand(1,9) * 1000,
                'cost_services' => mt_rand(1,9) * 1000,
                'cost_guests'   => mt_rand(1,9) * 1000,
                'total'         => mt_rand(1,9) * 1000 + mt_rand(1,9) * 1000 + mt_rand(1,9) * 1000,
                'comment'       => 'Vse pychkom'
            ]
        ];
        $first_date = date('Y-m-d', strtotime('now'));
        $end_date = date('Y-m-d', strtotime('now', strtotime('+7 days')));
        $dates_range = OrdrHelper::datesRange($first_date, $end_date);
        $rooms = BathhouseRoom::find()
            ->joinWith(['bathhouseRoomSettings'])
            ->indexBy('id')
            ->asArray()
            ->all();

        foreach($rooms as $room)
        {
            $services = BathhouseService::find()
                ->select(
                    'bathhouse_service.id,
                                bathhouse_service.name,
                                bathhouse_service.category,
                                bathhouse_service.price')
                ->where('bathhouse_service.bathhouse_id = :bathhouse_id', [':bathhouse_id' => $room['id']])
                ->asArray()
                ->all();

            $service_ids = ArrayHelper::getColumn($services,'id');

            foreach ($dates_range as $date)
            {
                foreach($order_samples as $sample)
                {
                    $count_services = mt_rand(0,4);
                    $selected_services = [];
                    if(!empty($service_ids))
                    {
                        for ($i = 0; $i < $count_services; $i++)
                        {
                            $ind = (int)mt_rand(0, count($service_ids)-1);
                            if(array_key_exists($ind,$service_ids))
                                $selected_services[] = $service_ids[$ind];
                        }
                    }
                    $sample['start_date'] = $date;
                    $sample['end_date'] = ($sample['end_date'] == 'current') ? $date : date('Y-m-d', strtotime('+1 days',strtotime($date)));

                    $booking = BathhouseBooking::find()
                        ->where('start_date = :start_date
                                    AND end_date = :end_date
                                    AND start_period = :start_period
                                    AND end_period = :end_period
                                    AND room_id = :room_id',
                        [
                            ':start_date'   => $sample['start_date'],
                            ':end_date'     => $sample['end_date'],
                            ':start_period' => $sample['start_period'],
                            ':end_period'   => $sample['end_period'],
                            ':room_id'      => $room['id'],
                        ])
                        ->one();
                    if($booking != null)
                        continue;
                    $booking = new BathhouseBooking();
                    $booking->bathhouse_id  = $room['bathhouse_id'];
                    $booking->room_id       = $room['id'];
                    $booking->start_date    = $sample['start_date'];
                    $booking->end_date      = $sample['end_date'];
                    $booking->start_period  = $sample['start_period'];
                    $booking->end_period    = $sample['end_period'];
                    $booking->services      = json_encode($selected_services);
                    $booking->guests        = $sample['guests'];
                    $booking->status_id     = $sample['status'];
                    $booking->status_id     = $sample['status'];
                    $booking->manager_id    = $sample['manager_id'];
                    $booking->cost_period   = $sample['cost_period'];
                    $booking->cost_services = $sample['cost_services'];
                    $booking->cost_guests   = $sample['cost_guests'];
                    $booking->total         = $sample['total'];
                    $booking->comment       = $sample['comment'];
                    $booking->created       = date('Y-m-d H:i:s');

                    $user = User::findOne($sample['user']['id']);
                    if($user == null)
                    {
                        $user = new User();
                        $user->id = $sample['user']['id'];
                        $user->phone = $sample['user']['phone'];
                        $user->is_ban = $sample['user']['is_ban'];
                        $user->last_order_date = date('Y-m-d');
                        $user->save();
                    }

                    $booking->user_id = $user->id;

                    if(!$booking->save())
                        var_dump($booking->getErrors());
                }

                $all_bookings = BathhouseBooking::find()
                    ->select('start_period,end_period,start_date,end_date')
                    ->where('(start_date = :start_date OR end_date = :end_date) AND room_id = :room_id',[
                        ':start_date'   => $date,
                        ':end_date'     => $date,
                        ':room_id'      => (int)$room['id'],
                    ])
                    ->all();

                $busy_periods = [];

                foreach($all_bookings as $book_item)
                {
                    //заявка, пришедшая с прошлого дня
                    if($book_item->end_date == $date and $book_item->start_date != $date)
                        $busy_periods[] = [0,$book_item->end_period];
                    //заявка с переходом на следующий день
                    elseif($book_item->end_date != $date and $book_item->start_date == $date)
                        $busy_periods[] = [$book_item->start_period,144];
                    else
                        $busy_periods[] = [$book_item->start_period,$book_item->end_period];
                }

                $free_period_for_date = ApiHelpers::getFreeTime($busy_periods,$room['bathhouseRoomSettings']['min_duration']);

                yii::$app->db->createCommand()
                    ->update('bathhouse_schedule', ['schedule'  => json_encode($free_period_for_date)], 'date = "'.$date.'" AND room_id = '.$room['id'])
                    ->execute();
            }
        }
    }

}
